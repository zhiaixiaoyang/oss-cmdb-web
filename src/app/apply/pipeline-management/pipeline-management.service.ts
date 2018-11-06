import {Injectable} from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable, throwError as observableThrowError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable()
export class PipelineManagementService {
  constructor(private http: HttpClient, private errorService: ErrorService) {
  }

  // 判断有没有Jenkins
  getJenkins(): Observable<any> {
    return this.http.get('/devops/v1/jenkins-env').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // install Jenkins
  installJenkins(id,data): Observable<any> {
    return this.http.post('/devops/v1/' + id + '/install-jenkins',JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 获得构建信息数据
  getApps(): Observable<any> {
    return this.http.get('/devops/v1/builds/base/information').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 根据构建id获得相关联的代码审查列表数据
  getCodeData(constructId,pipelineId): Observable<any> {
    return this.http.get('/devops/v1/codeQuality/list/' + constructId + '/' + pipelineId).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 从本地数据库获取信息
  getLocalPipeline(): Observable<any> {
    return this.http.get('/devops/v1/pipelines/list').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 获得主页面数据
  getPipeline(): Observable<any> {
    return this.http.get('/devops/v1/pipelines/lastbuilds').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 通过获得一条pipeline
  getPipelineById(id): Observable<any> {
    return this.http.get('/devops/v1/pipelines/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 通过id获得执行历史
  getHistoryById(id): Observable<any> {
    return this.http.get('/devops/v1/pipelines/' + id + '/builds').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 查看执行log
  getLogById(id, buildName): Observable<any> {
    return this.http.get('/devops/v1/pipelines/' + id + '/' + buildName + '/log').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 手动执行
  handPipeline(id): Observable<any> {
    return this.http.put('/devops/v1/pipelines/' + id + '/start', httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 停止手动执行
  stopPipeline(id): Observable<any> {
    return this.http.put('/devops/v1/pipelines/' + id + '/stop', httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  create(data): Observable<any> {
    return this.http.post('/devops/v1/pipelines', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  update(id, data): Observable<any> {
    return this.http.put('/devops/v1/pipelines/' + id, JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  checkSuccess(pipeline_id, id): Observable<any> {
    return this.http.post('/devops/v1/pipelines/' + pipeline_id + '/' + id + '/proceed', httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  checkFailed(pipeline_id, id): Observable<any> {
    return this.http.post('/devops/v1/pipelines/' + pipeline_id + '/' + id + '/abort', httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  delete(id): Observable<any> {
    return this.http.delete('/devops/v1/pipelines/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getStorageClassData(environment): Observable<any> {
    return this.http.get('/apis/storageclass/v1/envs/' + environment + '/storageclasses').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // get merge information by pipelineId
  getMergeById(id,buildNum): Observable<any> {
    return this.http.get('/devops/v1/pipelines/' + id + '/' + buildNum + '/gitInfo').pipe(
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
