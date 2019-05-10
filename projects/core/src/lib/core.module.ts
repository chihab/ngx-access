import { NgModule } from '@angular/core';
import { HasAccessDirective } from './directives/has-access.directive';

@NgModule({
  declarations: [HasAccessDirective],
  exports: [HasAccessDirective]
})
export class CoreModule {
}
