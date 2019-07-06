import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccessGuard, AccessModule, AccessStrategy } from 'ngx-access';
import { AccessExpressionPanel } from './access-expression/access-expression.component';
import { AppComponent } from './app.component';
import { MyAccessStrategy } from './core/my-access-strategy.service';
import { MainComponent } from './main/main.component';
import { ProfileComponent } from './profile/profile.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UserComponent } from './user/user.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule } from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({
   declarations: [
      AppComponent, 
      ProfileComponent, 
      MainComponent, 
      UnauthorizedComponent, 
      UserComponent, 
      AccessExpressionPanel, DashboardComponent
   ],
   entryComponents: [AccessExpressionPanel],
   imports: [
      AccessModule.forRoot({
         accesses: {
            UserForm: {
               FirstName: {
                  Read: 'CanRead & CanWrite',
                  Write: 'CanWrite'
               },
               Login: {
                  Read: 'CanRead | CanWrite',
               }
            }
         },
         redirect: '/forbidden',
         strategy: { provide: AccessStrategy, useClass: MyAccessStrategy },
         reactive: true,
         editor: {
            component: AccessExpressionPanel,
         }
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
      HttpClientModule,
      BrowserAnimationsModule,
      MatGridListModule,
      MatCardModule,
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      LayoutModule
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
