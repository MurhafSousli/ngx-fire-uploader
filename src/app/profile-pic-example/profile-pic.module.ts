import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FirePhotoModule } from '@ngx-fire-uploader/photo';

import { ProfilePicExampleComponent } from './profile-pic-example.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProfilePicExampleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
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
