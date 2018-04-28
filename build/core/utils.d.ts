import { Observable } from 'rxjs/Observable';
import { FileItem } from './file-item.class';
export declare function resizeImage(file: File, maxWidth: number, maxHeight: number, method: 'crop' | 'contain', quality: number): Observable<Blob>;
export declare function convertToMB(size: number): number;
/**
 * Splice files array into chunks for parallel upload
 */
export declare function parallizeUploads(files: FileItem[], parallelUploads: number): Observable<any>;
/**
 * Resize images if needed
 */
export declare function processFile(item: FileItem, width: number, height: number, method: 'crop' | 'contain', quality: number): Observable<Blob> | Observable<FileItem>;
/**
 * Uploader errors
 */
export declare const maxFilesError: (maxFiles: number) => {
    type: string;
    message: string;
};
export declare const maxFileSizeError: (fileName: string) => {
    type: string;
    message: string;
};
export declare const isImage: (file: File) => boolean;
