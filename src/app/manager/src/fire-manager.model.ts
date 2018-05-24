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
  thumbMethod?: 'crop' | 'contain';
  resizeMethod?: 'crop' | 'contain';
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMimeType?: string;
  resizeQuality?: number;
  maxFileSize?: number;
}
