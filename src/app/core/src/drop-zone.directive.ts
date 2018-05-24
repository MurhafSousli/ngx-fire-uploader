import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[dropZone]'
})
export class DropZoneDirective {

  @Output('dropZone') dropZone = new EventEmitter();

  @Output() dragOver = new EventEmitter<boolean>();

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.emit(false);
    this.dropZone.emit(e.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(e) {
    e.preventDefault();
    this.dragOver.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(e) {
    e.preventDefault();
    this.dragOver.emit(false);
  }

}
