import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
// import { FileState } from '@ngx-fire-uploader/core';
import { FileState } from '../core';

@Component({
  selector: 'file-item',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-item.component.html'
})
export class FileItemComponent {
  @Input() state: FileState;

  // Show fire-uploader progress bar
  @Input() showProgress: boolean;

  // Shows file name and size
  @Input() showDetails: boolean;

  // Shows remove button
  @Input() showRemove: boolean;

  // To set background based on file extension
  @Input() extensions: any;

  @Output() remove = new EventEmitter();

  removeClicked(e: Event) {
    e.stopPropagation();
    this.remove.emit();
  }
}
