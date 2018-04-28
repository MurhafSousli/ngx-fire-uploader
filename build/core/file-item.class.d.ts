import { AngularFireUploadTask } from 'angularfire2/storage';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FileSnapshot } from './fire-uploader.model';
import { FireUploaderComponent } from './fire-uploader.component';
export declare class FileItem {
    file: File;
    private _uploader;
    private _task;
    snapshot: FileSnapshot;
    snapshot$: BehaviorSubject<FileSnapshot>;
    constructor(file: File, _uploader: FireUploaderComponent);
    assignTask(task: AngularFireUploadTask): Promise<any>;
    delete(): void;
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(): void;
    private updateSnapshot(snapshot);
    private onSnapshotChanges(snapshot);
    private onTaskComplete(snapshot);
}
