import { Injectable } from '@angular/core';
import { ConnectionBackend, XHRConnection, XHRBackend, Request } from '@angular/http';

import { HttpInterceptor } from './http-interceptor';

@Injectable()
export class HttpInterceptorBackend implements ConnectionBackend {

  constructor(private httpInterceptor: HttpInterceptor,
              private xhrBackend: XHRBackend){}

  createConnection(request: Request): XHRConnection {
    let interceptor = this.httpInterceptor;

    //请求发出去之前，拦截请求并调用HttpInterceptor对象的beforeRequest()方法进行处理
    let req = interceptor.beforeRequest ? interceptor.beforeRequest(request) : request;

    let result = this.xhrBackend.createConnection(req);

    //拦截并处理得到的响应
    result.response = interceptor.afterResponse ? interceptor.afterResponse(result.response) : result.response;

    return result;
  }
 }
