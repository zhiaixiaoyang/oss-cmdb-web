import {Injectable} from '@angular/core';
import {ErrorService} from 'ng-zorro-iop';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable, throwError as observableThrowError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable()
export class CodeCheckService {
  constructor(private http: HttpClient, private errorService: ErrorService) {
  }

  // 获取代码审查列表数据
  getApps(): Observable<any> {
    return this.http.get('/devops/v1/codeQuality/listAll').pipe(
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

  // 通过id获得数据
  getDataById(id): Observable<any> {
    return this.http.get('/devops/v1/codeQuality/search/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 创建代码检查
  create(data): Observable<any> {
    return this.http.post('/devops/v1/codeQuality/create', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 更新
  update(id, data): Observable<any> {
    return this.http.put('/devops/v1/codeQuality/update/' + id, JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 删除
  delete(id): Observable<any> {
    return this.http.delete('/devops/v1/codeQuality/delete/' + id).pipe(
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

