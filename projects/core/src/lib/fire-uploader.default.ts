import { FireUploaderState, FireUploaderConfig, ResizeMethod } from './fire-uploader.model';

/** Uploader default config  */
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
  thumbMethod: ResizeMethod.Contain,
  thumbWidth: 100,
  thumbHeight: 100,
  resizeMethod: ResizeMethod.Crop,
  resizeWidth: null,
  resizeHeight: null,
  resizeMimeType: null,
  resizeQuality: 1
};

export const DEFAULT_STATE: FireUploaderState = {
  files: [],
  active: false,
  progress: {
    totalBytes: 0,
    bytesTransferred: 0,
    percentage: 0
  }
};
