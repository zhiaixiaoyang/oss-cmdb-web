import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule } from '@angular/router';

import { BreadcrumbComponent } from './breadcrumb.component';


@NgModule({
  imports: [
    NgZorroAntdModule,
    CommonModule,
    RouterModule
  ],
  declarations: [
    BreadcrumbComponent
  ],
  exports: [ BreadcrumbComponent ],
  providers: [ ]
})
export class BreadcrumbModule { }

