import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// import { FirePhotoModule } from '@ngx-fire-uploader/photo';
import { FirePhotoModule } from '../fire-uploader/photo';

import { ProfilePicExampleComponent } from './profile-pic-example.component';


@NgModule({
  declarations: [
    ProfilePicExampleComponent
  ],
  imports: [
    CommonModule,
    FirePhotoModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: ProfilePicExampleComponent
      }
    ])
  ]
})
export class ProfilePicModule {

}
