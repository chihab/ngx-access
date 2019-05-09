import { Directive } from '@angular/core';

@Directive({
  selector: '[libHasAccess]'
})
export class HasAccessDirective {

  constructor() {
    console.log('HasAccess directive');
  }

}
