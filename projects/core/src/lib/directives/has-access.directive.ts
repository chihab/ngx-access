import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccessService } from '../services';

@Directive({
  selector: '[ngxHasAccess]'
})
export class HasAccessDirective implements OnInit {

  @Input() ngxHasAccess: string | Array<string>;
  @Input() ngxHasAccessElse: TemplateRef<any>;

  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef, private accessService: AccessService) {
  }

  ngOnInit() {
    this.accessService.can(this.ngxHasAccess)
      .subscribe(
        access => access
          ? this.viewContainer.createEmbeddedView(this.template)
          : this.ngxHasAccessElse
            ? this.viewContainer.createEmbeddedView(this.ngxHasAccessElse)
            : null
      );
  }
}
