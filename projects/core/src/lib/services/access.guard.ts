import { AccessService } from './access.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  constructor(private router: Router,
              private accessService: AccessService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (this.accessService.canExpression(next.data.expectedAccess)) {
      return true;
    }

    // this.router.navigate(['/not-authorized']);
    return false;
  }
}
