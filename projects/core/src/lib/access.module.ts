import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { AccessExpressionEditor } from './components/access-expression-editor/access-expression-editor.component';
import { AccessConfig, ACCESS_CONFIG } from './config';
import { AccessExpressionDirective } from './directives/access-expression.directive';
import { AccessDirective } from './directives/access.directive';
import { AccessStrategy, FakeAccessStrategy } from './services/access-strategy.service';

@NgModule({
  imports: [NoopAnimationsModule, SatPopoverModule],
  declarations: [AccessDirective, AccessExpressionDirective, AccessExpressionEditor],
  exports: [AccessDirective, AccessExpressionDirective, AccessExpressionEditor],
  entryComponents: [AccessExpressionEditor]
})
export class AccessModule {
  static forRoot(config: AccessConfig): ModuleWithProviders {
    const accessConfig: AccessConfig = {
      accesses: config.accesses || {},
      reactive: config.reactive || !!config.editor,
      redirect: config.redirect,
      editor: config.editor
    }
    return {
      ngModule: AccessModule,
      providers: [
        {
          provide: ACCESS_CONFIG,
          useValue: accessConfig
        },
        config.strategy || {
          provide: AccessStrategy,
          useClass: FakeAccessStrategy
        }
      ]
    };
  }
}