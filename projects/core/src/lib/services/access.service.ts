import { Inject, Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { ACCESS_CONFIG } from '../config';
import { canAccessPaths, setConfigurationAccess, setHasAccessStrategy, canAccessExpression } from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private debugSubject: BehaviorSubject<boolean>;
  private debug$: Observable<boolean>;
  private accesses = {
    'Component1': 'CanUpdate',
    'Component2': 'CanRead&CanWrite',
  };

  constructor(@Inject(ACCESS_CONFIG) config, accessStrategy: AccessStrategy) {
    setHasAccessStrategy(accessName => accessStrategy.has(accessName), config.reactive);
    setConfigurationAccess(config.accesses || {});
    this.debugSubject = new BehaviorSubject<boolean>(true);
    this.debug$ = this.debugSubject.asObservable();
  }

  can(accessPaths: string | Array<string>): Observable<boolean> {
    return canAccessPaths(accessPaths);
  }

  canExpression(accessExpression: string): Observable<boolean> {
    return canAccessExpression(accessExpression);
  }

  setAccessExpression(accessKey: string, accessExpression: string) {
    this.accesses[accessKey] = accessExpression;
  }

  getAccessExpression(accessKey: string) {
    return this.accesses[accessKey];
  }

  getConfiguration() {
    return this.accesses;
  }

  setDebug(debug: boolean) {
    this.debugSubject.next(debug);
  }

  debug(): Observable<boolean> {
    return this.debug$;
  }

}
