<div align="center">
  <h2>🔑 ngx-access 🔑</h2>
  <br />
  Simpler and cleaner access control on your application using visually editable logical expressions.
  <br /><br />

  [![Npm version](https://badge.fury.io/js/ngx-access.svg)](https://npmjs.org/package/ngx-access)
  [![Build Status](https://travis-ci.org/chihab/ngx-access.svg?branch=master)](https://travis-ci.org/chihab/ngx-access)
</div>

Table of contents
=================
- [Table of contents](#table-of-contents)
- [Benefits of ngx-access](#benefits-of-ngx-access)
- [In a nutshell](#in-a-nutshell)
  - [1. Define the access control strategy](#1-define-the-access-control-strategy)
  - [2. Inline Access Expression Usage](#2-inline-access-expression-usage)
  - [4. Access Expression Editor](#4-access-expression-editor)
- [Getting Started](#getting-started)
  - [1. Install ngx-access](#1-install-ngx-access)
  - [2. Define the access control strategy](#2-define-the-access-control-strategy)
  - [3. Import/Configure AccessModule](#3-importconfigure-accessmodule)
    - [3.1 Inline Access Expression](#31-inline-access-expression)
    - [3.2 Access configuration](#32-access-configuration)
      - [Simple usage](#simple-usage)
      - [Multiple Access Paths](#multiple-access-paths)
      - [Router Links](#router-links)
      - [Container Component](#container-component)
- [Usage in code](#usage-in-code)
  - [Route guard](#route-guard)
  - [Inject AccessService](#inject-accessservice)
  - [Lazy Loaded Module](#lazy-loaded-module)
- [Reactive Mode](#reactive-mode)
- [Access Expression Editor](#access-expression-editor)
  - [1. Create the Access Expression Editor Component](#1-create-the-access-expression-editor-component)
  - [2. Configuration AccessModule](#2-configuration-accessmodule)
  - [3. Demo](#3-demo)
- [Import configuration from file](#import-configuration-from-file)
- [License](#license)

# Benefits of ngx-access

* No more endless "ngIf statements" in your components
* Define your access control as logical expressions
* Edit/Preview your access control configuration directly from UI
* No need to add useless accesses for your Route/Layout components
* Centralize your access control configuration
* Provide your own reactive strategy to verify if the user has a given access (profile, role, permission, whatever based strategy)
* Document your application access control policy

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

## 4. Access Expression Editor

You can live edit / simulate component access expressions and then export the resulting access configuration.

See the demo: https://chihab.github.io/ngx-access/

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

At this step you have to decide wether you'd be inlining the access expressions in your components templates or you'd be centralizing the access control configuration.

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
<input *ngxAccessExpr="'CanUpdateAll | (CanUpdateUser & CanUpdateUserPassword)'; else unauthorized" type="password" />

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>

```

### 3.2 Access configuration

```ts
import { AccessGuard, AccessModule } from 'ngx-access';

// Better define in a external configuration file [See below]
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
      Notifications: {
        Read: `
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

#### Simple usage

```html
<app-user-form *ngxAccess="'Home.Main.User:Update'"></app-user-form>

<app-user-form *ngxAccess="'Home.Main.User:Update'; else unauthorized"></app-user-form>

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>
```

#### Multiple Access Paths
```html
<app-home *ngxAccess="['Home.Main:Update', 'Home.Main:Read']"></app-home>
```

#### Router Links
```html
<a href="" *ngxAccess="'Home.Main.User:Read'" [routerLink]="[...]" >
    View User
</a>
<a href="" *ngxAccess="'Home.Main.User:Update'" [routerLink]="[...]" >
    Edit User
</a>
```

#### Container Component

Define absolute access path on each controlled component
```html
<div>
  <input *ngxAccess="'Main.User.Email:Update'" [(ngModel)]="user.email"></span>
  <input *ngxAccess="'Main.User.Password:Update'" [(ngModel)]="user.password"></span>
  <app-address *ngxAccess="'Main.User.Address:Update'" [(ngModel)]="user.address"></app-address>
</div>
```

Define absolute access path in parent component and relative paths on its children
```html
<div ngxAccess="Main.User:Update">
  <input *ngxAccess="'$.Email'" [(ngModel)]="user.email"></span>
  <input *ngxAccess="'$.Password'" [(ngModel)]="user.password"></span>
  <app-address *ngxAccess="'$.Address'" [(ngModel)]="user.address"></app-address>
</div>
```

Explanation
``` $``` is replaced by ```Main.User```

``` :Update``` is appended to the resulting string.


# Usage in code

## Route guard
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

## Inject AccessService
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

## Lazy Loaded Module

When you lazy load a module, you should import AccessModule rather than AccessModule.forRoot() to have a single instance of AccessService in your application.

```ts

@NgModule({
   imports: [
      AccessModule
   ]
   ... 
})
export class LazyLoadedModule { }
```




# Reactive Mode

TODO

# Access Expression Editor

## 1. Create the Access Expression Editor Component

This is the component that will appear next to each access controlled component. 

Access Expression Editor Component class has to extend ```AccessExpressionEditor```.

```ts
import { Component } from '@angular/core';
import { AccessExpressionEditor } from 'ngx-access';

@Component({
  selector: 'app-access-expression-editor',
  templateUrl: './app-access-expression-editor.component.html',
  styleUrls: ['./app-access-expression-editor.component.css']
})
export class AccessExpressionEditorComponent extends AccessExpressionEditor {}
```

```ts
abstract class AccessExpressionEditor {
  @Input() expression; // Populated from configuration file
  @Input() evaluation; // Result of Expression evaluation
  @Output() onExpression: EventEmitter<string> = new EventEmitter<string>(); // Emit the expression for evaluation
}
```

Access Expression Editor component's template get predefined expression  and its evaluation as inputs. It emits the access expression edited by the user throught your custom input (text, select...)

```html
<input type="text" [value]="expression" #expr (keyup.enter)="onExpression.emit(expr.value)" />
{{evaluation ? 'Visible': 'Hidden'}} <!-- Or a custom style -->
<ng-content></ng-content> <!-- This is the actual component on which access control expression  is applied -->
```

## 2. Configuration AccessModule

The Access Control Editor component has to be declared in a module and added to entryComponents.

```ts
import { AccessModule } from 'ngx-access';
import { AccessExpressionEditorComponent } from './components/access-expression-editor';

@NgModule({
   declarations: [AccessExpressionEditorComponent],
   entryComponents: [AccessExpressionEditorComponent],
   imports: [
      AccessModule.forRoot({
        strategy: { 
           provide: AccessStrategy, 
           useClass: TrueAccessStrategy 
        },
        editor: {
          component: AccessExpressionEditorComponent
        }
      })
   ]
})
export class AppModule { }
```

## 3. Demo

https://chihab.github.io/ngx-access/

# Import configuration from file
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

# License
MIT © [Chihab Otmani](mailto:chihab@gmail.com)



