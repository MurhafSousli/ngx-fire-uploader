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
  multiple?: boolean;
  accept?: string;
  autoStart?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbMethod?: ResizeMethod;
  resizeMethod?: ResizeMethod;
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMimeType?: string;
  resizeQuality?: number;
  maxFileSize?: number;
}
