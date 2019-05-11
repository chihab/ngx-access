import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccessStrategy } from 'core';

@Injectable()
export class MyAccessStrategy implements AccessStrategy {
  constructor(private http: HttpClient) { }
  has(access: string): Observable<boolean> {
    return of('CanAccess' === access);
  }
}
