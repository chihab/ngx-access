import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccessService } from './access.service';
import { AccessServiceConfig, ACCESS_CONFIG } from '../config';

@Injectable({
  providedIn: 'root',
})
export class AccessGuard implements CanActivate {
  constructor(
    private router: Router,
    private accessService: AccessService,
    @Inject(ACCESS_CONFIG) private config: AccessServiceConfig
  ) {}

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
    return this.accessService
      .can(next.data.accesses)
      .pipe(
        tap(
          (hasAccess) =>
            !hasAccess &&
            this.router.navigate([next.data.redirect || this.config.redirect])
        )
      );
  }
}
