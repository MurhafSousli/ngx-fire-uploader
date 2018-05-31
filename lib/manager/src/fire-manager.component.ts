import { Component, Input, OnInit, Output, HostBinding, OnChanges, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FireUploader, FireUploaderRef, FileItem, ResizeMethod } from '@ngx-fire-uploader/core';
import { FireManager } from './fire-manager';

@Component({
  selector: 'fire-manager',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fire-manager.component.html'
})
export class FireManagerComponent implements OnInit, OnChanges {
  @Input() id = 'root';
  @Input() dropZone: boolean = this._manager.config.dropZone;

  @Input() paramName: string = this._manager.config.paramName;
  @Input() paramDir: string = this._manager.config.paramDir;
  @Input() uniqueName: boolean = this._manager.config.uniqueName;
  @Input() multiple: boolean = this._manager.config.multiple;
  @Input() accept: string = this._manager.config.accept;
  @Input() autoStart: boolean = this._manager.config.autoStart;
  @Input() thumbWidth: number = this._manager.config.thumbWidth;
  @Input() thumbHeight: number = this._manager.config.thumbHeight;
  @Input() thumbMethod: ResizeMethod = this._manager.config.thumbMethod;
  @Input() resizeMethod: ResizeMethod = this._manager.config.resizeMethod;
  @Input() resizeWidth: number = this._manager.config.resizeWidth;
  @Input() resizeHeight: number = this._manager.config.resizeHeight;
  @Input() resizeMimeType: string = this._manager.config.resizeMimeType;
  @Input() resizeQuality: number = this._manager.config.resizeQuality;

  // Reference to the uploader
  @Input() uploaderRef: FireUploaderRef;

  // Show the fire-uploader progress bar of each file item
  @Input() showProgress: boolean = this._manager.config.showProgress;

  // Shows name and size of each file item
  @Input() showDetails: boolean = this._manager.config.showDetails;

  // Show remove button
  @Input() showRemove: boolean = this._manager.config.showRemove;

  // Set item background based on file extension
  @Input() extensions: any = this._manager.config.extensions;

  @Output() itemClick = new EventEmitter<FileItem>();
  @Output() files = new EventEmitter<FileItem[]>();
  @Output() value = new EventEmitter<string>();
  @Output() complete = new EventEmitter();
  @Output() error = new EventEmitter<any>();

  @HostBinding('class.dragover') hoverClass;

  constructor(private _uploader: FireUploader, private _manager: FireManager) {}

  ngOnInit() {
    this.uploaderRef = this._uploader.ref(this.id, {
      paramName: this.paramName,
      paramDir: this.paramDir,
      uniqueName: this.uniqueName,
      multiple: this.multiple,
      accept: this.accept,
      autoStart: this.autoStart,
      thumbWidth: this.thumbWidth,
      thumbHeight: this.thumbHeight,
      thumbMethod: this.thumbMethod,
      resizeHeight: this.resizeHeight,
      resizeMethod: this.resizeMethod,
      resizeWidth: this.resizeWidth,
      resizeMimeType: this.resizeMimeType,
      resizeQuality: this.resizeQuality
    });
  }

  ngOnChanges() {
    if (this.uploaderRef instanceof FireUploaderRef) {
      // Update uploader's config when inputs change
      this.uploaderRef.setConfig({
        autoStart: this.autoStart,
        thumbWidth: this.thumbWidth,
        thumbHeight: this.thumbHeight,
        thumbMethod: this.thumbMethod,
        resizeHeight: this.resizeHeight,
        resizeMethod: this.resizeMethod,
        resizeWidth: this.resizeWidth,
        resizeMimeType: this.resizeMimeType,
        resizeQuality: this.resizeQuality
      });
    }
  }

  itemClicked(e: Event, file: FileItem) {
    e.stopPropagation();
    this.itemClick.emit(file);
  }

  select() {
    this.uploaderRef.select();
  }

  start() {
    this.uploaderRef.start();
  }

  pause() {
    this.uploaderRef.pause();
  }

  resume() {
    this.uploaderRef.resume();
  }

  cancel() {
    this.uploaderRef.cancel();
  }

  reset() {
    this.uploaderRef.reset();
  }
}
