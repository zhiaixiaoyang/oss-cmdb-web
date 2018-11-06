import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from '../shared';

import { StatusModule } from '../core/status/status.module';
import { FormModule } from '../core';

import { ExternalServiceComponent } from './external-service.component';
import { ExternalServiceService } from './external-service.service';
import {NgZorroIopModule} from 'ng-zorro-iop';
import { EnvironmentModule } from '@trident/core';


const routes: Routes = [
  {
    path: '', component: ExternalServiceComponent
  }
];

@NgModule({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      RouterModule,
      RouterModule.forChild(routes),
      NgZorroAntdModule,
      NgZorroIopModule,
      StatusModule,
      FormModule,
      HttpClientModule,
      EnvironmentModule
    ],
    declarations: [
      ExternalServiceComponent
    ],
    entryComponents: [],
    exports: [ ],
    providers: [ ExternalServiceService, { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }  ]
})
export class  ExternalServiceModule { }
