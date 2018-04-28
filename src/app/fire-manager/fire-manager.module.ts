import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './file-size.pipe';
import { FileItemComponent } from './file-item.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { FireManagerComponent } from './fire-manager.component';
import { FireManagerConfig } from './fire-manager.model';
import { FireManager } from './fire-manager';
import { CONFIG } from './fire-manager.token';

export function previewerFactory(config: FireManagerConfig) {
  return new FireManager(config);
}

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FileItemComponent,
    FileSizePipe,
    SafeUrlPipe,
    FireManagerComponent
  ],
  exports: [
    FireManagerComponent,
    FileSizePipe,
    SafeUrlPipe
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
