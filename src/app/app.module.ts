import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  AccessConfiguration,
  AccessGuard,
  AccessModule,
  AccessService,
  AccessStrategy,
} from 'ngx-access';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { MyAccessStrategy } from './my-access-strategy.service';
import { ProfileComponent } from './profile/profile.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export function loadServerConf(
  accessService: AccessService
): () => Promise<void> {
  return () => {
    const serverConf$ = of({
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
    }).pipe(catchError((_) => of({})));

    return serverConf$
      .toPromise()
      .then((configuration: AccessConfiguration) => {
        console.log('Setting configuration', configuration);
        accessService.setConfiguration(configuration);
      });
  };
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
    {
      provide: APP_INITIALIZER,
      useFactory: loadServerConf,
      deps: [AccessService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
