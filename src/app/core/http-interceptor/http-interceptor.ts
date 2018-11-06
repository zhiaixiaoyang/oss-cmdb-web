import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Request, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpInterceptor {

  constructor(
    @Inject(DOCUMENT) private document: any) {
  }

  beforeRequest(request: Request): Request {
    console.log(request);
    let token = '';
    let name = "iotToken=";
    let ca = document.cookie.split(';');
    for(let i=0; i<ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) {
        token = c.substring(name.length, c.length);
      }
    }
    request.headers.append("Authorization", "bearer "+token);
    var url = request.url;
    if(url.startsWith("/devops") || url.startsWith("/app") || url.startsWith("/trident")) {
      request.url = "/apis" + url;
    }
    return request;
  }

  afterResponse(res: Observable<Response>): Observable<any> {
    /*res.subscribe((data) => {
      console.log(data);
    });*/
    return res;
  }
}
