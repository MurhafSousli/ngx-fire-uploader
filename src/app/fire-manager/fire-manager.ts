import { Inject, Injectable, Optional } from '@angular/core';
import { FireManagerConfig } from './fire-manager.model';
import { CONFIG } from './fire-manager.token';

const defaultConfig: FireManagerConfig = {
  showProgress: true,
  showDetails: true,
  showRemove: true
};

@Injectable()
export class FireManager {

  /** Global config */
  config: FireManagerConfig;

  constructor(@Optional() @Inject(CONFIG) config: FireManagerConfig) {
    this.config = {...defaultConfig, ...config};
  }
}
