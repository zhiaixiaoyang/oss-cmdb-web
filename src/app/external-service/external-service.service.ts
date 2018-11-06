import {Injectable} from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class ExternalServiceService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}

  getAllExternalService(environment): Observable<any> {
    return this.http.get('/apis/extensions/v1/envs/' + environment + '/ports/all').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getExternalServiceByName(environment , name): Observable<any> {
    return this.http.get('/apis/extensions/v1/envs/' + environment + '/ports/' + name).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getExternalIp(userId, environment): Observable<any> {
    const params = new HttpParams().append('user', userId);
    return this.http.get(' /apis/extensions/v1/envs/' + environment + '/externalips/available',
      {params : params}).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }


  getPorts(name , environment): Observable<any> {
    return this.http.get('/apis/extensions/v1/envs/' + environment + '/ports/' + name).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getAllPorts(name , environment): Observable<any> {
    return this.http.get('/apis/extensions/v1/envs/' + environment + '/ports/' + name).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  create(data): Observable<any> {
    return this.http.post('/apis/extensions/v1/envs/' + data.environment + '/ports', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  edit(data): Observable<any> {
    return this.http.put('/apis/extensions/v1/envs/' + data.environment + '/ports', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  deleteExternalService(externalip, environment): Observable<any> {
    return this.http.delete('/apis/extensions/v1/envs/' + environment + '/ports/' + externalip).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  private handleError () {
    return (error: any): Observable<any> => {
      this.errorService.error(error);
      return observableThrowError(error);
    };
  }
}

