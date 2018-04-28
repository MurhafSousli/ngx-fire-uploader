import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FireUploaderModule } from '../fire-uploader';

import { ProfilePicExampleComponent } from './profile-pic-example.component';
import { SafeStylePipe } from './safe-style.pipe';


@NgModule({
  declarations: [
    ProfilePicExampleComponent,
    SafeStylePipe
  ],
  imports: [
    CommonModule,
    FireUploaderModule,
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
