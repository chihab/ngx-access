import { Observable } from 'rxjs';
import { HasAccessStrategy } from '../helpers/access-helpers';

export abstract class AccessStrategy {
  abstract has(access: string): Observable<boolean> | boolean;
}
