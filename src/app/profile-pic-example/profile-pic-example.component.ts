import { ChangeDetectionStrategy, Component, QueryList, ViewChildren } from '@angular/core';
import { FirePhotoComponent } from '@ngx-fire-uploader/photo';

const DEFAULT_PROFILE =
  'https://media.wired.com/photos/59268c5dcfe0d93c474309a2/master/w_1300,c_limit/BSP_054.jpg';

@Component({
  selector: 'app-profile-pic-example',
  templateUrl: './profile-pic-example.component.html',
  styleUrls: ['./profile-pic-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePicExampleComponent {
  coverPhotoDisabled = false;
  profilePhotoDisabled = false;
  profilePhoto = DEFAULT_PROFILE;
  coverPhoto = DEFAULT_PROFILE;

  @ViewChildren(FirePhotoComponent) uploaders: QueryList<FirePhotoComponent>;

  upload() {
    this.uploaders.map((uploader: FirePhotoComponent) => uploader.start());
    this.coverPhotoDisabled = true;
    this.profilePhotoDisabled = true;
  }

  edit() {
    this.coverPhotoDisabled = false;
    this.profilePhotoDisabled = false;
  }

  cancel() {
    this.uploaders.map((uploader: FirePhotoComponent) => uploader.reset());
    this.coverPhotoDisabled = true;
    this.profilePhotoDisabled = true;
  }
}
