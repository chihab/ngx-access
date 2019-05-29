import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { ExpressionComponent } from './components/expression/expression.component';
import { ACCESS_CONFIG, ACCESS_EXPRESSION_COMPONENT } from './config';
import { AccessConfigurationDirective } from './directives/access-configuration.directive';
import { AccessExpressionDirective } from './directives/access-expression.directive';
import { AccessDirective } from './directives/access.directive';
import { AccessStrategy, FakeAccessStrategy } from './services/access-strategy.service';

export interface AccessModuleConfig {
  accesses?: any;
  redirect?: string;
  strategy?: Provider;
  reactive?: boolean;
  expressionComponent?: Type<ExpressionComponent>
}

@NgModule({
  imports: [NoopAnimationsModule, SatPopoverModule],
  declarations: [AccessDirective, AccessExpressionDirective, AccessConfigurationDirective, ExpressionComponent],
  exports: [AccessDirective, AccessExpressionDirective, AccessConfigurationDirective, ExpressionComponent],
  entryComponents: [ExpressionComponent]
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
        {
          provide: ACCESS_EXPRESSION_COMPONENT,
          useValue: config.expressionComponent
        },
        config.strategy || {
          provide: AccessStrategy,
          useClass: FakeAccessStrategy
        }
      ]
    };
  }
}