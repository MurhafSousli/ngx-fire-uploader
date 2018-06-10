import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
/**
 * Convert element to a drop zone to add files to uploader queue
 */
@Directive({
  selector: '[dropZone]'
})
export class DropZoneDirective {

  /** Stream that emits when files are dropped */
  @Output('dropZone') dropZone = new EventEmitter();

  /** Stream that emits when user drag over */
  @Output() dragOver = new EventEmitter<boolean>();

  /** Listen to drop event */
  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.emit(false);
    this.dropZone.emit(e.dataTransfer.files);
  }

  /** Listen to dragover event */
  @HostListener('dragover', ['$event'])
  onDragOver(e) {
    e.preventDefault();
    this.dragOver.emit(true);
  }

  /** Listen to dragleave event */
  @HostListener('dragleave', ['$event'])
  onDragLeave(e) {
    e.preventDefault();
    this.dragOver.emit(false);
  }

}
