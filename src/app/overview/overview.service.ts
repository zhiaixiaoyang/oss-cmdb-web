import {Injectable} from '@angular/core';
import { ErrorService } from 'ng-zorro-iop';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable ,  throwError as observableThrowError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class OverviewService {
  constructor(private http: HttpClient, private errorService: ErrorService) {}
}

