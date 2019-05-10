import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AccessGuard, CoreModule, AccessStrategy } from 'core';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { MyAccessStrategy } from './my-access-strategy.service';
import { ProfileComponent } from './profile/profile.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

@NgModule({
   declarations: [
      AppComponent, ProfileComponent, MainComponent, UnauthorizedComponent
   ],
   imports: [
      CoreModule.forRoot({
         accesses: {
            Hello: {
               View: {
                  read: 'CannotAccess'
               }
            }
         },
         strategy: { provide: AccessStrategy, useClass: MyAccessStrategy }
      }),
      RouterModule.forRoot([
         { path: '', component: MainComponent },
         { path: 'unauthorized', component: UnauthorizedComponent },
         {
            path: 'profile',
            component: ProfileComponent,
            canActivate: [AccessGuard],
            data: {
               expression: 'Hello.View:read'
            }
         }
      ]),
      BrowserModule,
      HttpClientModule
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
