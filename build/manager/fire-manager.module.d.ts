import { ModuleWithProviders } from '@angular/core';
import { FireManagerConfig } from './fire-manager.model';
import { FireManager } from './fire-manager';
export declare function previewerFactory(config: FireManagerConfig): FireManager;
export declare class FireManagerModule {
    static forRoot(config?: FireManagerConfig): ModuleWithProviders;
}
