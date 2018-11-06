import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NgZorroIopModule } from 'ng-zorro-iop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { HomeComponent } from './home.component';
import { ResourceMonitoringComponent } from './resource-monitoring/resource-monitoring.component';
import { MicroServiceComponent } from './micro-service/micro-service.component';
import { TableStatisticsComponent } from './table-statistics/table-statistics.component';
import { HomeService } from './home.service';
import { FormModule } from '../core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {HttpInterceptorService} from '../shared';
import {EnvironmentModule} from '@trident/core/index';
import {StatusModule} from '../core/status/status.module';

const homeRoutes: Routes = [{ path: '', component: HomeComponent }];
@NgModule({
  imports: [
    RouterModule,
    RouterModule.forChild(homeRoutes),
    NgxEchartsModule,
    NgZorroAntdModule,
    NgZorroIopModule,
    CommonModule,
    EnvironmentModule,
    FormsModule,
    ReactiveFormsModule,
    StatusModule,
    FormModule,
    HttpClientModule
  ],
  declarations: [
    HomeComponent,
    ResourceMonitoringComponent,
    MicroServiceComponent,
    TableStatisticsComponent
  ],
  exports: [],
  providers: [HomeService, { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }]
})
export class HomeModule { }
