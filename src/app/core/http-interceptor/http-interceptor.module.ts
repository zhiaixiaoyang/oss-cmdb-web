import { NgModule } from '@angular/core';
import { Http, HttpModule, RequestOptions } from '@angular/http';

import { HttpInterceptorBackend } from './http-interceptor-backend';
import { HttpInterceptor } from './http-interceptor';
import { httpFactory } from './http-factory';

@NgModule({
  imports: [ HttpModule ],
  declarations: [],
  providers: [
    HttpInterceptorBackend, HttpInterceptor,
    { provide: Http, useFactory: httpFactory, deps: [HttpInterceptorBackend, RequestOptions] }
  ]
})
export class HttpInterceptorModule { }
