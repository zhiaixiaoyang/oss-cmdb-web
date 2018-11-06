import { NgModule } from '@angular/core';
import { CookiesService } from 'ng-zorro-iop';
import { MessageService } from './message.service';
import { UserService } from './user.service';
import { HttpInterceptorService } from './http-interceptor.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationParamService } from "./application-param.service";
import { MenuService } from './menu.service';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    CookiesService,
    MessageService,
    UserService,
    ApplicationParamService,
    MenuService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
  ]
})
export class SharedModule { }

