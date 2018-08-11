import { Observable, fromEvent, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ResizeMethod } from './fire-uploader.model';
import { blobToFile } from './utils';

interface ImageSize {
  width: number;
  height: number;
}

/**
 * Image re-sizer function
 */
export function resizeImage(file: File,
                            maxWidth: number,
                            maxHeight: number,
                            method = ResizeMethod.Crop,
                            quality: number): Observable<File> {
  const image = new Image();
  return of({}).pipe(
    map(() => initSize(maxWidth, maxHeight)),
    switchMap((size: ImageSize) => {
      return loadImage(image, file).pipe(
        map(() => resize(image, method, size)),
        map((newSize: ImageSize) => imageToCanvas(image, newSize.width, newSize.height)),
        switchMap((canvas: HTMLCanvasElement) => canvasToFile(canvas, file.name, file.type, quality))
      );
    })
  );
}

/**
 * Initialize image size
 */
function initSize(maxWidth: number, maxHeight: number): ImageSize {
  return {
    width: maxWidth ? maxWidth : maxHeight,
    height: maxHeight ? maxHeight : maxWidth
  };
}

/**
 * Load Image
 */
function loadImage(image: HTMLImageElement, file: File): Observable<any> {
  const loadSuccess = fromEvent(image, 'load');
  image.src = URL.createObjectURL(file);
  return loadSuccess;
}

/**
 * Get proper size using contain size or cover size
 */
function resize(image: HTMLImageElement, method: ResizeMethod, maxSize: ImageSize): ImageSize {
  switch (method) {
    case ResizeMethod.Contain:
      if (image.width > image.height) {
        return {
          width: image.width * (maxSize.height / image.height),
          height: maxSize.height
        };
      }
      return {
        width: maxSize.width,
        height: image.height * (maxSize.width / image.width)
      };
    case ResizeMethod.Crop:
      if (image.width > image.height) {
        return {
          width: maxSize.width,
          height: image.height * (maxSize.width / image.width)
        };
      }
      return {
        width: image.width * (maxSize.height / image.height),
        height: maxSize.height
      };
  }
}

/**
 * Convert image to canvas
 */
function imageToCanvas(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

/**
 * Convert canvas to file
 */
function canvasToFile(canvas: HTMLCanvasElement, name: string, type: string, quality: number): Observable<File> {
  if (typeof canvas.toBlob === 'function') {
    return new Observable(observer => {
      canvas.toBlob((blob: Blob) => {
        // Create new image file and set image type
        const file = blobToFile(blob, type, name);
        observer.next(file);
        observer.complete();
      }, type, quality);
    });
  } else {
    return of(blobToFile(canvas.msToBlob(), type, name));
  }
}
