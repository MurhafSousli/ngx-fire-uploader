import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { FileItem } from '../file-uploader/file-item.class';
import { PreviewerManager } from './previewer-manager';

@Component({
  selector: 'file-preview',
  template: `
    <file-item *ngFor="let item of (uploader.state$ | async).files"
               [state]="item.state$ | async"
               [showDetails]="showDetails"
               [showProgress]="showProgress"
               [showRemove]="showRemove"
               (click)="itemClicked($event, item)"
               (remove)="uploader.remove(item)">
    </file-item>
  `
})
export class FilePreviewComponent {

  // Reference to the uploader
  @Input() uploader: FileUploaderComponent;

  @Input() previewWidth: number = this.manager.config.previewWidth;
  @Input() previewHeight: number = this.manager.config.previewHeight;

  // Show the file-uploader progress bar of each file item
  @Input() showProgress: boolean = this.manager.config.showProgress;

  // Shows name and size of each file item
  @Input() showDetails: boolean = this.manager.config.showDetails;

  // Show remove button
  @Input() showRemove: boolean = this.manager.config.showRemove;

  @Output() itemClick = new EventEmitter<FileItem>();

  constructor(private manager: PreviewerManager) {
  }

  itemClicked(e: Event, file: FileItem) {
    e.stopPropagation();
    this.itemClick.emit(file);
  }

}
