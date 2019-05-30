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

## 1. Define the access control strategy
```ts
import { AccessStrategy } from 'ngx-access';

@Injectable()
export class TrueAccessStrategy implements AccessStrategy {
  /**
   * access: access could be 'Admin' role or 'CanUpdateProfile permission or whatever suits you.
   **/
  has(access: string): Observable<boolean> {
    // Use your local state, local storage, http endpoint...
    return of(true);
  }
}
```

You're up to decide what an access does mean and how to control whether a user has it or not. 

## 2. Inline Access Expression Usage
```html
<input *ngxAccessExpr="'CanUpdateAll | (CanUpdateUser & CanUpdateUserPassword)'" type="password" />
```
```input``` element is displayed only if user has ```CanUpdateAll``` access **or** both ```CanUpdateUser``` **and** ```CanUpdateUserEmail``` accesses.

If user has  ```CanUpdateAll``` access, ```CanUpdateUser``` and ```CanUpdateUserEmail``` **will not be** evaluated. (Except on live mode) 

## 3. External Access Configuration Usage

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

```app-user-form``` component is displayed only if the user has at least one of the ```Update``` accesses defined in the ```Home.Main.User``` access path hierarchy, namely: ```CanUpdateUserEmail``` **or** ```CanUpdateUserPassword``` **or** ```CanUpdateUserAddress``` accesses.

This prevents you from adding specific accesses (repeating accesses) for parent components of which display depends on their children components.

## 4. Live Edit / Export Access Configuration

You can live edit / simulate component access expressions and then export the resulting access configuration.

See the demo: https://github.com/chihab/ngx-access

# Getting Started

## 1. Install ngx-access

```shell
npm install --save ngx-access
```

## 2. Define the access control strategy
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

## 3. Import/Configure AccessModule

At this step you have to decide wether you'd be inlining the access expression in the template or you'd be centralizing the access control configuration.

### 3.1 Inline Access Expression

```ts
import { AccessModule } from 'ngx-access';

@NgModule({
   imports: [
      AccessModule.forRoot({
         strategy: { 
           provide: AccessStrategy, 
           useClass: TrueAccessStrategy 
        }
      })
   ]
})
export class AppModule { }
```
```html
<input *ngxAccessExpr="'CanUpdateAll | (CanUpdateUser & CanUpdateUserPassword)' else unauthorized" type="password" />

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>

```

### 3.2 External Access configuration

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
      "Notifications": {
       "Read": `
          CanReadNotifications &
          (CanReadUpdateNotifications | CanReadDeleteNotifications | CanReadCreateNotifications)
        `
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

##### Usage in template

* Simple usage

```html
<app-user-form *ngxAccess="'Home.Main.User:Update'"></app-user-form>

<app-user-form *ngxAccess="'Home.Main.User:Update'; else unauthorized"></app-user-form>

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>
```

* Multiple Access Paths
```html
<app-home *ngxAccess="['Home.Main:Update', 'Home.Main:Read']"></app-home>
```

* Router Links
```html
<a href="" *ngxAccess="'Home.Main.User:Read'" [routerLink]="[...]" >
    View User
</a>
<a href="" *ngxAccess="'Home.Main.User:Update'" [routerLink]="[...]" >
    Edit User
</a>
```

* Container Component

Define absolute access path on each controlled component
```html
<div>
  <input *ngxAccess="'Main.User.Email:Update'" [(ngModel)]="user.email"></span>
  <input *ngxAccess="'Main.User.Password:Update'" [(ngModel)]="user.password"></span>
  <app-address *ngxAccess="'Main.User.Address:Update'" [(ngModel)]="user.address"></app-address>
</div>
```

Define absolute access path in parent component and relative path on children
```html
<div ngxAccess="Main.User:Update">
  <input *ngxAccess="'$.Email'" [(ngModel)]="user.email"></span>
  <input *ngxAccess="'$.Password'" [(ngModel)]="user.password"></span>
  <app-address *ngxAccess="'$.Address'" [(ngModel)]="user.address"></app-address>
</div>
```

Explanation
``` $``` is replaced by ```Main.User```. 

``` Update``` is appended to the resulting string.

#### External access configuration
* Enable JSON imports in tsconfig.json
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

 * Create ngx-access configuration
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

* Import ngx-access configuration
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

## Usage in code

### Route guard
```ts
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';

@NgModule({
   imports: [
      AccessModule.forRoot({
         accesses
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
         },
         {
            path: 'user',
            component: UserComponent,
            canActivate: [AccessGuard],
            data: {
               expression: 'ADMIN OR MANAGER'
            }
         }         
      ])
   ]
   ...
})
export class AppModule { }
```

### Inject AccessService
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

    if (this.accessService.canExpression('CanUpdateProfile')) {
      // Populate formData...
    }
    ...
  }

}  
```

### Shardd Module

```ts

@NgModule({
   imports: [
      AccessModule
   ]
   ... 
}) 
```

# License
MIT © [Chihab Otmani](mailto:chihab@gmail.com)



