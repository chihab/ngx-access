<div align="center">
  <h2>🔑 ngx-access 🔑</h2>
    <br />

[![Npm version](https://badge.fury.io/js/ngx-access.svg)](https://npmjs.org/package/ngx-access)
[![Build Status](https://travis-ci.org/chihab/ngx-access.svg?branch=master)](https://travis-ci.org/chihab/ngx-access)
[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Add access control to your components.

ngx-access is an access control library for Angular, specifically designed to be extended and customized.

</div>

# Features

- ✅ No more endless "ngIf statements" in your components
- ✅ Define your access control as logical expressions
- ✅ Centralize your access control configuration
- ✅ Display parent only if one of the children is displayed
- ✅ Document your application access control policy
- ✅ Provide your custom reactive strategy to verify if the user has a given access
- ✅ Compatible and tested against all Angular versions since v2 (WIP 🚧)

# Table of Contents

- [In a Nutshell](#in-a-nutshell)
- [Installation](#installation)
- [Access Strategy](#access-strategy)
- [Usage in Template](#usage-in-template)
- [Usage in Code](#usage-in-code)
- [Contributors](#contributors)
- [Credits](#credits)

# In a Nutshell

## Basic usage

```html
<app-sidebar *ngxAccess="'ADMIN'"></app-sidebar>
```

The `app-sidebar` component is displayed only if the user has `'ADMIN'` access.

---

## Usage with logical expressions

```html
<app-salaries *ngxAccess="'ADMIN | HR'; else unauthorized"></app-salaries>

<ng-template #unauthorized>
  You do not have enough permissions to display this section.
</ng-template>
```

The `app-salaries` component is displayed only if the user has `ADMIN` **OR** `HR` access.

## Define your Access strategy

The `ADMIN` and `RH` access are evaluated using your custom strategy

```ts
import { AccessStrategy } from "ngx-access";

@Injectable()
export class RoleAccessStrategy implements AccessStrategy {
  constructor(private userService: UserService) {}

  check(role: string): boolean {
    return this.userService
      .getRoles()
      .some((userAccess) => userAccess === role);
  }
}
```

You have full control on how Access Control should be verified, `ngx-access` doesn't differentiate between User, Role and Permissions based access controls. They're all `access` controls, you put whatever access control logic you want in your `AccessStrategy` service.

`ngx-access` is simply the glue between the logical `expression` you put in your template and the custom `AccessStrategy` you define.

The Access strategy can be reactive.

There are predefined strategies provided for some common use cases though. (WIP 🚧)

# Installation

## Install ngx-access

```shell
npm install --save ngx-access
```

## Compatibility

ngx-access version 2.x has verified compatibility with the following Angular versions.

| Angular version | ngx-access 2.x support |
| --------------- | ---------------------- |
| 11.x            | ✅                     |
| 10.x            | ✅                     |
| 9.x             | ✅                     |
| 8.x             | ✅                     |
| 7.x             | ✅                     |
| 6.x             | ✅                     |
| 5.x             | ✅                     |
| 4.x             | ✅                     |
| 2.x             | ✅                     |

If the version you are using is not listed, please [raise an issue in our GitHub repository](https://github.com/chihab/ngx-access/issues/new).

</br>

# Access strategy

To define your custom access strategy

## 1. Define the strategy

```ts
import { AccessStrategy } from "ngx-access";

@Injectable()
export class PermissionAccessStrategy implements AccessStrategy {
  constructor(private userService: UserService) {}

  // You have full control on access control logic
  check(persmission: string): boolean {
    return this.userService
      .getPermissions()
      .some((userPermission) => userPermission === persmission);
  }
}
```

You can implement a reactive strategy by returning an `Observable<boolean>`.

```ts
import { AccessStrategy } from "ngx-access";

@Injectable()
export class PermissionAccessStrategy implements AccessStrategy {
  constructor(private userService: UserService) {}

  // You have full control on access control logic
  check(persmission: string): Observable<boolean> {
    return this.userService
      .getPermissions()
      .pipe(
        map((userPermissions: string[]) =>
          userPermissions.some(
            (userPermission) => userPermission === persmission
          )
        )
      );
  }
}
```

## 2. Provide the strategy

```ts
import { AccessStrategy } from "ngx-access";
import { PermissionAccessStrategy } from "./core/access.service";

@NgModule({
  providers: [{ provide: AccessStrategy, useClass: PermissionAccessStrategy }],
})
export class AppModule {}
```

# Usage in template

## Static access control

```html
<input
  *ngxAccess="'CanUpdateAll | (CanUpdateUser & CanUpdateUserPassword)'"
  type="password"
/>
```

The `input` element is displayed only if the user has `CanUpdateAll` access **OR** both `CanUpdateUser` **And** `CanUpdateUserEmail` access.

If user has `CanUpdateAll` access, `CanUpdateUser` and `CanUpdateUserEmail` access **will not be** evaluated.

## Parent access control - (WIP 🚧)

```html
<form *ngxAccess>
  <h1>Update User Form</h1>
  <input *ngxAccess="'CanUpdateUserAvatar'" />
  <input *ngxAccess="'CanUpdateUserName'" />
  <input *ngxAccess="'CanUpdateUserAge'" />
  <input *ngxAccess="'CanUpdateUserPassword'" />
</form>
```

The `form` (including `h1`) will be displayed only if the user has one of the access in the inputs beneath.

## Dynamic access control

We can define access controls on an element/component using external access configuration.

This is useful when we want to maintain the access control outside the application:

- in a static [external file](#external-access-configuration)
- dynamically from [server](#server)

```json
{
  "User": {
    "Form": {
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
```

In the template we provide the Access Control path

```html
<input *ngxAccess="'User.Form.Password:Update'" />
<!-- is equivalent to -->
<input *ngxAccess="'CanUpdateUserPassword'" />

<app-user-form *ngxAccess="'User.Form:Update'"></app-user-form>
<!-- is equivalent to -->
<app-user-form
  *ngxAccess="'CanUpdateUserEmail | CanUpdateUserPassword | CanUpdateUserAddress'"
></app-user-form>
```

`app-user-form` component is displayed only if the user has at least one of the `Update` access defined beneath the `User.Form` access path, namely: `CanUpdateUserEmail` or `CanUpdateUserPassword` or `CanUpdateUserAddress` access.

### Configuration

```ts
import { AccessModule, AccessConfiguration } from "ngx-access";

// Usually we will
// - define in a configuration file: access.json  [See below]
// - get the configuration from the server [See below]
export const ACCESS_CONFIGURATION: AccessConfiguration = {
  User: {
    Form: {
      Email: {
        Read: "CanReadUserEmail",
        Update: "CanUpdateUserEmail",
      },
      Password: {
        Update: "CanUpdateUserPassword",
      },
      Address: {
        Read: "CanReadUserAddress",
        Update: "CanUpdateUserAddress",
      },
    },
  },
};
```

The access configuration can be set either at module level

```ts
import { ACCESS_CONFIGURATION } from "./access.ts";

@NgModule({
  imports: [
    AccessModule.forRoot({
      access: ACCESS_CONFIGURATION,
    }),
  ],
  providers: [{ provide: AccessStrategy, useClass: RoleAccessStrategy }],
})
export class AppModule {}
```

Or at service level

```ts
import { ACCESS_CONFIGURATION } from "./access.ts";

import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  constructor(private accessService: AccessService) {}
  ngOnInit() {
    this.accessService.setConfiguration(ACCESS_CONFIGURATION);
  }
}
```

#### <a id="server"></a> Server access configuration (WIP 🚧)

```ts
import access from "./src/assets/access.json";

import { APP_INITIALIZER } from "@angular/core";

export function loadServerConfiguration(
  accessService: AccessService,
  http: HttpClient
) {
  this.http.get<AccessModuleConfiguration>("/configuration").pipe(
    tap((configuration) => accessService.setConfiguration(configuration)),
    catchError((e) => accessService.setConfiguration({}))
  );
}

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadServerConfiguration,
      deps: [AccessService, HttpClient],
      multi: true,
    },
  ],
})
export class AppModule {}
```

### Logical Expressions (WIP 🚧)

You can use logical expression on your access paths

```html
<app-user *ngxAccess="'User:Update' | 'User:Read'"></app-user>
```

### Container Component (WIP 🚧)

Rather than repeating the same access path in sibling elements we can define the path access in the parent element/component

```html
<div>
  <input *ngxAccess="'User.Email:Update'" [(ngModel)]="user.email"></span>
  <input *ngxAccess="'User.Password:Update'" [(ngModel)]="user.password"></span>
  <app-address *ngxAccess="'User.Address:Update'" [(ngModel)]="user.address"></app-address>
</div>
<!-- is equivalent to -->
<div ngxAccess="User:Update">
  <input *ngxAccess="'.Email'" [(ngModel)]="user.email"></span>
  <input *ngxAccess="'.Password'" [(ngModel)]="user.password"></span>
  <app-address *ngxAccess="'.Address'" [(ngModel)]="user.address"></app-address>
</div>
```

`.Email` is above prefixed by `User`.

`Update` is appended to the resulting string.

### External access configuration

#### 1. Enable JSON imports in tsconfig.json

```json
{
  "compilerOptions": {
    "declaration": false,
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

#### 2. Create access.json file

```json
{
  "User": {
    "Form": {
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

#### 3. Import access.json file

```ts
import access from "./src/assets/access.json";

@NgModule({
  imports: [
    AccessModule.forRoot({
      access,
    }),
  ],
})
export class AppModule {}
```

# Usage in code

## Component

```ts
import { Component, OnInit } from "@angular/core";
import { AccessService } from "ngx-access";

@Component({
  selector: "app-main",
  templateUrl: "./component.html",
  styleUrls: ["./component.css"],
})
export class MainComponent {
  constructor(private accessService: AccessService) {}

  submit() {
    if (this.accessService.check("ADMIN | RH")) {
      // Send ADMIN | RH specific Payload to backend
    }
  }
}
```

## Route guard

```ts
import { AccessGuard, AccessModule, AccessStrategy } from "ngx-access";

@NgModule({
  imports: [
    AccessModule.forRoot({
      redirectTo: "/forbidden",
    }),
    RouterModule.forRoot([
      { path: "forbidden", component: UnauthorizedComponent },
      { path: "not-found", component: NotFoundComponent },
      {
        path: "profile",
        component: ProfileComponent,
        canActivate: [AccessGuard],
        data: {
          access: "ADMIN",
        },
        // if no 'ADMIN' access, guard refirects to '/forbidden' defined at module level
      },
      {
        path: "salaries",
        loadChildren: () =>
          import("./salaries/salaries.module").then((m) => m.SalariesModule),
        canLoad: [AccessGuard],
        data: {
          access: "ADMIN | RH",
        },
        // if no 'ADMIN' or 'RH' access, guard refirects to '/not-found'
        redirectTo: "/not-found",
      },
    ]),
  ],
  providers: [{ provide: AccessStrategy, useClass: MyAccessStrategy }],
})
export class AppModule {}
```

## Logical Expression

| Type | Description                      | Evaluation                                                |
| ---- | -------------------------------- | --------------------------------------------------------- |
| &    | `Access1 & Access2`              | true if user has Access1 **AND** Access2.                 |
| \|   | `Access1 \| Access2`             | true if user has Access1 **OR** Access2                   |
| &/\| | `Access1 & (Access2 \| Access3)` | true if user has Access1 **AND** (Access2 **OR** Access3) |

# Credits

[LEP](https://github.com/NimitzDEV/logical-expression-parser) by [NimitzDEV](https://github.com/NimitzDEV)

# License

MIT © [Chihab Otmani](mailto:chihab@gmail.com)
