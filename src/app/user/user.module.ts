import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from '../shared';

import { StatusModule } from '../core/status/status.module';
import { FormModule } from '../core';

import { FileUploadModule } from 'ng2-file-upload';

import { UserComponent } from './user.component';
import {NamespaceModule} from '@trident/core';

import { UserService } from './user.service';
import { NgZorroIopModule } from 'ng-zorro-iop';

const routes: Routes = [
  {
    path: '', component: UserComponent
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
      StatusModule,
      FormModule,
      FileUploadModule,
      HttpClientModule,
      NgZorroIopModule,
      NamespaceModule
    ],
    declarations: [
      UserComponent
    ],
    entryComponents: [],
    providers: [ UserService, { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }  ]
})
export class  UserModule { }
