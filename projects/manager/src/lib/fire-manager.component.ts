import { Component, Input, OnInit, Output, HostBinding, OnChanges, OnDestroy, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FireUploader, FireUploaderRef, FileItem, ResizeMethod, FireUploaderProgress } from '@ngx-fire-uploader/core';
import { FireManager } from './fire-manager.service';

@Component({
  selector: 'fire-manager',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fire-manager.component.html'
})
export class FireManagerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() id = 'root';
  @Input() dropZone: boolean = this._manager.config.dropZone;

  @Input() paramName: string = this._manager.config.paramName;
  @Input() paramDir: string = this._manager.config.paramDir;
  @Input() uniqueName: boolean = this._manager.config.uniqueName;
  @Input() maxFilesCount: number = this._manager.config.maxFilesCount;
  @Input() maxFileSize: number = this._manager.config.maxFileSize;
  @Input() parallelUploads: number = this._manager.config.parallelUploads;
  @Input() multiple: boolean = this._manager.config.multiple;
  @Input() accept: string = this._manager.config.accept;
  @Input() autoStart: boolean = this._manager.config.autoStart;
  @Input() thumbs: boolean = this._manager.config.thumbs;
  @Input() thumbWidth: number = this._manager.config.thumbWidth;
  @Input() thumbHeight: number = this._manager.config.thumbHeight;
  @Input() thumbMethod: ResizeMethod = this._manager.config.thumbMethod;
  @Input() resizeMethod: ResizeMethod = this._manager.config.resizeMethod;
  @Input() resizeWidth: number = this._manager.config.resizeWidth;
  @Input() resizeHeight: number = this._manager.config.resizeHeight;
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
  @Output() value = new EventEmitter<string[]>();
  @Output() complete = new EventEmitter();
  @Output() success = new EventEmitter<FileItem>();
  @Output() progress = new EventEmitter<FireUploaderProgress>();
  @Output('remove') removeEmitter = new EventEmitter<FileItem>();
  @Output('cancel') cancelEmitter = new EventEmitter<FileItem>();
  @Output('reset') resetEmitter = new EventEmitter();
  @Output() active = new EventEmitter<boolean>();
  @Output() error = new EventEmitter<any>();

  @HostBinding('class.dragover') hoverClass;

  constructor(private _uploader: FireUploader, private _manager: FireManager) {
  }

  private getConfig() {
    return {
      paramName: this.paramName,
      paramDir: this.paramDir,
      uniqueName: this.uniqueName,
      maxFiles: this.maxFilesCount,
      maxFileSize: this.maxFilesCount,
      parallelUploads: this.parallelUploads,
      multiple: this.multiple,
      accept: this.accept,
      autoStart: this.autoStart,
      thumbs: this.thumbs,
      thumbWidth: this.thumbWidth,
      thumbHeight: this.thumbHeight,
      thumbMethod: this.thumbMethod,
      resizeHeight: this.resizeHeight,
      resizeMethod: this.resizeMethod,
      resizeWidth: this.resizeWidth,
      resizeQuality: this.resizeQuality
    };
  }

  ngOnInit() {
    this.uploaderRef = this._uploader.ref(this.id, this.getConfig());

    this.uploaderRef.success$.subscribe((file: FileItem) => this.success.emit(file));
    this.uploaderRef.progress$.subscribe((progress: FireUploaderProgress) => this.progress.emit(progress));
    this.uploaderRef.active$.subscribe((active: boolean) => this.active.emit(active));
    this.uploaderRef.files$.subscribe((files: FileItem[]) => this.files.emit(files));
    this.uploaderRef.value$.subscribe((value: string[]) => this.value.emit(value));
    this.uploaderRef.remove$.subscribe((file: FileItem) => this.removeEmitter.emit(file));
    this.uploaderRef.cancel$.subscribe((file: FileItem) => this.cancelEmitter.emit(file));
    this.uploaderRef.complete$.subscribe((files: FileItem[]) => this.complete.emit(files));
    this.uploaderRef.reset$.subscribe(() => this.resetEmitter.emit());
  }

  ngOnDestroy() {
    this._uploader.destroy(this.id);
  }

  ngOnChanges() {
    if (this.uploaderRef instanceof FireUploaderRef) {
      // Update uploader's config when inputs change
      this.uploaderRef.setConfig(this.getConfig());
    }
  }

  itemClicked(e: Event, file: FileItem) {
    e.stopPropagation();
    this.itemClick.emit(file);
  }

  remove(file: FileItem) {
    this.uploaderRef.removeItem(file);
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
