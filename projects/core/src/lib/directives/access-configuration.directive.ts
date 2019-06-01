import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, EmbeddedViewRef, Host, Inject, Injector, Input, OnInit, Optional, SkipSelf, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AccessExpressionEditor } from '../components/access-expression-editor/access-expression-editor.component';
import { AccessConfig, ACCESS_CONFIG } from '../config';
import { AccessService } from '../services/access.service';
import { parse } from '../helpers/access-helpers';

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

  constructor(@Optional() private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    @Optional() @SkipSelf() @Host() private parentAccessDirective: AccessConfigurationDirective,
    @Optional() @Inject(ACCESS_CONFIG) private accessConfig: AccessConfig) {
  }

  ngOnInit() {
    let ngxAccessConf = this.ngxAccessConf;

    if (this.parentAccessDirective) {
      const { path, action } = parse(this.parentAccessDirective.ngxAccessConf);
      if (this.ngxAccessConf) {
        if (Array.isArray(this.ngxAccessConf)) {
          ngxAccessConf = `${this.ngxAccessConf.map(access => access.replace('$', path))}:${action}`;
        } else {
          const { path: childPath, action: childAction } = parse(ngxAccessConf);
          ngxAccessConf = `${childPath.replace('$', path)}:${childAction ? childAction : action}`;
        }
      } else {
        ngxAccessConf = `${path}:${action}`;
      }
    }

    this.expression = this.accessService.getAccessExpression(ngxAccessConf);

    if (this.accessConfig.editor) {
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
    } else {
      this.checkRealAccess();
    }
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
    const expressionComponent = this.accessConfig.editor.component || AccessExpressionEditor;
    let componentFactory: ComponentFactory<AccessExpressionEditor> = this.componentFactoryResolver.resolveComponentFactory(expressionComponent);
    this.expressionRef = this.viewContainer.createComponent<AccessExpressionEditor>(componentFactory, 0, this.injector, [[node]]);
    let instance = <AccessExpressionEditor>this.expressionRef.instance;
    instance.expression = this.expression;
    this.expressionSubscription = instance.onExpression.subscribe((expression) => {
      this.expression = expression;
      this.accessService.setAccessExpression(this.ngxAccessConf, this.expression);
      this.checkAccess(canAccess => instance.canAccess = canAccess);
    });
    this.checkAccess(canAccess => instance.canAccess = canAccess);
  }

  private checkRealAccess() {
    this.checkAccess((canAccess) => {
      if (this.viewRef) {
        this.viewContainer.remove(this.viewContainer.indexOf(this.viewRef));
      }
      if (canAccess) {
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
