import { InjectionToken } from '@angular/core';

export interface FireUploaderConfig {
  dropZone?: boolean;
  paramName?: string;
  uniqueName?: boolean;
  placeholder?: string;
  multiple?: boolean;
  accept?: string;
  parallelUploads?: number;
  maxFiles?: number;
  maxFileSize?: number;
  autoStart?: boolean;
  thumbs?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbMethod?: 'crop' | 'contain';
  resizeMethod?: 'crop' | 'contain';
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMimeType?: string;
  resizeQuality?: number;
}

export const UPLOADER_CONFIG = new InjectionToken<FireUploaderConfig>('config');
