import { ModuleWithProviders } from '@angular/core';
import { FireUploader } from './fire-uploader';
import { FireUploaderConfig } from './fire-uploader.model';
export declare function UploaderFactory(config: FireUploaderConfig): FireUploader;
export declare class FireUploaderModule {
    static forRoot(config?: FireUploaderConfig): ModuleWithProviders;
}
