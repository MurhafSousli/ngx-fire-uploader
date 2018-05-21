import { Inject, Injectable, Optional } from '@angular/core';
import { FireUploaderConfig } from './fire-uploader.model';
import { UPLOADER_CONFIG } from './fire-uploader.token';

const defaultConfig: FireUploaderConfig = {
  dropZone: true,
  paramName: null,
  paramDir: null,
  uniqueName: true,
  placeholder: 'Drop files here or click to select',
  multiple: true,
  accept: null,
  parallelUploads: 1,
  maxFiles: 20,
  autoStart: false,
  thumbs: true,
  thumbMethod: 'contain',
  thumbWidth: 100,
  thumbHeight: 100,
  resizeMethod: 'crop',
  resizeWidth: null,
  resizeHeight: null,
  resizeMimeType: null,
  resizeQuality: 1
};

@Injectable()
export class FireUploader {

  /** Global config */
  config: FireUploaderConfig;

  constructor(@Optional() @Inject(UPLOADER_CONFIG) config: FireUploaderConfig) {
    this.config = {...defaultConfig, ...config};
  }

}
