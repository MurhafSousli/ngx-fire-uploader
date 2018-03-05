import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { FireUploaderState, TotalProgress } from './fire-uploader.model';
import { FileItem } from './file-item.class';
import { FireUploaderManager } from './file-uploader.manager';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { Subject } from 'rxjs/Subject';
import { resizeImage } from './utils';

@Component({
  selector: 'file-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-uploader.html'
})
export class FileUploaderComponent implements OnInit, OnDestroy {

  private _initialState: FireUploaderState = {
    files: [],
    totalProgress: {
      totalBytes: 0,
      bytesTransferred: 0,
      progress: 0
    }
  };
  private _state: FireUploaderState = this._initialState;
  state$ = new BehaviorSubject<FireUploaderState>(this._initialState);

  calculateTotalProgress$ = new BehaviorSubject<TotalProgress>(this._initialState.totalProgress);

  complete$ = new Subject<string>();

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
  @Input() maxUploadsPerTime: number = this.manager.config.maxUploadsPerTime;

  // Maximum number of files to be uploaded
  @Input() maxFiles: number = this.manager.config.maxFiles;

  // Maximum file size
  @Input() maxFileSize: number = this.manager.config.maxFileSize;

  // Starts uploading when files are added
  @Input() autoStart: boolean = this.manager.config.autoStart;

  // Whether thumbnails for images should be generated
  @Input() createImageThumbnails: boolean = this.manager.config.createImageThumbnails;

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

  // Emits when a file gets processed.
  @Output() processing = new EventEmitter();

  // Emits when a file upload gets canceled.
  @Output() cancel = new EventEmitter<string[]>();

  // The file has been uploaded successfully.
  @Output() success = new EventEmitter<string>();

  // Emits when the upload was either successful or erroneous.
  @Output() complete = new EventEmitter<string[]>();

  // Emits when an error is occurred
  @Output() error = new EventEmitter();

  // Emits the progress %, the totalBytes and the totalBytesSent.
  @Output() totalProgress = new EventEmitter<TotalProgress>();

  // Emits when the uploader is reset
  @Output() reset = new EventEmitter();

  constructor(private manager: FireUploaderManager, private storage: AngularFireStorage) {

  }

  ngOnInit() {
    // Calculate total progress
    if (this.totalProgress.observers.length) {

      this.calculateTotalProgress$.pipe(
        debounceTime(50),
        map(() => {
          if (this._state.files.length) {
            const totalProgress = this._state.files
              .map(item => item.state)
              .reduce((total, state) => ({
                  progress: total.progress + state.progress,
                  bytesTransferred: total.bytesTransferred + state.bytesTransferred,
                  totalBytes: total.totalBytes + state.totalBytes
                })
              );
            return {
              progress: totalProgress.progress / this._state.files.length,
              bytesTransferred: totalProgress.bytesTransferred,
              totalBytes: totalProgress.totalBytes
            };
          }
          return {
            progress: 0,
            bytesTransferred: 0,
            totalBytes: 0
          };
        }),
        tap((totalProgress: TotalProgress) => {
          this.setState({totalProgress});
          this.totalProgress.emit(totalProgress);
        })
      ).subscribe();
    }

    // Emits on complete
    if (this.complete$.observers.length) {
      this.complete$.pipe(
        map(() => {
          if (this._state.files.length) {
            const downloadURLs = this._state.files
              .filter(item => item.state.success)
              .map(item => item.state.downloadURL);
            this.complete.emit(downloadURLs);
          }
        })
      );
    }
  }

  ngOnDestroy() {
    if (this.totalProgress.observers.length) {
      this.calculateTotalProgress$.complete();
    }
  }

  /**
   * Start uploading
   */
  start() {
    this._state.files
      .filter((item: FileItem) => !item.state.success)
      .map((item: FileItem) => {
        const path = `${new Date().getTime()}_${item.state.name}`;
        let task: AngularFireUploadTask;
        if (this.resizeWidth || this.resizeHeight) {
          resizeImage(item.file, this.resizeWidth, this.resizeHeight, this.resizeMethod)
            .then(data => {
              task = this.storage.upload(path, data);
              item.assignTask(task);
            });
        } else {
          task = this.storage.upload(path, item.file);
          item.assignTask(task);
        }
      });
  }

  /**
   * Add files to the queue
   */
  addFiles(fileList: FileList) {
    if (fileList.length) {
      let files: FileItem[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = new FileItem(fileList[i], this);
        files = [...files, file];
      }
      if (this.multiple) {
        // Combine and filter duplicated files
        files = [...this._state.files, ...files]
          .filter((curr, index, self) =>
            self.findIndex(t => t.file.name === curr.file.name && t.file.size === curr.file.size) === index
          );
      }
      this.setState({files});
      this.files.emit(this._state.files);
      this.calculateTotalProgress$.next(null);

      // Starts uploading as soon as the file are added
      if (this.autoStart) {
        this.start();
      }
    }
  }

  /**
   * Remove file from the queue
   */
  remove(file: FileItem) {
    file.cancel();
    file.state$.complete();
    const files = this._state.files.filter(item => item !== file);
    this.setState({files});
    this.files.emit(this._state.files);
    this.calculateTotalProgress$.next(null);
  }

  /**
   * Resets the uploader
   */
  clear() {
    this._state.files.map((file: FileItem) => {
      file.cancel();
      file.state$.complete();
    });
    this.setState({files: []});
    this.files.emit(this._state.files);
    this.calculateTotalProgress$.next(null);
    this.reset.emit();
  }

  pause() {
    this._state.files.map((file: FileItem) => file.pause());
  }

  resume() {
    this._state.files.map((file: FileItem) => file.resume());
  }

  private setState(state: FireUploaderState) {
    this._state = {...this._state, ...state};
    this.state$.next(this._state);
  }

}
