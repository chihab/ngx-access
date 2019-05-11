import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessStrategy } from './access-strategy.service';
import { ACCESS_CONFIG } from '../config';
import { can, canExpression, setConfigurationAccess, setHasAccessStrategy } from '../helpers';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  constructor(@Inject(ACCESS_CONFIG) config, accessStrategy: AccessStrategy) {
    setHasAccessStrategy(accessName => accessStrategy.has(accessName));
    setConfigurationAccess(config.accesses || {});
  }

  can(path: string, action: string, group = false): Observable<boolean> {
    return can(path, action, group);
  }

  canExpression(accessExpression: string | Array<string>, group = false): Observable<boolean> {
    return canExpression(accessExpression, group);
  }

}
