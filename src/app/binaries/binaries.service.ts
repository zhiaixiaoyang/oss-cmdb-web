import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import { throwError as observableThrowError ,  Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class BinariesService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}

  getBinariesList(name: string, runtimeEnv: string): Observable<any> {
    const params = new HttpParams().append('name', name).append('runtimeEnv', runtimeEnv);
    return this.http.get('/apis/apps/v1/binaries', {params: params}).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  delBinaries(id: string): Observable<any> {
    return this.http.delete('/apis/apps/v1/binaries/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }
  createBinariesMeta(data: any): Observable<any> {
    return this.http.post('/apis/apps/v1/binaries/meta', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  delBinariesVersion(id: string): Observable<any> {
    return this.http.delete('/apis/apps/v1/binaries/versions/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  downLoadBinariesVersion(id: string): Observable<any> {
    return this.http.get('/apis/apps/v1/binaries/versions/' + id + '/download',
      {observe: 'response', responseType: 'blob'}).pipe(
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
