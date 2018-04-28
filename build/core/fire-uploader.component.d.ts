import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from 'angularfire2/storage';
import { UploaderState, UploaderProgress } from './fire-uploader.model';
import { FireUploader } from './fire-uploader';
import { FileItem } from './file-item.class';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
export declare class FireUploaderComponent implements OnInit, OnDestroy {
    private _manager;
    private _storage;
    private _initialState;
    private _state;
    state$: BehaviorSubject<UploaderState>;
    updateRootState$: BehaviorSubject<UploaderState>;
    private _cancelUpload$;
    dropZone: boolean;
    paramName: string;
    uniqueName: boolean;
    placeholder: string;
    multiple: boolean;
    accept: string;
    parallelUploads: number;
    maxFiles: number;
    maxFileSize: number;
    autoStart: boolean;
    thumbs: boolean;
    thumbnailMethod: 'crop' | 'contain';
    resizeMethod: 'crop' | 'contain';
    resizeWidth: number;
    resizeHeight: number;
    resizeQuality: number;
    thumbWidth: number;
    thumbHeight: number;
    resizeMimeType: string;
    filesEmitter: EventEmitter<{}>;
    removeEmitter: EventEmitter<FileItem>;
    successEmitter: EventEmitter<FileItem>;
    completeEmitter: EventEmitter<FileItem[]>;
    valueEmitter: EventEmitter<string[]>;
    errorEmitter: EventEmitter<{}>;
    activeEmitter: EventEmitter<boolean>;
    progressEmitter: EventEmitter<UploaderProgress>;
    resetEmitter: EventEmitter<{}>;
    fileInput: any;
    hoverClass: any;
    constructor(_manager: FireUploader, _storage: AngularFireStorage);
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * Start uploading
     */
    start(): void;
    select(): void;
    /**
     * Add files to the queue
     */
    addFiles(fileList: FileList): void;
    /**
     * Remove file
     * cancels the file if it is being uploaded
     * deletes the file if it has been uploaded
     */
    removeFile(item: FileItem): void;
    /**
     * Resets the uploader
     */
    reset(remove?: boolean): void;
    cancelFile(file: FileItem): void;
    /**
     * Cancel all upload tasks
     */
    cancel(remove?: boolean): void;
    /**
     * Pause all upload tasks
     */
    pause(): void;
    /**
     * Resume all paused tasks
     */
    resume(): void;
    private setState(state);
    /**
     * Takes files from drop zone or file input
     * Validates max file count
     * Validates max file size
     * Prevents duplication
     */
    private validateFiles(fileList);
    /**
     * Iterates over given files
     * Generates file name
     * Starts the uploading task
     */
    private uploadFiles(files);
    /**
     * Combine the states of all files in a single state
     */
    private combineStates();
}
