import { Inject, Injectable, Optional } from '@angular/core';
import { ResizeMethod } from '@ngx-fire-uploader/core';
import { FireManagerConfig } from './fire-manager.model';
import { CONFIG } from './fire-manager.token';

const defaultConfig: FireManagerConfig = {
  showProgress: true,
  showDetails: true,
  showRemove: true,
  dropZone: true,
  autoStart: false,
  multiple: true,
  uniqueName: true,
  thumbMethod: ResizeMethod.Contain,
  thumbWidth: 100,
  thumbHeight: 100
};

@Injectable()
export class FireManager {

  /** Global config */
  config: FireManagerConfig;

  constructor(@Optional() @Inject(CONFIG) config: FireManagerConfig) {
    this.config = {...defaultConfig, ...config};
  }
}
