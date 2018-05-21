# Angular Fire Uploader

This plugin simplifies the process of managing FireBase file upload in Angular apps.

### Features

- All FireBase upload functions (upload/pause/resume/cancel/delete).
- Drag & drop support.
- Parallel uploads support.
- Local progress state for each file.
- Total progress state for all files.
- Ability to resize images before uploading.
- Ability to remove file after it is uploaded.
- Ability to set delay between uploads.
- Ability to set maximum files count.
- Ability to set maximum file size.
- Generates thumbnails for image files.
- Generates unique file names.
- Prevents files duplication.

### Packages

- @ngx-uploader/core: Fire Uploader
- @ngx-uploader/ui: Fire Uploader User Interface


## Fire Uploader

### Installation

**NPM**

```
npm install --save @ngx-uploader/core
```

**YARN**

```
yarn add @ngx-uploader/core
```

```ts
@NgModule({
  imports: [
    // ..
    FileUploaderModule.forRoot()
  ]
}]
```

### Usage

You will not need to set all the following inputs and outputs, 

```html
<file-uploader #uploader (progress)="progress = $event" (active)="onActiveChange($event)"></file-uploader>

<button (click)="uploader.start()">Upload</button>

<!-- Bootstrap progress bar to display uploading state -->
<ngb-progressbar type="primary" [value]="progress?.percentage"></ngb-progressbar>
```

All list of inputs and outputs

```html
<file-uploader #uploader
               [accept]="'images/*'"
               [multiple]="true"
               [uniqueName]="true"
               [maxFiles]="10"
               [maxFileSize]="5"
               [dropZone]="true"
               [placeholder]="'Drop files here or select to upload'"
               [paramName]="'attachment'"
               [paramDir]="'photos'"
               [parallelUploads]="2"
               [thumbs]="true"
               [thumbWidth]="100"
               [thumbHeight]="100"
               [resizeMethod]="'contain'"
               [resizeWidth]="800"
               [resizeHeight]="600"
               (files)="onFiles($event)"
               (progress)="onProgress($event)"
               (complete)="onComplete($event)"
               (success)="onSuccess($event)"
               (error)="onError($event)"
               (cancel)="onCancel($event)"
               (active)="onActiveChange($event)"
               (remove)="onRemove($event)"
               (reset)="onReset()">
</file-uploader>
```

### Inputs

The following inputs can also be set from the `FireUpload.forRoot(config?)`

| Name                  | Default            | Description                                           |
| --------------------- | ------------------ | ----------------------------------------------------- |
| dropZone              | true               | Enable a dropzone.                                    |
| paramName             | null               | Save the file with custom name in the cloud.          |
| paramDir              | null               | Specify a dir to store the file in, e.g. `photos`     |
| uniqueName            | true               | Create a unique name for uploader files.              |
| placeholder           | 'Drop files...'    | Placeholder text.                                     |
| multiple              | true               | Enables multiple file select.                         |
| accept                | null               | The accepted extensions.                              |
| parallelUploads       | 1                  | Maximum number of files uploading at a time.          |
| maxFiles              | 20                 | Maximum files to be selected.                         |
| maxFileSize           | null               | Maximum size for each file.                           |
| autoStart             | false              | Start uploading once user selects the files.          |
| createImageThumbnails | true               | Create image thumbnails.                              |
| thumbs                | true               | Generate thumbnails for image files.                  |
| thumbnailMethod       | 'contain'          | The method for resizing the images for preview.       |
| resizeMethod          | 'crop'             | The method for resizing the images before uploading.  |
| resizeWidth           | null               | Image new width in px.                                |
| resizeHeight          | null               | Image new height in px.                               |
| thumbWidth            | 100                | Thumbnail width in px                                 |
| thumbHeight           | 100                | Thumbnail height in px                                |
| resizeMimeType        | original mime type | The mime type of the resized image e.g. `image/jpeg`  |.


### Outputs

| Name           | Description                                               |
| -------------- | --------------------------------------------------------- |
| files          | Stream that emits when new files are added to the queue.  |
| progress       | Stream that emits when total upload progress.             |
| active         | Stream that emits when uploading starts or stops.         |
| success        | Stream that emits when a file is successfully uploaded.   |
| complete       | Stream that emits when the upload operation has finished. |
| reset          | Stream that emits when the uploader resets.               |
| error          | Stream that emits when an error occurs.                   |
| cancel         | Stream that emits when a uploading is cancelled.          |
| remove         | Stream that emits when a file is removed.                 |


### Functions

| Name                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| Uploader.state$           | Stream that emits File Uploader state.                |
| Uploader.**start()**      | Start file upload.                                    |
| Uploader.**addFiles()**   | Add files to the queue.                               |
| Uploader.**removeFile()** | Remove file from the queue.                           |
| Uploader.**pause()**      | Pause all files that are being uploaded.              |
| Uploader.**resume()**     | Resume all files that are being paused.               |
| Uploader.**cancel()**     | Cancel file upload.                                   |
| Uploader.**clear()**      | Clear the queue, reset the uploader.                  |



## File Uploader UI

### Installation

**NPM**

```
npm install --save @ngx-uploader/core @ngx-uploader/previewer
```

**YARN**

```
yarn add @ngx-uploader/core @ngx-uploader/previewer
```

```ts
@NgModule({
  imports: [
    // ..
    FileUploaderModule.forRoot(),
    FireManagerModule.forRoot(),
  ]
  // ..
})
```

Example

```html
<file-uploader #uploader>
  <file-preview [uploader]="uploader" [showDetails]="true" [showProgress]="true"></file-preview>
</file-uploader>
```

Or if you want to keep the placeholder after file has been selected

```html
<file-uploader #uploader></file-uploader>
<file-preview [uploader]="uploader" [showDetails]="true" [showProgress]="true"></file-preview>
```


| Name           | Default | Description                                              |
| -------------- | ------- | -------------------------------------------------------- |
| [uploader]     | null    | Pass the reference of the uploader component (required). |
| [showProgress] | true    | Show progress bar on file upload.                        |
| [showDetails]  | true    | Shows file name and size.                                |
| [showRemove]   | true    | Shows remove button on each file item.                   |
| [extensions]   | null    | Sets item background based on file extension.            | 
| (itemClick)    |         | Stream that emits when file item is clicked.             | 

Thumbnails is generated for images files by default, for other files types you can set a custom thumbnail by using either a background color or a background image.

The following example sets a custom background image for pdf files

```ts
FireManagerModule.forRoot({
  extensions: {
    pdf: 'url("assets/pdf.svg")',
    doc: '#335599'
  }
})
```

PreviewConfig 

| Name           | Default | Description                                              |
| -------------- | ------- | -------------------------------------------------------- |
| showProgress   | true    | Show progress bar on file upload.                        |
| showDetails    | true    | Shows file name and size.                                |
| showRemove     | true    | Shows remove button on each file item.                   |
| extensions     | null    | Sets item background based on file extension.            |
