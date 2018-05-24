import { Inject, Injectable, Optional } from '@angular/core';
import { FirePhotoConfig } from './fire-photo.model';
import { CONFIG } from './fire-photo.token';

const defaultConfig: FirePhotoConfig = {
  dropZone: true,
  uniqueName: true,
  defaultImage: null,
  autoStart: false,
  thumbMethod: 'contain',
  resizeMethod: 'crop'
};

@Injectable()
export class FirePhoto {

  /** Global config */
  config: FirePhotoConfig;

  constructor(@Optional() @Inject(CONFIG) config: FirePhotoConfig) {
    this.config = {...defaultConfig, ...config};
  }
}
