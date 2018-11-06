import {Injectable} from '@angular/core';
import {ErrorService} from 'ng-zorro-iop';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable, throwError as observableThrowError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable()
export class BuildManagementService {
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

  // 通过id获得数据
  getAppsById(id): Observable<any> {
    return this.http.get('/devops/v1/builds/' + id).pipe(
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

  // 获得构建相关联的流水线代码审查
  getConstructRelevance(id): Observable<any> {
    return this.http.get('/devops/v1/builds/isConstructUsing/' + id).pipe(
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

  // 独立构建
  independentBuild(id, tag): Observable<any> {
    return this.http.put('/devops/v1/builds/' + id + '/build/' + tag, httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 查看构建执行log
  getBuildLogById(id, buildName): Observable<any> {
    return this.http.get('/devops/v1/builds/' + id + '/' + buildName + '/log').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 查看流水线执行log
  getPipelineLogById(id, buildName): Observable<any> {
    return this.http.get('/devops/v1/pipelines/' + id + '/' + buildName + '/log').pipe(
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

  // 获得程序包名称
  getBinariesList(name: string, runtimeEnv: string): Observable<any> {
    const params = new HttpParams().append('name', name).append('runtimeEnv', runtimeEnv);
    return this.http.get('/apis/apps/v1/binaries', {params: params}).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // apiToken跟项目地址校验
  apiTokenValidator(data): Observable<any> {
    return this.http.post('/devops/v1/builds/construct/verify', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // gitlab用户名密码项目地址校验
  gitLabValidator(data): Observable<any> {
    return this.http.post('/devops/v1/builds/construct/verify/gitlab/user', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 获得构建历史
  getHistoryById(id): Observable<any> {
    return this.http.get('/devops/v1/builds/' + id + '/construct/builds').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  // 获取项目分支
  getBranch(data): Observable<any> {
    return this.http.post('/devops/v1/builds/construct/get/branches', JSON.stringify(data), httpOptions).pipe(
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

  // get image tag
  getImageTag(name): Observable<any> {
    return this.http.get('/apis/images/v1/images/user-image-tags?name=' + name).pipe(
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

