import { ACCESS_CONFIG } from './lib/config';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { AccessStrategy, FakeAccessStrategy } from './lib/services';
import { HasAccessDirective } from './lib/directives';

export * from './lib/directives';
export * from './lib/helpers';
export * from './lib/services';
export * from './lib/config';

export interface AccessModuleConfig {
  accesses?: any;
  redirect?: string;
  strategy?: Provider;
}

@NgModule({
  declarations: [HasAccessDirective],
  exports: [HasAccessDirective]
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
