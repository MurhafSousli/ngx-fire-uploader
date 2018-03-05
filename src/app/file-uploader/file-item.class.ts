import { AngularFireUploadTask } from 'angularfire2/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { resizeImage } from './utils';
import { FileUploaderComponent } from './file-uploader.component';

export class FileItem {

  task: AngularFireUploadTask;
  state: FileState = {
    name: null,
    type: null,
    preview: null,
    downloadURL: null,
    progress: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    isActive: false,
    success: false,
    error: null
  };
  state$ = new BehaviorSubject<FileState>(this.state);

  constructor(public file: File,
              private uploader: FileUploaderComponent) {

    this.setState({
      name: file.name,
      type: file.type,
      totalBytes: file.size
    });

    this.setPreviewThumb(file);
  }

  assignTask(task: AngularFireUploadTask) {
    this.task = task;
    this.task.downloadURL().subscribe((downloadURL: string) =>
      // File Uploaded
      this.setState({
        downloadURL,
        success: true
      })
    );

    this.task.percentageChanges().subscribe((progress: number) => {
      this.setState({progress});
    });

    this.task.snapshotChanges().subscribe((snapshot) => {
      this.setState({
        bytesTransferred: snapshot.bytesTransferred,
        isActive: this.isActive(snapshot)
      });
      // Calculate total progress
      this.uploader.calculateTotalProgress$.next(null);
    });

    this.task.catch((error: Error) => {
      this.setState({
        error,
        success: false
      });
    });
  }

  pause() {
    if (this.task) {
      this.task.pause();
    }
  }

  resume() {
    if (this.task) {
      this.task.resume();
    }
  }

  cancel() {
    if (this.task) {
      this.task.cancel();
    }
  }

  private setState(state: FileState) {
    this.state = {...this.state, ...state};
    this.state$.next(this.state);
  }

  private isActive(snapshot: any) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  private setPreviewThumb(file: File) {
    if (file.type.split('/')[0] === 'image') {
      resizeImage(file, this.uploader.thumbWidth, this.uploader.thumbHeight, 'contain')
        .then(blob => {
            this.setState({preview: URL.createObjectURL(blob)});
          }, err => {
            console.error('Photo error', err);
          }
        );
    }
  }

}

export interface FileState {
  name?: string;
  type?: string;
  totalBytes?: number;
  preview?: string;
  downloadURL?: string;
  progress?: number;
  bytesTransferred?: number;
  isActive?: boolean;
  success?: boolean;
  error?: any;
}
