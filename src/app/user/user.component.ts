import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

  allPermissions: string[] = [
    'CanRead',
    'CanWrite',
    'CanUpdate'
  ];
  permissions$: Observable<string[]>;
  
  constructor(private userService: UserService) {
    this.permissions$ = this.userService.getPermissions();
  }

  add(perm) {
    this.userService.addPermission(perm);
  }

  delete(perm) {
    this.userService.deletePermission(perm);
  }

}
