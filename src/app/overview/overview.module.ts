import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from '../shared';

import { StatusModule } from '../core/status/status.module';
import { FormModule } from '../core';

import { OverviewComponent } from './overview.component';
import { OverviewService } from './overview.service';


const routes: Routes = [
  {
    path: '', component: OverviewComponent
  }
];

@NgModule({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      RouterModule,
      RouterModule.forChild(routes),
      NgZorroAntdModule,
      StatusModule,
      FormModule,
      HttpClientModule
    ],
    declarations: [
      OverviewComponent
    ],
    entryComponents: [],
    exports: [ ],
    providers: [ OverviewService, { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }  ]
})
export class  OverviewModule { }
