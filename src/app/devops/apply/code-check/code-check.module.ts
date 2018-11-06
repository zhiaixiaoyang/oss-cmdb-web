import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpInterceptorService} from '@trident/shared';
import {FormModule} from '@trident/core';
import {NgZorroIopModule} from 'ng-zorro-iop';

import {CodeCheckComponent} from './code-check.component';
import {CheckAddComponent} from './check-add/check-add.component';
import {CheckDetailComponent} from './check-detail/check-detail.component';
import {CodeCheckService} from './code-check.service';
import {CheckRouterComponent} from './check-router/check-router.component';

const CodeCheckRoutes: Routes = [
  {
    path: '', component: CodeCheckComponent,
    data: {hasBreadcrumb: false}
  },
  {
    path: 'add', component: CheckRouterComponent,
    data: {breadcrumb: '创建任务', hasBreadcrumb: false},
    children: [
      {
        path: '', component: CheckAddComponent
      }
    ]
  },
  {
    path: 'detail/:id', component: CheckRouterComponent,
    data: {breadcrumb: '详情'},
    children: [
      {
        path: '', component: CheckDetailComponent,
        data: {hasBreadcrumb: false}
      },
      {
        path: 'add/:id/:type', component: CheckRouterComponent,
        data: {breadcrumb: '编辑构建', hasBreadcrumb: false},
        children: [
          {
            path: '', component: CheckAddComponent
          }
        ]
      }
    ]
  },
  {
    path: 'add/:id/:type', component: CheckRouterComponent,
    data: {breadcrumb: '编辑任务', hasBreadcrumb: false},
    children: [
      {
        path: '', component: CheckAddComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    RouterModule.forChild(CodeCheckRoutes),
    NgZorroAntdModule,
    HttpClientModule,
    NgZorroIopModule,
    FormModule
  ],
  declarations: [
    CodeCheckComponent,
    CheckAddComponent,
    CheckDetailComponent,
    CheckRouterComponent
  ],
  entryComponents: [],
  exports: [],
  providers: [CodeCheckService, {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true}]
})

export class CodeCheckModule{}
