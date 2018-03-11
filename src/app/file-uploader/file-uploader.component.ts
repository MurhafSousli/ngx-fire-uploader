import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { UploaderState, UploaderProgress } from './fire-uploader.model';
import { FireUploaderManager } from './file-uploader.manager';
import { FileItem } from './file-item.class';
import { convertToMB, maxFilesError, maxFileSizeError, parallizeUploads, processFile } from './utils';

import { from } from 'rxjs/observable/from';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { combineAll } from 'rxjs/operators/combineAll';
import { concatMap } from 'rxjs/operators/concatMap';
import { switchMap } from 'rxjs/operators/switchMap';
import { finalize } from 'rxjs/operators/finalize';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';

@Component({
  selector: 'file-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-uploader.html'
})
export class FileUploaderComponent implements OnInit, OnDestroy {

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

  // If null, original file name will be used.
  @Input() dropZone: boolean = this.manager.config.dropZone;

  // If null, original file name will be used.
  @Input() paramName: string = this.manager.config.paramName;

  // Use date.now to create a unique name for uploaded file
  @Input() uniqueName: boolean = this.manager.config.uniqueName;

  // Drop zone placeholder
  @Input() placeholder: string = this.manager.config.placeholder;

  // Enables multiple file select
  @Input() multiple: boolean = this.manager.config.multiple;

  // The accepted extensions by the uploader
  @Input() accept: string = this.manager.config.accept;

  // Maximum number of files uploading at a time
  @Input() parallelUploads: number = this.manager.config.parallelUploads;

  // Maximum number of files to be uploaded
  @Input() maxFiles: number = this.manager.config.maxFiles;

  // Maximum file size
  @Input() maxFileSize: number = this.manager.config.maxFileSize;

  // Starts uploading when files are added
  @Input() autoStart: boolean = this.manager.config.autoStart;

  // Whether thumbnails for images should be generated
  @Input() generateThumbnails: boolean = this.manager.config.createImageThumbnails;

  // How the images should be scaled down in case both, width and height are provided. Can be either contain or crop.
  @Input() thumbnailMethod: 'crop' | 'contain' = this.manager.config.thumbMethod;
  @Input() resizeMethod: 'crop' | 'contain' = this.manager.config.resizeMethod;

  // If set, images will be resized to these dimensions before being uploaded. If only one, resizeWidth or resizeHeight is provided,
  // the original aspect ratio of the file will be preserved.
  @Input() resizeWidth: number = this.manager.config.resizeWidth;
  @Input() resizeHeight: number = this.manager.config.resizeHeight;

  // If null, the ratio of the image will be used to calculate it.
  @Input() thumbWidth: number = this.manager.config.thumbWidth;
  @Input() thumbHeight: number = this.manager.config.thumbHeight;

  // The mime type of the resized image (before it gets uploaded to the server). If null the original mime type will be used. To force jpeg,
  // for example, use image/jpeg.
  @Input() resizeMimeType: string = this.manager.config.resizeMimeType;

  // Emits when files are changed.
  @Output() files = new EventEmitter();

  // Emits when a file is canceled.
  @Output() cancel = new EventEmitter<FileItem>();

  // Emits when a file is deleted.
  @Output() remove = new EventEmitter<FileItem>();

  // The file has been uploaded successfully.
  @Output() success = new EventEmitter<FileItem>();

  // Emits when the upload was either successful or erroneous.
  @Output() complete = new EventEmitter<FileItem[]>();

  // Emits downloadURL array for the successfully uploaded files
  @Output() value = new EventEmitter<string[]>();

  // Emits when an error is occurred
  @Output() error = new EventEmitter();

  // Emits when active state changes
  @Output() active = new EventEmitter<boolean>();

  // Emits the progress %, the totalBytes and the totalBytesSent.
  @Output() progress = new EventEmitter<UploaderProgress>();

  // Emits when the uploader is reset
  @Output() reset = new EventEmitter();

  @ViewChild('fileInput') fileInput;

  @HostBinding('class.dragover') hoverClass;

  constructor(private manager: FireUploaderManager, private storage: AngularFireStorage) {
    this.state$.subscribe(res => console.log('root', res));
  }

  ngOnInit() {
    if (this.progress.observers.length) {

      // Combine all items state
      this.updateRootState$.pipe(
        debounceTime(50),
        map(() => {
          if (this._state.files.length) {
            const rootState = this._state.files
              .map(item => item.state)
              .reduce((total, state) => ({
                  active: total.active || state.active,
                  progress: {
                    percentage: total.progress.percentage + state.progress.percentage,
                    bytesTransferred: total.progress.bytesTransferred + state.progress.bytesTransferred,
                    totalBytes: total.progress.totalBytes + state.progress.totalBytes
                  }
                })
              );
            return {
              active: rootState.active,
              progress: {
                percentage: rootState.progress.percentage / this._state.files.length,
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
          this.progress.emit(state.progress);
          this.active.emit(state.active);
        })
      ).subscribe();
    }
  }

  ngOnDestroy() {
    if (this.progress.observers.length) {
      this.updateRootState$.complete();
    }
  }

  /**
   * Start uploading
   */
  start() {
    from(this._state.files).pipe(
      map((file: FileItem) =>
        processFile(file, this.resizeWidth, this.resizeHeight, this.resizeMethod)
      ),
      combineAll(),
      switchMap((files: FileItem[]) =>
        parallizeUploads(files, this.parallelUploads)
      ),
      concatMap((chunk: FileItem[]) =>
        this.uploadFiles(chunk)
      ),
      finalize(() => {
        this.complete.emit(this._state.files);
        const downloadURLs = this._state.files.map(file => file.state.downloadURL);
        this.value.emit(downloadURLs);
        this.updateRootState$.next(null);
      })
    ).subscribe();
  }

  select() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Add files to the queue
   */
  addFiles(fileList: FileList) {
    const files = this.validateFiles(fileList);
    this.setState({files});
    this.files.emit(files);
    this.updateRootState$.next(null);

    // Starts uploading as soon as the file are added
    if (this.autoStart) {
      this.start();
    }
  }

  /**
   * Remove file
   * cancels the file if it is being uploaded
   * deletes the file if it has been uploaded
   */
  removeFile(file: FileItem) {
    if (file.state.success) {
      file.delete()
        .then(() => this.remove.emit(file))
        .catch(error => this.error.emit(error));
    } else {
      file.cancel();
      this.cancel.emit(file);
    }

    // Destroy file item
    file.state$.complete();
    const files = this._state.files.filter(item => item !== file);
    this.setState({files});

    this.files.emit(this._state.files);
    this.updateRootState$.next(null);
  }

  /**
   * Resets the uploader
   */
  clear() {
    this._state.files.map((file: FileItem) => {
      if (file.state.success) {
        file.delete().then().catch();
      } else {
        file.cancel();
      }
    });
    this.setState({files: []});
    this.files.emit([]);
    this.updateRootState$.next(null);
    this.reset.emit();
  }

  pause() {
    this._state.files.map((file: FileItem) => file.pause());
  }

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
    let files: FileItem[] = [];
    if (fileList.length) {
      let length: number;

      // Validate max files count
      if (fileList.length > this.maxFiles) {
        this.error.emit(maxFilesError(this.maxFiles));
        length = this.maxFiles;
      } else {
        length = fileList.length;
      }

      for (let i = 0; i < length; i++) {

        // Validate max file size
        if (convertToMB(fileList[i].size) > this.maxFileSize) {
          this.error.emit(maxFileSizeError(fileList[i].name));
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
      return files;
    }
    // If user didn't select file
    return this._state.files;
  }

  /**
   * Iterates over given files
   * Generates file name
   * Starts the uploading task
   */
  private uploadFiles(files: FileItem[]) {
    const chunk = files.map((item: FileItem) => {
      // Generate file name
      const path = `${new Date().getTime()}_${this.paramName || item.state.name}`;
      const task = this.storage.upload(path, item.file);
      return item.assignTask(task);
    });
    return forkJoin(...chunk);
  }

}
