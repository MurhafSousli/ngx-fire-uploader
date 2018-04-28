import { Pipe, ChangeDetectionStrategy, Component, EventEmitter, Input, Output, InjectionToken, Inject, Injectable, Optional, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FireUploaderComponent } from '@ngx-fire-uploader/core';
import { CommonModule } from '@angular/common';

var FileSizePipe = /** @class */ (function () {
    function FileSizePipe() {
        this.units = [
            'B',
            'KB',
            'MB',
            'GB'
        ];
    }
    FileSizePipe.prototype.transform = function (bytes, precision) {
        if (bytes === void 0) { bytes = 0; }
        if (precision === void 0) { precision = 1; }
        if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes))
            return '?';
        var unit = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            unit++;
        }
        return bytes.toFixed(precision) + ' ' + this.units[unit];
    };
    return FileSizePipe;
}());
FileSizePipe.decorators = [
    { type: Pipe, args: [{ name: 'fileSize' },] },
];
FileSizePipe.ctorParameters = function () { return []; };
var FileItemComponent = /** @class */ (function () {
    function FileItemComponent(sanitizer) {
        this.sanitizer = sanitizer;
        this.remove = new EventEmitter();
    }
    FileItemComponent.prototype.removeClicked = function (e) {
        e.stopPropagation();
        this.remove.emit();
    };
    return FileItemComponent;
}());
FileItemComponent.decorators = [
    { type: Component, args: [{
                selector: 'file-item',
                preserveWhitespaces: false,
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: "<div class=\"file-item file-{{snapshot.state}}\">\n  <div class=\"file-thumb\"\n       [style.background]=\"sanitizer.bypassSecurityTrustStyle(extensions[snapshot.extension])\">\n    <!--<span *ngIf=\"!snapshot.thumbnail && !extensions[snapshot.extension]?.includes('url')\">-->\n      <!--{{ snapshot.extension }}-->\n    <!--</span>-->\n    <span *ngIf=\"!snapshot.thumbnail && !extensions[snapshot.extension]?.includes('url')\">\n      {{ snapshot.extension }}\n    </span>\n    <div *ngIf=\"snapshot.thumbnail\" class=\"file-thumb-img\">\n      <img [src]=\"snapshot.thumbnail | safeUrl\">\n    </div>\n  </div>\n  <div class=\"file-overlay\">\n    <div class=\"file-success-icon\"></div>\n    <div class=\"file-error-icon\"></div>\n  </div>\n  <div *ngIf=\"showProgress\" class=\"file-progress-bar\">\n    <div class=\"file-bar\"\n         [style.transform]=\"'translate3d(' + (-100 + snapshot.progress.percentage) + '%,0,0)'\"></div>\n  </div>\n</div>\n<div *ngIf=\"showDetails\" class=\"file-details\">\n  <div class=\"file-detail file-name\">\n    <span>{{ snapshot.name }}</span>\n  </div>\n  <div class=\"file-detail file-size\">\n    <span>{{ snapshot.progress.totalBytes | fileSize }}</span>\n  </div>\n</div>\n<div *ngIf=\"showRemove\" class=\"file-remove\">\n  <button class=\"file-remove-button\" (click)=\"removeClicked($event)\">\n    <div class=\"file-remove-icon\"></div>\n  </button>\n</div>\n"
            },] },
];
FileItemComponent.ctorParameters = function () { return [
    { type: DomSanitizer, },
]; };
FileItemComponent.propDecorators = {
    "snapshot": [{ type: Input },],
    "showProgress": [{ type: Input },],
    "showDetails": [{ type: Input },],
    "showRemove": [{ type: Input },],
    "extensions": [{ type: Input },],
    "remove": [{ type: Output },],
};
var SafeUrlPipe = /** @class */ (function () {
    function SafeUrlPipe(sanitizer) {
        this.sanitizer = sanitizer;
    }
    SafeUrlPipe.prototype.transform = function (value) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    };
    return SafeUrlPipe;
}());
SafeUrlPipe.decorators = [
    { type: Pipe, args: [{
                name: 'safeUrl'
            },] },
];
SafeUrlPipe.ctorParameters = function () { return [
    { type: DomSanitizer, },
]; };
var CONFIG = new InjectionToken('config');
var defaultConfig = {
    showProgress: true,
    showDetails: true,
    showRemove: true
};
var FireManager = /** @class */ (function () {
    function FireManager(config) {
        this.config = Object.assign({}, defaultConfig, config);
    }
    return FireManager;
}());
FireManager.decorators = [
    { type: Injectable },
];
FireManager.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CONFIG,] },] },
]; };
var FireManagerComponent = /** @class */ (function () {
    function FireManagerComponent(manager) {
        this.manager = manager;
        this.showProgress = this.manager.config.showProgress;
        this.showDetails = this.manager.config.showDetails;
        this.showRemove = this.manager.config.showRemove;
        this.extensions = this.manager.config.extensions;
        this.itemClick = new EventEmitter();
    }
    FireManagerComponent.prototype.ngOnInit = function () {
        if (!(this.uploader instanceof FireUploaderComponent)) {
            throw new Error('[FilePreview]: [uploader] input must has FileUploader reference.');
        }
    };
    FireManagerComponent.prototype.itemClicked = function (e, file) {
        e.stopPropagation();
        this.itemClick.emit(file);
    };
    return FireManagerComponent;
}());
FireManagerComponent.decorators = [
    { type: Component, args: [{
                selector: 'file-preview',
                preserveWhitespaces: false,
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: "\n    <file-item *ngFor=\"let file of (uploader.state$ | async).files\"\n               [snapshot]=\"file.snapshot$ | async\"\n               [showDetails]=\"showDetails\"\n               [showProgress]=\"showProgress\"\n               [showRemove]=\"showRemove\"\n               [extensions]=\"extensions\"\n               (click)=\"itemClicked($event, file)\"\n               (remove)=\"uploader.removeFile(file)\">\n    </file-item>\n  "
            },] },
];
FireManagerComponent.ctorParameters = function () { return [
    { type: FireManager, },
]; };
FireManagerComponent.propDecorators = {
    "uploader": [{ type: Input },],
    "showProgress": [{ type: Input },],
    "showDetails": [{ type: Input },],
    "showRemove": [{ type: Input },],
    "extensions": [{ type: Input },],
    "itemClick": [{ type: Output },],
};
function previewerFactory(config) {
    return new FireManager(config);
}
var FireManagerModule = /** @class */ (function () {
    function FireManagerModule() {
    }
    FireManagerModule.forRoot = function (config) {
        return {
            ngModule: FireManagerModule,
            providers: [
                { provide: CONFIG, useValue: config },
                {
                    provide: FireManager,
                    useFactory: previewerFactory,
                    deps: [CONFIG]
                }
            ]
        };
    };
    return FireManagerModule;
}());
FireManagerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [
                    FileItemComponent,
                    FileSizePipe,
                    SafeUrlPipe,
                    FireManagerComponent
                ],
                exports: [
                    FireManagerComponent,
                    FileSizePipe,
                    SafeUrlPipe
                ]
            },] },
];
FireManagerModule.ctorParameters = function () { return []; };

export { previewerFactory, FireManagerModule, FireManagerComponent, FileItemComponent, FileSizePipe, FireManager as ɵa, CONFIG as ɵb, SafeUrlPipe as ɵc };
//# sourceMappingURL=ngx-fire-uploader-manager.js.map
