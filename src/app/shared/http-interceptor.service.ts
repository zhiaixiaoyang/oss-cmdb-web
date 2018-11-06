import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(
    @Inject(DOCUMENT) private document: any) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = '';
    let name = "iotToken=";
    let ca = document.cookie.split(';');
    for(let i=0; i<ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) {
        token = c.substring(name.length, c.length);
      }
    }
    let url = req.url;
    if(url.startsWith("/devops") || url.startsWith("/app") || url.startsWith("/trident")) {
      url = "/apis" + url;
    }
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', "bearer "+token),
      url: url
    });
    console.log("new headers", clonedRequest.headers.keys());
    return next.handle(clonedRequest);
  }
}
