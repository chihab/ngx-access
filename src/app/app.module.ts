import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { MyAccessStrategy } from './my-access-strategy.service';
import { ProfileComponent } from './profile/profile.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    MainComponent,
    UnauthorizedComponent,
  ],
  imports: [
    AccessModule.forRoot({
      accesses: {
        UserForm: {
          FirstName: {
            Read: 'UserAccess',
          },
          Login: {
            Read: 'Adminccess',
          },
        },
      },
      redirect: '/forbidden',
      strategy: { provide: AccessStrategy, useClass: MyAccessStrategy },
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
          accesses: ['Hello.View:Read', 'Hello.View:Update'],
        },
      },
    ]),
    BrowserModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
