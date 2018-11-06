import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from "../shared";

import { ProjectComponent } from './project.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { ProjectTableOptComponent } from './project-table/project-opt/project-opt.component';

import { ProjectService } from './project.service';


@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    NgZorroAntdModule,
    HttpClientModule
  ],
  declarations: [
    ProjectTableComponent,
    ProjectComponent,
    ProjectTableOptComponent
  ],
  entryComponents: [
  ],
  exports: [ ],
  providers: [ ProjectService, { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }  ]
})
export class  ProjectModule { }
