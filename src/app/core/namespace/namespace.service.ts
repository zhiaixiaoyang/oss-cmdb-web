import { Injectable } from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import { HttpClient } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable()
export class NamespaceService {

  constructor(private http: HttpClient, private errorService: ErrorService) {
  }

  getNamespaces(id): Observable<any> {
    return this.http.get('apis/core/v1/envs/' + id + '/user-namespaces')
      .pipe(
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
