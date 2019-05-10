import { ACCESS_CONFIG } from './../config';
import { Injectable, Inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccessService } from './access.service';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  constructor(private router: Router, private accessService: AccessService, @Inject(ACCESS_CONFIG) private config) {
  }
  canActivate(
    next: ActivatedRouteSnapshot): Observable<boolean> {
    return this.accessService.canExpression(next.data.expression)
      .pipe(
        tap(hasAccess => !hasAccess && this.router.navigate([next.data.redirect || this.config.redirect]))
      );
  }
}
