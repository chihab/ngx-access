import { ACCESS_CONFIG } from './config';
import { NgModule, Inject, Optional } from '@angular/core';
import { CoreComponent } from './core.component';
import { HasAccessDirective } from './has-access/has-access.directive';

@NgModule({
  declarations: [CoreComponent, HasAccessDirective],
  imports: [
  ],
  exports: [CoreComponent, HasAccessDirective]
})
export class CoreModule {
  constructor(@Optional() @Inject(ACCESS_CONFIG) configuration) {
    console.log(configuration);
  }
}
