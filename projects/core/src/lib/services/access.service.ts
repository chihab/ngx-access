import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessServiceConfig, ACCESS_CONFIG } from '../config';
import {
  canAccessPaths,
  setConfigurationAccess,
  setHasAccessStrategy,
  canAccessExpression,
} from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  constructor(
    @Inject(ACCESS_CONFIG) config: AccessServiceConfig,
    accessStrategy: AccessStrategy
  ) {
    setHasAccessStrategy((accessName) => accessStrategy.has(accessName));
    setConfigurationAccess(config.accesses || {});
  }

  can(access: string): Observable<boolean> {
    return access.includes(':')
      ? canAccessPaths(access)
      : canAccessExpression(access);
  }
}
