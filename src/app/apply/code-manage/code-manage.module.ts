import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {StatusModule} from '../../core/status/status.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FormModule} from '../../core';
import {NgZorroIopModule} from 'ng-zorro-iop';
import {CodeManageComponent} from './code-manage.component';
import {EnvironmentModule} from '@trident/core';

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
    StatusModule,
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
