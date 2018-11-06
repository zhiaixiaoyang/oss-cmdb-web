import {Injectable} from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ProjectService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}

  getProjects(name: string): Observable<any> {
    const projectParams = new HttpParams()
      .append('name', name);
    return this.http.get('/app/v1/projects', {params: projectParams}).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getTags(name: string): Observable<any> {
    return this.http.get('/app/v1/projects/' + name + '/tags').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getTag(name: string, tag: string): Observable<any> {
    return this.http.get('/app/v1/projects/' + name + '/tags/' + tag).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  deleteTag(name: string, tag: string): Observable<any> {
    return this.http.delete('/app/v1/projects/' + name + '/tags/' + tag).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  scanTag(name: string, tag: string): Observable<any> {
    return this.http.post('/app/v1/projects/' + name + '/tags/' + tag + '/scan', httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  create(data): Observable<any> {
    return this.http.post('/app/v1/projects', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  delete(name): Observable<any> {
    return this.http.delete('/app/v1/projects/' + name).pipe(
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

  getPageData(pageIndex, pageSize): Observable<any> {
    const projectParams = new HttpParams()
      .append('page', pageIndex)
      .append('pageSize', pageSize);
    return this.http.get('/app/v1/projects/4/projects/page', {params: projectParams}).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

}
