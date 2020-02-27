<div align="center">
  <h2>🔑 ngx-access 🔑</h2>
  <br />
  Add access control to your components using hierarchical configuration with logical expressions.
  <br /><br />

  [![Npm version](https://badge.fury.io/js/ngx-access.svg)](https://npmjs.org/package/ngx-access)
  [![Build Status](https://travis-ci.org/chihab/ngx-access.svg?branch=master)](https://travis-ci.org/chihab/ngx-access)
</div>

# Benefits of ngx-access

* No more endless "ngIf statements" in your components
* Define your access control as logical expressions
* No need to add useless accesses for your Route/Layout components
* Centralize your access control configuration
* Document your application access control policy
* Provide your own reactive strategy to verify if the user has a given access

# In a nutshell

#### Access Expression Usage
```html
<input *ngxAccessExpr="'CanUpdateAll | (CanUpdateUser & CanUpdateUserPassword)'" type="password" />
```
```input``` element is displayed only if user has ```CanUpdateAll``` access **or** both ```CanUpdateUser``` **and** ```CanUpdateUserEmail``` accesses.

If user has  ```CanUpdateAll``` access, ```CanUpdateUser``` and ```CanUpdateUserEmail``` **will not be** evaluated.

#### Access Configuration Usage

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
          "Read": "CanReadUserAddress",
          "Update": "CanUpdateUserAddress"
        }
      }
    }
  }
}
```

```html
<app-user-form *ngxAccess="'Home.Main.User : Update'"></app-user-form>
```

```app-user-form``` component is displayed only if the user has at least one of the ```Update``` accesses defined in the ```Home.Main.User``` access path hierarchy, namely: ```CanUpdateUserEmail``` or ```CanUpdateUserPassword``` or ```CanUpdateUserAddress``` accesses.

# Getting Started

#### Install ngx-access

```shell
npm install --save ngx-access
```

#### Define the access control strategy
```ts
import { AccessStrategy } from 'ngx-access';

@Injectable()
export class TrueAccessStrategy implements AccessStrategy {
  /**
  * called method over matched access in the access expression
  * example: has("CanUpdateUserEmail")
  **/
  has(access: string): Observable<boolean> {
    // return this.authService.getUserAccesses()
    //    .some(userAccess => userAccess === access)
    return of(true);
  }
}
```

#### Import AccessModule

```ts
import { AccessGuard, AccessModule } from 'ngx-access';

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
          Read: "CanReadUserAddress",
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
         strategy: { 
           provide: AccessStrategy, 
           useClass: TrueAccessStrategy 
        }
      })
   ]
   ...
})
export class AppModule { }
```

## Usage in template

### Simple usage

```html
<app-user-form *ngxAccess="'Home.Main.User:Update'"></app-user-form>

<app-user-form *ngxAccess="'Home.Main.User:Update'; else unauthorized"></app-user-form>

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
<a href="" *ngxAccess="'Home.Main.User:Read'" [routerLink]="[...]" >
    View User
</a>
<a href="" *ngxAccess="'Home.Main.User:Update'" [routerLink]="[...]" >
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
               accesses: ['User.Profile:Read', 'User.Profile:Update']
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
    if (this.accessService.can('User.Profile:Update')) {
      // Populate formData...
    }

    if (this.accessService.canExpression('User.Profile:Update')) {
      // Populate formData...
    }
    ...
  }

}  
```

## Configuration

#### Access Expression

| Type  |  Description | Evaluation  |
|---|---|---|
|  & |  ```Access1 & Access2``` |  true if user has Access1 **AND** Access2. |
| \| |  ```Access1 \| Access2```  |  true if user has Access1 **OR** Access2 | 
| &/\| |  ```Access1 & (Access2 \| Access3)``` |  true if user has Access1 **AND** (Access2 **OR** Access3) |

#### Example
```json
{
  "Home": {
    "Notifications": {
       "Read": "
          CanReadNotifications & 
          (CanReadUpdateNotifications | CanReadDeleteNotifications | CanReadCreateNotifications)
        "
    }
  }
}
```

#### Usage
```html
<navbar>
  <a href="" *ngxAccess="'Home.Notifications:Read'" routerLink="/notifications" >
      Display Notifications
  </a>
</navbar>
```

#### Behavior
Link is displayed only if user has ```CanReadNotifications``` access **AND** at least one of ```CanReadUpdateNotifications``` **OR** ```CanReadDeleteNotifications``` **OR** ```CanReadCreateNotifications``` accesses.

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

# Credits
[LEP](https://github.com/NimitzDEV/logical-expression-parser) by [NimitzDEV](https://github.com/NimitzDEV)

# License
MIT © [Chihab Otmani](mailto:chihab@gmail.com)

