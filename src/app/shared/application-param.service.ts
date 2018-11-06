import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';




@Injectable()
export class ApplicationParamService {
  constructor(private http: HttpClient) {}

  getParams(): Promise<any> {
    return this.http.get("config/application.json")
      .toPromise()
      .then(response => response)
      .catch(this.handleError());
  }

  private handleError () {
    return (error: any): Promise<any> => {
      error = error.error || error;
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
    };
  }
}
