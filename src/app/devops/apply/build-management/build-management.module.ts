import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpInterceptorService} from '@trident/shared';
import {CodemirrorModule} from 'ng2-codemirror';
import {FormModule} from '@trident/core';
import {FileUploadModule} from 'ng2-file-upload';
import {NgZorroIopModule} from 'ng-zorro-iop';
import {EnvironmentModule} from '@trident/core';

import {BuildLogComponent} from './build-log/build-log.component';
import {BuildAddComponent} from './build-add/build-add.component';
import {BuildManagementComponent} from './build-management.component';
import {BuildManagementService} from './build-management.service';
import {BuildRouterComponent} from './detail-router/detail-router.component';
import {BuildDetailComponent} from './detail/detail.component';
import {BuildHistoryComponent} from './build-history/build-history.component';
import {UserService} from '@trident/shared';

const buildManagementRoutes: Routes = [
  {
    path: '', component: BuildManagementComponent,
    data: {hasBreadcrumb: false}
  },
  {
    path: 'detail/:id', component: BuildRouterComponent,
    data: {breadcrumb: '详情'},
    children: [
      {
        path: '', component: BuildDetailComponent,
        data: {hasBreadcrumb:false}
      },
      {
        path: 'add/:id/:type', component: BuildRouterComponent,
        data: {breadcrumb: '编辑构建', hasBreadcrumb: false},
        children: [
          {
            path: '', component: BuildAddComponent
          }
        ]
      }
    ]
  },
  {
    path: 'add', component: BuildRouterComponent,
    data: {breadcrumb: '创建构建', hasBreadcrumb: false},
    children: [
      {
        path: '', component: BuildAddComponent
      }
    ]
  },
  {
    path: 'log/:id/:history', component: BuildRouterComponent,
    data: {breadcrumb: '构建log', hasBreadcrumb: false},
    children: [
      {
        path: '', component: BuildLogComponent
      }
    ]
  },
  {
    path: 'history/:id', component: BuildRouterComponent,
    data: {breadcrumb: '执行历史', hasBreadcrumb: false},
    children: [
      {
        path: '', component: BuildHistoryComponent
      },
      {
        path: 'log/:id/:buildId/:history/:backId', component: BuildLogComponent,
        data: {breadcrumb: '执行log', hasBreadcrumb: false},
      }
    ]
  },
  {
    path: 'add/:id/:type', component: BuildRouterComponent,
    data: {breadcrumb: '编辑构建', hasBreadcrumb: false},
    children: [
      {
        path: '', component: BuildAddComponent
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
    RouterModule.forChild(buildManagementRoutes),
    NgZorroAntdModule,
    HttpClientModule,
    FileUploadModule,
    CodemirrorModule,
    NgZorroIopModule,
    FormModule,
    EnvironmentModule
  ],
  declarations: [
    BuildManagementComponent,
    BuildRouterComponent,
    BuildDetailComponent,
    BuildAddComponent,
    BuildHistoryComponent,
    BuildLogComponent
  ],
  entryComponents: [],
  exports: [],
  providers: [BuildManagementService, UserService, {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpInterceptorService,
    multi: true
  }]
})

export class BuildManagementModule {
}
