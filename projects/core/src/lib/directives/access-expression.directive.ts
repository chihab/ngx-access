import { Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AccessService } from '../services/access.service';

@Directive({
  selector: '[ngxAccessExpr]'
})
export class AccessExpressionDirective {  
  @Input() ngxAccessExprElse: TemplateRef<any>;
  onDestroy$ = new Subject<void>();

  private viewRef: EmbeddedViewRef<any>;
  private subscription: Subscription;

  constructor(private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService) {
  }

  @Input()
  set ngxAccessExpr(ngxAccessExpr: string) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.accessService.canExpression(ngxAccessExpr)
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe(
        access => {
          if (this.viewRef) {
            this.viewContainer.remove(this.viewContainer.indexOf(this.viewRef));
          }
          this.viewRef = access
            ? this.viewContainer.createEmbeddedView(this.template)
            : this.ngxAccessExprElse
              ? this.viewContainer.createEmbeddedView(this.ngxAccessExprElse)
              : null
        }
      );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
