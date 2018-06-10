import { InjectionToken } from '@angular/core';
import { FirePhotoConfig } from './fire-photo.model';

export const CONFIG = new InjectionToken<FirePhotoConfig>('config');
