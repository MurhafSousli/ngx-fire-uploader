import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { FileItem } from './file-item';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';

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

export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  method: 'crop' | 'contain',
  quality: number
): Observable<Blob> {
  // Check if maxWidth or maxHeight is null
  if (!maxHeight) {
    maxHeight = maxWidth;
  } else if (!maxWidth) {
    maxWidth = maxHeight;
  }
  console.log(maxWidth, maxHeight, method, quality);

  return fromPromise(
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        const width = image.width;
        const height = image.height;

        if (width <= maxWidth && height <= maxHeight) {
          resolve(file);
        }

        let newWidth;
        let newHeight;

        switch (method) {
          case 'contain':
            if (width > height) {
              newHeight = maxHeight;
              newWidth = width * (maxHeight / height);
            } else {
              newWidth = maxWidth;
              newHeight = height * (maxWidth / width);
            }
            break;
          case 'crop':
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
          canvas.toBlob(resolve, file.type, quality);
        } else {
          resolve(canvas.msToBlob());
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
export function processFile(
  item: FileItem,
  width: number,
  height: number,
  method: 'crop' | 'contain',
  quality: number
) {
  return width || height
    ? resizeImage(item.file, width, height, method, quality)
    : of(item);
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
