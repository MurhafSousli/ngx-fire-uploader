import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FireUploaderComponent } from './fire-uploader.component';
import { DropZoneDirective } from './drop-zone.directive';
import { FireUploader } from './fire-uploader';
import { FireUploaderConfig } from './fire-uploader.model';
import { UPLOADER_CONFIG } from './fire-uploader.token';

export function UploaderFactory(config: FireUploaderConfig) {
  return new FireUploader(config);
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FireUploaderComponent
  ],
  declarations: [
    FireUploaderComponent,
    DropZoneDirective
  ]
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
          deps: [UPLOADER_CONFIG]
        }
      ]
    };
  }
}
