import { FileItem } from './file-item.class';

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
