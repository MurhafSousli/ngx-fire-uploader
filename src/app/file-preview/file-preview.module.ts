import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NFormatterPipe } from './n-formatter.pipe';
import { FileItemComponent } from './file-item/file-item.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { FilePreviewComponent } from './file-preview.component';
import { CONFIG, UploadConfig } from './upload-config.model';
import { PreviewerManager } from './previewer-manager';

export function previewerFactory(config: UploadConfig) {
  return new PreviewerManager(config);
}

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileItemComponent,
    NFormatterPipe,
    SafeUrlPipe,
    FilePreviewComponent
  ],
  exports: [
    FilePreviewComponent,
    NFormatterPipe
  ]
})
export class FilePreviewModule {
  static forRoot(config?: UploadConfig): ModuleWithProviders {
    return {
      ngModule: FilePreviewModule,
      providers: [
        {provide: CONFIG, useValue: config},
        {
          provide: PreviewerManager,
          useFactory: previewerFactory,
          deps: [CONFIG]
        }
      ]
    };
  }
}
