import {Injectable} from '@angular/core';
import {ErrorService} from 'ng-zorro-iop';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, throwError as observableThrowError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class UserService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}

  getApps(uname, email): Observable<any> {
    if (uname === undefined) {
      uname = '';
    }
    if (email === undefined) {
      email = '';
    }
    return this.http.get('/apis/auth/v1/users/1/10000?name=' + uname + '&email=' + email).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }
  getApplication(uname, email): Observable<any> {
    if (uname === undefined) {
      uname = '';
    }
    if (email === undefined) {
      email = '';
    }
    return this.http.get('/apis/auth/v1/users/1/10000?name=' + uname + '&email=' + email).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  create(data): Observable<any> {
    return this.http.post('/apis/auth/v1/users', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

 edit(data, id): Observable<any> {
    return this.http.put('/apis/auth/v1/users/' + id + '/reset-password' , JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getAvailableRoles(): Observable<any> {
    return this.http.get('/apis/auth/v1/users/available/roles').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getNamespaceUserRights(environment, namespace): Observable<any> {
    return this.http.get('/envs/' + environment + '/namespaces/' + namespace + '/user-rights').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getUserAvailableNamespaces(id): Observable<any> {
    return this.http.get('/apis/core/v1/namespaces/' + id + '/available').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  getUserUnavailableNamespaces(id): Observable<any> {
    return this.http.get('/apis/core/v1/namespaces/' + id + '/unavailable').pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  addUserToNamespace(id, namespace): Observable<any> {
    const data = {
      userId: id,
      role: 'trident-admin'
    };
    return this.http.post('/apis/core/v1/namespaces/' + namespace + '/add-user', JSON.stringify(data), httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  removeUserFromNamespace(id, namespace): Observable<any> {
    return this.http.delete('/apis/core/v1/namespaces/' + namespace + '/remove-user/' + id, httpOptions).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }

  deleteUser(id): Observable<any> {
    return this.http.delete('/apis/auth/v1/users/' + id).pipe(
      tap(response => response),
      catchError(this.handleError())
    );
  }
  nameUnique(namespace, resource, name): Promise<any> {
    return this.http.get('/app/v1/namespace/' + namespace + '/' + resource + '/' + name + '/validate')
      .toPromise()
      .then(response => response);
  }





  private handleError () {
    return (error: any): Observable<any> => {
      this.errorService.error(error);
      return observableThrowError(error);
    };
  }
}

