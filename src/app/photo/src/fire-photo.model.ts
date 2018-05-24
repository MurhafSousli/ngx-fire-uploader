export interface FirePhotoConfig {
  paramDir?: string;
  paramName?: string;
  uniqueName?: boolean;
  dropZone?: boolean;
  defaultImage?: string;
  autoStart?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbMethod?: 'crop' | 'contain';
  resizeMethod?: 'crop' | 'contain';
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMimeType?: string;
  resizeQuality?: number;
  maxFileSize?: number;
}
