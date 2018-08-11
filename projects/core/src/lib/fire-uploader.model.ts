import { FileItem } from './file-item';

/** Upload progress state */
export interface FireUploaderProgress {
  /** Progress percentage */
  percentage?: number;
  /** Bytes transferred */
  bytesTransferred?: number;
  /** Total size in bytes */
  totalBytes?: number;
}

/** Uploader state */
export interface FireUploaderState {
  /** Queued files */
  files?: FileItem[];
  /** Total upload progress */
  progress?: FireUploaderProgress;
  /** Uploader active state */
  active?: boolean;
}

/** FileItem state */
export interface FileState {
  /** File name */
  name?: string;
  /** File type */
  type?: string;
  /** File extension */
  extension?: string;
  /** File upload progress */
  progress?: FireUploaderProgress;
  /** If file is an image, this will be the image thumbnail */
  thumbnail?: string;
  /** File download URL if it has been uploaded */
  downloadURL?: string;
  /** File upload task state */
  active?: boolean;
  /** File state */
  state?: string;
}

/** Uploader config */
export interface FireUploaderConfig {
  /** Stores file in directory, e.g. photos/{FileName}. */
  paramDir?: string;
  /** Stores file with custom name in the firebase storage. */
  paramName?: string;
  /** Adds current date to file's name. */
  uniqueName?: boolean;
  /** Enables multiple file select. */
  multiple?: boolean;
  /** The accepted files types. */
  accept?: string;
  /** Maximum number of files uploading at a time. */
  parallelUploads?: number;
  /** Maximum files count in the queue. */
  maxFiles?: number;
  /** Maximum file size in MB. */
  maxFileSize?: number;
  /** Starts uploading on file select. */
  autoStart?: boolean;
  /** Generate thumbnails for image files. */
  thumbs?: boolean;
  /** Thumbnail width in px. */
  thumbWidth?: number;
  /** Thumbnail height in px. */
  thumbHeight?: number;
  /** The method used to generate the thumbnails. */
  thumbMethod?: ResizeMethod;
  /** The method used to resize the images before uploading. */
  resizeMethod?: ResizeMethod;
  /** Image new width in px. */
  resizeWidth?: number;
  /** Image new height in px. */
  resizeHeight?: number;
  /** Quality of re-sized image between 0 and 1 (not on Edge). */
  resizeQuality?: number;
}

/** Resize method options */
export enum ResizeMethod {
  Crop = 'crop',
  Contain = 'contain'
}
