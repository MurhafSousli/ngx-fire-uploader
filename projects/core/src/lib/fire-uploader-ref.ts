import { AngularFireStorage } from 'angularfire2/storage';
import { Observable, Subject, BehaviorSubject, Subscription, of, forkJoin, fromEvent, EMPTY } from 'rxjs';
import { switchMap, concatMap, takeUntil, finalize, tap, catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { FireUploaderState, FireUploaderConfig, FireUploaderProgress } from './fire-uploader.model';
import { DEFAULT_STATE } from './fire-uploader.default';
import { FileItem } from './file-item';
import { parallizeUploads, maxFilesError, maxFileSizeError, convertToMB, combineStates } from './utils';

/**
 * FireUploaderRef class for fire uploader ref
 */
export class FireUploaderRef {

  /** File input element used to select files from browser file dialog */
  private readonly _fileInput: HTMLInputElement;

  /** Reference to file input Subscription, used to unsubscribe onDestroy */
  private readonly _inputSelect$: Subscription;

  /** Internal stream that emits to cancel any ongoing task */
  private readonly _cancelUpload$ = new Subject();

  /** Internal stream that emits to combine all file items states into FireUploaderRef state */
  private readonly _refreshState$ = new BehaviorSubject<FireUploaderState>({});

  /** Uploader state */
  private _state: FireUploaderState = DEFAULT_STATE;

  /** Stream that emits when uploader state is changed */
  state$ = new BehaviorSubject<FireUploaderState>(DEFAULT_STATE);

  /** Stream that emits when files are added */
  files$ = new Subject<FileItem[]>();

  /** Stream that emits when files are removed */
  remove$ = new Subject<FileItem>();

  /** Stream that emits when files are cancel */
  cancel$ = new Subject<FileItem>();

  /** Stream that emits when file is successfully uploaded */
  success$ = new Subject<FileItem>();

  /** Stream that emits when uploading has been completed */
  complete$ = new Subject<FileItem[]>();

  /** Stream that emits the download URLs array after files are uploaded */
  value$ = new Subject<string[]>();

  /** Stream that emits when an error has occurred */
  error$ = new Subject<any>();

  /** Stream that emits when uploader active state is changed */
  active$ = new Subject<boolean>();

  /** Stream that emits when upload progress is changed */
  progress$ = new Subject<FireUploaderProgress>();

  /** Stream that emits when uploader has been reset */
  reset$ = new Subject();

  /** Creates FireUploaderRef with a default config */
  constructor(public config: FireUploaderConfig, private _storage: AngularFireStorage) {

    // Prepare the file input
    this._fileInput = document.createElement('input');
    this._fileInput.type = 'file';
    this._inputSelect$ = fromEvent(this._fileInput, 'change').subscribe(() => this.addFiles(this._fileInput.files));

    this._refreshState$.pipe(
      switchMap(() => {
        if (this._state.files.length) {
          return combineStates(this._state.files);
        }
        return of(DEFAULT_STATE);
      }),
      map((state: FireUploaderState) => {
        this.setState(state);
        this.progress$.next(state.progress);
        return state.active;
      }),
      // Emit active state only it is changed
      distinctUntilChanged(),
      tap((active: boolean) => this.active$.next(active))
    ).subscribe();
  }

  /** Set Config */
  setConfig(config: FireUploaderConfig) {
    this.config = {...this.config, ...config};
  }

  /** Destroy uploader ref */
  destroy() {
    this._inputSelect$.unsubscribe();
    this._cancelUpload$.complete();
    this._refreshState$.complete();
    this.state$.complete();
    this.files$.complete();
    this.active$.complete();
    this.progress$.complete();
    this.cancel$.complete();
    this.remove$.complete();
    this.success$.complete();
    this.value$.complete();
    this.error$.complete();
    this.reset$.complete();
  }

  /**
   * Start uploading
   */
  start() {
    // Start if there are files added and the uploader is not busy
    if (!this._state.active && this._state.files.length) {
      of(this._state.files).pipe(
        switchMap((files: FileItem[]) => parallizeUploads(files, this.config.parallelUploads)),
        concatMap((chunk: FileItem[]) => this.uploadChunk(chunk)),
        takeUntil(this._cancelUpload$),
        finalize(() => {
          const uploadedFiles = this._state.files.filter((item: FileItem) => item.state.state === 'success');

          // Emits the URLs of the uploaded files.
          const downloadURLs = uploadedFiles.map((item: FileItem) => item.state.downloadURL);
          this.value$.next(downloadURLs);

          // Emits uploaded files.
          this.complete$.next(uploadedFiles);
        })
      ).subscribe();
    }
  }

  /**
   * Select files
   */
  select() {
    this._fileInput.multiple = this.config.multiple;
    this._fileInput.accept = this.config.accept;
    this._fileInput.click();
  }

  /**
   * Add files to the queue
   */
  addFiles(fileList: FileList | File[]) {
    this.validateFiles(fileList).subscribe((files: FileItem[]) => {
      this.setState({files});
      this.files$.next(files);

      this._refreshState$.next(null);

      // Starts uploading as soon as the file are added
      if (this.config.autoStart) {
        this.start();
      }
    });
  }

  /**
   * Remove file
   * cancels the file if it is being uploaded
   * deletes the file if it has been uploaded
   */
  removeItem(item: FileItem) {
    if (item.state.state === 'success') {
      item.delete().pipe(
        tap(() => this.remove$.next(item)),
        catchError((err: Error) => this.handleError(err)),
      );
    } else if (item.state.state === 'running') {
      item.cancel();
      this.cancel$.next(item);
    } else {
      this.remove$.next(item);
    }

    // Destroy file item
    item.state$.complete();
    const files = this._state.files.filter((file: FileItem) => file !== item);
    this.setState({files});

    this.files$.next(this._state.files);
    this._refreshState$.next(null);
  }

  /**
   * Resets the uploader
   */
  reset(remove = false) {
    this.cancel(remove);
    this.setState({files: []});
    this._refreshState$.next(null);
    this.files$.next([]);
    this.reset$.next();
  }

  /**
   * Cancel a specific file
   */
  cancelItem(item: FileItem) {
    item.cancel();
    this._refreshState$.next(null);
  }

  /**
   * Cancel all upload tasks
   */
  cancel(remove = true) {
    this._cancelUpload$.next();
    this._state.files.map((item: FileItem) => {
      if (remove && item.state.state === 'success') {
        item.delete();
      } else {
        item.cancel();
      }
    });
  }

  /**
   * Pause all upload tasks
   */
  pause() {
    this._state.files.map((file: FileItem) => file.pause());
  }

  /**
   * Resume all paused tasks
   */
  resume() {
    this._state.files.map((file: FileItem) => file.resume());
  }

  private setState(state: FireUploaderState) {
    this._state = {...this._state, ...state};
    this.state$.next(this._state);
  }

  /**
   * Takes files from drop zone or file input
   * Validates max file count
   * Validates max file size
   * Prevents duplication
   */
  private validateFiles(fileList: FileList | File[]): Observable<FileItem[]> {
    if (!fileList.length) {
      // If user didn't select file, return state's files
      return of(this._state.files);
    }

    return of({}).pipe(
      map(() => {
        let files: FileItem[] = [];

        // Validate max files count
        const length = this.validateMaxFiles(fileList, this.config.maxFiles);

        for (let i = 0; i < length; i++) {
          // Check if file type is accepted
          if (this.config.accept && !fileList[i].type.match(this.config.accept)) {
            continue;
          }

          // Validate max file size
          if (convertToMB(fileList[i].size) > this.config.maxFileSize) {
            this.error$.next(maxFileSizeError(fileList[i].name));
            continue;
          }

          const file = new FileItem(fileList[i], this.config, this._storage);
          files = [...files, file];
        }
        return files;
      }),
      switchMap((files: FileItem[]) => {
        const prepareFiles = files.map(item => item.prepare());
        return forkJoin(prepareFiles).pipe(
          map(() => {
            if (this.config.multiple) {
              // Combine and filter duplicated files
              files = [...this._state.files, ...files].filter((curr, index, self) =>
                self.findIndex(t => t.file.name === curr.file.name && t.file.size === curr.file.size) === index
              );
            }
            return files;
          }),
          catchError((err: Error) => this.handleError(err)),
        );
      })
    );
  }

  /** Validate if fileList count exceeded uploader's max count */
  private validateMaxFiles(fileList: FileList | File[], max: number): number {
    if (fileList.length > max) {
      this.error$.next(maxFilesError(max));
      return max;
    }
    return fileList.length;
  }

  /**
   * Iterates over given files
   * Starts the uploading task
   */
  private uploadChunk(files: FileItem[]): Observable<FileItem[]> {
    const chunk = files.map((item: FileItem) => {
      return item.upload().pipe(
        catchError((err: Error) => this.handleError(err)),
        finalize(() => this.success$.next(item))
      );
    });
    return forkJoin(chunk);
  }

  private handleError(err: Error) {
    this.error$.next(err);
    return EMPTY;
  }

}
