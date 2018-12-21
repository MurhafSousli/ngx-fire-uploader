import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap/collapse/collapse.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap/progressbar/progressbar.module';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { FireUploaderModule } from '@ngx-fire-uploader/core';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { routes } from './routes';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, {useHash: true}),
    NgbDropdownModule.forRoot(),
    NgbCollapseModule.forRoot(),
    NgbProgressbarModule.forRoot(),
    SimpleNotificationsModule.forRoot(),
    FireUploaderModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
