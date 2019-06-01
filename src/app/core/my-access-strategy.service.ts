import { Injectable } from '@angular/core';
import { AccessStrategy } from 'ngx-access';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class MyAccessStrategy implements AccessStrategy {
  constructor(private userService: UserService) { }
  has(access: string): Observable<boolean> {
    return this.userService.getPermissions()
      .pipe(
        map(permissions => permissions.some(permission => permission === access)),
        tap(console.log)
      );
  }
}
