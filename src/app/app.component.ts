import { Component } from '@angular/core';
import { TotalProgress } from './file-uploader/fire-uploader.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  files;
  links;
  totalProgress: TotalProgress;

  onFiles(e) {
    this.files = e;
  }

  onComplete(e) {
    this.links = e;
  }

  onProgress(e) {
    this.totalProgress = e;
  }
}
