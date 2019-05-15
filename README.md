# Benefits of ngx-access

* No more endless if statements in your components
* Define only the accesses you really need
* Do not add useless accesses for your Route/Layout components
* Define your access control as logical expressions
* Centralize your access control configuration
* Document your application security
* Define your own strategy to verify if the user has a given access

# In a Nutshell

```json
{
  "Home": {
    "Main": {
      "User": {
        "Email": {
          "Read": "CanReadUserEmail",
          "Update": "CanUpdateUserEmail"
        },
        "Password": {
          "Update": "CanUpdateUserPassword"
        },
        "Address": {
          "Update": "CanUpdateUserAddress"
        }
      }
    }
  }
}
```

```html
<app-user-form *ngxAccess="'Home.Main.User:Update'" [user]="user"></app-user-form>
```

```app-user-form``` component is displayed only if the user has at least one of the```Update``` accesses defined in the ```Home.Main.User``` access path, namely: ```CanUpdateUserEmail``` or ```CanUpdateUserPassword``` or ```CanUpdateUserAddress``` accesses.


# Installation

```shell
npm install --save ngx-access
```

# Configuration

```ts
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';

@Injectable()
export class TrueAccessStrategy implements AccessStrategy {
  /**
  * called method over each matched access
  * example: CanUpdateUserEmail
  **/
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

# Usage in templates

## Simple usage

```html
<app-user-form *ngxAccess="'Home.Main.User:Update'" [user]="user"></app-user-form>

<app-user-form *ngxAccess="'Home.Main.User:Update'; else unauthorized" [user]="user"></app-user-form>

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>
```

## Multiple Access Paths
```html
<app-home *ngxAccess="['Home.Main:Update', 'Home.Main:Read']"></app-home>
```

## Router Links
```html
<a href="" [routerLink]="['view', user.id]" *ngxAccess="'Home.Main.User:Read'">
    View User
</a>
<a href="" [routerLink]="['edit', user.id]" *ngxAccess="'Home.Main.User:Update'">
    Edit User
</a>
```

## Container Component

### Repeat access path
```html
<div *ngxAccess="Main.User:Read">
    <input *ngxAccess="'Main.User.Email:Read'" [(ngModel)]="user.email"></span>
    <app-address *ngxAccess="'Main.User.Address:Read'" [(ngModel)]="user.address"></app-address>
</div>
```

### Dry version
```html
<div ngxAccessPath="Main.User:Read">
  <ng-container *ngxAccess>
      <input *ngxAccess="'$.Email'" [(ngModel)]="user.email"></span>
      <app-address *ngxAccess="'$.Address'" [(ngModel)]="user.address"></app-address>
  </ng-container>
</div>
```
``` $``` is replaced by ```Main.User```

``` Read``` is implicit in ```$.Email```

# Usage in code

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

## Component
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

  submit() {
    let formData = {};
    if (this.accessService.hasAccess('User.Profile:Update')) {
      // Populate formData...
    }
    ...
  }

}  
```

## Configuration

| Type  |  Description | Evaluation  |
|---|---|---|
|  Single |  ```"Access1"``` |  true if user  has Access1 |
|  Array |  ```["Access1", "Access2"]``` |  true if user has Access1 **OR** Access2|
|  And |  ```"Access1 AND Access2"``` |  true if user has Access1 **AND** Access2. |
| Or |  ```"Access1 OR Access2"```  |  true if user has Access1 **OR** Access2 || 
| And/Or |  ```"Access1 AND (Access2 OR Access3)"``` |  true if user has Access1 **AND** (Access2 **OR** Access3) |

Example:
```json
{
  "Home": {
    "Notifications": {
       "Read": "
          CanReadNotifications AND 
          (CanReadUpdateNotifications OR CanReadDeleteNotifications OR CanReadCreateNotifications)
        "
    }
  }
}
```

```html
<navbar>
  <a href="" routerLink="/notifications" *ngxAccess="'Home.Notifications:Read'">
      Display Notifications
  </a>
</navbar>
```

Link is displayed only if user has ```CanReadNotifications``` access **AND** at least one of ```CanReadUpdateNotifications OR CanReadDeleteNotifications OR CanReadCreateNotifications``` accesses.


