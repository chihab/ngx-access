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
- ✅ Compatible and tested against all Angular versions since v2

# Demo

Debug mode is activated here hence the popin

TODO: Put a screenshot of debug mode

# Basic Usage

## Usage in template

```html
<app-sidebar *ngxAccess="'ADMIN'"></app-sidebar>
```

The `app-sidebar` component is displayed only if the access strategy you define below validates `'ADMIN'`

---

Sometimes we want to give access to different roles, we can use logical expressions

```html
<app-salaries *ngxAccess="'ADMIN | HR'; else unauthorized"></app-salaries>

<ng-template #unauthorized>
  You do not have enough permissions to display this section.
</ng-template>
```

The `input` element is displayed only if the user has `ADMIN` **or** `HR` access.

## Define your Access strategy

The `ADMIN` and `RH` are evaluated using your custom strategy

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

You have full control over how Access Control should be verified, `ngx-access` doesn't differentiate between User, Role and Permissions based access controls. They're all `access` controls, you put whatever access control logic you want in your `AccessStrategy` service.

`ngx-access` is simply the glue between the logical `expression` you put in your template and the custom `AccessStrategy` you define.

There are some predefined strategies provided for common use cases though.

# Getting Started

### Install ngx-access

```shell
npm install --save ngx-access
```

### Define your Access strategy

```ts
import { AccessStrategy } from "ngx-access";

@Injectable({
  providedIn: "root",
})
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

### Inline Template Usage

```html
<input
  *ngxAccess="'CanUpdateAll | (CanUpdateUser & CanUpdateUserPassword)'"
  type="password"
/>
```

The `input` element is displayed only if the user has `CanUpdateAll` access **OR** both `CanUpdateUser` **And** `CanUpdateUserEmail` access.

If user has `CanUpdateAll` access, `CanUpdateUser` and `CanUpdateUserEmail` access **will not be** evaluated.

### Parent control access

```html
<form *ngxAccess>
  <h1>Update User Form</h1>
  <input *ngxAccess="'CanUpdateUserAvatar'" />
  <input *ngxAccess="'CanUpdateUserName'" />
  <input *ngxAccess="'CanUpdateUserAge'" />
  <input *ngxAccess="'CanUpdateUserPassword'" />
</form>
```

The `form` (including `h1`) will be displayed only if the user has one of the accesses in the inputs beneath.

## Centralized Access Usage

We can define access controls on an element/component using external access configuration.

This is useful when we want to maintain the access control outside the application:

- in a static [external file](#json)
- dynamically from [server](#server)

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
        "Read": "CanReadUserAddress",
        "Update": "CanUpdateUserAddress"
      }
    }
  }
}
```

In the template we provide the Access Control path

```html
<input *ngxAccess="'Home.User.Password:Update'" />
<!-- is equivalent to -->
<input *ngxAccess="'CanUpdateUserPassword'" />

<app-user-form *ngxAccess="'Home.User:Update'"></app-user-form>
<!-- is equivalent to -->
<app-user-form
  *ngxAccess="'CanUpdateUserEmail | CanUpdateUserPassword | CanUpdateUserAddress'"
></app-user-form>
```

`app-user-form` component is displayed only if the user has at least one of the `Update` access defined beneath the `Home.User` access path, namely: `CanUpdateUserEmail` or `CanUpdateUserPassword` or `CanUpdateUserAddress` access.

## Usage

```ts
import { AccessModule, AccessConfiguration } from "ngx-access";

// Usually we will
// - define in a configuration file: access.json  [See below]
// - get the configuration from the server [See below]
const access: AccessConfiguration = {
  Home: {
    User: {
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

@NgModule({
  imports: [
    AccessModule.forRoot({
      access,
    }),
  ],
  providers: [{ provide: AccessStrategy, useClass: RoleAccessStrategy }],
})
export class AppModule {}
```

### Usage in template

```html
<app-user-form *ngxAccess="'Home.User:Update'"></app-user-form>

<app-user-form
  *ngxAccess="'Home.User:Update'; else unauthorized"
></app-user-form>

<ng-template #unauthorized>
  You do not have enough permissions to update user info
</ng-template>
```

### Multiple Access Paths

```html
<app-home *ngxAccess="['Home:Update', 'Home:Read']"></app-home>
```

### Router Links

```html
<a href="" *ngxAccess="'Home.User:Read'" [routerLink]="[...]"> View User </a>
<a href="" *ngxAccess="'Home.User:Update'" [routerLink]="[...]"> Edit User </a>
```

### Container Component

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

## Usage in code

### Route guard

```ts
import { AccessGuard, AccessModule, AccessStrategy } from "ngx-access";

@NgModule({
  imports: [
    AccessModule.forRoot({
      redirect: "/forbidden",
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
        redirect: "/not-found",
      },
    ]),
  ],
  providers: [{ provide: AccessStrategy, useClass: MyAccessStrategy }],
})
export class AppModule {}
```

### Component

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
    let formData = {};
    if (this.accessService.check("ADMIN | RH")) {
      // Populate formData...
    }
  }
}
```

## <a id="json"></a> External access configuration

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

## <a id="server"></a> Server access configuration

```ts
import access from "./src/assets/access.json";

import { APP_INITIALIZER } from "@angular/core";

export function loadServerConfiguration(
  accessService: AccessService,
  http: HttpClient
) {
  this.http.get<AccessModuleConfiguration>("/configuration").pipe(
    tap((configuration) => accessService.setConfiguration()),
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
