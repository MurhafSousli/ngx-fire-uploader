import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FireUploaderModule } from '../core';
import { FirePhotoModule } from '../photo';

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
