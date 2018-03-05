import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[dropZone]'
})
export class DropZoneDirective {

  @Output('dropZone') dropZone = new EventEmitter();

  @HostBinding('class.dragover') hoverClass;

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.hoverClass = false;
    this.dropZone.emit(e.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(e) {
    e.preventDefault();
    this.hoverClass = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(e) {
    e.preventDefault();
    this.hoverClass = false;
  }

}
