import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { FileItem } from './file-item';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators/map';
import { ResizeMethod } from './fire-uploader.model';

/**
 * Opens select file dialog
 */
export function selectFiles(
  accept: string,
  multiple: boolean
): Observable<FileList> {
  return fromPromise(
    new Promise(resolve => {
      const fileInput: HTMLInputElement = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = multiple;
      fileInput.accept = accept;
      fileInput.onchange = () => resolve(fileInput.files);
      fileInput.click();
    })
  );
}

export function resizeImage(item: FileItem, maxWidth: number, maxHeight: number, method: ResizeMethod, quality: number): Observable<File> {
  // Check if maxWidth or maxHeight is null
  if (!maxHeight) {
    maxHeight = maxWidth;
  } else if (!maxWidth) {
    maxWidth = maxHeight;
  }

  return fromPromise(
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(item.file);
      image.onload = () => {
        const width = image.width;
        const height = image.height;

        if (width <= maxWidth && height <= maxHeight) {
          resolve(item.file);
        }

        let newWidth;
        let newHeight;

        switch (method) {
          case ResizeMethod.Contain:
            if (width > height) {
              newHeight = maxHeight;
              newWidth = width * (maxHeight / height);
            } else {
              newWidth = maxWidth;
              newHeight = height * (maxWidth / width);
            }
            break;
          case ResizeMethod.Crop:
            if (width > height) {
              newHeight = height * (maxWidth / width);
              newWidth = maxWidth;
            } else {
              newWidth = width * (maxHeight / height);
              newHeight = maxHeight;
            }
            break;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, newWidth, newHeight);

        if (typeof canvas.toBlob === 'function') {
          canvas.toBlob((blob: Blob) => resolve(new File([blob], item.file.name)), item.file.type, quality);
        } else {
          resolve(new File([canvas.msToBlob()], item.file.name));
        }
      };
      image.onerror = reject;
    })
  );
}

export function convertToMB(size: number) {
  return size / 1024 / 1024;
}

/**
 * Splice files array into chunks for parallel upload
 */
export function parallizeUploads(files: FileItem[], parallelUploads: number) {
  const arr = [];
  let i, j;
  for (i = 0, j = files.length; i < j; i += parallelUploads) {
    arr.push(files.slice(i, i + parallelUploads));
  }
  return from(arr);
}

/**
 * Resize images if needed
 */
export function processFile(item: FileItem, width: number, height: number, method: ResizeMethod, quality: number): Observable<FileItem> {
  // If width or height is defined then resize the image
  if (width || height) {
    return resizeImage(item, width, height, method, quality).pipe(
      map((file: File) => {
        item.file = file;
        return item;
      })
    );
  }
  return of(item);
}

/**
 * Uploader errors
 */
export const maxFilesError = (maxFiles: number) => {
  return {
    type: 'uploader/count_limit_exceeded',
    message: `Max files has exceeded, Only ${maxFiles} is accepted.`
  };
};

export const maxFileSizeError = (fileName: string) => {
  return {
    type: 'uploader/size_limit_exceeded',
    message: `${fileName} has exceeded the max size allowed.`
  };
};

export const isImage = (file: File) => {
  return file.type.split('/')[0] === 'image';
};
