import { NgModule } from '@angular/core';
import { CoreComponent } from './core.component';
import { HasAccessDirective } from './has-access/has-access.directive';

@NgModule({
  declarations: [CoreComponent, HasAccessDirective],
  imports: [
  ],
  exports: [CoreComponent, HasAccessDirective]
})
export class CoreModule { }
