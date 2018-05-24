import { InjectionToken } from '@angular/core';
import { FireUploaderConfig } from './fire-uploader.model';

export const UPLOADER_CONFIG = new InjectionToken<FireUploaderConfig>('config');
