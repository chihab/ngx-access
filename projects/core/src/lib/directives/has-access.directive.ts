import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccessService } from './../services/access.service';

@Directive({
  selector: '[ngxHasAccess]'
})
export class HasAccessDirective implements OnInit {

  constructor(private template: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private accessService: AccessService) {
  }

  @Input() ngxHasAccessElse: TemplateRef<any>;
  @Input() ngxHasAccessGroup = false;
  @Input() ngxHasAccess: string | Array<string>;

  ngOnInit() {
    if (this.accessService.canExpression(this.ngxHasAccess, this.ngxHasAccessGroup)) {
      this.viewContainer.createEmbeddedView(this.template);
    } else if (this.ngxHasAccessElse) {
      this.viewContainer.createEmbeddedView(this.ngxHasAccessElse);
    }
  }
}
