import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccessService } from '../services';

@Directive({
  selector: '[ngxHasAccess]'
})
export class HasAccessDirective implements OnInit {

  @Input() ngxHasAccessElse: TemplateRef<any>;
  @Input() ngxHasAccessGroup = false;
  @Input() ngxHasAccess: string | Array<string>;

  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef, private accessService: AccessService) {
  }

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
