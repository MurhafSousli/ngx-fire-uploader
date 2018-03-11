import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UploaderProgress } from './file-uploader/fire-uploader.model';
import { FileItem } from './file-uploader/file-item.class';

const DEFAULT_PROFILE_PIC = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  files = [];
  links = [];
  progress: UploaderProgress;
  active = false;
  lockProfile = true;
  profilePic = DEFAULT_PROFILE_PIC;
  selectedPic;

  onFiles(e) {
    this.files = e;
  }

  onSuccess(e) {
    console.log('success', e);
  }

  onComplete(e) {
    this.links = e.map(file => file.downloadURL);
    console.log('complete', e);
  }

  onProgress(e) {
    this.progress = e;
  }

  onRemove(e) {
    console.log(e);
  }

  onCancel(e) {
    console.log(e);
  }

  onError(e) {
    console.log(e);
  }

  onActiveChange(e) {
    this.active = e;
  }

  onProfilePic(photos: FileItem[]) {
    if (photos[0] && photos[0].state.preview) {
      this.selectedPic = photos[0].state.preview;
    }
  }

  getProfilePic() {
    const url = (this.lockProfile) ? this.profilePic : (this.profilePic || this.selectedPic);
    return `url(${url})`;
  }
}
