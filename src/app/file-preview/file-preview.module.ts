import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './file-size.pipe';
import { FileItemComponent } from './file-item.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { FilePreviewComponent } from './file-preview.component';
import { CONFIG, UploadConfig } from './upload-config.model';
import { PreviewManager } from './preview-manager';

export function previewerFactory(config: UploadConfig) {
  return new PreviewManager(config);
}

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileItemComponent,
    FileSizePipe,
    SafeUrlPipe,
    FilePreviewComponent
  ],
  exports: [
    FilePreviewComponent,
    FileSizePipe,
    SafeUrlPipe
  ]
})
export class FilePreviewModule {
  static forRoot(config?: UploadConfig): ModuleWithProviders {
    return {
      ngModule: FilePreviewModule,
      providers: [
        {provide: CONFIG, useValue: config},
        {
          provide: PreviewManager,
          useFactory: previewerFactory,
          deps: [CONFIG]
        }
      ]
    };
  }
}
