import { InjectionToken } from '@angular/core';
import { AccessConfiguration } from './helpers';

export const ACCESS_CONFIG = new InjectionToken<AccessServiceConfig>(
  'ACCESS_CONFIG'
);

export interface AccessServiceConfig {
  access?: AccessConfiguration;
  redirectTo?: string;
}
