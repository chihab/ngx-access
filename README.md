<div align="center">
  <h2>🔑 ngx-access 🔑</h2>
  <br />
  Add access control to your components using hierarchical configuration.
  <br /><br />

  [![Npm version](https://badge.fury.io/js/ngx-access.svg)](https://npmjs.org/package/ngx-access)
</div>

# Benefits of ngx-access

* No more endless if statements in your components
* Define only the accesses you really need
* Do not add useless accesses for your Route/Layout components
* Define your access control as logical expressions
* Centralize your access control configuration
* Document your application security
* Define your own strategy to verify if the user has a given access

# In a nutshell

#### Access control configuration

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
#### Component template
```html
<app-user-form *ngxAccess="'Home.Main.User:Update'"></app-user-form>
```

#### Behavior
```app-user-form``` component is displayed only if user has at least one of the ```Update``` accesses defined in the ```Home.Main.User``` access path hierarchy, namely: ```CanUpdateUserEmail``` or ```CanUpdateUserPassword``` or ```CanUpdateUserAddress``` accesses.

# Demo

* https://stackblitz.com/edit/ngx-access


# Getting Started

#### Install ngx-access

```shell
npm install --save ngx-access
```

#### Define the access control strategy
```ts
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';

@Injectable()
export class TrueAccessStrategy implements AccessStrategy {
  /**
  * called method over each matched access
  * example: has("CanUpdateUserEmail")
  **/
  has(access: string): Observable<boolean> {
    // return this.authService.getUserAccesses().some(userAccess => userAccess === access)
    return of(true);
  }
}
```

#### Import AccessModule

```ts
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

## Usage in template

### Simple usage

```html
<app-user-form *ngxAccess="'Home.Main.User:Update'" [user]="user"></app-user-form>

<app-user-form *ngxAccess="'Home.Main.User:Update'; else unauthorized" [user]="user"></app-user-form>

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>
```

### Multiple Access Paths
```html
<app-home *ngxAccess="['Home.Main:Update', 'Home.Main:Read']"></app-home>
```

### Router Links
```html
<a href="" [routerLink]="['view', user.id]" *ngxAccess="'Home.Main.User:Read'">
    View User
</a>
<a href="" [routerLink]="['edit', user.id]" *ngxAccess="'Home.Main.User:Update'">
    Edit User
</a>
```

### Container Component

#### Repeat access path
```html
<div>
    <input *ngxAccess="'Main.User.Email:Update'" [(ngModel)]="user.email"></span>
    <input *ngxAccess="'Main.User.Password:Update'" [(ngModel)]="user.password"></span>
    <app-address *ngxAccess="'Main.User.Address:Update'" [(ngModel)]="user.address"></app-address>
</div>
```

#### DRY version
```html
<div ngxAccess="Main.User:Update">
    <input *ngxAccess="'$.Email'" [(ngModel)]="user.email"></span>
    <input *ngxAccess="'$.Password'" [(ngModel)]="user.password"></span>
    <app-address *ngxAccess="'$.Address'" [(ngModel)]="user.address"></app-address>
</div>
```

#### Explanation
``` $``` is replaced by ```Main.User```. 

``` Update``` is appended to the resulting string.

## Usage in code

### Route guard
```ts
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';

@NgModule({
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
      ])
   ]
   ...
})
export class AppModule { }
```

### Component
```ts
import { Component, OnInit } from '@angular/core';
import { AccessService } from 'ngx-access';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
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

#### Example
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

#### Usage
```html
<navbar>
  <a href="" routerLink="/notifications" *ngxAccess="'Home.Notifications:Read'">
      Display Notifications
  </a>
</navbar>
```

#### Behavior
Link is displayed only if user has ```CanReadNotifications``` access **AND** at least one of ```CanReadUpdateNotifications OR CanReadDeleteNotifications OR CanReadCreateNotifications``` accesses.

## External access configuration

#### 1. Enable JSON imports in tsconfig.json
```json
{
  ...
  "compilerOptions": {
    ...
    "declaration": false,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    ...
  }
}
```

#### 2. Create ngx-access configuration
```json
{
  "Home": {
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
```

#### 3. Import ngx-access configuration
```ts
import accesses from './path/to/access.json';

@NgModule({
   imports: [
      AccessModule.forRoot({
         accesses,
         ...
      })
   ]
   ... 
})
```

# License
MIT © [Chihab Otmani](mailto:chihab@gmail.com)


