(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser'), require('@ngx-fire-uploader/core'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define('@ngx-fire-uploader/manager', ['exports', '@angular/core', '@angular/platform-browser', '@ngx-fire-uploader/core', '@angular/common'], factory) :
	(factory((global['ngx-fire-uploader'] = global['ngx-fire-uploader'] || {}, global['ngx-fire-uploader'].manager = {}),global.ng.core,global.ng.platformBrowser,global.core$1,global.ng.common));
}(this, (function (exports,core,platformBrowser,core$1,common) { 'use strict';

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
    { type: core.Pipe, args: [{ name: 'fileSize' },] },
];
FileSizePipe.ctorParameters = function () { return []; };
var FileItemComponent = /** @class */ (function () {
    function FileItemComponent(sanitizer) {
        this.sanitizer = sanitizer;
        this.remove = new core.EventEmitter();
    }
    FileItemComponent.prototype.removeClicked = function (e) {
        e.stopPropagation();
        this.remove.emit();
    };
    return FileItemComponent;
}());
FileItemComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'file-item',
                preserveWhitespaces: false,
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                template: "<div class=\"file-item file-{{snapshot.state}}\">\n  <div class=\"file-thumb\"\n       [style.background]=\"sanitizer.bypassSecurityTrustStyle(extensions[snapshot.extension])\">\n    <!--<span *ngIf=\"!snapshot.thumbnail && !extensions[snapshot.extension]?.includes('url')\">-->\n      <!--{{ snapshot.extension }}-->\n    <!--</span>-->\n    <span *ngIf=\"!snapshot.thumbnail && !extensions[snapshot.extension]?.includes('url')\">\n      {{ snapshot.extension }}\n    </span>\n    <div *ngIf=\"snapshot.thumbnail\" class=\"file-thumb-img\">\n      <img [src]=\"snapshot.thumbnail | safeUrl\">\n    </div>\n  </div>\n  <div class=\"file-overlay\">\n    <div class=\"file-success-icon\"></div>\n    <div class=\"file-error-icon\"></div>\n  </div>\n  <div *ngIf=\"showProgress\" class=\"file-progress-bar\">\n    <div class=\"file-bar\"\n         [style.transform]=\"'translate3d(' + (-100 + snapshot.progress.percentage) + '%,0,0)'\"></div>\n  </div>\n</div>\n<div *ngIf=\"showDetails\" class=\"file-details\">\n  <div class=\"file-detail file-name\">\n    <span>{{ snapshot.name }}</span>\n  </div>\n  <div class=\"file-detail file-size\">\n    <span>{{ snapshot.progress.totalBytes | fileSize }}</span>\n  </div>\n</div>\n<div *ngIf=\"showRemove\" class=\"file-remove\">\n  <button class=\"file-remove-button\" (click)=\"removeClicked($event)\">\n    <div class=\"file-remove-icon\"></div>\n  </button>\n</div>\n"
            },] },
];
FileItemComponent.ctorParameters = function () { return [
    { type: platformBrowser.DomSanitizer, },
]; };
FileItemComponent.propDecorators = {
    "snapshot": [{ type: core.Input },],
    "showProgress": [{ type: core.Input },],
    "showDetails": [{ type: core.Input },],
    "showRemove": [{ type: core.Input },],
    "extensions": [{ type: core.Input },],
    "remove": [{ type: core.Output },],
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
    { type: core.Pipe, args: [{
                name: 'safeUrl'
            },] },
];
SafeUrlPipe.ctorParameters = function () { return [
    { type: platformBrowser.DomSanitizer, },
]; };
var CONFIG = new core.InjectionToken('config');
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
    { type: core.Injectable },
];
FireManager.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [CONFIG,] },] },
]; };
var FireManagerComponent = /** @class */ (function () {
    function FireManagerComponent(manager) {
        this.manager = manager;
        this.showProgress = this.manager.config.showProgress;
        this.showDetails = this.manager.config.showDetails;
        this.showRemove = this.manager.config.showRemove;
        this.extensions = this.manager.config.extensions;
        this.itemClick = new core.EventEmitter();
    }
    FireManagerComponent.prototype.ngOnInit = function () {
        if (!(this.uploader instanceof core$1.FireUploaderComponent)) {
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
    { type: core.Component, args: [{
                selector: 'file-preview',
                preserveWhitespaces: false,
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                template: "\n    <file-item *ngFor=\"let file of (uploader.state$ | async).files\"\n               [snapshot]=\"file.snapshot$ | async\"\n               [showDetails]=\"showDetails\"\n               [showProgress]=\"showProgress\"\n               [showRemove]=\"showRemove\"\n               [extensions]=\"extensions\"\n               (click)=\"itemClicked($event, file)\"\n               (remove)=\"uploader.removeFile(file)\">\n    </file-item>\n  "
            },] },
];
FireManagerComponent.ctorParameters = function () { return [
    { type: FireManager, },
]; };
FireManagerComponent.propDecorators = {
    "uploader": [{ type: core.Input },],
    "showProgress": [{ type: core.Input },],
    "showDetails": [{ type: core.Input },],
    "showRemove": [{ type: core.Input },],
    "extensions": [{ type: core.Input },],
    "itemClick": [{ type: core.Output },],
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
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule
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

exports.previewerFactory = previewerFactory;
exports.FireManagerModule = FireManagerModule;
exports.FireManagerComponent = FireManagerComponent;
exports.FileItemComponent = FileItemComponent;
exports.FileSizePipe = FileSizePipe;
exports.ɵa = FireManager;
exports.ɵb = CONFIG;
exports.ɵc = SafeUrlPipe;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-fire-uploader-manager.umd.js.map
