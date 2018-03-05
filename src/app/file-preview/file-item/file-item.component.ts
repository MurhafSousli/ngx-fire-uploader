import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FileState } from '../../file-uploader/file-item.class';

@Component({
  selector: 'file-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss'],
  animations: []
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
