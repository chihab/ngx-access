import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, Optional, SkipSelf, Host, AfterViewInit } from '@angular/core';
import { AccessService } from '../services/access.service';
import { parse } from '../helpers/access-helpers';

// @Directive({
//   selector: '[ngxAccessPath]'
// })
// export class AccessPathDirective {
//   @Input() ngxAccessPath: string;
// }

@Directive({
  selector: '[ngxAccess]'
})
export class AccessDirective implements OnInit {

  @Input() ngxAccess: string | Array<string>;
  @Input() ngxAccessElse: TemplateRef<any>;

  constructor(@Optional() private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService,
    @Optional() @SkipSelf() @Host() private parentAccessPath: AccessDirective) {
  }

  ngOnInit() {
    if (this.template) {
      let ngxAccess = this.ngxAccess;
      if (this.parentAccessPath) {
        const { path, action } = parse(this.parentAccessPath.ngxAccess);
        if (this.ngxAccess) {
          if (Array.isArray(this.ngxAccess)) {
            ngxAccess = `${this.ngxAccess.map(access => access.replace('$', path))}:${action}`;
          } else {
            const { path: childPath, action: childAction } = parse(ngxAccess);
            ngxAccess = `${childPath.replace('$', path)}:${childAction ? childAction : action}`;
          }
        } else {
          ngxAccess = `${path}:${action}`;
        }
      }
      this.accessService.can(ngxAccess)
        .subscribe(
          access => access
            ? this.viewContainer.createEmbeddedView(this.template)
            : this.ngxAccessElse
              ? this.viewContainer.createEmbeddedView(this.ngxAccessElse)
              : null
        );
    }
  }
}
