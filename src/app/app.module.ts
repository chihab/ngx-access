import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';
import { AccessService } from 'projects/core/src/public-api';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { MyAccessStrategy } from './my-access-strategy.service';
import { ProfileComponent } from './profile/profile.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export function loadServerConfiguration(accessService: AccessService) {
  of({
    access: {
      UserForm: {
        FirstName: {
          Read: 'UserAccess',
        },
        Login: {
          Read: 'Adminccess',
        },
      },
    },
    redirectTo: '/forbidden',
  }).pipe(
    tap((configuration) => accessService.setConfiguration(configuration)), // <----
    catchError((_) => {
      accessService.setConfiguration({});
      return of();
    })
  );
}

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    MainComponent,
    UnauthorizedComponent,
  ],
  imports: [
    AccessModule.forRoot({
      access: {
        UserForm: {
          FirstName: {
            Read: 'UserAccess',
          },
          Login: {
            Read: 'Adminccess',
          },
        },
      },
      redirectTo: '/forbidden',
    }),
    RouterModule.forRoot([
      { path: '', component: MainComponent },
      { path: 'forbidden', component: UnauthorizedComponent },
      {
        path: 'lazy',
        loadChildren: () =>
          import('./lazy/lazy.module').then((m) => m.LazyModule),
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AccessGuard],
        data: {
          access: 'Hello.View:Update | UserForm.FirstName:Read',
        },
      },
    ]),
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: AccessStrategy,
      useClass: MyAccessStrategy,
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: loadServerConfiguration,
    //   deps: [AccessService],
    //   multi: true,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
