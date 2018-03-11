import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { FileItem } from './file-item.class';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';

export function resizeImage(file: File, maxWidth: number, maxHeight: number, method: 'crop' | 'contain'): Observable<Blob> {

  // Check if maxWidth or maxHeight is null
  if (!maxHeight) {
    maxHeight = maxWidth;
  } else if (!maxWidth) {
    maxWidth = maxHeight;
  }

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

        canvas.toBlob(resolve, file.type);
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
export function processFile(item: FileItem, width: number, height: number, method: 'crop' | 'contain') {
  return (width || height) ?
    resizeImage(item.file, width, height, method) :
    of(item);
}

export const maxFilesError = (maxFiles: number) => {
  return {
    type: '',
    message: `Max files has exceeded, Only ${maxFiles} is accepted.`
  };
};

export const maxFileSizeError = (fileName: string) => {
  return {
    type: '',
    message: `${fileName} has exceeded the max size allowed.`
  };
};
