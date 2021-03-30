import { Observable } from 'rxjs';

export abstract class AccessStrategy {
  abstract has(access: string): Observable<boolean> | boolean;
}
