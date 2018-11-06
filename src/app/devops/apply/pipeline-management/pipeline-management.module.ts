import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpInterceptorService} from '@trident/shared';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormModule} from '@trident/core';
import {NgZorroIopModule} from 'ng-zorro-iop';
import {PipelineManagementComponent} from './pipeline-management.component';
import {PipelineManagementService} from './pipeline-management.service';
import {PipelineHistoryComponent} from './pipeline-history/pipeline-history.component';
import {HistoryRouterComponent} from './history-router/history-router.component';
import {PipelineLogComponent} from './pipeline-log/pipeline-log.component';
import {CodemirrorModule} from 'ng2-codemirror';
import {PipelineAddComponent} from './pipeline-add/pipeline-add.component';
import {UserService} from '@trident/shared';
import {EnvironmentModule} from '@trident/core';

const piplelineManagementRoutes: Routes = [
  {
    path: '', component: PipelineManagementComponent,
    data: {hasBreadcrumb: false}
  },
  {
    path: 'history/:id', component: HistoryRouterComponent,
    data: {breadcrumb: '执行历史',hasBreadcrumb: false},
    children: [
      {
        path: '', component: PipelineHistoryComponent
      },
      {
        path: 'log2/:pipeline_id/:id/:history', component: HistoryRouterComponent,
        data: {breadcrumb: '执行log',hasBreadcrumb:false},
        children: [
          {
            path: '', component: PipelineLogComponent
          },
        ]
      }
    ]
  },
  {
    path: 'log/:pipeline_id/:id/:history', component: HistoryRouterComponent,
    data: {breadcrumb: '执行log',hasBreadcrumb: false},
    children: [
      {
        path: '', component: PipelineLogComponent
      }
    ]
  },
  {
    path: 'add', component: HistoryRouterComponent,
    data: {breadcrumb: '创建流水线', hasBreadcrumb: false},
    children: [
      {
        path: '', component: PipelineAddComponent
      }
    ]
  },
  {
    path: 'add/:id', component: HistoryRouterComponent,
    data: {breadcrumb: '创建流水线', hasBreadcrumb: false},
    children: [
      {
        path: '', component: PipelineAddComponent
      }
    ]
  }

];

@NgModule({
  imports: [
    FormsModule,
    NgZorroIopModule,
    ReactiveFormsModule,
    CommonModule,
    FormModule,
    RouterModule,
    RouterModule.forChild(piplelineManagementRoutes),
    NgZorroAntdModule,
    CodemirrorModule,
    HttpClientModule,
    EnvironmentModule
  ],
  declarations: [
    PipelineManagementComponent,
    PipelineHistoryComponent,
    HistoryRouterComponent,
    PipelineLogComponent,
    PipelineAddComponent,
  ],
  entryComponents: [],
  exports: [],
  providers: [PipelineManagementService, UserService, {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpInterceptorService,
    multi: true
  }]
})

export class PipelineManagementModule {
}
