import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operators/map';

@Component({
  selector: 'ng-uploader',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  dragover = false;

  queue$ = new Subject();

  @Input() multiple: boolean;

  @Output() drag = new EventEmitter();
  @Output() completed = new EventEmitter();
  @Output() totalCompleted = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    this.queue$.pipe(
      map(files => {
        console.log(files);
      })
    );
  }

  onDragOver(e) {
    e.preventDefault();
    this.dragover = true;
    return false;
  }

  onDragLeave(e) {
    e.preventDefault();
    this.dragover = false;
    return false;
  }

  onDrop(e) {
    this.dragover = false;
    console.log(e);
    this.queue$.next(e.dataTransfer.files);
    e.preventDefault();
    return false;
  }

}
