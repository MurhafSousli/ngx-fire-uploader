import { InjectionToken, Inject, Injectable, Optional, ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output, ViewChild, Directive, HostListener, NgModule } from '@angular/core';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireStorage } from 'angularfire2/storage';
import { debounceTime } from 'rxjs/operators/debounceTime';
import { combineAll } from 'rxjs/operators/combineAll';
import { concatMap } from 'rxjs/operators/concatMap';
import { switchMap } from 'rxjs/operators/switchMap';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { finalize } from 'rxjs/operators/finalize';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Subject } from 'rxjs/Subject';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const UPLOADER_CONFIG = new InjectionToken('config');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const defaultConfig = {
    dropZone: true,
    paramName: null,
    uniqueName: true,
    placeholder: 'Drop files here or click to select',
    multiple: true,
    accept: null,
    parallelUploads: 1,
    maxFiles: 20,
    autoStart: false,
    thumbs: true,
    thumbMethod: 'contain',
    thumbWidth: 100,
    thumbHeight: 100,
    resizeMethod: 'crop',
    resizeWidth: null,
    resizeHeight: null,
    resizeMimeType: null,
    resizeQuality: 1
};
class FireUploader {
    /**
     * @param {?} config
     */
    constructor(config) {
        this.config = Object.assign({}, defaultConfig, config);
    }
}
FireUploader.decorators = [
    { type: Injectable },
];
/** @nocollapse */
FireUploader.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [UPLOADER_CONFIG,] },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} file
 * @param {?} maxWidth
 * @param {?} maxHeight
 * @param {?} method
 * @param {?} quality
 * @return {?}
 */
function resizeImage(file, maxWidth, maxHeight, method, quality) {
    // Check if maxWidth or maxHeight is null
    if (!maxHeight) {
        maxHeight = maxWidth;
    }
    else if (!maxWidth) {
        maxWidth = maxHeight;
    }
    return fromPromise(new Promise((resolve, reject) => {
        const /** @type {?} */ image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
            const /** @type {?} */ width = image.width;
            const /** @type {?} */ height = image.height;
            if (width <= maxWidth && height <= maxHeight) {
                resolve(file);
            }
            let /** @type {?} */ newWidth;
            let /** @type {?} */ newHeight;
            switch (method) {
                case 'contain':
                    if (width > height) {
                        newHeight = maxHeight;
                        newWidth = width * (maxHeight / height);
                    }
                    else {
                        newWidth = maxWidth;
                        newHeight = height * (maxWidth / width);
                    }
                    break;
                case 'crop':
                    if (width > height) {
                        newHeight = height * (maxWidth / width);
                        newWidth = maxWidth;
                    }
                    else {
                        newWidth = width * (maxHeight / height);
                        newHeight = maxHeight;
                    }
                    break;
            }
            const /** @type {?} */ canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const /** @type {?} */ context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, newWidth, newHeight);
            if (typeof canvas.toBlob === 'function') {
                canvas.toBlob(resolve, file.type, quality);
            }
            else {
                resolve(canvas.msToBlob());
            }
        };
        image.onerror = reject;
    }));
}
/**
 * @param {?} size
 * @return {?}
 */
function convertToMB(size) {
    return size / 1024 / 1024;
}
/**
 * Splice files array into chunks for parallel upload
 * @param {?} files
 * @param {?} parallelUploads
 * @return {?}
 */
function parallizeUploads(files, parallelUploads) {
    const /** @type {?} */ arr = [];
    let /** @type {?} */ i, /** @type {?} */ j;
    for (i = 0, j = files.length; i < j; i += parallelUploads) {
        arr.push(files.slice(i, i + parallelUploads));
    }
    return from(arr);
}
/**
 * Resize images if needed
 * @param {?} item
 * @param {?} width
 * @param {?} height
 * @param {?} method
 * @param {?} quality
 * @return {?}
 */
function processFile(item, width, height, method, quality) {
    return (width || height) ?
        resizeImage(item.file, width, height, method, quality) :
        of(item);
}
/**
 * Uploader errors
 */
const maxFilesError = (maxFiles) => {
    return {
        type: 'uploader/count_limit_exceeded',
        message: `Max files has exceeded, Only ${maxFiles} is accepted.`
    };
};
const maxFileSizeError = (fileName) => {
    return {
        type: 'uploader/size_limit_exceeded',
        message: `${fileName} has exceeded the max size allowed.`
    };
};
const isImage = (file) => {
    return file.type.split('/')[0] === 'image';
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class FileItem {
    /**
     * @param {?} file
     * @param {?} _uploader
     */
    constructor(file, _uploader) {
        this.file = file;
        this._uploader = _uploader;
        this.snapshot$ = new BehaviorSubject({});
        this.updateSnapshot({
            name: file.name,
            type: file.type,
            active: false,
            extension: file.name.split('.').pop(),
            progress: {
                percentage: 0,
                bytesTransferred: 0,
                totalBytes: file.size
            }
        });
        /** If file is type of image, create a thumbnail */
        if (this._uploader.thumbs && isImage(file)) {
            resizeImage(file, this._uploader.thumbWidth, this._uploader.thumbHeight, this._uploader.thumbnailMethod, 1)
                .subscribe((blob) => this.updateSnapshot({ thumbnail: URL.createObjectURL(blob) }), (err) => this._uploader.errorEmitter.emit(err));
        }
    }
    /**
     * @param {?} task
     * @return {?}
     */
    assignTask(task) {
        this._task = task;
        this._task.snapshotChanges()
            .subscribe((snapshot) => this.onSnapshotChanges(snapshot));
        return this._task
            .then((snapshot) => this.onTaskComplete(snapshot))
            .catch((err) => {
            this.updateSnapshot({ active: false });
            this._uploader.errorEmitter.emit(err);
        });
    }
    /**
     * @return {?}
     */
    delete() {
        this.snapshot.ref.delete()
            .then(() => {
            this._uploader.removeEmitter.emit(this);
            this.cancel();
        })
            .catch((err) => this._uploader.errorEmitter.emit(err));
    }
    /**
     * @return {?}
     */
    pause() {
        if (this._task) {
            this._task.pause();
        }
    }
    /**
     * @return {?}
     */
    resume() {
        if (this._task) {
            this._task.resume();
        }
    }
    /**
     * @return {?}
     */
    cancel() {
        if (this._task) {
            this._task.cancel();
        }
        this.reset();
    }
    /**
     * @return {?}
     */
    reset() {
        this.updateSnapshot({
            state: null,
            active: false,
            downloadURL: null,
            progress: {
                percentage: 0,
                bytesTransferred: 0,
                totalBytes: this.file.size
            }
        });
    }
    /**
     * @param {?} snapshot
     * @return {?}
     */
    updateSnapshot(snapshot) {
        this.snapshot = Object.assign({}, this.snapshot, snapshot);
        this.snapshot$.next(this.snapshot);
    }
    /**
     * @param {?} snapshot
     * @return {?}
     */
    onSnapshotChanges(snapshot) {
        this.updateSnapshot({
            active: snapshot.state === 'running',
            state: snapshot.state,
            progress: {
                percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
            }
        });
        this._uploader.updateRootState$.next(null);
    }
    /**
     * @param {?} snapshot
     * @return {?}
     */
    onTaskComplete(snapshot) {
        if (snapshot.downloadURL) {
            this.updateSnapshot({
                downloadURL: snapshot.downloadURL,
                ref: snapshot.ref,
                active: false,
                state: snapshot.state,
                progress: {
                    percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes
                }
            });
            this._uploader.successEmitter.emit(this);
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class FireUploaderComponent {
    /**
     * @param {?} _manager
     * @param {?} _storage
     */
    constructor(_manager, _storage) {
        this._manager = _manager;
        this._storage = _storage;
        this._initialState = {
            files: [],
            active: false,
            progress: {
                totalBytes: 0,
                bytesTransferred: 0,
                percentage: 0
            }
        };
        this._state = this._initialState;
        this.state$ = new BehaviorSubject(this._initialState);
        this.updateRootState$ = new BehaviorSubject({});
        this._cancelUpload$ = new Subject();
        // Shows the drop zone
        this.dropZone = this._manager.config.dropZone;
        // If null, original file name will be used.
        this.paramName = this._manager.config.paramName;
        // Use date.now to create a unique name for uploaded file
        this.uniqueName = this._manager.config.uniqueName;
        // Drop zone placeholder
        this.placeholder = this._manager.config.placeholder;
        // Enables multiple file select
        this.multiple = this._manager.config.multiple;
        // The accepted extensions by the uploader
        this.accept = this._manager.config.accept;
        // Maximum number of files uploading at a time
        this.parallelUploads = this._manager.config.parallelUploads;
        // Maximum number of files to be uploaded
        this.maxFiles = this._manager.config.maxFiles;
        // Maximum file size
        this.maxFileSize = this._manager.config.maxFileSize;
        // Starts uploading when files are added
        this.autoStart = this._manager.config.autoStart;
        // Whether thumbnails for images should be generated
        this.thumbs = this._manager.config.thumbs;
        // How the images should be scaled down in case both, width and height are provided. Can be either contain or crop.
        this.thumbnailMethod = this._manager.config.thumbMethod;
        this.resizeMethod = this._manager.config.resizeMethod;
        // If set, images will be resized to these dimensions before being uploaded. If only one, resizeWidth or resizeHeight is provided,
        // the original aspect ratio of the file will be preserved.
        this.resizeWidth = this._manager.config.resizeWidth;
        this.resizeHeight = this._manager.config.resizeHeight;
        this.resizeQuality = this._manager.config.resizeQuality;
        // If null, the ratio of the image will be used to calculate it.
        this.thumbWidth = this._manager.config.thumbWidth;
        this.thumbHeight = this._manager.config.thumbHeight;
        // The mime type of the resized image (before it gets uploaded to the server). If null the original mime type will be used. To force jpeg,
        // for example, use image/jpeg.
        this.resizeMimeType = this._manager.config.resizeMimeType;
        // Emits when files are changed.
        this.filesEmitter = new EventEmitter();
        // Emits when a file is deleted.
        this.removeEmitter = new EventEmitter();
        // The file has been uploaded successfully.
        this.successEmitter = new EventEmitter();
        // Emits when the upload was either successful or erroneous.
        this.completeEmitter = new EventEmitter();
        // Emits downloadURL array for the successfully uploaded files
        this.valueEmitter = new EventEmitter();
        // Emits when an error is occurred
        this.errorEmitter = new EventEmitter();
        // Emits when active state changes
        this.activeEmitter = new EventEmitter();
        // Emits the progress %, the totalBytes and the totalBytesSent.
        this.progressEmitter = new EventEmitter();
        // Emits when the uploader is reset
        this.resetEmitter = new EventEmitter();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        // Combines queued files states
        this.updateRootState$.pipe(debounceTime(50), map(() => {
            if (this._state.files.length) {
                const /** @type {?} */ rootState = this.combineStates();
                return {
                    active: rootState.active,
                    progress: {
                        percentage: (rootState.progress.bytesTransferred / rootState.progress.totalBytes) * 100,
                        bytesTransferred: rootState.progress.bytesTransferred,
                        totalBytes: rootState.progress.totalBytes
                    }
                };
            }
            return {
                active: false,
                progress: {
                    percentage: 0,
                    bytesTransferred: 0,
                    totalBytes: 0
                }
            };
        }), tap((state) => {
            this.setState(state);
            this.progressEmitter.emit(state.progress);
            this.activeEmitter.emit(state.active);
        })).subscribe();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.progressEmitter.observers.length) {
            this.updateRootState$.complete();
        }
    }
    /**
     * Start uploading
     * @return {?}
     */
    start() {
        // Start if there are files added and the uploader is not busy
        if (!this._state.active && this._state.files.length) {
            from(this._state.files).pipe(map((file) => processFile(file, this.resizeWidth, this.resizeHeight, this.resizeMethod, this.resizeQuality)), combineAll(), switchMap((files) => parallizeUploads(files, this.parallelUploads)), concatMap((chunk) => this.uploadFiles(chunk)), takeUntil(this._cancelUpload$), finalize(() => {
                // Emits uploaded files.
                const /** @type {?} */ uploaded = this._state.files.filter((item) => item.snapshot === 'success');
                this.completeEmitter.emit(uploaded);
                // Emits the URLs of the uploaded files.
                const /** @type {?} */ downloadURLs = uploaded.map((item) => item.snapshot.downloadURL);
                this.valueEmitter.emit(downloadURLs);
                this.updateRootState$.next(null);
            })).subscribe();
        }
    }
    /**
     * @return {?}
     */
    select() {
        this.fileInput.nativeElement.click();
    }
    /**
     * Add files to the queue
     * @param {?} fileList
     * @return {?}
     */
    addFiles(fileList) {
        this.validateFiles(fileList)
            .then((files) => {
            this.setState({ files });
            this.filesEmitter.emit(files);
            this.updateRootState$.next(null);
            // Starts uploading as soon as the file are added
            if (this.autoStart) {
                this.start();
            }
        });
    }
    /**
     * Remove file
     * cancels the file if it is being uploaded
     * deletes the file if it has been uploaded
     * @param {?} item
     * @return {?}
     */
    removeFile(item) {
        if (item.snapshot.state === 'success') {
            item.delete();
        }
        else if (item.snapshot.state === 'running') {
            item.cancel();
        }
        else {
            this.removeEmitter.emit(item);
        }
        // Destroy file item
        item.snapshot$.complete();
        const /** @type {?} */ files = this._state.files.filter((file) => file !== item);
        this.setState({ files });
        this.filesEmitter.emit(this._state.files);
        this.updateRootState$.next(null);
    }
    /**
     * Resets the uploader
     * @param {?=} remove
     * @return {?}
     */
    reset(remove = true) {
        this.cancel(remove);
        this.setState({ files: [] });
        this.filesEmitter.emit([]);
        this.updateRootState$.next(null);
        this.resetEmitter.emit();
    }
    /**
     * @param {?} file
     * @return {?}
     */
    cancelFile(file) {
        file.cancel();
        this.updateRootState$.next(null);
    }
    /**
     * Cancel all upload tasks
     * @param {?=} remove
     * @return {?}
     */
    cancel(remove = true) {
        this._cancelUpload$.next();
        this._state.files.map((item) => {
            if (remove && item.snapshot.state === 'success') {
                item.delete();
            }
            else {
                item.cancel();
            }
        });
    }
    /**
     * Pause all upload tasks
     * @return {?}
     */
    pause() {
        this._state.files.map((file) => file.pause());
    }
    /**
     * Resume all paused tasks
     * @return {?}
     */
    resume() {
        this._state.files.map((file) => file.resume());
    }
    /**
     * @param {?} state
     * @return {?}
     */
    setState(state) {
        this._state = Object.assign({}, this._state, state);
        this.state$.next(this._state);
    }
    /**
     * Takes files from drop zone or file input
     * Validates max file count
     * Validates max file size
     * Prevents duplication
     * @param {?} fileList
     * @return {?}
     */
    validateFiles(fileList) {
        return new Promise((resolve, reject) => {
            let /** @type {?} */ files = [];
            if (fileList.length) {
                let /** @type {?} */ length;
                // Validate max files count
                if (fileList.length > this.maxFiles) {
                    this.errorEmitter.emit(maxFilesError(this.maxFiles));
                    length = this.maxFiles;
                }
                else {
                    length = fileList.length;
                }
                for (let /** @type {?} */ i = 0; i < length; i++) {
                    // Validate max file size
                    if (convertToMB(fileList[i].size) > this.maxFileSize) {
                        this.errorEmitter.emit(maxFileSizeError(fileList[i].name));
                    }
                    else {
                        const /** @type {?} */ file = new FileItem(fileList[i], this);
                        files = [...files, file];
                    }
                }
                if (this.multiple) {
                    // Combine and filter duplicated files
                    files = [...this._state.files, ...files]
                        .filter((curr, index, self) => self.findIndex(t => t.file.name === curr.file.name && t.file.size === curr.file.size) === index);
                }
                // return files;
                resolve(files);
            }
            // If user didn't select file
            resolve(this._state.files);
            // return this._state.files;
        });
    }
    /**
     * Iterates over given files
     * Generates file name
     * Starts the uploading task
     * @param {?} files
     * @return {?}
     */
    uploadFiles(files) {
        const /** @type {?} */ chunk = files.map((item) => {
            // Generate file name
            const /** @type {?} */ path = `${new Date().getTime()}_${this.paramName || item.snapshot.name}`;
            const /** @type {?} */ task = this._storage.upload(path, item.file);
            return item.assignTask(task);
        });
        return forkJoin(...chunk);
    }
    /**
     * Combine the states of all files in a single state
     * @return {?}
     */
    combineStates() {
        return this._state.files
            .map((item) => item.snapshot)
            .reduce((total, state) => ({
            active: total.active || state.active,
            progress: {
                bytesTransferred: total.progress.bytesTransferred + state.progress.bytesTransferred,
                totalBytes: total.progress.totalBytes + state.progress.totalBytes
            }
        }));
    }
}
FireUploaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'fire-uploader',
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `<ng-container *ngIf="state$ | async; let state">
  <input #fileInput type="file"
         [accept]="accept"
         [multiple]="multiple"
         (click)="fileInput.value=null"
         (change)="addFiles(fileInput.files)">
  <div *ngIf="dropZone"
       class="dropzone"
       (dropZone)="addFiles($event)"
       (click)="fileInput.click()"
       (dragOver)="hoverClass=$event">
    <div class="dropzone-placeholder"
         *ngIf="!state.files.length || !content.children.length">
      {{ placeholder }}
    </div>
    <div class="overlay-layer"></div>
    <div class="uploader-content" #content>
      <ng-content></ng-content>
    </div>
  </div>
</ng-container>
`
            },] },
];
/** @nocollapse */
FireUploaderComponent.ctorParameters = () => [
    { type: FireUploader, },
    { type: AngularFireStorage, },
];
FireUploaderComponent.propDecorators = {
    "dropZone": [{ type: Input },],
    "paramName": [{ type: Input },],
    "uniqueName": [{ type: Input },],
    "placeholder": [{ type: Input },],
    "multiple": [{ type: Input },],
    "accept": [{ type: Input },],
    "parallelUploads": [{ type: Input },],
    "maxFiles": [{ type: Input },],
    "maxFileSize": [{ type: Input },],
    "autoStart": [{ type: Input },],
    "thumbs": [{ type: Input },],
    "thumbnailMethod": [{ type: Input },],
    "resizeMethod": [{ type: Input },],
    "resizeWidth": [{ type: Input },],
    "resizeHeight": [{ type: Input },],
    "resizeQuality": [{ type: Input },],
    "thumbWidth": [{ type: Input },],
    "thumbHeight": [{ type: Input },],
    "resizeMimeType": [{ type: Input },],
    "filesEmitter": [{ type: Output, args: ['files',] },],
    "removeEmitter": [{ type: Output, args: ['remove',] },],
    "successEmitter": [{ type: Output, args: ['success',] },],
    "completeEmitter": [{ type: Output, args: ['complete',] },],
    "valueEmitter": [{ type: Output, args: ['value',] },],
    "errorEmitter": [{ type: Output, args: ['error',] },],
    "activeEmitter": [{ type: Output, args: ['active',] },],
    "progressEmitter": [{ type: Output, args: ['progress',] },],
    "resetEmitter": [{ type: Output, args: ['reset',] },],
    "fileInput": [{ type: ViewChild, args: ['fileInput',] },],
    "hoverClass": [{ type: HostBinding, args: ['class.dragover',] },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class DropZoneDirective {
    constructor() {
        this.dropZone = new EventEmitter();
        this.dragOver = new EventEmitter();
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onDrop(e) {
        e.preventDefault();
        this.dragOver.emit(false);
        this.dropZone.emit(e.dataTransfer.files);
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onDragOver(e) {
        e.preventDefault();
        this.dragOver.emit(true);
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onDragLeave(e) {
        e.preventDefault();
        this.dragOver.emit(false);
    }
}
DropZoneDirective.decorators = [
    { type: Directive, args: [{
                selector: '[dropZone]'
            },] },
];
/** @nocollapse */
DropZoneDirective.ctorParameters = () => [];
DropZoneDirective.propDecorators = {
    "dropZone": [{ type: Output, args: ['dropZone',] },],
    "dragOver": [{ type: Output },],
    "onDrop": [{ type: HostListener, args: ['drop', ['$event'],] },],
    "onDragOver": [{ type: HostListener, args: ['dragover', ['$event'],] },],
    "onDragLeave": [{ type: HostListener, args: ['dragleave', ['$event'],] },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} config
 * @return {?}
 */
function UploaderFactory(config) {
    return new FireUploader(config);
}
class FireUploaderModule {
    /**
     * @param {?=} config
     * @return {?}
     */
    static forRoot(config) {
        return {
            ngModule: FireUploaderModule,
            providers: [
                { provide: UPLOADER_CONFIG, useValue: config },
                {
                    provide: FireUploader,
                    useFactory: UploaderFactory,
                    deps: [UPLOADER_CONFIG]
                }
            ]
        };
    }
}
FireUploaderModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                exports: [
                    FireUploaderComponent
                ],
                declarations: [
                    FireUploaderComponent,
                    DropZoneDirective
                ]
            },] },
];
/** @nocollapse */
FireUploaderModule.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { UploaderFactory, FireUploaderModule, FireUploaderComponent, FileItem, DropZoneDirective as ɵc, FireUploader as ɵa, UPLOADER_CONFIG as ɵb };
//# sourceMappingURL=ngx-fire-uploader-core.js.map
