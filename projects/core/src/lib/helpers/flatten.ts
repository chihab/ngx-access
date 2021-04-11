import {
  AccessConfiguration,
  AccessConfigurationItem,
} from './access-configuration';

export type AccessFlatConfiguration = {
  [key: string]: Set<AccessConfigurationItem>;
};

export function flatten(
  config: AccessConfiguration,
  { parse = (v: any) => v, group = false } = {}
) {
  const flatConfig: AccessFlatConfiguration = {};

  function setConfig(path: string, value: AccessConfigurationItem) {
    if (!flatConfig[path]) {
      flatConfig[path] = new Set();
    }
    flatConfig[path].add(value);
  }

  function getPath(path: string, delimiter: string, prop: string) {
    return path ? path + delimiter + prop : prop;
  }

  function visitor(
    access: { action: string; prop: string }[],
    prop: string,
    value: AccessConfigurationItem | AccessConfigurationItem[],
    path: string
  ): { action: string; prop: string }[] {
    if (Array.isArray(value)) {
      value.forEach((_access: AccessConfigurationItem) => {
        visitor(access, prop, _access, path);
      });
    } else if (typeof value === 'object') {
      const childrenAccess = children(value, getPath(path, '.', prop));
      if (group) {
        access = access.concat(childrenAccess);
        access.forEach((access) => {
          setConfig(getPath(path, '.', access.prop), access.action);
        });
      }
    } else {
      const expression = parse(value.replace(/\s/g, ''));
      setConfig(getPath(path, '.', prop), expression);
      access = access.concat({ action: expression, prop });
    }
    return access;
  }

  function children(
    obj: AccessConfiguration,
    path = ''
  ): { action: string; prop: string }[] {
    return Object.keys(obj).reduce(
      (access: { action: string; prop: string }[], prop) =>
        visitor(access, prop, obj[prop], path),
      []
    );
  }

  children(config);
  return flatConfig;
}
