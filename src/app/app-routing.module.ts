import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/app-home',
    pathMatch: 'full'
  },
  {
    path: 'app-home',
    loadChildren: './new-home/home.module#NewHomeModule',
    data: {
      breadcrumb: '总览',
      hasBreadcrumb: false
    }
  },
  {
    path: 'overview',
    loadChildren: './home/home.module#HomeModule',
    data: {
      breadcrumb: '容器总览'
    }
  },
  {
    path: 'app-binaries',
    loadChildren: './binaries/binaries.module#BinariesModule',
    data: {
      breadcrumb: '程序包'
    }
  },
  {
    path: 'app-apply-code-manage',
    loadChildren: './apply/code-manage/code-manage.module#CodeManageModule',
    data: {
      breadcrumb: '代码托管'
    }
  },
  {
    path: 'app-apply-build-management',
    loadChildren:'../../node_modules/@sws/devops/apply/build-management/build-management.module#BuildManagementModule',
    // loadChildren: './apply/build-management/build-management.module#BuildManagementModule',
    data: {
      breadcrumb: '构建'
    }
  },
  {
    path: 'app-apply-pipeline-management',
    loadChildren: './apply/pipeline-management/pipeline-management.module#PipelineManagementModule',
    data: {
      breadcrumb: '流水线'
    }
  },
  {
    path: 'app-apply-code-check',
    loadChildren: './apply/code-check/code-check.module#CodeCheckModule',
    data: {
      breadcrumb: '任务'
    }
  },
  {
    path: 'app-apply-code-rule',
    loadChildren: './apply/code-rule/code-rule.module#CodeRuleModule',
    data: {
      breadcrumb: '规则'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
