import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, Optional, SkipSelf, Host, AfterViewInit } from '@angular/core';
import { AccessService } from '../services';
import { parse } from '../helpers';

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
      const { path, action } = parse(this.parentAccessPath.ngxAccessPath);
      if (this.ngxHasAccess) {
        if (Array.isArray(this.ngxHasAccess)) {
          ngxHasAccess = `${this.ngxHasAccess.map(access => access.replace('$', path))}:${action}`;
        } else {
          const { path: childPath, action: childAction } = parse(ngxHasAccess);
          ngxHasAccess = `${childPath.replace('$', path)}:${childAction ? childAction : action}`;
        }
      } else {
        ngxHasAccess = `${path}:${action}`;
      }
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
