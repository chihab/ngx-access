import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export abstract class AccessStrategy {
  abstract has(access: string): Observable<boolean>;
}

@Injectable()
export class FakeAccessStrategy extends AccessStrategy {
  has(access: string): Observable<boolean> {
    return of(false);
  }
}
