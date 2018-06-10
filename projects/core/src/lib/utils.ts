import { Observable, from } from 'rxjs';
import { debounceTime, map, mergeAll, reduce, switchMap } from 'rxjs/operators';
import { FileItem } from './file-item';
import { FileState, FireUploaderState } from './fire-uploader.model';

/** Combine the states of all files in a single state */
export function combineStates(files: FileItem[]): Observable<FireUploaderState> {

  const state$Arr = from(files).pipe(map((item: FileItem) => item.state$));
  const stateArr = from(files).pipe(map((item: FileItem) => item.state));

  return from(state$Arr).pipe(
    mergeAll(),
    debounceTime(100),
    switchMap(() => from(stateArr).pipe(
      reduce((total: FileState, state: FileState) => {
        return {
          active: total.active || state.active,
          progress: {
            percentage: (total.progress.bytesTransferred / total.progress.totalBytes) * 100,
            bytesTransferred: total.progress.bytesTransferred + state.progress.bytesTransferred,
            totalBytes: total.progress.totalBytes + state.progress.totalBytes
          }
        };
      })
    ))
  );
}

/** Convert file size to MB */
export function convertToMB(size: number) {
  return size / 1024 / 1024;
}

/** Splice files array into chunks for parallel upload */
export function parallizeUploads(files: FileItem[], parallelUploads: number): Observable<FileItem[]> {
  const arr = [];
  let i, j;
  for (i = 0, j = files.length; i < j; i += parallelUploads) {
    arr.push(files.slice(i, i + parallelUploads));
  }
  return from(arr);
}

export function blobToFile(theBlob: Blob, type: string, fileName: string): File {
  const blob: any = new Blob([theBlob], {type: type});
  blob.lastModifiedDate = new Date();
  blob.name = fileName;
  return <File>blob;
}

/** Uploader errors */
export const maxFilesError = (maxFiles: number) => {
  return {
    type: 'uploader/count_limit_exceeded',
    message: `Max files has exceeded, Only ${maxFiles} is accepted.`
  };
};

/** Throw error when max file size has exceeded */
export const maxFileSizeError = (fileName: string) => {
  return {
    type: 'uploader/size_limit_exceeded',
    message: `${fileName} has exceeded the max size allowed.`
  };
};

/** Check if a file type is image */
export const isImage = (file: File) => {
  return file.type.split('/')[0] === 'image';
};
