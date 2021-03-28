import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccessServiceConfig, ACCESS_CONFIG } from './config';
import { AccessExpressionDirective } from './directives/access-expression.directive';
import { AccessDirective } from './directives/access.directive';
import {
  AccessStrategy,
  FakeAccessStrategy,
} from './services/access-strategy.service';

@NgModule({
  declarations: [AccessDirective, AccessExpressionDirective],
  exports: [AccessDirective, AccessExpressionDirective],
})
export class AccessModule {
  static forRoot(
    config: AccessServiceConfig
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
