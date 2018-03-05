import { FileItem } from './file-item.class';

export interface FireUploaderState {
  files?: FileItem[];
  totalProgress?: TotalProgress;
  loading?: boolean;
  success?: boolean;
  error?: any;
}

export interface TotalProgress {
  progress?: number;
  bytesTransferred?: number;
  totalBytes?: number;
}

