import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Type, Directive, EmbeddedViewRef, Injector, Input, OnInit, TemplateRef, ViewContainerRef, Inject, Optional } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ExpressionComponent } from '../components/expression/expression.component';
import { AccessService } from '../services/access.service';
import { ACCESS_EXPRESSION_COMPONENT } from '../config';


export type Content<T> = string | TemplateRef<T>;

@Directive({
  selector: '[ngxAccessConf]'
})
export class AccessConfigurationDirective implements OnInit {
  @Input() ngxAccessConf: string;
  @Input() ngxAccessConfElse: TemplateRef<any>;
  onDestroy$ = new Subject<void>();

  private expression: string;
  private viewRef: EmbeddedViewRef<any>;
  private expressionRef: ComponentRef<any>;
  private expressionSubscription: Subscription;
  private subscription: Subscription;

  constructor(private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    @Optional() @Inject(ACCESS_EXPRESSION_COMPONENT) private AccessExpressionComponent: Type<ExpressionComponent>) {
  }

  ngOnInit() {
    this.expression = this.accessService.getAccessExpression(this.ngxAccessConf);
    this.accessService.debug()
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe(debug => {
        this.cleanUp();
        if (debug) {
          this.checkDebugAccess();
        } else {
          this.checkRealAccess();
        }
      })
  }

  private cleanUp() {
    if (this.viewRef) {
      this.viewContainer.remove(this.viewContainer.indexOf(this.viewRef));
      this.viewRef = null;
    }
    if (this.expressionRef) {
      this.viewContainer.remove(this.viewContainer.indexOf(this.expressionRef.hostView));
      this.expressionSubscription.unsubscribe();
      this.expressionRef = null;
    }
  }

  private checkDebugAccess() {
    this.viewRef = this.viewContainer.createEmbeddedView(this.template);
    const [node] = this.viewRef.rootNodes;
    const expressionComponent = this.AccessExpressionComponent || ExpressionComponent;
    let componentFactory: ComponentFactory<ExpressionComponent> = this.componentFactoryResolver.resolveComponentFactory(expressionComponent);
    this.expressionRef = this.viewContainer.createComponent<ExpressionComponent>(componentFactory, 0, this.injector, [[node]]);
    let instance = <ExpressionComponent>this.expressionRef.instance;
    instance.expression = this.expression;
    this.expressionSubscription = instance.onExpression.subscribe((expression) => {
      this.expression = expression;
      this.accessService.setAccessExpression(this.ngxAccessConf, this.expression);
      this.checkAccess(access => instance.visible = access);
    });
    this.checkAccess(access => instance.visible = access);
  }

  private checkRealAccess() {
    this.checkAccess((access) => {
      if (this.viewRef) {
        this.viewContainer.remove(this.viewContainer.indexOf(this.viewRef));
      }
      if (access) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.template);
      }
      else if (this.ngxAccessConfElse) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.ngxAccessConfElse);
      }
    });
  }

  private checkAccess(onExpression) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.accessService.canExpression(this.expression)
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe(onExpression);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
