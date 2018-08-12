import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { FileItem, ResizeMethod, FireUploaderProgress } from '@ngx-fire-uploader/core';

@Component({
  selector: 'app-basic-example',
  templateUrl: './basic-example.component.html',
  styleUrls: ['./basic-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicExampleComponent {

  files = [];
  links = [];
  progress: FireUploaderProgress;
  active = false;

  notifOptions = {
    timeOut: 5000,
    showProgressBar: true,
    pauseOnHover: false,
    clickToClose: false,
    maxLength: 10
  };

  uniqueName = true;
  dropZone = true;
  multiple = true;
  maxFilesCount = 20;
  maxFileSize = 5;
  paramName;
  paramDir;
  placeholder = 'Drop files here or click to select';
  accept = null;
  parallelUploads = 1;
  thumbs = true;
  thumbWidth = 100;
  thumbHeight = 100;
  resizeWidth;
  resizeHeight;
  resizeMethod = ResizeMethod.Crop;

  constructor(private notifications: NotificationsService) {
  }

  onFiles(e) {
    this.files = e;
  }

  onSuccess(e: FileItem) {
    this.notifications.success('File uploaded successfully!', e.state.name, this.notifOptions);
  }

  onComplete(e) {
    this.links = e.map(file => file.downloadURL);
    this.notifications.info('Operation finished!', `${this.links.length} files has been uploaded`, this.notifOptions);
  }

  onProgress(e) {
    this.progress = e;
  }

  onRemove(e: FileItem) {
    this.notifications.info('File removed!', e.state.name, this.notifOptions);
  }

  onCancel(e: FileItem) {
    this.notifications.info('Upload cancelled!', e.state.name, this.notifOptions);
  }

  onError(e) {
    this.notifications.error('Error!', e.message, this.notifOptions);
  }

  onReset() {
    this.notifications.alert('Cleared!', 'All items has been removed', this.notifOptions);
  }

  onValue(e) {
    console.log('value', e);
  }

  onActive(e) {
    this.active = e;
  }

}
