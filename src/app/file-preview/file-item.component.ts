import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileState } from '../file-uploader/fire-uploader.model';

@Component({
  selector: 'file-item',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-item.component.html'
})

export class FileItemComponent {

  @Input() snapshot: FileState;

  // Show file-uploader progress bar
  @Input() showProgress: boolean;

  // Shows file name and size
  @Input() showDetails: boolean;

  // Shows remove button
  @Input() showRemove: boolean;

  // To set background based on file extension
  @Input() extensions: any;

  @Output() remove = new EventEmitter();

  constructor(public sanitizer: DomSanitizer) {
  }

  removeClicked(e: Event) {
    e.stopPropagation();
    this.remove.emit();
  }

}
