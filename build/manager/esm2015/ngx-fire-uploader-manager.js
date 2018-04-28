import { Pipe, ChangeDetectionStrategy, Component, EventEmitter, Input, Output, InjectionToken, Inject, Injectable, Optional, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FireUploaderComponent } from '@ngx-fire-uploader/core';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class FileSizePipe {
    constructor() {
        this.units = [
            'B',
            'KB',
            'MB',
            'GB'
        ];
    }
    /**
     * @param {?=} bytes
     * @param {?=} precision
     * @return {?}
     */
    transform(bytes = 0, precision = 1) {
        if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes))
            return '?';
        let /** @type {?} */ unit = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            unit++;
        }
        return bytes.toFixed(precision) + ' ' + this.units[unit];
    }
}
FileSizePipe.decorators = [
    { type: Pipe, args: [{ name: 'fileSize' },] },
];
/** @nocollapse */
FileSizePipe.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class FileItemComponent {
    /**
     * @param {?} sanitizer
     */
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.remove = new EventEmitter();
    }
    /**
     * @param {?} e
     * @return {?}
     */
    removeClicked(e) {
        e.stopPropagation();
        this.remove.emit();
    }
}
FileItemComponent.decorators = [
    { type: Component, args: [{
                selector: 'file-item',
                preserveWhitespaces: false,
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `<div class="file-item file-{{snapshot.state}}">
  <div class="file-thumb"
       [style.background]="sanitizer.bypassSecurityTrustStyle(extensions[snapshot.extension])">
    <!--<span *ngIf="!snapshot.thumbnail && !extensions[snapshot.extension]?.includes('url')">-->
      <!--{{ snapshot.extension }}-->
    <!--</span>-->
    <span *ngIf="!snapshot.thumbnail && !extensions[snapshot.extension]?.includes('url')">
      {{ snapshot.extension }}
    </span>
    <div *ngIf="snapshot.thumbnail" class="file-thumb-img">
      <img [src]="snapshot.thumbnail | safeUrl">
    </div>
  </div>
  <div class="file-overlay">
    <div class="file-success-icon"></div>
    <div class="file-error-icon"></div>
  </div>
  <div *ngIf="showProgress" class="file-progress-bar">
    <div class="file-bar"
         [style.transform]="'translate3d(' + (-100 + snapshot.progress.percentage) + '%,0,0)'"></div>
  </div>
</div>
<div *ngIf="showDetails" class="file-details">
  <div class="file-detail file-name">
    <span>{{ snapshot.name }}</span>
  </div>
  <div class="file-detail file-size">
    <span>{{ snapshot.progress.totalBytes | fileSize }}</span>
  </div>
</div>
<div *ngIf="showRemove" class="file-remove">
  <button class="file-remove-button" (click)="removeClicked($event)">
    <div class="file-remove-icon"></div>
  </button>
</div>
`
            },] },
];
/** @nocollapse */
FileItemComponent.ctorParameters = () => [
    { type: DomSanitizer, },
];
FileItemComponent.propDecorators = {
    "snapshot": [{ type: Input },],
    "showProgress": [{ type: Input },],
    "showDetails": [{ type: Input },],
    "showRemove": [{ type: Input },],
    "extensions": [{ type: Input },],
    "remove": [{ type: Output },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class SafeUrlPipe {
    /**
     * @param {?} sanitizer
     */
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    transform(value) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
}
SafeUrlPipe.decorators = [
    { type: Pipe, args: [{
                name: 'safeUrl'
            },] },
];
/** @nocollapse */
SafeUrlPipe.ctorParameters = () => [
    { type: DomSanitizer, },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const CONFIG = new InjectionToken('config');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
const defaultConfig = {
    showProgress: true,
    showDetails: true,
    showRemove: true
};
class FireManager {
    /**
     * @param {?} config
     */
    constructor(config) {
        this.config = Object.assign({}, defaultConfig, config);
    }
}
FireManager.decorators = [
    { type: Injectable },
];
/** @nocollapse */
FireManager.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CONFIG,] },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class FireManagerComponent {
    /**
     * @param {?} manager
     */
    constructor(manager) {
        this.manager = manager;
        // Show the fire-uploader progress bar of each file item
        this.showProgress = this.manager.config.showProgress;
        // Shows name and size of each file item
        this.showDetails = this.manager.config.showDetails;
        // Show remove button
        this.showRemove = this.manager.config.showRemove;
        // Set item background based on file extension
        this.extensions = this.manager.config.extensions;
        this.itemClick = new EventEmitter();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        if (!(this.uploader instanceof FireUploaderComponent)) {
            throw new Error('[FilePreview]: [uploader] input must has FileUploader reference.');
        }
    }
    /**
     * @param {?} e
     * @param {?} file
     * @return {?}
     */
    itemClicked(e, file) {
        e.stopPropagation();
        this.itemClick.emit(file);
    }
}
FireManagerComponent.decorators = [
    { type: Component, args: [{
                selector: 'file-preview',
                preserveWhitespaces: false,
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
    <file-item *ngFor="let file of (uploader.state$ | async).files"
               [snapshot]="file.snapshot$ | async"
               [showDetails]="showDetails"
               [showProgress]="showProgress"
               [showRemove]="showRemove"
               [extensions]="extensions"
               (click)="itemClicked($event, file)"
               (remove)="uploader.removeFile(file)">
    </file-item>
  `
            },] },
];
/** @nocollapse */
FireManagerComponent.ctorParameters = () => [
    { type: FireManager, },
];
FireManagerComponent.propDecorators = {
    "uploader": [{ type: Input },],
    "showProgress": [{ type: Input },],
    "showDetails": [{ type: Input },],
    "showRemove": [{ type: Input },],
    "extensions": [{ type: Input },],
    "itemClick": [{ type: Output },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} config
 * @return {?}
 */
function previewerFactory(config) {
    return new FireManager(config);
}
class FireManagerModule {
    /**
     * @param {?=} config
     * @return {?}
     */
    static forRoot(config) {
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
    }
}
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
/** @nocollapse */
FireManagerModule.ctorParameters = () => [];

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

export { previewerFactory, FireManagerModule, FireManagerComponent, FileItemComponent, FileSizePipe, FireManager as ɵa, CONFIG as ɵb, SafeUrlPipe as ɵc };
//# sourceMappingURL=ngx-fire-uploader-manager.js.map
