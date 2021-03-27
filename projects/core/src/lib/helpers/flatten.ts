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
    accesses: { action: string; prop: string }[],
    prop: string,
    value: AccessConfigurationItem | AccessConfigurationItem[],
    path: string
  ): { action: string; prop: string }[] {
    if (Array.isArray(value)) {
      value.forEach((access: AccessConfigurationItem) => {
        visitor(accesses, prop, access, path);
      });
    } else if (typeof value === 'object') {
      const childrenAccesses = children(value, getPath(path, '.', prop));
      if (group) {
        accesses = accesses.concat(childrenAccesses);
        accesses.forEach((access) => {
          setConfig(getPath(path, ':', access.prop), access.action);
        });
      }
    } else {
      const expression = parse(value.replace(/\s/g, ''));
      setConfig(getPath(path, ':', prop), expression);
      accesses = accesses.concat({ action: expression, prop });
    }
    return accesses;
  }

  function children(
    obj: AccessConfiguration,
    path = ''
  ): { action: string; prop: string }[] {
    return Object.keys(obj).reduce(
      (accesses: { action: string; prop: string }[], prop) =>
        visitor(accesses, prop, obj[prop], path),
      []
    );
  }

  children(config);
  return flatConfig;
}
