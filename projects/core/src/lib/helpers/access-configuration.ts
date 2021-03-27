export type AccessConfiguration = {
  [key: string]: AccessConfigurationItem | AccessConfigurationItem[];
};

export type AccessConfigurationItem =
  | string
  | string[]
  | AccessConfiguration
  | AccessConfiguration[];
