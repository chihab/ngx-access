import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, Optional, SkipSelf, Host, AfterViewInit } from '@angular/core';
import { AccessService } from '../services';

@Directive({
  selector: '[ngxAccessPath]'
})
export class AccessPathDirective {
  @Input() ngxAccessPath: string;
}

@Directive({
  selector: '[ngxHasAccess]'
})
export class HasAccessDirective implements OnInit {

  @Input() ngxHasAccess: string | Array<string>;
  @Input() ngxHasAccessElse: TemplateRef<any>;

  constructor(private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService,
    @Optional() @Host() private parentAccessPath: AccessPathDirective) {
  }

  ngOnInit() {
    let ngxHasAccess = this.ngxHasAccess;
    if (this.parentAccessPath) {
      console.log("Parent Access Path" + this.parentAccessPath.ngxAccessPath);
      if (this.ngxHasAccess) {
        ngxHasAccess = this.ngxHasAccess.replace('$', this.parentAccessPath.ngxAccessPath);
      } else {
        ngxHasAccess = this.parentAccessPath.ngxAccessPath;
      }
    } else {
      console.log("Undefined Parent Access Path");
    }
    this.accessService.can(ngxHasAccess)
      .subscribe(
        access => access
          ? this.viewContainer.createEmbeddedView(this.template)
          : this.ngxHasAccessElse
            ? this.viewContainer.createEmbeddedView(this.ngxHasAccessElse)
            : null
      );
  }
}
