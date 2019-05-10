import { ACCESS_CONFIG } from './config';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { HasAccessDirective } from './directives/has-access.directive';
import { AccessStrategy, FakeAccessStrategy } from './services/access-strategy.service';

export interface CoreModuleConfig {
  accesses?: any;
  redirect?: string;
  strategy?: Provider;
}

@NgModule({
  declarations: [HasAccessDirective],
  exports: [HasAccessDirective]
})
export class CoreModule {
  static forRoot(config: CoreModuleConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        {
          provide: ACCESS_CONFIG,
          useValue: {
            accesses: config.accesses || {},
            redirect: config.redirect || '/unauthorized',
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
