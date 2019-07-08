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
import { MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, MatToolbarModule, MatSidenavModule, MatListModule, MatInputModule, MatSelectModule, MatRadioModule, MatTooltipModule } from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { NavbarComponent } from './navbar/navbar.component';
import { ProductComponent } from './product/product.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
   declarations: [
      AppComponent,
      ProfileComponent,
      MainComponent,
      UnauthorizedComponent,
      UserComponent,
      AccessExpressionPanel, DashboardComponent, NavbarComponent, ProductComponent
   ],
   entryComponents: [AccessExpressionPanel],
   imports: [
      AccessModule.forRoot({
         accesses: {
            Product: {
               Company: {
                  Write: 'CanWriteCompany'
               },
               FirstName: {
                  Write: 'CanWriteFirstName'
               },
               LastName: {
                  Write: 'CanWriteLastName'
               },
               Address: {
                  Write: 'CanWriteAddress'
               },
               City: {
                  Write: 'CanWriteCity'
               },
               State: {
                  Write: 'CanWriteState'
               },
               PostalCode: {
                  Write: 'CanWritePostalCode'
               },
               Shipping: {
                  Write: 'CanWriteShipping'
               },
            },
            User: {
               FirstName: {
                  Read: 'CanReadFirstName',
                  Write: 'CanWriteFirstName'
               },
               Login: {
                  Read: 'CanReadLogin',
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
         { path: 'product', component: ProductComponent },
         { path: 'forbidden', component: UnauthorizedComponent },
         { path: 'dashboard', component: DashboardComponent },
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
      FormsModule,
      BrowserAnimationsModule,
      MatGridListModule,
      MatCardModule,
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      LayoutModule,
      MatToolbarModule,
      MatSidenavModule,
      MatListModule,
      MatInputModule,
      MatSelectModule,
      MatTooltipModule,
      MatRadioModule,
      ReactiveFormsModule
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }
