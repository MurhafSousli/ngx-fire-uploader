import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FireUploaderComponent, FileItem } from '../fire-uploader';
import { FireManager } from './fire-manager';

@Component({
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
})
export class FireManagerComponent implements OnInit {

  // Reference to the uploader
  @Input() uploader: FireUploaderComponent;

  // Show the fire-uploader progress bar of each file item
  @Input() showProgress: boolean = this.manager.config.showProgress;

  // Shows name and size of each file item
  @Input() showDetails: boolean = this.manager.config.showDetails;

  // Show remove button
  @Input() showRemove: boolean = this.manager.config.showRemove;

  // Set item background based on file extension
  @Input() extensions: any = this.manager.config.extensions;

  @Output() itemClick = new EventEmitter<FileItem>();

  constructor(private manager: FireManager) {
  }

  ngOnInit() {
    if (!(this.uploader instanceof FireUploaderComponent)) {
      throw new Error('[FilePreview]: [uploader] input must has FileUploader reference.');
    }
  }

  itemClicked(e: Event, file: FileItem) {
    e.stopPropagation();
    this.itemClick.emit(file);
  }

}
