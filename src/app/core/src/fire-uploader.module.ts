import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireStorageModule, AngularFireStorage } from 'angularfire2/storage';

import { FireUploader } from './fire-uploader';
import { FireUploaderConfig } from './fire-uploader.model';
import { UPLOADER_CONFIG } from './fire-uploader.token';
import { DropZoneDirective } from './drop-zone.directive';

export function UploaderFactory(config: FireUploaderConfig, storage: AngularFireStorage) {
  return new FireUploader(config, storage);
}

@NgModule({
  imports: [AngularFireStorageModule],
  declarations: [DropZoneDirective],
  exports: [DropZoneDirective]
})
export class FireUploaderModule {
  static forRoot(config?: FireUploaderConfig): ModuleWithProviders {
    return {
      ngModule: FireUploaderModule,
      providers: [
        {provide: UPLOADER_CONFIG, useValue: config},
        {
          provide: FireUploader,
          useFactory: UploaderFactory,
          deps: [UPLOADER_CONFIG, AngularFireStorage]
        }
      ]
    };
  }
}
