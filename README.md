## Configuration

Giving this configuration and this strategy

```ts
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';

/**
 * method is called over each matched service
 **/
@Injectable()
export class AlwaysTrueAccessStrategy implements AccessStrategy {
  has(access: string): Observable<boolean> {
    // return this.authService.getUserAccesses().some(userAccess => userAccess === access)
    return of(true);
  }
}

// Better define in a configuration file [See below]
const accesses = {
  Home: {
    Main: {
      User: {
        Email: {
          Read: "CanReadUserEmail",
          Update: "CanUpdateUserEmail"
        },
        Password: {
          Update: "CanUpdateUserPassword"
        },
        Address: {
          Update: "CanUpdateUserAddress"
        }
      }
    }
  }
}

@NgModule({
   imports: [
      AccessModule.forRoot({
         accesses,
         strategy: { provide: AccessStrategy, useClass: TrueAccessStrategy }
      })
   ]
   ...
})
export class AppModule { }
```

### Check in template if user has access
```html
<app-user-form *ngxAccess="'Home.Main.User:Update'" [user]="user"></app-user-form>
```

### Else statement
```html
<app-user-form *ngxAccess="'Home.Main.User:Update'; else unauthorized" [user]="user"></app-user-form>

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>
```

### Group indicator
### Container Component
```html
<div ngxAccessPath="Main.User:Read">
  <ng-container *ngxAccess>
      <input *ngxAccess="'$.Email'" [(ngModel)]="user.email"></span>
      <app-address *ngxAccess="'$.Address'" [(ngModel)]="user.address"></app-address>
  </ng-container>
</div>
```

### Router Link
```html
<a href="" [routerLink]="['view', user.id]" *ngxAccess="'Home.Main.User:Read'">
    View User
</a>
<a href="" [routerLink]="['edit', user.id]" *ngxAccess="'Home.Main.User:Update'">
    Edit User
</a>
```

## Guard
```ts
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';

@NgModule({
   declarations: [
      AppComponent
   ],
   imports: [
      AccessModule.forRoot({
         accesses: {
            User: {
               Profile: {
                  Read: 'CanAccessUserProfile'
               },
               Billing: {
                  Read: 'CanAccessUserBilling'
               }
            }
         },
         redirect: '/forbidden',
         strategy: { provide: AccessStrategy, useClass: MyAccessStrategy }
      }),
      RouterModule.forRoot([
         ...
         { path: 'forbidden', component: UnauthorizedComponent },
         {
            path: 'profile',
            component: ProfileComponent,
            canActivate: [AccessGuard],
            data: {
               expression: 'User.Profile:Read'
            }
         }
      ]),
      BrowserModule,
      HttpClientModule
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
```

## Usage in code
```ts
import { Component, OnInit } from '@angular/core';
import { AccessService } from 'ngx-access';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  constructor(private accessService: AccessService) { }

  hasReadAccess() {
    return this.accessService.hasAccess('Home.Main:Read');
  }

  hasCreateAccess() {
    return this.accessService.hasAccess('Home.Main:Create');
  }
}  
```

## Configuration
| Type  |  Description | Evaluation  |
|---|---|---|
|  Single |  ```"Access1"``` |  true if user  has Access1 |
|  And |  ```"Access1 AND Access2"``` |  true if user has Access1 **AND** Access2. |
|  Or |  ```["Access1", ["Access1", "Access2"]]```  |  true if user has Access1 **OR** (Access2 **OR** Access3) |
|  And/Or |  ```["Access1", ["Access2 AND Access3"]]```  |  true if user has Access1 **OR** (Access2 **AND** Access3) |

