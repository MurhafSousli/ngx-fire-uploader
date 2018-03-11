import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { FileUploaderModule } from './file-uploader/file-uploader.module';
import { FilePreviewModule } from './file-preview/file-preview.module';
import { StyleSanitizerPipe } from './style-sanitizer/style-sanitizer';

@NgModule({
  declarations: [
    AppComponent,
    StyleSanitizerPipe
  ],
  imports: [
    BrowserModule,
    FileUploaderModule.forRoot(),
    FilePreviewModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgbProgressbarModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
