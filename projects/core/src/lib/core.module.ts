import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccessServiceConfig, ACCESS_CONFIG } from './config';
import { AccessDirective } from './directives/access.directive';

@NgModule({
  declarations: [AccessDirective],
  exports: [AccessDirective],
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
            access: config.access || {},
            redirectTo: config.redirectTo || '/unauthorized',
          },
        },
      ],
    };
  }
}
