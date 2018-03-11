# Angular Fire Uploader


### Inputs

The following inputs can be set from the `FireUpload.forRoot(config?)`

| Name                  | Description                                           |
| --------------------- | ----------------------------------------------------- |
| paramName             |                                                       |
| uniqueName            |                                                       |
| placeholder           |                                                       |
| multiple              |                                                       |
| accept                |                                                       |
| maxUploadsPerTime     |                                                       | 
| maxFiles              |                                                       | 
| maxFileSize           |                                                       | 
| autoStart             |                                                       | 
| createImageThumbnails |                                                       | 
| thumbnailMethod       |                                                       | 
| resizeMethod          |                                                       | 
| resizeWidth           |                                                       | 
| resizeHeight          |                                                       | 
| thumbWidth            |                                                       | 
| thumbHeight           |                                                       | 
| resizeMimeType        |                                                       | 


### Outputs

| Name           | Description                                           |
| -------------- | ----------------------------------------------------- |
| state$         |                                                       |
| files          |                                                       |
| totalProgress  |                                                       |
| success        |                                                       |
| complete       |                                                       |
| reset          |                                                       | 
| error          |                                                       | 


### Functions

| Name                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| Uploader.**start()**      | Start uploading files                                 |
| Uploader.**addFiles()**   | Add files to the queue                                |
| Uploader.**removeFile()** | Remove file from the queue                            |
| Uploader.**pause()**      | Pause all files that are being uploaded               |
| Uploader.**resume()**     | Resume all files that are being paused                |
| Uploader.**clear()**      |                                                       | 





