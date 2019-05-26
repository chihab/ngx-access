import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccessService } from '../services/access.service';

@Directive({
  selector: '[ngxAccessExpr]'
})
export class AccessExpressionDirective implements OnInit {
  @Input() ngxAccessExpr: string;
  @Input() ngxAccessExprElse: TemplateRef<any>;
  onDestroy$ = new Subject<void>();

  constructor(private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService) {
  }

  ngOnInit() {
    if (this.template) {
      this.accessService.canExpression(this.ngxAccessExpr)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(
          access => access
            ? this.viewContainer.createEmbeddedView(this.template)
            : this.ngxAccessExprElse
              ? this.viewContainer.createEmbeddedView(this.ngxAccessExprElse)
              : null
        );
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
