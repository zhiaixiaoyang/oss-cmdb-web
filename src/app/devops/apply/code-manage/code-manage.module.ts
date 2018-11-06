import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormModule, EnvironmentModule} from '@trident/core';
import {NgZorroIopModule} from 'ng-zorro-iop';
import {CodeManageComponent} from './code-manage.component';

const routes: Routes = [
  {
    path: '', component: CodeManageComponent,
    data: {hasBreadcrumb: false}
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
    RouterModule.forChild(routes),
    NgZorroAntdModule,
    HttpClientModule,
    EnvironmentModule
  ],
  declarations: [
    CodeManageComponent
  ],
  entryComponents: [],
})

export class CodeManageModule {
}
