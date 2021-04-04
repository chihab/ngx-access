import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccessServiceConfig, ACCESS_CONFIG } from './config';
import { AccessDirective } from './directives/access.directive';
import { AccessGuard } from './services/access.guard';
import { AccessService } from './services/access.service';

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
        AccessService,
        AccessGuard,
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
