import { AngularFireUploadTask } from 'angularfire2/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { isImage, resizeImage } from './utils';
import { FileState } from './fire-uploader.model';
import { FileUploaderComponent } from './file-uploader.component';

export class FileItem {

  private _task: AngularFireUploadTask;

  state: FileState = {
    name: null,
    type: null,
    thumbnail: null,
    state: null,
    downloadURL: null,
    active: false,
    progress: {
      percentage: 0,
      bytesTransferred: 0,
      totalBytes: 0
    }
  };

  state$ = new BehaviorSubject<FileState>(this.state);

  constructor(public file: File, private _uploader: FileUploaderComponent) {

    const state = {
      name: file.name,
      type: file.type,
      extension: file.name.split('.').pop(),
      progress: {
        percentage: 0,
        bytesTransferred: 0,
        totalBytes: file.size,
      }
    };

    /** If file is type of image, create a thumbnail */
    if (this._uploader.thumbs && isImage(file)) {

      resizeImage(file, this._uploader.thumbWidth, this._uploader.thumbHeight, this._uploader.thumbnailMethod, 1)
        .subscribe((blob: Blob) => {
            this.setState({
              ...state,
              thumbnail: URL.createObjectURL(blob)
            });
          }, (err: Error) => {
            this._uploader.errorEmitter.emit(err);
            this.setState(state);
          }
        );
    } else {
      this.setState(state);
    }
  }

  // private async initialize(file, width, height, method, quality) {
  //
  //   try {
  //
  //     const thumbnail = await resizeImage(file, width, height, method, quality);
  //
  //     this.setState({
  //       ...state,
  //       thumbnail: (this._uploader.thumbs && isImage(file))
  //         ?
  //         : null
  //     });
  //   }
  //   catch (e) {
  //
  //     this.setState(state);
  //   }
  // }

  assignTask(task: AngularFireUploadTask) {
    this._task = task;

    this._task.snapshotChanges().pipe(
      map(snapshot => {

        this.setState({
          active: snapshot.state === 'running',
          state: snapshot.state,
          progress: {
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes
          }
        });
        this._uploader.updateRootState$.next(null);
      })
    ).subscribe();

    return this._task
      .then(snapshot => {

        if (snapshot.downloadURL) {
          this.setState({
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
      })
      .catch((err: Error) => {
        this.setState({
          active: false,
        });
        this._uploader.errorEmitter.emit(err);
      });
  }

  delete() {
    return this.state.ref.delete()
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
    this.setState({
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

  setState(state: FileState) {
    this.state = {...this.state, ...state};
    this.state$.next(this.state);
  }

}
