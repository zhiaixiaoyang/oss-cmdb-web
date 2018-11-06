import { Component } from '@angular/core';
import { LoginService } from './login.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: LoginService) {}
  username = 'admin';
  password =  '123456a?';
  login() {
    this.loginService.login(this.username, this.password).subscribe(datas => {
       document.cookie = 'iotToken=' + datas.access_token;
    });
  }
}

