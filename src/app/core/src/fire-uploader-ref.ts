import { UploaderState, FireUploaderConfig, UploaderProgress } from './fire-uploader.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { FileItem } from './file-item';
import { FireUploader } from './fire-uploader';
import { processFile, parallizeUploads, maxFilesError, maxFileSizeError, convertToMB, selectFiles } from './utils';
import { AngularFireStorage } from 'angularfire2/storage';

import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { combineAll } from 'rxjs/operators/combineAll';
import { switchMap } from 'rxjs/operators/switchMap';
import { concatMap } from 'rxjs/operators/concatMap';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { finalize } from 'rxjs/operators/finalize';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { tap } from 'rxjs/operators/tap';
import { map } from 'rxjs/operators/map';

export class FireUploaderRef {

  private _initialState: UploaderState = {
    files: [],
    active: false,
    progress: {
      totalBytes: 0,
      bytesTransferred: 0,
      percentage: 0
    }
  };
  private _state: UploaderState = this._initialState;
  state$ = new BehaviorSubject<UploaderState>(this._initialState);

  updateRootState$ = new BehaviorSubject<UploaderState>({});

  private _cancelUpload$ = new Subject();

  files$ = new Subject<FileItem[]>();
  remove$ = new Subject();
  success$ = new Subject<FileItem>();
  complete$ = new Subject<FileItem[]>();
  value$ = new Subject<string[]>();
  error$ = new Subject();
  active$ = new Subject<boolean>();
  progress$ = new Subject<UploaderProgress>();
  reset$ = new Subject();

  fileInput: HTMLInputElement;

  constructor(public config: FireUploaderConfig, private _storage: AngularFireStorage) {

    // Combines queued files states
    this.updateRootState$.pipe(
      debounceTime(50),
      map(() => {
        if (this._state.files.length) {
          const rootState = this.combineStates();
          return {
            active: rootState.active,
            progress: {
              percentage: (rootState.progress.bytesTransferred / rootState.progress.totalBytes) * 100,
              bytesTransferred: rootState.progress.bytesTransferred,
              totalBytes: rootState.progress.totalBytes
            }
          };
        }
        return {
          active: false,
          progress: {
            percentage: 0,
            bytesTransferred: 0,
            totalBytes: 0
          }
        };
      }),
      tap((state: UploaderState) => {
        this.setState(state);
        this.progress$.next(state.progress);
        this.active$.next(state.active);
      })
    ).subscribe();
  }

  /**
   * Set Config
   */
  setConfig(config: FireUploaderConfig) {
    this.config = {...this.config, ...config};
  }

  destroy() {
    this._cancelUpload$.complete();
    if (this.progress$.observers.length) {
      this.updateRootState$.complete();
    }
  }

  /**
   * Start uploading
   */
  start() {
    // Start if there are files added and the uploader is not busy
    if (!this._state.active && this._state.files.length) {
      from(this._state.files).pipe(
        map((file: FileItem) =>
          processFile(file, this.config.resizeWidth, this.config.resizeHeight, this.config.resizeMethod, this.config.resizeQuality)
        ),
        combineAll(),
        switchMap((files: FileItem[]) =>
          parallizeUploads(files, this.config.parallelUploads)
        ),
        concatMap((chunk: FileItem[]) =>
          this.uploadFiles(chunk)
        ),
        takeUntil(this._cancelUpload$),
        finalize(() => {
          const uploadedFiles = this._state.files.filter((item: FileItem) => item.snapshot.state === 'success');

          // Emits the URLs of the uploaded files.
          const downloadURLs = uploadedFiles.map((item: FileItem) => item.snapshot.downloadURL);
          this.value$.next(downloadURLs);

          // Emits uploaded files.
          this.complete$.next(uploadedFiles);

          this.updateRootState$.next(null);
        })
      ).subscribe();
    }
  }

  /**
   * Select files
   */
  select() {
    selectFiles(this.config.accept, this.config.multiple).subscribe((files: FileList) => this.addFiles(files));
  }

  /**
   * Add files to the queue
   */
  addFiles(fileList: FileList) {
    this.validateFiles(fileList)
      .then((files: FileItem[]) => {
        this.setState({files});
        this.files$.next(files);
        this.updateRootState$.next(null);

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
  removeFile(item: FileItem) {
    if (item.snapshot.state === 'success') {
      item.delete();
    } else if (item.snapshot.state === 'running') {
      item.cancel();
    } else {
      this.remove$.next(item);
    }

    // Destroy file item
    item.snapshot$.complete();
    const files = this._state.files.filter((file: FileItem) => file !== item);
    this.setState({files});

    this.files$.next(this._state.files);
    this.updateRootState$.next(null);
  }

  /**
   * Resets the uploader
   */
  reset(remove = false) {
    this.cancel(remove);
    this.setState({files: []});
    this.updateRootState$.next(null);
    this.files$.next([]);
    this.reset$.next();
  }

  cancelFile(file: FileItem) {
    file.cancel();
    this.updateRootState$.next(null);
  }

  /**
   * Cancel all upload tasks
   */
  cancel(remove = true) {
    this._cancelUpload$.next();
    this._state.files.map((item: FileItem) => {
      if (remove && item.snapshot.state === 'success') {
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

  private setState(state: UploaderState) {
    this._state = {...this._state, ...state};
    this.state$.next(this._state);
  }

  /**
   * Takes files from drop zone or file input
   * Validates max file count
   * Validates max file size
   * Prevents duplication
   */
  private validateFiles(fileList: FileList): Promise<FileItem[]> {
    return new Promise((resolve, reject) => {
      let files: FileItem[] = [];
      if (fileList.length) {
        let length: number;

        // Validate max files count
        if (fileList.length > this.config.maxFiles) {
          this.error$.next(maxFilesError(this.config.maxFiles));
          length = this.config.maxFiles;
        } else {
          length = fileList.length;
        }

        for (let i = 0; i < length; i++) {
          // Check if file type is accepted
          if (!fileList[i].type.match(this.config.accept)) {
            continue;
          }

          // Validate max file size
          if (convertToMB(fileList[i].size) > this.config.maxFileSize) {
            this.error$.next(maxFileSizeError(fileList[i].name));
          } else {
            const file = new FileItem(fileList[i], this);
            files = [...files, file];
          }
        }
        if (this.config.multiple) {
          // Combine and filter duplicated files
          files = [...this._state.files, ...files]
            .filter((curr, index, self) =>
              self.findIndex(t => t.file.name === curr.file.name && t.file.size === curr.file.size) === index
            );
        }
        // return files;
        resolve(files);
      }
      // If user didn't select file
      resolve(this._state.files);
      // return this._state.files;
    });
  }

  /**
   * Iterates over given files
   * Generates file name
   * Starts the uploading task
   */
  private uploadFiles(files: FileItem[]): Observable<FileItem[]> {
    const chunk = files.map((item: FileItem) => {

      const dirName = this.config.paramDir ? `${this.config.paramDir}/` : '';
      const prefixName = this.config.uniqueName ? `${new Date().getTime()}_` : '';
      const fileName = this.config.paramName || item.snapshot.name;

      const path = dirName + prefixName + fileName;

      const task = this._storage.upload(path, item.file);
      return item.assignTask(task);
    });
    return forkJoin(...chunk);
  }

  /**
   * Combine the states of all files in a single state
   */
  private combineStates(): UploaderState {
    return this._state.files
      .map((item: FileItem) => item.snapshot)
      .reduce((total, state) => ({
          active: total.active || state.active,
          progress: {
            bytesTransferred: total.progress.bytesTransferred + state.progress.bytesTransferred,
            totalBytes: total.progress.totalBytes + state.progress.totalBytes
          }
        })
      );
  }
}
