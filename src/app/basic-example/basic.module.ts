import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap/collapse/collapse.module';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap/progressbar/progressbar.module';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { FireManagerModule } from '@ngx-fire-uploader/manager';

import { BasicExampleComponent } from './basic-example.component';

@NgModule({
  declarations: [BasicExampleComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbProgressbarModule,
    SimpleNotificationsModule,
    FireManagerModule.forRoot({
      extensions: {
        pdf: 'url("assets/pdf.svg")',
        doc: '#335599'
      }
    }),
    RouterModule.forChild([
      {
        path: '',
        component: BasicExampleComponent
      }
    ])
  ]
})
export class BasicModule {}
