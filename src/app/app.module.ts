import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { MyAccessStrategy } from './core/my-access-strategy.service';
import { ProfileComponent } from './profile/profile.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UserComponent } from './user/user.component';
import { AccessExpressionComponent } from './access-expression/access-expression.component';

@NgModule({
   declarations: [
      AppComponent, ProfileComponent, MainComponent, UnauthorizedComponent, UserComponent, AccessExpressionComponent
   ],
   entryComponents: [AccessExpressionComponent],
   imports: [
      AccessModule.forRoot({
         accesses: {
            UserForm: {
               FirstName: {
                  Read: 'UserAccess'
               },
               Login: {
                  Read: 'Adminccess'
               }
            }
         },
         expressionComponent: AccessExpressionComponent,
         redirect: '/forbidden',
         strategy: { provide: AccessStrategy, useClass: MyAccessStrategy },
         reactive: true
      }),
      RouterModule.forRoot([
         { path: '', component: MainComponent },
         { path: 'forbidden', component: UnauthorizedComponent },
         { path: 'lazy', loadChildren: './lazy/lazy.module#LazyModule' },
         {
            path: 'profile',
            component: ProfileComponent,
            canActivate: [AccessGuard],
            data: {
               accesses: ['Hello.View:Read', 'Hello.View:Update']
            }
         }
      ]),
      BrowserModule,
      HttpClientModule
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
