import { InjectionToken } from '@angular/core';

export interface UploadConfig {
  previewHeight?: number;
  previewWidth?: number;
  showProgress?: boolean;
  showDetails?: boolean;
  showRemove?: boolean;
}

export const CONFIG = new InjectionToken<UploadConfig>('config');
