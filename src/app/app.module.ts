import { ACCESS_CONFIG, ACCESS_STRATEGY } from 'core';
import { CoreModule } from 'core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { AppComponent } from './app.component';

export const MyAccessStrategy = () => () => false;

@Injectable({ providedIn: 'root' })
export class StrategyService {
  constructor(private http: HttpClient) { }
  canAccess(access: string) {
    return false;
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: ACCESS_CONFIG,
      useValue: {
        Hello: {
          View: {
            read: 'CanAccess'
          }
        }
      }
    },
    {
      provide: ACCESS_STRATEGY,
      useClass: StrategyService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
