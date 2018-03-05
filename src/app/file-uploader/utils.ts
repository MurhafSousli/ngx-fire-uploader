export function resizeImage(file: File, maxWidth: number, maxHeight: number, method: 'crop' | 'contain'): Promise<Blob> {

  // Check if maxWidth or maxHeight is null
  if (!maxHeight) {
    maxHeight = maxWidth;
  } else if (!maxWidth) {
    maxWidth = maxHeight;
  }

  return new Promise((resolve, reject) => {
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
  });
}

