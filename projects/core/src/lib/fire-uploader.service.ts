import { Inject, Injectable, Optional } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FireUploaderConfig } from './fire-uploader.model';
import { UPLOADER_CONFIG } from './fire-uploader.token';
import { DEFAULT_CONFIG } from './fire-uploader.default';
import { FireUploaderRef } from './fire-uploader-ref';

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

  /** Checks if uploader instance exists */
  hasRef(id = 'root'): boolean {
    return this._instances[id] instanceof FireUploaderRef;
  }

  /** Get a FireUploaderRef */
  ref(id = 'root', config?: FireUploaderConfig): FireUploaderRef {
    if (this.hasRef(this._instances[id])) {
      if (config) {
        this._instances[id].setConfig({...this.config, ...config});
      }
      return this._instances[id];
    } else {
      return this._instances[id] = new FireUploaderRef({...this.config, ...config}, this._storage);
    }
  }

  /** Destroy a uploader instance */
  destroy(id = 'root') {
    if (this.hasRef(this._instances[id])) {
      this._instances[id].destroy();
      this._instances[id] = null;
    }
  }

  /** Destroy all uploader instances */
  destroyAll() {
    Object.keys(this._instances)
      .map((key) => {
        this._instances[key].destory();
        this._instances[key] = null;
      });
  }

  /** Reset all uploader instances */
  resetAll() {
    Object.keys(this._instances)
      .map((id = 'root') => this._instances[id].uploader)
      .map((uploader: FireUploaderRef) => uploader.reset());
  }
}
