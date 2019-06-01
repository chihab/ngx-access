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
import { AccessExpressionPanel } from './access-expression/access-expression.component';
import { environment } from '../environments/environment';

@NgModule({
   declarations: [
      AppComponent, ProfileComponent, MainComponent, UnauthorizedComponent, UserComponent, AccessExpressionPanel
   ],
   entryComponents: [AccessExpressionPanel],
   imports: [
      AccessModule.forRoot({
         accesses: {
            UserForm: {
               FirstName: {
                  Read: 'CanRead | CanUpdate | CanWrite',
                  Write: 'CanWrite'
               },
               Login: {
                  Read: 'CanRead | CanWrite',
               }
            }
         },
         redirect: '/forbidden',
         strategy: { provide: AccessStrategy, useClass: MyAccessStrategy },
         reactive: true
         // editor: {
         //    component: AccessExpressionPanel,
         // }
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
