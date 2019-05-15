import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccessStrategy } from 'ngx-access';

@Injectable()
export class MyAccessStrategy implements AccessStrategy {
  constructor(private http: HttpClient) { }
  has(access: string): Observable<boolean> {
    return of('UserAccess' === access);
  }
}
