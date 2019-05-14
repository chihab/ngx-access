import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ACCESS_CONFIG } from '../config';
import { canExpression, setConfigurationAccess, setHasAccessStrategy } from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  constructor(@Inject(ACCESS_CONFIG) config, accessStrategy: AccessStrategy) {
    setHasAccessStrategy(accessName => accessStrategy.has(accessName));
    setConfigurationAccess(config.accesses || {});
  }

  can(accessExpression: string | Array<string>): Observable<boolean> {
    return canExpression(accessExpression);
  }

}
