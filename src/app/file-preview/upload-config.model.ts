import { InjectionToken } from '@angular/core';

export interface UploadConfig {
  showProgress?: boolean;
  showDetails?: boolean;
  showRemove?: boolean;
  extensions?: any;
}

export const CONFIG = new InjectionToken<UploadConfig>('config');
