import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from '../../shared';

import { FileUploadModule } from 'ng2-file-upload';

import { LoginComponent } from './login.component';

import { LoginService } from './login.service';

const loginRoutes: Routes = [
  {
    path: '', component: LoginComponent
  }
];
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    RouterModule.forChild(loginRoutes),
    NgZorroAntdModule,
    FileUploadModule,
    HttpClientModule
  ],
  declarations: [
    LoginComponent
  ],
  entryComponents: [
  ],
  exports: [ ],
  providers: [ LoginService, { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true } ]
})
export class  LoginModule { }
