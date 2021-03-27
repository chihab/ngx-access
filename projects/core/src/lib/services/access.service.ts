import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessModuleConfig } from '../../public-api';
import { ACCESS_CONFIG } from '../config';
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
    @Inject(ACCESS_CONFIG) config: AccessModuleConfig,
    accessStrategy: AccessStrategy
  ) {
    setHasAccessStrategy((accessName) => accessStrategy.has(accessName));
    setConfigurationAccess(config.accesses || {});
  }

  can(accessPaths: string | Array<string>): Observable<boolean> {
    return canAccessPaths(accessPaths);
  }

  canExpression(accessExpression: string): Observable<boolean> {
    return canAccessExpression(accessExpression);
  }
}
