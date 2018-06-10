import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FireUploaderModule } from '@ngx-fire-uploader/core';
import { FirePhotoComponent } from './fire-photo.component';
import { LazyImageDirective } from './lazy-image.directive';
import { FirePhotoConfig } from './fire-photo.model';
import { FirePhoto } from './fire-photo';
import { CONFIG } from './fire-photo.token';

export function firePhotoFactory(config: FirePhotoConfig) {
  return new FirePhoto(config);
}

@NgModule({
  imports: [
    CommonModule,
    FireUploaderModule
  ],
  declarations: [
    FirePhotoComponent,
    LazyImageDirective
  ],
  exports: [
    FireUploaderModule,
    FirePhotoComponent,
    LazyImageDirective
  ]
})
export class FirePhotoModule {
  static forRoot(config?: FirePhotoConfig): ModuleWithProviders {
    return {
      ngModule: FirePhotoModule,
      providers: [
        {provide: CONFIG, useValue: config},
        {
          provide: FirePhoto,
          useFactory: firePhotoFactory,
          deps: [CONFIG]
        }
      ]
    };
  }
}
