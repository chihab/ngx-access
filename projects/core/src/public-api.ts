import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { ACCESS_CONFIG } from './lib/config';
import {
  AccessStrategy,
  FakeAccessStrategy,
} from './lib/services/access-strategy.service';
import { AccessDirective } from './lib/directives/access.directive';
import { AccessExpressionDirective } from './lib/directives/access-expression.directive';
import { AccessConfiguration } from './lib/helpers';

export * from './lib/directives';
export * from './lib/helpers';
export * from './lib/services';
export * from './lib/config';

export interface AccessModuleConfig {
  accesses?: AccessConfiguration;
  redirect?: string;
  strategy?: Provider;
}

@NgModule({
  declarations: [AccessDirective, AccessExpressionDirective],
  exports: [AccessDirective, AccessExpressionDirective],
})
export class AccessModule {
  static forRoot(
    config: AccessModuleConfig
  ): ModuleWithProviders<AccessModule> {
    return {
      ngModule: AccessModule,
      providers: [
        {
          provide: ACCESS_CONFIG,
          useValue: {
            accesses: config.accesses || {},
            redirect: config.redirect || '/unauthorized',
          },
        },
        config.strategy || {
          provide: AccessStrategy,
          useClass: FakeAccessStrategy,
        },
      ],
    };
  }
}
