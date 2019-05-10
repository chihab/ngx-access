import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccessService } from './../services/access.service';

@Directive({
  selector: '[ngxHasAccess]'
})
export class HasAccessDirective implements OnInit {

  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef, private accessService: AccessService) {
  }

  @Input() ngxHasAccessElse: TemplateRef<any>;
  @Input() ngxHasAccessGroup = false;
  @Input() ngxHasAccess: string | Array<string>;

  ngOnInit() {
    this.accessService.canExpression(this.ngxHasAccess, this.ngxHasAccessGroup)
      .subscribe(
        access => access
          ? this.viewContainer.createEmbeddedView(this.template)
          : this.ngxHasAccessElse
            ? this.viewContainer.createEmbeddedView(this.ngxHasAccessElse)
            : null
      );
  }
}
