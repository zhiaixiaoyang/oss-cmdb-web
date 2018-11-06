import { Injectable } from '@angular/core';


import { Subject, Observable } from "rxjs";

@Injectable()
export class MessageService {
  private subject = new Subject<any>();

  sendMessage(type: any) {
    this.subject.next({type: type});
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
