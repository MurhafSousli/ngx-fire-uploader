import { Inject, Injectable, Optional } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { FireUploaderConfig } from './fire-uploader.model';
import { UPLOADER_CONFIG } from './fire-uploader.token';
import { DEFAULT_CONFIG } from './fire-uploader.default';
import { FireUploaderRef } from './fire-uploader-ref';
import { FileItem } from './file-item';

/**
 * FireUploader global service that can be used to access FireUploaderRef anywhere in the app
 */
@Injectable()
export class FireUploader {
  /** Stores FireUploaderRef instances */
  private readonly _instances = {};

  /** Global default config */
  config: FireUploaderConfig;

  /** Set default global config */
  constructor(@Optional() @Inject(UPLOADER_CONFIG)config: FireUploaderConfig, private _storage: AngularFireStorage) {
    this.config = {...DEFAULT_CONFIG, ...config};
  }

  /** Get a FireUploaderRef */
  ref(id = 'root', config?: FireUploaderConfig): FireUploaderRef {
    if (this._instances[id] instanceof FireUploaderRef) {
      return this._instances[id];
    } else {
      config = {...this.config, ...config};
      return (this._instances[id] = new FireUploaderRef(config, this._storage));
    }
  }

  /** Set config */
  setConfig(config: FireUploaderConfig, id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].setConfig(config);
    }
  }

  /** Start uploading task */
  start(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].start();
    }
  }

  /** Add files manually */
  addFiles(files: FileItem[], id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].addFiles();
    }
  }

  /** Reset uploader state */
  reset(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].reset();
    }
  }

  /** Cancel uploading task */
  cancel(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].cancel();
    }
  }

  /** Resume uploading task */
  resume(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].resume();
    }
  }

  destroy(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].destroy();
      this._instances[id] = null;
    }
  }
}
