import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable()
export class StorageclassService {

  constructor(private http: HttpClient, private nzMessageService: NzMessageService) {
  }

  getStorageclasses(id ,namespaceId): Observable<any> {
    return this.http.get('apis/core/v1/envs/'+ id +'/namespaces/' + namespaceId)
      .pipe(
        tap(response => response),
        catchError(this.handleError())
      );
  }

  private handleError() {
    return (error: any): Observable<any> => {
      const message = error.message || error.error;
      console.error('An error occurred', error);
      this.nzMessageService.remove();
      this.nzMessageService.error(message, { nzDuration: 3000 });
      return observableThrowError(error);
    };
  }
}
