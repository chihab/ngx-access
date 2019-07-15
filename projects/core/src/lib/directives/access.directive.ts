import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, EmbeddedViewRef, Host, Inject, Injector, Input, OnInit, Optional, SkipSelf, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, from, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, scan, takeUntil, filter } from 'rxjs/operators';
import { AccessExpressionEditor } from '../components/access-expression-editor/access-expression-editor.component';
import { AccessConfig, ACCESS_CONFIG } from '../config';
import { AccessService } from '../services/access.service';
import { parse } from '../helpers/access-helpers';

@Directive({
  selector: '[ngxAccess]'
})
export class AccessDirective implements OnInit {
  @Input() ngxAccess: string;
  @Input() ngxAccessElse: TemplateRef<any>;

  private ngxAccessPath: string;
  private expression: string;
  // private childern$: Array<{ key: string, child$: Observable<boolean> }> = [];

  private viewRef: EmbeddedViewRef<any>;
  private expressionRef: ComponentRef<any>;
  private expressionSubscription: Subscription;
  private subscription: Subscription;
  private onDestroy$ = new Subject<void>();

  constructor(@Optional() private template: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    @Optional() @SkipSelf() @Host() private parentAccessDirective: AccessDirective,
    @Optional() @Inject(ACCESS_CONFIG) private accessConfig: AccessConfig) {
  }

  ngOnInit() {
    let ngxAccess = this.ngxAccess;
    if (this.parentAccessDirective) {
      const { path, action } = parse(this.parentAccessDirective.ngxAccess);
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
    this.ngxAccessPath = ngxAccess;

    if (this.accessConfig.editor) {
      this.expression = this.accessService.getAccessExpression(ngxAccess);
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
      this.viewContainer.clear();
      this.viewRef = null;
    }
    if (this.expressionRef) {
      this.viewContainer.clear();
      this.expressionRef = null;
    }
    if (this.expressionSubscription) {
      this.expressionSubscription.unsubscribe();
    }
  }

  private createEditorComponent() {
    this.viewRef = this.viewContainer.createEmbeddedView(this.template);
    const [node] = this.viewRef.rootNodes;
    const expressionComponent = this.accessConfig.editor.component || AccessExpressionEditor;
    let componentFactory: ComponentFactory<AccessExpressionEditor> = this.componentFactoryResolver.resolveComponentFactory(expressionComponent);
    this.expressionRef = this.viewContainer.createComponent<AccessExpressionEditor>(componentFactory, 0, this.injector, [[node]]);
    return <AccessExpressionEditor>this.expressionRef.instance;
  }

  private checkDebugAccess() {
    let instance = this.createEditorComponent();
    if (this.expression !== undefined) {
      instance.expression = this.expression;
      if (this.expressionSubscription) {
        this.expressionSubscription.unsubscribe();
      }
      this.expressionSubscription = instance.onExpression
        .pipe(
          filter(accessExpression => !!accessExpression),
          distinctUntilChanged()
        )
        .subscribe((expression) => {
          this.expression = expression;
          this.accessService.setAccessExpression(this.ngxAccess, this.expression);
          this.checkAccess(canAccess => instance.canAccess = canAccess);
        });
    }
    this.checkAccess(canAccess => instance.canAccess = canAccess);
  }

  private checkRealAccess() {
    this.checkAccess((canAccess) => {
      if (this.viewRef) {
        this.viewContainer.clear();
      }
      if (canAccess) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.template);
      } else if (this.ngxAccessElse) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.ngxAccessElse);
      }
    });
  }

  private checkAccess(onExpression: (canAccess: boolean) => void): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    console.log('Waiting for ' + this.ngxAccessPath + ' from directive')
    const checkAccess$: Observable<boolean> = this.expression
      ? this.accessService.canExpression(this.expression)
      : this.accessService.can(this.ngxAccessPath);

    // if (this.parentAccessDirective) {
    //   console.log('Parent access directive!');
    //   this.parentAccessDirective.observeChildren(this.ngxAccess, checkAccess$);
    // }

    this.subscription = checkAccess$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe(onExpression);
  }

  // observeChildren(key: string, child$: Observable<boolean>) {
  //   if (this.subscription) {
  //     this.subscription.unsubscribe(); // Will unsbscribe from all children
  //   }
  //   const child = this.childern$.find(child => child.key === key);
  //   if (child) {
  //     child.child$ = child$;
  //   } else {
  //     this.childern$.push({ key, child$ });
  //   }
  //   this.subscription = from(this.childern$.map(child => child.child$))
  //     .pipe(scan((acc, childAccess) => acc || childAccess))
  //     .subscribe(canAccess => console.log('Can access parent ' + canAccess))
  // }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
