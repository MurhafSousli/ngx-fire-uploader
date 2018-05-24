import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FireUploaderModule } from '../../core';

import { FileItemComponent } from './file-item.component';
import { FireManagerComponent } from './fire-manager.component';
import { FileSizePipe } from './file-size.pipe';
import { SafeStylePipe } from './safe-style.pipe';
import { FireManagerConfig } from './fire-manager.model';
import { FireManager } from './fire-manager';
import { CONFIG } from './fire-manager.token';

export function previewerFactory(config: FireManagerConfig) {
  return new FireManager(config);
}

@NgModule({
  imports: [
    CommonModule,
    FireUploaderModule
  ],
  declarations: [
    FireManagerComponent,
    FileItemComponent,
    FileSizePipe,
    SafeStylePipe
  ],
  exports: [
    FireManagerComponent,
    FileSizePipe
  ]
})
export class FireManagerModule {
  static forRoot(config?: FireManagerConfig): ModuleWithProviders {
    return {
      ngModule: FireManagerModule,
      providers: [
        {provide: CONFIG, useValue: config},
        {
          provide: FireManager,
          useFactory: previewerFactory,
          deps: [CONFIG]
        }
      ]
    };
  }
}
