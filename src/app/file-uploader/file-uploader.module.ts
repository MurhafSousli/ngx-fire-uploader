import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { DropZoneDirective } from './drop-zone.directive';
import { FireUploaderManager } from './file-uploader.manager';
import { FireUploaderConfig, UPLOADER_CONFIG } from './upload-config.model';

export function UploaderFactory(config: FireUploaderConfig) {
  return new FireUploaderManager(config);
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FileUploaderComponent
  ],
  declarations: [
    FileUploaderComponent,
    DropZoneDirective
  ]
})
export class FileUploaderModule {
  static forRoot(config?: FireUploaderConfig): ModuleWithProviders {
    return {
      ngModule: FileUploaderModule,
      providers: [
        {provide: UPLOADER_CONFIG, useValue: config},
        {
          provide: FireUploaderManager,
          useFactory: UploaderFactory,
          deps: [UPLOADER_CONFIG]
        }
      ]
    };
  }
}
