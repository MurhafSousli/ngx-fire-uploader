import { Inject, Injectable, Optional } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';

import { FireUploaderConfig } from './fire-uploader.model';
import { UPLOADER_CONFIG } from './fire-uploader.token';
import { DEFAULT_CONFIG } from './fire-uploader.default';
import { FireUploaderRef } from './fire-uploader-ref';
import { FileItem } from './file-item';

@Injectable()
export class FireUploader {
  /** Stores FireUploaderRef instances */
  private readonly _instances = {};

  /** Global config */
  config: FireUploaderConfig;

  constructor(
    @Optional()
    @Inject(UPLOADER_CONFIG)
    config: FireUploaderConfig,
    private _storage: AngularFireStorage
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  ref(id = 'root', config?: FireUploaderConfig): FireUploaderRef {
    if (this._instances[id] instanceof FireUploaderRef) {
      return this._instances[id];
    } else {
      config = { ...this.config, ...config };
      return (this._instances[id] = new FireUploaderRef(config, this._storage));
    }
  }

  setConfig(config: FireUploaderConfig, id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].setConfig(config);
    }
  }

  start(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].start();
    }
  }

  addFiles(files: FileItem[], id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].addFiles();
    }
  }

  reset(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].reset();
    }
  }

  cancel(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].cancel();
    }
  }

  resume(id = 'root') {
    if (this._instances[id] instanceof FireUploaderRef) {
      this._instances[id].resume();
    }
  }
}
