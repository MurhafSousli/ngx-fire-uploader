import { EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileSnapshot } from '@ngx-fire-uploader/core';
export declare class FileItemComponent {
    sanitizer: DomSanitizer;
    snapshot: FileSnapshot;
    showProgress: boolean;
    showDetails: boolean;
    showRemove: boolean;
    extensions: any;
    remove: EventEmitter<{}>;
    constructor(sanitizer: DomSanitizer);
    removeClicked(e: Event): void;
}
