import { __spread } from 'tslib';
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

var UPLOADER_CONFIG = new InjectionToken('config');
var defaultConfig = {
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
var FireUploader = /** @class */ (function () {
    function FireUploader(config) {
        this.config = Object.assign({}, defaultConfig, config);
    }
    return FireUploader;
}());
FireUploader.decorators = [
    { type: Injectable },
];
FireUploader.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [UPLOADER_CONFIG,] },] },
]; };
function resizeImage(file, maxWidth, maxHeight, method, quality) {
    if (!maxHeight) {
        maxHeight = maxWidth;
    }
    else if (!maxWidth) {
        maxWidth = maxHeight;
    }
    return fromPromise(new Promise(function (resolve, reject) {
        var image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = function () {
            var width = image.width;
            var height = image.height;
            if (width <= maxWidth && height <= maxHeight) {
                resolve(file);
            }
            var newWidth;
            var newHeight;
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
            var canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            var context = canvas.getContext('2d');
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
function convertToMB(size) {
    return size / 1024 / 1024;
}
function parallizeUploads(files, parallelUploads) {
    var arr = [];
    var i, j;
    for (i = 0, j = files.length; i < j; i += parallelUploads) {
        arr.push(files.slice(i, i + parallelUploads));
    }
    return from(arr);
}
function processFile(item, width, height, method, quality) {
    return (width || height) ?
        resizeImage(item.file, width, height, method, quality) :
        of(item);
}
var maxFilesError = function (maxFiles) {
    return {
        type: 'uploader/count_limit_exceeded',
        message: "Max files has exceeded, Only " + maxFiles + " is accepted."
    };
};
var maxFileSizeError = function (fileName) {
    return {
        type: 'uploader/size_limit_exceeded',
        message: fileName + " has exceeded the max size allowed."
    };
};
var isImage = function (file) {
    return file.type.split('/')[0] === 'image';
};
var FileItem = /** @class */ (function () {
    function FileItem(file, _uploader) {
        var _this = this;
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
        if (this._uploader.thumbs && isImage(file)) {
            resizeImage(file, this._uploader.thumbWidth, this._uploader.thumbHeight, this._uploader.thumbnailMethod, 1)
                .subscribe(function (blob) { return _this.updateSnapshot({ thumbnail: URL.createObjectURL(blob) }); }, function (err) { return _this._uploader.errorEmitter.emit(err); });
        }
    }
    FileItem.prototype.assignTask = function (task) {
        var _this = this;
        this._task = task;
        this._task.snapshotChanges()
            .subscribe(function (snapshot) { return _this.onSnapshotChanges(snapshot); });
        return this._task
            .then(function (snapshot) { return _this.onTaskComplete(snapshot); })
            .catch(function (err) {
            _this.updateSnapshot({ active: false });
            _this._uploader.errorEmitter.emit(err);
        });
    };
    FileItem.prototype.delete = function () {
        var _this = this;
        this.snapshot.ref.delete()
            .then(function () {
            _this._uploader.removeEmitter.emit(_this);
            _this.cancel();
        })
            .catch(function (err) { return _this._uploader.errorEmitter.emit(err); });
    };
    FileItem.prototype.pause = function () {
        if (this._task) {
            this._task.pause();
        }
    };
    FileItem.prototype.resume = function () {
        if (this._task) {
            this._task.resume();
        }
    };
    FileItem.prototype.cancel = function () {
        if (this._task) {
            this._task.cancel();
        }
        this.reset();
    };
    FileItem.prototype.reset = function () {
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
    };
    FileItem.prototype.updateSnapshot = function (snapshot) {
        this.snapshot = Object.assign({}, this.snapshot, snapshot);
        this.snapshot$.next(this.snapshot);
    };
    FileItem.prototype.onSnapshotChanges = function (snapshot) {
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
    };
    FileItem.prototype.onTaskComplete = function (snapshot) {
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
    };
    return FileItem;
}());
var FireUploaderComponent = /** @class */ (function () {
    function FireUploaderComponent(_manager, _storage) {
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
        this.dropZone = this._manager.config.dropZone;
        this.paramName = this._manager.config.paramName;
        this.uniqueName = this._manager.config.uniqueName;
        this.placeholder = this._manager.config.placeholder;
        this.multiple = this._manager.config.multiple;
        this.accept = this._manager.config.accept;
        this.parallelUploads = this._manager.config.parallelUploads;
        this.maxFiles = this._manager.config.maxFiles;
        this.maxFileSize = this._manager.config.maxFileSize;
        this.autoStart = this._manager.config.autoStart;
        this.thumbs = this._manager.config.thumbs;
        this.thumbnailMethod = this._manager.config.thumbMethod;
        this.resizeMethod = this._manager.config.resizeMethod;
        this.resizeWidth = this._manager.config.resizeWidth;
        this.resizeHeight = this._manager.config.resizeHeight;
        this.resizeQuality = this._manager.config.resizeQuality;
        this.thumbWidth = this._manager.config.thumbWidth;
        this.thumbHeight = this._manager.config.thumbHeight;
        this.resizeMimeType = this._manager.config.resizeMimeType;
        this.filesEmitter = new EventEmitter();
        this.removeEmitter = new EventEmitter();
        this.successEmitter = new EventEmitter();
        this.completeEmitter = new EventEmitter();
        this.valueEmitter = new EventEmitter();
        this.errorEmitter = new EventEmitter();
        this.activeEmitter = new EventEmitter();
        this.progressEmitter = new EventEmitter();
        this.resetEmitter = new EventEmitter();
    }
    FireUploaderComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.updateRootState$.pipe(debounceTime(50), map(function () {
            if (_this._state.files.length) {
                var rootState = _this.combineStates();
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
        }), tap(function (state) {
            _this.setState(state);
            _this.progressEmitter.emit(state.progress);
            _this.activeEmitter.emit(state.active);
        })).subscribe();
    };
    FireUploaderComponent.prototype.ngOnDestroy = function () {
        if (this.progressEmitter.observers.length) {
            this.updateRootState$.complete();
        }
    };
    FireUploaderComponent.prototype.start = function () {
        var _this = this;
        if (!this._state.active && this._state.files.length) {
            from(this._state.files).pipe(map(function (file) { return processFile(file, _this.resizeWidth, _this.resizeHeight, _this.resizeMethod, _this.resizeQuality); }), combineAll(), switchMap(function (files) { return parallizeUploads(files, _this.parallelUploads); }), concatMap(function (chunk) { return _this.uploadFiles(chunk); }), takeUntil(this._cancelUpload$), finalize(function () {
                var uploaded = _this._state.files.filter(function (item) { return item.snapshot === 'success'; });
                _this.completeEmitter.emit(uploaded);
                var downloadURLs = uploaded.map(function (item) { return item.snapshot.downloadURL; });
                _this.valueEmitter.emit(downloadURLs);
                _this.updateRootState$.next(null);
            })).subscribe();
        }
    };
    FireUploaderComponent.prototype.select = function () {
        this.fileInput.nativeElement.click();
    };
    FireUploaderComponent.prototype.addFiles = function (fileList) {
        var _this = this;
        this.validateFiles(fileList)
            .then(function (files) {
            _this.setState({ files: files });
            _this.filesEmitter.emit(files);
            _this.updateRootState$.next(null);
            if (_this.autoStart) {
                _this.start();
            }
        });
    };
    FireUploaderComponent.prototype.removeFile = function (item) {
        if (item.snapshot.state === 'success') {
            item.delete();
        }
        else if (item.snapshot.state === 'running') {
            item.cancel();
        }
        else {
            this.removeEmitter.emit(item);
        }
        item.snapshot$.complete();
        var files = this._state.files.filter(function (file) { return file !== item; });
        this.setState({ files: files });
        this.filesEmitter.emit(this._state.files);
        this.updateRootState$.next(null);
    };
    FireUploaderComponent.prototype.reset = function (remove) {
        if (remove === void 0) { remove = true; }
        this.cancel(remove);
        this.setState({ files: [] });
        this.filesEmitter.emit([]);
        this.updateRootState$.next(null);
        this.resetEmitter.emit();
    };
    FireUploaderComponent.prototype.cancelFile = function (file) {
        file.cancel();
        this.updateRootState$.next(null);
    };
    FireUploaderComponent.prototype.cancel = function (remove) {
        if (remove === void 0) { remove = true; }
        this._cancelUpload$.next();
        this._state.files.map(function (item) {
            if (remove && item.snapshot.state === 'success') {
                item.delete();
            }
            else {
                item.cancel();
            }
        });
    };
    FireUploaderComponent.prototype.pause = function () {
        this._state.files.map(function (file) { return file.pause(); });
    };
    FireUploaderComponent.prototype.resume = function () {
        this._state.files.map(function (file) { return file.resume(); });
    };
    FireUploaderComponent.prototype.setState = function (state) {
        this._state = Object.assign({}, this._state, state);
        this.state$.next(this._state);
    };
    FireUploaderComponent.prototype.validateFiles = function (fileList) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var files = [];
            if (fileList.length) {
                var length = void 0;
                if (fileList.length > _this.maxFiles) {
                    _this.errorEmitter.emit(maxFilesError(_this.maxFiles));
                    length = _this.maxFiles;
                }
                else {
                    length = fileList.length;
                }
                for (var i = 0; i < length; i++) {
                    if (convertToMB(fileList[i].size) > _this.maxFileSize) {
                        _this.errorEmitter.emit(maxFileSizeError(fileList[i].name));
                    }
                    else {
                        var file = new FileItem(fileList[i], _this);
                        files = __spread(files, [file]);
                    }
                }
                if (_this.multiple) {
                    files = __spread(_this._state.files, files).filter(function (curr, index, self) { return self.findIndex(function (t) { return t.file.name === curr.file.name && t.file.size === curr.file.size; }) === index; });
                }
                resolve(files);
            }
            resolve(_this._state.files);
        });
    };
    FireUploaderComponent.prototype.uploadFiles = function (files) {
        var _this = this;
        var chunk = files.map(function (item) {
            var path = new Date().getTime() + "_" + (_this.paramName || item.snapshot.name);
            var task = _this._storage.upload(path, item.file);
            return item.assignTask(task);
        });
        return forkJoin.apply(void 0, __spread(chunk));
    };
    FireUploaderComponent.prototype.combineStates = function () {
        return this._state.files
            .map(function (item) { return item.snapshot; })
            .reduce(function (total, state) { return ({
            active: total.active || state.active,
            progress: {
                bytesTransferred: total.progress.bytesTransferred + state.progress.bytesTransferred,
                totalBytes: total.progress.totalBytes + state.progress.totalBytes
            }
        }); });
    };
    return FireUploaderComponent;
}());
FireUploaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'fire-uploader',
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: "<ng-container *ngIf=\"state$ | async; let state\">\n  <input #fileInput type=\"file\"\n         [accept]=\"accept\"\n         [multiple]=\"multiple\"\n         (click)=\"fileInput.value=null\"\n         (change)=\"addFiles(fileInput.files)\">\n  <div *ngIf=\"dropZone\"\n       class=\"dropzone\"\n       (dropZone)=\"addFiles($event)\"\n       (click)=\"fileInput.click()\"\n       (dragOver)=\"hoverClass=$event\">\n    <div class=\"dropzone-placeholder\"\n         *ngIf=\"!state.files.length || !content.children.length\">\n      {{ placeholder }}\n    </div>\n    <div class=\"overlay-layer\"></div>\n    <div class=\"uploader-content\" #content>\n      <ng-content></ng-content>\n    </div>\n  </div>\n</ng-container>\n"
            },] },
];
FireUploaderComponent.ctorParameters = function () { return [
    { type: FireUploader, },
    { type: AngularFireStorage, },
]; };
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
var DropZoneDirective = /** @class */ (function () {
    function DropZoneDirective() {
        this.dropZone = new EventEmitter();
        this.dragOver = new EventEmitter();
    }
    DropZoneDirective.prototype.onDrop = function (e) {
        e.preventDefault();
        this.dragOver.emit(false);
        this.dropZone.emit(e.dataTransfer.files);
    };
    DropZoneDirective.prototype.onDragOver = function (e) {
        e.preventDefault();
        this.dragOver.emit(true);
    };
    DropZoneDirective.prototype.onDragLeave = function (e) {
        e.preventDefault();
        this.dragOver.emit(false);
    };
    return DropZoneDirective;
}());
DropZoneDirective.decorators = [
    { type: Directive, args: [{
                selector: '[dropZone]'
            },] },
];
DropZoneDirective.ctorParameters = function () { return []; };
DropZoneDirective.propDecorators = {
    "dropZone": [{ type: Output, args: ['dropZone',] },],
    "dragOver": [{ type: Output },],
    "onDrop": [{ type: HostListener, args: ['drop', ['$event'],] },],
    "onDragOver": [{ type: HostListener, args: ['dragover', ['$event'],] },],
    "onDragLeave": [{ type: HostListener, args: ['dragleave', ['$event'],] },],
};
function UploaderFactory(config) {
    return new FireUploader(config);
}
var FireUploaderModule = /** @class */ (function () {
    function FireUploaderModule() {
    }
    FireUploaderModule.forRoot = function (config) {
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
    };
    return FireUploaderModule;
}());
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
FireUploaderModule.ctorParameters = function () { return []; };

export { UploaderFactory, FireUploaderModule, FireUploaderComponent, FileItem, DropZoneDirective as ɵc, FireUploader as ɵa, UPLOADER_CONFIG as ɵb };
//# sourceMappingURL=ngx-fire-uploader-core.js.map
