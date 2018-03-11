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
  createImageThumbnails?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbMethod?: 'crop' | 'contain';
  resizeMethod?: 'crop' | 'contain';
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMimeType?: string;
}

export const UPLOADER_CONFIG = new InjectionToken<FireUploaderConfig>('config');
