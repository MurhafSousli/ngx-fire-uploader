import { AngularFireUploadTask } from 'angularfire2/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { isImage, resizeImage } from './utils';
import { FileSnapshot } from './fire-uploader.model';
import { FireUploaderComponent } from './fire-uploader.component';

export class FileItem {

  private _task: AngularFireUploadTask;

  snapshot: FileSnapshot;
  snapshot$ = new BehaviorSubject<FileSnapshot>({});

  constructor(public file: File, private _uploader: FireUploaderComponent) {

    this.updateSnapshot({
      name: file.name,
      type: file.type,
      active: false,
      extension: file.name.split('.').pop(),
      progress: {
        percentage: 0,
        bytesTransferred: 0,
        totalBytes: file.size
      }
    });

    /** If file is type of image, create a thumbnail */
    if (this._uploader.thumbs && isImage(file)) {

      resizeImage(file, this._uploader.thumbWidth, this._uploader.thumbHeight, this._uploader.thumbnailMethod, 1)
        .subscribe(
          (blob: Blob) => this.updateSnapshot({thumbnail: URL.createObjectURL(blob)}),
          (err: Error) => this._uploader.errorEmitter.emit(err)
        );
    }
  }

  assignTask(task: AngularFireUploadTask): Promise<any> {
    this._task = task;

    this._task.snapshotChanges()
      .subscribe((snapshot: any) => this.onSnapshotChanges(snapshot));

    return this._task
      .then((snapshot: any) => this.onTaskComplete(snapshot))
      .catch((err: Error) => {
        this.updateSnapshot({active: false});
        this._uploader.errorEmitter.emit(err);
      });
  }

  delete() {
    this.snapshot.ref.delete()
      .then(() => {
        this._uploader.removeEmitter.emit(this);
        this.cancel();
      })
      .catch((err) => this._uploader.errorEmitter.emit(err));
  }

  pause() {
    if (this._task) {
      this._task.pause();
    }
  }

  resume() {
    if (this._task) {
      this._task.resume();
    }
  }

  cancel() {
    if (this._task) {
      this._task.cancel();
    }
    this.reset();
  }

  reset() {
    this.updateSnapshot({
      state: null,
      active: false,
      downloadURL: null,
      progress: {
        percentage: 0,
        bytesTransferred: 0,
        totalBytes: this.file.size
      }
    });
  }

  private updateSnapshot(snapshot: FileSnapshot) {
    this.snapshot = {...this.snapshot, ...snapshot};
    this.snapshot$.next(this.snapshot);
  }

  private onSnapshotChanges(snapshot: any) {
    this.updateSnapshot({
      active: snapshot.state === 'running',
      state: snapshot.state,
      progress: {
        percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes
      }
    });
    this._uploader.updateRootState$.next(null);
  }

  private onTaskComplete(snapshot: any) {
    if (snapshot.downloadURL) {
      this.updateSnapshot({
        downloadURL: snapshot.downloadURL,
        ref: snapshot.ref,
        active: false,
        state: snapshot.state,
        progress: {
          percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        }
      });
      this._uploader.successEmitter.emit(this);
    }
  }

}
