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
  extension?: string;
  progress?: UploaderProgress;
  thumbnail?: string;
  downloadURL?: string;
  active?: boolean;
  state?: string;
}
