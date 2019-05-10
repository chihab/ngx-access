import { Directive } from '@angular/core';

@Directive({
  selector: '[ngxHasAccess]'
})
export class HasAccessDirective {

  constructor() {
    console.log('HasAccess directive');
  }

}
