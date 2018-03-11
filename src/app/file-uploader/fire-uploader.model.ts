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

export interface FileState {
  ref?: any;
  name?: string;
  type?: string;
  progress?: UploaderProgress;
  preview?: string;
  downloadURL?: string;
  active?: boolean;
  success?: boolean;
  error?: any;
}
