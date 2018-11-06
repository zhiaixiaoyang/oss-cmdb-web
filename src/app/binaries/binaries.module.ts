import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from '../shared';
import { FileUploadModule } from 'ng2-file-upload';
import { NgZorroIopModule } from 'ng-zorro-iop';

import { BinariesComponent } from '../binaries/binaries.component';
import { BinariesTableComponent } from '../binaries/binaries-table/binaries-table.component';
import { BinariesUploadComponent } from '../binaries/binaries-upload/binaries-upload.component';
import { BinariesService } from '../binaries/binaries.service';
import { BinariesOptComponent } from '../binaries/binaries-opt/binaries-opt.component';

const binariesRoutes: Routes = [
  {
    path: '', component: BinariesComponent
  },
  {
    path: 'upload', component: BinariesUploadComponent,
    data: {hasBreadcrumb: false},
  },
];
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    RouterModule.forChild(binariesRoutes),
    NgZorroAntdModule,
    HttpClientModule,
    FileUploadModule,
    NgZorroIopModule,
  ],
  declarations: [
    BinariesUploadComponent,
    BinariesOptComponent,
    BinariesTableComponent,
    BinariesComponent
  ],
  entryComponents: [
  ],
  exports: [  ],
  providers: [
    BinariesService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
  ]
})

export class  BinariesModule { }
