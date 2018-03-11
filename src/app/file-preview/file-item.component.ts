import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FileState } from '../file-uploader/fire-uploader.model';

@Component({
  selector: 'file-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="file-item"
   [class.file-active]="state.active"
   [class.file-success]="state.success"
   [class.file-error]="!state.success && state.error">
  <img *ngIf="state.preview" [src]="state.preview | safeUrl" class="file-thumb">
  <div class="file-overlay">
    <div class="file-success-icon"></div>
    <div class="file-error-icon"></div>
  </div>
  <div *ngIf="showProgress" class="file-progress-bar">
    <div class="file-bar"
         [style.transform]="'translate3d(' + (-100 + state.progress.percentage) + '%,0,0)'"></div>
  </div>
</div>
<div *ngIf="showDetails" class="file-details">
  <div class="file-detail file-name">
    <span>{{ state.name }}</span>
  </div>
  <div class="file-detail file-size">
    <span>{{ state.progress.totalBytes | fileSize }}</span>
  </div>
</div>
<div *ngIf="showRemove" class="file-remove">
  <div class="file-remove-button" (click)="removeClicked($event)">
    <div class="file-remove-icon"></div>
  </div>
</div>
  `
})

export class FileItemComponent {

  @Input() state: FileState;

  // Show file-uploader progress bar
  @Input() showProgress: boolean;

  // Shows file name and size
  @Input() showDetails: boolean;

  // Shows remove button
  @Input() showRemove: boolean;

  @Output() remove = new EventEmitter();

  removeClicked(e: Event) {
    e.stopPropagation();
    this.remove.emit();
  }

}
