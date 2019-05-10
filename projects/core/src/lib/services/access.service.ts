import { ACCESS_CONFIG } from './../config';
import { Inject, Optional, Injectable } from '@angular/core';
import { setHasAccessStrategy, setConfigurationAccess, can, canExpression } from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  constructor(@Optional() @Inject(ACCESS_CONFIG) accesses, accessStrategy: AccessStrategy) {
    // setHasAccessStrategy(accessStrategy || (() => false));
    setHasAccessStrategy(accessName => accessStrategy.has(accessName));
    setConfigurationAccess(accesses || {});
  }

  can(path: string, action: string, group = false): boolean {
    return can(path, action, group);
  }

  canExpression(accessExpression: string | Array<string>, group = false): boolean {
    return canExpression(accessExpression, group);
  }

}
