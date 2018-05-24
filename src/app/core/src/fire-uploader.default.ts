import { FireUploaderConfig } from './fire-uploader.model';

export const DEFAULT_CONFIG: FireUploaderConfig = {
  paramName: null,
  paramDir: null,
  uniqueName: true,
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
