import { ResizeMethod } from '@ngx-fire-uploader/core';

export interface FirePhotoConfig {
  paramDir?: string;
  paramName?: string;
  uniqueName?: boolean;
  dropZone?: boolean;
  defaultImage?: string;
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
