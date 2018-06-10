import { InjectionToken } from '@angular/core';
import { FireManagerConfig } from './fire-manager.model';

export const CONFIG = new InjectionToken<FireManagerConfig>('config');
