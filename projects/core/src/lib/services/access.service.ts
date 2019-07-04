import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccessConfig, ACCESS_CONFIG } from '../config';
import { canAccessExpression, canAccessConfiguration, getAccessExpression, setAccessConfiguration, setAccessExpression, getAccessConfiguration, setHasAccessStrategy } from '../helpers/access-helpers';
import { AccessStrategy } from './access-strategy.service';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private debugSubject$: BehaviorSubject<boolean>;
  private debug$: Observable<boolean>;

  constructor(@Inject(ACCESS_CONFIG) config: AccessConfig, accessStrategy: AccessStrategy) {
    setHasAccessStrategy(accessName => accessStrategy.has(accessName), config.reactive);
    setAccessConfiguration(config.accesses || {}/*, {parse: v => v, group: false}*/);
    this.debugSubject$ = new BehaviorSubject<boolean>(true);
    this.debug$ = this.debugSubject$.asObservable();
  }

  can(accessConfiguration: string): Observable<boolean> {
    return canAccessConfiguration(accessConfiguration);
  }

  canExpression(accessExpression: string): Observable<boolean> {
    return canAccessExpression(accessExpression);
  }

  setAccessExpression(accessKey: string, accessExpression: string) {
    setAccessExpression(accessKey, accessExpression);
  }

  getAccessExpression(accessKey: string) {
    return getAccessExpression(accessKey);
  }

  getAccessConfiguration() {
    return getAccessConfiguration();
  }

  setDebug(debug: boolean) {
    this.debugSubject$.next(debug);
  }

  debug(): Observable<boolean> {
    return this.debug$;
  }

}
