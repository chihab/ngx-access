import { ACCESS_CONFIG, ACCESS_STRATEGY } from './../config';
import { Inject, Optional, Injectable } from '@angular/core';
import { setHasAccessStrategy, setConfigurationAccess, can, canExpression } from '../helpers/access-helpers';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  constructor(@Optional() @Inject(ACCESS_CONFIG) accesses, @Optional() @Inject(ACCESS_STRATEGY) accessStrategy) {
    // setHasAccessStrategy(accessStrategy || (() => false));
    setHasAccessStrategy(accessName => accessStrategy.canAccess(accessName));
    setConfigurationAccess(accesses || {});
  }

  can(path: string, action: string, group = false): boolean {
    return can(path, action, group);
  }

  canExpression(accessExpression: string | Array<string>, group = false): boolean {
    return canExpression(accessExpression, group);
  }

}
