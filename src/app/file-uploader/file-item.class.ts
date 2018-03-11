import { AngularFireUploadTask } from 'angularfire2/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { resizeImage } from './utils';
import { FileState } from './fire-uploader.model';
import { FileUploaderComponent } from './file-uploader.component';

export class FileItem {

  private _task: AngularFireUploadTask;
  state: FileState = {
    name: null,
    type: null,
    preview: null,
    downloadURL: null,
    active: false,
    success: false,
    error: null,
    progress: {
      percentage: 0,
      bytesTransferred: 0,
      totalBytes: 0
    }
  };
  state$ = new BehaviorSubject<FileState>(this.state);

  constructor(public file: File, private uploader: FileUploaderComponent) {

    this.setState({
      name: file.name,
      type: file.type,
      progress: {
        percentage: 0,
        bytesTransferred: 0,
        totalBytes: file.size,
      }
    });

    /** If file is type of image, create a thumbnail */
    if (file.type.split('/')[0] === 'image') {

      resizeImage(file, this.uploader.thumbWidth, this.uploader.thumbHeight, 'contain')
        .subscribe((blob: Blob) => {
            this.setState({preview: URL.createObjectURL(blob)});
          }, (error: Error) => {
            this.setState({error});
          }
        );
    }
  }

  assignTask(task: AngularFireUploadTask) {
    this._task = task;

    this._task.snapshotChanges().pipe(
      map(snapshot => {

        console.log(snapshot);
        this.setState({
          active: snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes,
          progress: {
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes
          }
        });
        this.uploader.updateRootState$.next(null);
      })
    ).subscribe();

    return this._task
      .then(snapshot => {
        console.log(snapshot);
        if (snapshot.downloadURL) {
          this.setState({
            downloadURL: snapshot.downloadURL,
            ref: snapshot.ref,
            error: null,
            success: true,
            active: false,
            progress: {
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            }
          });
          this.uploader.success.emit(this);
        }
      })
      .catch((err: Error) => {
        this.setState({
          error: err,
          success: false,
          active: false,
        });
        this.uploader.error.emit(err);
      });
  }

  delete() {
    return this.state.ref.delete();
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
  }

  setState(state: FileState) {
    this.state = {...this.state, ...state};
    this.state$.next(this.state);
  }

}
