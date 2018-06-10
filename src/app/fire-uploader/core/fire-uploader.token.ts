import { InjectionToken } from '@angular/core';
import { FireUploaderConfig } from './fire-uploader.model';

/** FireUploaderConfig token */
export const UPLOADER_CONFIG = new InjectionToken<FireUploaderConfig>('config');
