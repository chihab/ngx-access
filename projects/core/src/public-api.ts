import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { ACCESS_CONFIG } from './lib/config';
import { AccessStrategy, FakeAccessStrategy } from './lib/services/access-strategy.service';
import { AccessDirective } from './lib/directives/access.directive';
import { AccessExpressionDirective } from './lib/directives/access-expression.directive';

export * from './lib/directives';
export * from './lib/helpers';
export * from './lib/services';
export * from './lib/config';

export interface AccessModuleConfig {
  accesses?: any;
  redirect?: string;
  strategy?: Provider;
  reactive?: boolean;
}

@NgModule({
  declarations: [AccessDirective, AccessExpressionDirective],
  exports: [AccessDirective, AccessExpressionDirective]
})
export class AccessModule {
  static forRoot(config: AccessModuleConfig): ModuleWithProviders {
    return {
      ngModule: AccessModule,
      providers: [
        {
          provide: ACCESS_CONFIG,
          useValue: {
            accesses: config.accesses || {},
            redirect: config.redirect || '/unauthorized',
            reactive: !!config.reactive
          }
        },
        config.strategy || {
          provide: AccessStrategy,
          useClass: FakeAccessStrategy
        }
      ]
    };
  }
}
