import { FileItem } from './file-item';

export interface UploaderProgress {
  percentage?: number;
  bytesTransferred?: number;
  totalBytes?: number;
}

export interface UploaderState {
  files?: FileItem[];
  progress?: UploaderProgress;
  active?: boolean;
}

export interface FileSnapshot {
  ref?: any;
  name?: string;
  type?: string;
  extension?: string;
  progress?: UploaderProgress;
  thumbnail?: string;
  downloadURL?: string;
  active?: boolean;
  state?: string;
}

export interface FireUploaderConfig {
  paramDir?: string;
  paramName?: string;
  uniqueName?: boolean;
  multiple?: boolean;
  accept?: string;
  parallelUploads?: number;
  maxFiles?: number;
  maxFileSize?: number;
  autoStart?: boolean;
  thumbs?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbMethod?: ResizeMethod;
  resizeMethod?: ResizeMethod;
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMimeType?: string;
  resizeQuality?: number;
}
export enum ResizeMethod {
  Crop = 'crop',
  Contain = 'contain'
}
