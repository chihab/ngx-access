import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable(
  { providedIn: 'root' }
)
export class UserService {

  private permissions: Set<string> = new Set(['CanRead', 'CanWrite']);
  private _permissions$: BehaviorSubject<string[]>;
  private permissions$: Observable<string[]>;

  constructor() {
    this._permissions$ = new BehaviorSubject(Array.from(this.permissions));
    this.permissions$ = this._permissions$.asObservable();
  }

  addPermission(permission) {
    if (!this.permissions.has(permission)) {
      this.permissions.add(permission);
      this._permissions$.next(Array.from(this.permissions));
    }
  }

  deletePermission(permission) {
    this.permissions.delete(permission);
    this._permissions$.next(Array.from(this.permissions));
  }

  getPermissions(): Observable<string[]> {
    return this.permissions$;
  }

}