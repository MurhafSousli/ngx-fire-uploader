import { EventEmitter, OnInit } from '@angular/core';
import { FireUploaderComponent, FileItem } from '@ngx-fire-uploader/core';
import { FireManager } from './fire-manager';
export declare class FireManagerComponent implements OnInit {
    private manager;
    uploader: FireUploaderComponent;
    showProgress: boolean;
    showDetails: boolean;
    showRemove: boolean;
    extensions: any;
    itemClick: EventEmitter<FileItem>;
    constructor(manager: FireManager);
    ngOnInit(): void;
    itemClicked(e: Event, file: FileItem): void;
}
