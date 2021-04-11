import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessServiceConfig, ACCESS_CONFIG } from '../config';
import { AccessConfiguration } from '../helpers';
import {
  canAccessExpression,
  canAccessPaths,
  setConfigurationAccess,
  setHasAccessStrategy,
} from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable()
export class AccessService {
  constructor(
    @Inject(ACCESS_CONFIG) config: AccessServiceConfig,
    accessStrategy: AccessStrategy
  ) {
    setConfigurationAccess(config.access || {});
    setHasAccessStrategy((accessName) => accessStrategy.has(accessName));
  }

  setConfiguration(access: AccessConfiguration = {}) {
    setConfigurationAccess(access);
  }

  setAccessStrategy(accessStrategy: AccessStrategy) {
    setHasAccessStrategy((accessName) => accessStrategy.has(accessName));
  }

  can(access: string): Observable<boolean> {
    return access.startsWith(':')
      ? canAccessPaths(access.substring(1))
      : canAccessExpression(access);
  }
}
