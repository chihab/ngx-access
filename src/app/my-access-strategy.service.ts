import { Injectable } from '@angular/core';
import { AccessStrategy } from 'ngx-access';
import { Observable, of } from 'rxjs';

@Injectable()
export class MyAccessStrategy implements AccessStrategy {
  constructor() {}
  has(access: string): Observable<boolean> {
    return of('CanReadFirstName' === access);
  }
}
