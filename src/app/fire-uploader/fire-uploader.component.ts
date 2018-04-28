import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';

import { UploaderState, UploaderProgress } from './fire-uploader.model';
import { FireUploader } from './fire-uploader';
import { FileItem } from './file-item.class';
import { convertToMB, maxFilesError, maxFileSizeError, parallizeUploads, processFile } from './utils';

import { debounceTime } from 'rxjs/operators/debounceTime';
import { combineAll } from 'rxjs/operators/combineAll';
import { concatMap } from 'rxjs/operators/concatMap';
import { switchMap } from 'rxjs/operators/switchMap';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { finalize } from 'rxjs/operators/finalize';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { from } from 'rxjs/observable/from';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'fire-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fire-uploader.html'
})
export class FireUploaderComponent implements OnInit, OnDestroy {

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

  // Shows the drop zone
  @Input() dropZone: boolean = this._manager.config.dropZone;

  // If null, original file name will be used.
  @Input() paramName: string = this._manager.config.paramName;

  // Use date.now to create a unique name for uploaded file
  @Input() uniqueName: boolean = this._manager.config.uniqueName;

  // Drop zone placeholder
  @Input() placeholder: string = this._manager.config.placeholder;

  // Enables multiple file select
  @Input() multiple: boolean = this._manager.config.multiple;

  // The accepted extensions by the uploader
  @Input() accept: string = this._manager.config.accept;

  // Maximum number of files uploading at a time
  @Input() parallelUploads: number = this._manager.config.parallelUploads;

  // Maximum number of files to be uploaded
  @Input() maxFiles: number = this._manager.config.maxFiles;

  // Maximum file size
  @Input() maxFileSize: number = this._manager.config.maxFileSize;

  // Starts uploading when files are added
  @Input() autoStart: boolean = this._manager.config.autoStart;

  // Whether thumbnails for images should be generated
  @Input() thumbs: boolean = this._manager.config.thumbs;

  // How the images should be scaled down in case both, width and height are provided. Can be either contain or crop.
  @Input() thumbnailMethod: 'crop' | 'contain' = this._manager.config.thumbMethod;
  @Input() resizeMethod: 'crop' | 'contain' = this._manager.config.resizeMethod;

  // If set, images will be resized to these dimensions before being uploaded. If only one, resizeWidth or resizeHeight is provided,
  // the original aspect ratio of the file will be preserved.
  @Input() resizeWidth: number = this._manager.config.resizeWidth;
  @Input() resizeHeight: number = this._manager.config.resizeHeight;

  @Input() resizeQuality: number = this._manager.config.resizeQuality;

  // If null, the ratio of the image will be used to calculate it.
  @Input() thumbWidth: number = this._manager.config.thumbWidth;
  @Input() thumbHeight: number = this._manager.config.thumbHeight;

  // The mime type of the resized image (before it gets uploaded to the server). If null the original mime type will be used. To force jpeg,
  // for example, use image/jpeg.
  @Input() resizeMimeType: string = this._manager.config.resizeMimeType;

  // Emits when files are changed.
  @Output('files') filesEmitter = new EventEmitter();

  // Emits when a file is deleted.
  @Output('remove') removeEmitter = new EventEmitter<FileItem>();

  // The file has been uploaded successfully.
  @Output('success') successEmitter = new EventEmitter<FileItem>();

  // Emits when the upload was either successful or erroneous.
  @Output('complete') completeEmitter = new EventEmitter<FileItem[]>();

  // Emits downloadURL array for the successfully uploaded files
  @Output('value') valueEmitter = new EventEmitter<string[]>();

  // Emits when an error is occurred
  @Output('error') errorEmitter = new EventEmitter();

  // Emits when active state changes
  @Output('active') activeEmitter = new EventEmitter<boolean>();

  // Emits the progress %, the totalBytes and the totalBytesSent.
  @Output('progress') progressEmitter = new EventEmitter<UploaderProgress>();

  // Emits when the uploader is reset
  @Output('reset') resetEmitter = new EventEmitter();

  @ViewChild('fileInput') fileInput;

  @HostBinding('class.dragover') hoverClass;

  constructor(private _manager: FireUploader, private _storage: AngularFireStorage) {
  }

  ngOnInit() {

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
        this.progressEmitter.emit(state.progress);
        this.activeEmitter.emit(state.active);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.progressEmitter.observers.length) {
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
          processFile(file, this.resizeWidth, this.resizeHeight, this.resizeMethod, this.resizeQuality)
        ),
        combineAll(),
        switchMap((files: FileItem[]) =>
          parallizeUploads(files, this.parallelUploads)
        ),
        concatMap((chunk: FileItem[]) =>
          this.uploadFiles(chunk)
        ),
        takeUntil(this._cancelUpload$),
        finalize(() => {
          // Emits uploaded files.
          const uploaded = this._state.files.filter((item: FileItem) => item.snapshot === 'success');
          this.completeEmitter.emit(uploaded);

          // Emits the URLs of the uploaded files.
          const downloadURLs = uploaded.map((item: FileItem) => item.snapshot.downloadURL);
          this.valueEmitter.emit(downloadURLs);

          this.updateRootState$.next(null);
        })
      ).subscribe();
    }
  }

  select() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Add files to the queue
   */
  addFiles(fileList: FileList) {
    this.validateFiles(fileList)
      .then((files: FileItem[]) => {
        this.setState({files});
        this.filesEmitter.emit(files);
        this.updateRootState$.next(null);

        // Starts uploading as soon as the file are added
        if (this.autoStart) {
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
      this.removeEmitter.emit(item);
    }

    // Destroy file item
    item.snapshot$.complete();
    const files = this._state.files.filter((file: FileItem) => file !== item);
    this.setState({files});

    this.filesEmitter.emit(this._state.files);
    this.updateRootState$.next(null);
  }

  /**
   * Resets the uploader
   */
  reset(remove = true) {
    this.cancel(remove);
    this.setState({files: []});
    this.filesEmitter.emit([]);
    this.updateRootState$.next(null);
    this.resetEmitter.emit();
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
  private validateFiles(fileList: FileList) {
    return new Promise((resolve, reject) => {
      let files: FileItem[] = [];
      if (fileList.length) {
        let length: number;

        // Validate max files count
        if (fileList.length > this.maxFiles) {
          this.errorEmitter.emit(maxFilesError(this.maxFiles));
          length = this.maxFiles;
        } else {
          length = fileList.length;
        }

        for (let i = 0; i < length; i++) {

          // Validate max file size
          if (convertToMB(fileList[i].size) > this.maxFileSize) {
            this.errorEmitter.emit(maxFileSizeError(fileList[i].name));
          } else {
            const file = new FileItem(fileList[i], this);
            files = [...files, file];
          }
        }
        if (this.multiple) {
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
  private uploadFiles(files: FileItem[]) {
    const chunk = files.map((item: FileItem) => {
      // Generate file name
      const path = `${new Date().getTime()}_${this.paramName || item.snapshot.name}`;
      const task = this._storage.upload(path, item.file);
      return item.assignTask(task);
    });
    return forkJoin(...chunk);
  }

  /**
   * Combine the states of all files in a single state
   */
  private combineStates() {
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
