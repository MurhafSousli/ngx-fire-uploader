import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FileItem, FileSnapshot } from '../fire-uploader';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators/filter';
import { take } from 'rxjs/operators/take';
import { map } from 'rxjs/operators/map';

const DEFAULT_PROFILE_PIC = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';

@Component({
  selector: 'app-profile-pic-example',
  templateUrl: './profile-pic-example.component.html',
  styleUrls: ['./profile-pic-example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePicExampleComponent implements OnInit {

  uploadProfilePic = false;
  process$ = new BehaviorSubject(DEFAULT_PROFILE_PIC);
  profilePic$: Observable<any>;

  ngOnInit() {
    this.profilePic$ = this.process$.pipe(
      map((imgURL: string) => `url(${imgURL})`)
    );
  }

  onProfilePic(photos: FileItem[]) {
    if (photos.length) {
      photos[0].snapshot$.pipe(
        filter((state: FileSnapshot) => !!state.thumbnail),
        map((state: FileSnapshot) => this.process$.next(state.thumbnail)),
        take(1)
      ).subscribe();
    }
  }

  reset() {
    this.process$.next(DEFAULT_PROFILE_PIC);
  }
}
