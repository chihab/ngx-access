import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccessConfig, ACCESS_CONFIG } from '../config';
import { canAccessExpression, canAccessPaths, getAccessExpression, setConfigurationAccess, setHasAccessStrategy } from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private debugSubject: BehaviorSubject<boolean>;
  private debug$: Observable<boolean>;
  // private accesses;

  constructor(@Inject(ACCESS_CONFIG) config: AccessConfig, accessStrategy: AccessStrategy) {
    setHasAccessStrategy(accessName => accessStrategy.has(accessName), config.reactive);
    setConfigurationAccess(config.accesses || {});
    // this.accesses = flatten(config.accesses) ;
    // this.accesses = config.accesses ;
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
    // this.accesses[accessKey] = accessExpression;
  }

  getAccessExpression(accessKey: string) {
    return getAccessExpression(accessKey);
  }

  getConfiguration() {
    return {}; // this.accesses;
  }

  setDebug(debug: boolean) {
    this.debugSubject.next(debug);
  }

  debug(): Observable<boolean> {
    return this.debug$;
  }

}
