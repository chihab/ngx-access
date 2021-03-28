import { InjectionToken, Provider } from '@angular/core';
import { AccessConfiguration } from './helpers';

export const ACCESS_CONFIG = new InjectionToken<AccessServiceConfig>(
  'ACCESS_CONFIG'
);

export interface AccessServiceConfig {
  accesses?: AccessConfiguration;
  redirect?: string;
  strategy?: Provider;
}
