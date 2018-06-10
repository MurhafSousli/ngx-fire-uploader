import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FireUploaderProgress } from '../fire-uploader/core';
import { FirePhotoComponent } from '../fire-uploader/photo';
// import { UploaderProgress } from '@ngx-fire-uploader/core';
// import { FirePhotoComponent } from '@ngx-fire-uploader/photo';

const DEFAULT_PROFILE =
  'https://media.wired.com/photos/59268c5dcfe0d93c474309a2/master/w_1300,c_limit/BSP_054.jpg';

@Component({
  selector: 'app-profile-pic-example',
  templateUrl: './profile-pic-example.component.html',
  styleUrls: ['./profile-pic-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePicExampleComponent {
  coverProgress: number;
  disabled = true;
  defaultProfilePhoto = DEFAULT_PROFILE;

  onCoverProgress(e: FireUploaderProgress) {
    this.coverProgress = e.percentage;
  }

  saveChanges(coverUploader: FirePhotoComponent, profileUploader: FirePhotoComponent) {
    coverUploader.start();
    profileUploader.start();
    this.disabled = true;
  }

  cancel(coverUploader: FirePhotoComponent, profileUploader: FirePhotoComponent) {
    coverUploader.reset();
    profileUploader.reset();
    this.disabled = true;
  }

  onComplete(e) {
    console.log(e);
  }
}
