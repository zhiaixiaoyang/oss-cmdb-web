import {Injectable} from '@angular/core';
import {ErrorService} from 'ng-zorro-iop';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable, throwError as observableThrowError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable()
export class CodeRuleService {
  constructor(private http: HttpClient, private errorService: ErrorService) {
  }

  // 有Jenkins数据获得构建列表数据
  getApps(): Observable<any> {
    return this.http.get('/devops/v1/builds').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 从本地数据库获得构建信息数据
  getBuilds(): Observable<any> {
    return this.http.get('/devops/v1/builds/base/information').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 创建构建
  create(data): Observable<any> {
    return this.http.post('/devops/v1/builds', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 更新构建
  update(id, data): Observable<any> {
    return this.http.put('/devops/v1/builds/' + id, JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 删除构建
  delete(id): Observable<any> {
    return this.http.delete('/devops/v1/builds/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }


  // 停止独立构建
  stopBuild(id): Observable<any> {
    return this.http.put('/devops/v1/builds/' + id + '/stopBuild', httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  private handleError() {
    return (error: any): Observable<any> => {
      this.errorService.error(error);
      return observableThrowError(error);
    };
  }
}

