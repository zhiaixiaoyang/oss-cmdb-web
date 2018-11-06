/**
 * Created by fengyongqing on 2018/1/15.
 */
import { NgModule }          from '@angular/core';
import { BrowserModule }     from '@angular/platform-browser';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from '../shared';

import { NavHeaderComponent } from './nav-header.component';
import { UserService, ApplicationParamService, MenuService } from '../shared'

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule,
    NgZorroAntdModule,
    HttpClientModule
  ],
  declarations: [
    NavHeaderComponent,
  ],
  exports: [
    NavHeaderComponent
  ],
  providers: [
    UserService,
    ApplicationParamService,
    MenuService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
  ]
})
export class NavHeaderModule { }
