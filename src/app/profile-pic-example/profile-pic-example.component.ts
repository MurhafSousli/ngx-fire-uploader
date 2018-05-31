import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FileItem, FileSnapshot, UploaderProgress } from '../core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { take } from 'rxjs/operators/take';
import { map } from 'rxjs/operators/map';
import { FirePhotoComponent } from '../photo';
import { of } from 'rxjs/observable/of';
import { delay } from 'rxjs/operators/delay';

// const DEFAULT_PROFILE =
//   'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';

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
  test;

  ngOnInit() {
    this.test = of(this.defaultProfilePhoto).pipe(delay(2000));
  }

  onCoverProgress(e: UploaderProgress) {
    this.coverProgress = e.percentage;
  }

  saveChanges(
    coverUploader: FirePhotoComponent,
    profileUploader: FirePhotoComponent
  ) {
    coverUploader.start();
    profileUploader.start();
    this.disabled = true;
  }

  cancel(
    coverUploader: FirePhotoComponent,
    profileUploader: FirePhotoComponent
  ) {
    coverUploader.reset();
    profileUploader.reset();
    this.disabled = true;
  }
}
