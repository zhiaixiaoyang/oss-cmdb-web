import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class LoginService {
  constructor(private http: HttpClient, private nzMessageService: NzMessageService) {}

  login(username: string, password: string): Observable<any> {
    const data = {
      username: username,
      password: password
    };
    const jsonData = JSON.stringify(data);
    console.log(jsonData);
    return this.http.post('/apis/auth/v1/login', jsonData, httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  private handleError () {
    return (error: any): Observable<any> => {
      const message = error.message || error.error;
      console.error('An error occurred', error);
      this.nzMessageService.remove();
      this.nzMessageService.error(message, {nzDuration: 3000});
      return observableThrowError(error);
    };
  }
}
