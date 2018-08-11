import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { UploadTaskSnapshot } from 'angularfire2/storage/interfaces';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { FileState, FireUploaderConfig } from './fire-uploader.model';
import { isImage } from './utils';
import { resizeImage } from './image-resizer';

/**
 * FileItem class for each file in the uploader queue
 */
export class FileItem {

  /** File storage ref */
  private readonly _ref: AngularFireStorageReference;

  /** File path in fire storage */
  private readonly _path: string;

  /** File upload task ref */
  private _task: AngularFireUploadTask;

  /** FileItem state */
  state: FileState = {
    active: false,
    state: 'init',
    progress: {
      percentage: 0,
      bytesTransferred: 0,
      totalBytes: 0
    }
  };

  /** Stream that emits FileItem state */
  state$ = new BehaviorSubject<FileState>(this.state);

  /** Creates FileItem class for each file added to uploader queue */
  constructor(public file: File, public config: FireUploaderConfig, private _storage: AngularFireStorage) {

    // Initialize file item state
    this.updateState({
      name: file.name,
      type: file.type,
      extension: file.name.split('.').pop(),
      progress: {
        percentage: 0,
        bytesTransferred: 0,
        totalBytes: file.size
      }
    });

    // Set directory name where the file should be stored in the fire cloud
    const dirName = this.config.paramDir ? `${this.config.paramDir}/` : '';

    // Set a prefix to the file name, useful to avoid overriding an existing file
    const prefixName = this.config.uniqueName ? `${new Date().getTime()}_` : '';

    // Set file name to either a custom name or the original file name
    const fileName = this.config.paramName || file.name;

    this._path = dirName + prefixName + fileName;
    this._ref = this._storage.ref(this._path);
  }

  /** Prepare file, functions to be executed when a file is added (Used for image files) */
  prepare(): Observable<any> {
    return of({}).pipe(
      // Check if file type is image
      filter(() => isImage(this.file)),
      switchMap(() => this.generateThumb()),
      switchMap(() => this.resizeImage()),
      take(1)
    );
  }

  /** Assign AngularFireUploadTask to FileItem */
  upload(): Observable<any> {
    this._task = this._storage.upload(this._path, this.file);
    this._task.snapshotChanges().pipe(tap((snapshot: UploadTaskSnapshot) => this.onSnapshotChanges(snapshot))).subscribe();
    return from(this._task).pipe(switchMap((task: UploadTaskSnapshot) => this.onTaskComplete(task)));
  }

  /** Delete file after it is uploaded */
  delete(): Observable<any> {
    return this._ref.delete();
  }

  /** Pause upload task */
  pause() {
    if (this._task) {
      this._task.pause();
    }
  }

  /** Resume upload task */
  resume() {
    if (this._task) {
      this._task.resume();
    }
  }

  /** Cancel upload task */
  cancel() {
    if (this._task) {
      this._task.cancel();
    }
  }

  destroy() {
    this.state$.complete();
  }

  /** Update FileItem state */
  private updateState(state: FileState) {
    this.state = {...this.state, ...state};
    this.state$.next(this.state);
  }

  /** Update FileItem state when UploadTaskSnapshot changes */
  private onSnapshotChanges(state: UploadTaskSnapshot) {
    this.updateState({
      active: state.state === 'running',
      state: state.state,
      progress: {
        percentage: (state.bytesTransferred / state.totalBytes) * 100,
        bytesTransferred: state.bytesTransferred,
        totalBytes: state.totalBytes
      }
    });
  }

  /** Update FileItem state when UploadTaskSnapshot completes */
  private onTaskComplete(task: UploadTaskSnapshot) {
    return this._ref.getDownloadURL().pipe(
      tap((downloadURL: string) => {
        this.updateState({
          downloadURL: downloadURL,
          active: false,
          state: task.state,
          progress: {
            percentage: 100,
            bytesTransferred: task.bytesTransferred,
            totalBytes: task.totalBytes
          }
        });
      })
    );
  }

  /** Generate image thumbnail */
  private generateThumb(): Observable<any> {
    if (this.config.thumbs) {
      // Update file item state with thumbnail
      return resizeImage(this.file, this.config.thumbWidth, this.config.thumbHeight, this.config.thumbMethod, 1).pipe(
        tap((blob: Blob) => this.updateState({thumbnail: window.URL.createObjectURL(blob)}))
      );
    }
    return of({});
  }

  /** Resize image */
  private resizeImage(): Observable<any> {
    if (this.config.resizeWidth || this.config.resizeHeight) {
      return resizeImage(this.file, this.config.resizeWidth, this.config.resizeHeight, this.config.thumbMethod, 1).pipe(
        tap((newFile: File) => {
          this.file = newFile;
          this.updateState({
            progress: {
              percentage: 0,
              bytesTransferred: 0,
              totalBytes: newFile.size
            }
          });
        })
      );
    }
    return of({});
  }

}
