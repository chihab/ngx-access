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
import { Observable, Subject } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  map,
  startWith,
  takeUntil,
} from 'rxjs/operators';
import { Scan, scanStream } from '../helpers/fromX.rx';
import { AccessService } from '../services/access.service';

@Directive({
  selector: '[ngxAccess]',
})
export class AccessDirective implements OnInit {
  @Input() ngxAccess: string = '';
  @Input() ngxAccessElse?: TemplateRef<any>;
  onDestroy$ = new Subject<void>();

  private _access$: Subject<boolean> = new Subject();
  private access$: Observable<boolean> = this._access$.asObservable();
  private children$?: Scan<boolean>;

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
      if (this.ngxAccess) {
        let ngxAccess = this.ngxAccess;
        // if (
        //   this.parentAccessDirective &&
        //   this.parentAccessDirective.ngxAccess
        // ) {
        //   const { path, action } = parse(this.parentAccessDirective.ngxAccess);
        //   if (ngxAccess) {
        //     if (Array.isArray(this.ngxAccess)) {
        //       ngxAccess = `${this.ngxAccess.map(
        //         (access) => path + access
        //       )}:${action}`;
        //     } else {
        //       const { path: childPath, action: childAction } = parse(ngxAccess);
        //       ngxAccess = `${path}${childPath}:${
        //         childAction ? childAction : action
        //       }`;
        //     }
        //   } else {
        //     ngxAccess = `${path}:${action}`;
        //   }
        // }
        this.check(ngxAccess);
      } else {
        this.children$ = scanStream<boolean>(true);
        this.children$.values
          .pipe(
            takeUntil(this.onDestroy$),
            map((values: boolean[]) => {
              return values.reduce((acc: boolean, val: boolean) => {
                return acc || val;
              }, false);
            }),
            startWith(true),
            distinctUntilChanged()
          )
          .subscribe((access: boolean) => {
            if (access) {
              this.viewContainer.createEmbeddedView(this.template);
            } else {
              this.viewContainer.clear();
            }
          });
      }
    }
  }

  observe(child: Observable<boolean>): void {
    this.children$?.add(child);
  }

  unObserve(child: Observable<boolean>) {
    this.children$?.remove(child);
  }

  check(access: string) {
    this.access$ = this.accessService
      .can(access)
      .pipe(takeUntil(this.onDestroy$));
    if (this.parentAccessDirective) {
      this.parentAccessDirective.observe(
        this.access$.pipe(
          map((access) => access || !!this.ngxAccessElse),
          delay(0)
        )
      );
    }
    this.access$.subscribe((access) => {
      return access
        ? this.viewContainer.createEmbeddedView(this.template)
        : this.ngxAccessElse
        ? this.viewContainer.createEmbeddedView(this.ngxAccessElse)
        : null;
    });
  }

  ngOnDestroy(): void {
    if (this.parentAccessDirective) {
      this.parentAccessDirective.unObserve(this.access$);
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
