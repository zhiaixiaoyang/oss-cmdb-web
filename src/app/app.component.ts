import { Component, ElementRef, ViewChild, AfterViewInit, DoCheck } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, DoCheck {
  @ViewChild('pageMain') pageMain: ElementRef;
  @ViewChild('appBreadcrumb') appBreadcrumb;

  mainHeight: number;
  hasBreadcrumb = true;

  constructor(private keycloak: KeycloakService) {}

  ngAfterViewInit(): void {
    this.mainHeight = this.getMainHeight();

    // 载入后，每隔15秒执行一次checkAndUpdateToken函数
    setInterval(() => { this.checkAndUpdateToken(); }, '15000' );
    }

  checkAndUpdateToken(): void {
    const isExpired = this.keycloak.isTokenExpired(300);
    if (isExpired) {
      console.log('token will expires in 300 secconds');
      console.log(new Date());
      const self = this;
      this.keycloak.updateToken(300).then(res => {
        console.log('refresh token ok');
        this.keycloak.getToken().then(newtoken => {
          document.cookie = 'iotToken=' + newtoken;
          console.log('update cookie token');
        });
      });
    }

  }

  ngDoCheck(): void {
    this.mainHeight = this.getMainHeight();
    if (this.appBreadcrumb) {
      this.hasBreadcrumb = this.appBreadcrumb.hasBreadcrumb;
    }
  }

  getMainHeight(): number {
    let winH = window.innerHeight,
      mainOffset = this.pageMain.nativeElement.offsetTop,
      mainH = winH - (mainOffset || 0);
    mainH = mainH <= 0 ? 1 : mainH;
    return mainH;
  }
}
