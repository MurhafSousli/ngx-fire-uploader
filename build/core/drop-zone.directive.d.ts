import { EventEmitter } from '@angular/core';
export declare class DropZoneDirective {
    dropZone: EventEmitter<{}>;
    dragOver: EventEmitter<boolean>;
    onDrop(e: DragEvent): void;
    onDragOver(e: any): void;
    onDragLeave(e: any): void;
}
