import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpInterceptorService} from '@trident/shared';
import {FormModule} from '@trident/core';
import {NgZorroIopModule} from 'ng-zorro-iop';


import {CodeRuleComponent} from './code-rule.component';
import {RuleAddComponent} from './code-add/rule-add.component'
import {CodeRuleService} from './code-rule.service';
import {RuleRouterComponent} from './rule-router/rule-router.component';

const CodeRuleRoutes: Routes = [
  {
    path: '', component: CodeRuleComponent,
    data: {hasBreadcrumb: false}
  },
  {
    path: 'add', component: RuleRouterComponent,
    data: {hasBreadcrumb: false},
    children: [
      {
        path:'', component: RuleAddComponent
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
    RouterModule.forChild(CodeRuleRoutes),
    NgZorroAntdModule,
    HttpClientModule,
    NgZorroIopModule,
    FormModule
  ],
  declarations: [
    CodeRuleComponent,
    RuleAddComponent,
    RuleRouterComponent
  ],
  entryComponents: [],
  exports: [],
  providers: [CodeRuleService, {provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true}]
})

export class CodeRuleModule{}
