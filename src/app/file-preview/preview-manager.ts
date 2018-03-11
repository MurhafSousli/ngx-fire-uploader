import { Inject, Injectable, Optional } from '@angular/core';
import { CONFIG, UploadConfig } from './upload-config.model';

const defaultConfig: UploadConfig = {
  previewHeight: 80,
  previewWidth: 80,
  showProgress: true,
  showDetails: true,
  showRemove: true
};

@Injectable()
export class PreviewManager {

  /** Global config */
  config: UploadConfig;

  constructor(@Optional() @Inject(CONFIG) config: UploadConfig) {
    this.config = {...defaultConfig, ...config};
  }
}
