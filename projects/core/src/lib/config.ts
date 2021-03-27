import { InjectionToken } from '@angular/core';
import { AccessModuleConfig } from '../public-api';

export const ACCESS_CONFIG = new InjectionToken<AccessModuleConfig>(
  'ACCESS_CONFIG'
);
