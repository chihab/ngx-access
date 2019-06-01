import { InjectionToken, Type, Provider } from '@angular/core';
import { AccessExpressionEditor } from './components/access-expression-editor/access-expression-editor.component';

export const ACCESS_CONFIG = new InjectionToken<string>('ACCESS_CONFIG');

export interface AccessConfig {
  accesses?: any;
  redirect?: string;
  strategy?: Provider;
  reactive?: boolean;
  editor?: {
    component?: Type<AccessExpressionEditor>
  }
}
