import {Injectable} from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HomeService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}

  getSpaceData(environment): Observable<any> {
    return this.http.get( '/apis/core/v1/envs/' + environment + '/user-namespaces').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getQueryData(queryKind , environment, param): Observable<any> {
    return this.http.post( '/apis/monitoring/v1/envs/' + environment + '/monitorings', {queryKind: queryKind, parameter: param }).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // getQuerySimpleData(param): Observable<any> {
  //   const urlParams = new HttpParams()
  //     .append('query', param);
  //   return this.http.get(   'http://10.110.17.88:32668/api/v1/query' , { params: urlParams }).pipe(
  //     tap(response => response),
  //     catchError(this.handleError())
  //   );
  // }

  private handleError () {
    return (error: any): Observable<any> => {
      this.errorService.error(error);
      return observableThrowError(error);
    };
  }
}

