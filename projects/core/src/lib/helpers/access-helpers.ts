export type AccessName = string;

export type HasAccessStrategy = (accessName: AccessName) => boolean;

interface Access {
  operator: Operator;
  list: Array<AccessName>;
}

enum Operator {
  AND = 'AND',
  OR = 'OR'
}

const DEFAULT_ACTION = 'read';
const PATH_SEPARATOR = '.';
const ACCESS_SEPARATOR = ':';

let configurationAccess = null;
let hasAccessStrategy: HasAccessStrategy;

export function can(path: string, action: string, group = false): boolean {
  try {
    const pathObject = getPathObject(path);
    const access = group
      ? mergeChildrenActions(pathObject, action)
      : pathObject[action];
    return access && testAccess(access);
  } catch (e) {
    return false;
  }
}

export function canExpression(accessExpression: string | Array<string>, group = false): boolean {
  const access = Array.isArray(accessExpression)
    ? accessExpression
    : [accessExpression];
  return access
    .map(a => a.split(ACCESS_SEPARATOR))
    .some(a => can(a[0], a[1] || DEFAULT_ACTION, group));
}

export function setConfigurationAccess(config) {
  configurationAccess = config;
}

export function setHasAccessStrategy(accessTest: HasAccessStrategy) {
  hasAccessStrategy = accessTest;
}

function getPathObject(path: string) {
  return path.split(PATH_SEPARATOR)
    .reduce((o, i) => {
      if (i in o) {
        return o[i];
      }
      throw new Error(`${i} undefined inside ${path}`);
    }, configurationAccess);
}

function mergeChildrenActions(path, action) {
  return Object.values(path)
    .filter(item => action in item)
    .map(item => item[action])
    .reduce((all, one) => [...all, one], []);
}

function testAccess(access: AccessName | Access | Array<AccessName> | Array<Access>, op = Operator.OR): boolean {
  return Array.isArray(access)
    ? (op === Operator.AND)
      ? (access as Array<AccessName | Access>).every(
        (currentAccess: Access | AccessName) => testAccess(currentAccess, op)
      )
      : (access as Array<AccessName | Access>).some(
        (currentAccess: Access | AccessName) => testAccess(currentAccess, op),
      )
    : typeof access === 'string'
      ? hasAccessStrategy(access)
      : testAccess(access.list, access.operator);
}
