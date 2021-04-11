import { Injectable } from '@angular/core';
import { AccessStrategy } from 'ngx-access';

@Injectable()
export class MyAccessStrategy implements AccessStrategy {
  constructor() {}
  // has(access: string): Observable<boolean> {
  //   return of('CanReadFirstName' === access).pipe(delay(2000));
  // }
  has(access: string): boolean {
    return 'CanReadFirstName' === access;
  }
}
