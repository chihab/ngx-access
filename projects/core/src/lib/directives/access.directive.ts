import {
  Directive,
  Host,
  Input,
  OnInit,
  Optional,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { parse } from '../helpers/access-helpers';
import { AccessService } from '../services/access.service';

@Directive({
  selector: '[ngxAccess]',
})
export class AccessDirective implements OnInit {
  @Input() ngxAccess: string | Array<string> = '';
  @Input() ngxAccessElse?: TemplateRef<any>;
  onDestroy$ = new Subject<void>();

  constructor(
    @Optional() private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService,
    @Optional()
    @SkipSelf()
    @Host()
    private parentAccessDirective: AccessDirective
  ) {}

  ngOnInit() {
    if (this.template) {
      let ngxAccess = this.ngxAccess;
      if (this.parentAccessDirective) {
        const { path, action } = parse(this.parentAccessDirective.ngxAccess);
        if (this.ngxAccess) {
          if (Array.isArray(this.ngxAccess)) {
            ngxAccess = `${this.ngxAccess.map((access) =>
              access.replace('$', path)
            )}:${action}`;
          } else {
            const { path: childPath, action: childAction } = parse(ngxAccess);
            ngxAccess = `${childPath.replace('$', path)}:${
              childAction ? childAction : action
            }`;
          }
        } else {
          ngxAccess = `${path}:${action}`;
        }
      }
      this.accessService
        .can(ngxAccess)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((access) =>
          access
            ? this.viewContainer.createEmbeddedView(this.template)
            : this.ngxAccessElse
            ? this.viewContainer.createEmbeddedView(this.ngxAccessElse)
            : null
        );
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
