import { ResizeMethod } from '@ngx-fire-uploader/core';

export interface FireManagerConfig {
  showProgress?: boolean;
  showDetails?: boolean;
  showRemove?: boolean;
  extensions?: any;
  dropZone?: boolean;
  paramDir?: string;
  paramName?: string;
  uniqueName?: boolean;
  maxFileSize?: number;
  maxFilesCount?: number;
  parallelUploads?: number;
  multiple?: boolean;
  accept?: string;
  autoStart?: boolean;
  thumbs?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbMethod?: ResizeMethod;
  resizeMethod?: ResizeMethod;
  resizeWidth?: number;
  resizeHeight?: number;
  resizeQuality?: number;
}
