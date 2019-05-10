import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { can, canExpression, setConfigurationAccess, setHasAccessStrategy } from '../helpers/access-helpers';
import { ACCESS_CONFIG } from './../config';
import { AccessStrategy } from './access-strategy.service';

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
