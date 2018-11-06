import {APP_INITIALIZER, enableProdMode, NgModule} from '@angular/core';
import {NgZorroAntdModule, NZ_I18N, zh_CN} from 'ng-zorro-antd';
import {CookiesService, NgZorroIopModule} from 'ng-zorro-iop';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MessageService, SharedModule} from '@trident/shared';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';

import {AppRoutingModule} from './app-routing.module';
import {NavAsideModule} from './nav-aside/nav-aside.module';
import {NavHeaderModule} from './nav-header/nav-header.module';
import {HomeModule} from './home/home.module';
import {ApplicationParamService} from './shared';
import {BreadcrumbModule} from './core/breadcrumb/breadcrumb.module';
import {StatusModule} from './core/status/status.module';

import {AppComponent} from './app.component';

import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {initializer} from './app-init';
import {MarkdownModule} from 'ngx-markdown';

enableProdMode();
registerLocaleData(zh);

@NgModule({
  imports: [
    AppRoutingModule,
    NoopAnimationsModule,
    NavAsideModule,
    NavHeaderModule,
    HomeModule,
    SharedModule,
    NgZorroIopModule,
    NgZorroAntdModule.forRoot(),
    BreadcrumbModule,
    StatusModule,
    MarkdownModule.forRoot(),
    KeycloakAngularModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    MessageService,
    ApplicationParamService,
    CookiesService,
    { provide: NZ_I18N, useValue: zh_CN },
    /*{
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService, ApplicationParamService, CookiesService]
    }*/
  ],
  entryComponents: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
