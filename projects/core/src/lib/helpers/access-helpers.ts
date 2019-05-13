import { from, Observable, of } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

export type HasAccessStrategy = (accessName: string) => Observable<boolean>;

interface Access {
  operator: Operator;
  list: Array<string>;
}

type AccessType = string | Access;

enum Operator {
  AND = 'AND',
  OR = 'OR'
}

const PATH_SEPARATOR = '.';

let configurationAccess = {};
let hasAccessStrategy: HasAccessStrategy;

const v = {
  View: {
    Resource1: {
      Read: 'ReadResource1Access'
    },
    Resource2: {
      Read: 'ReadResource2Access',
      Update: 'UpdateResource2Access',
      Logic: '(Access1 OR Access2) OR (Access3 AND Access4)) AND Access6)'
    }
  }
};

const r = {
  'View.Read': ['ReadResource1Access', 'ReadResource2Access'],
  'View.Update': ['UpdateResource2Access'],
  'View.Logic': {
    __type__: 'expression',
    value: [
      ['Access1', 'Access2'],
      { operator: 'OR', list: ['Access3', 'Access4'] },
      'Access5'
    ]
  },
  'View.Resource1.Read': ['ReadResource1Access'],
  'View.Resource2.Read': ['ReadResource2Access'],
  'View.Resource2.Update': ['UpdateResource2Access'],
  'View.Resource2.Logic': ['UpdateResource2Access']
};

export function setConfigurationAccess(config) {
  configurationAccess = config;
  const newConfig = {};

  function getPath(path, prop) {
    return path
      ? path + '.' + prop
      : prop;
  }

  function children(obj, path) {
    let accesses = [];
    function visitor(prop, value) {
      if (typeof value === 'string') {
        const pathKey = getPath(path, prop);
        if (!newConfig[pathKey]) {
          newConfig[pathKey] = new Set();
        }
        newConfig[pathKey].add(value);
        accesses = accesses.concat({ action: value, prop });
      } else if (Array.isArray(value)) {
        value.forEach(access => {
          visitor(prop, access);
        });
      } else {
        const childrenAccesss = children(value, getPath(path, prop));
        accesses = accesses.concat(childrenAccesss);
        accesses.forEach(access => {
          const pathKey = getPath(path, access.prop);
          if (!newConfig[pathKey]) {
            newConfig[pathKey] = new Set();
          }
          newConfig[pathKey].add(access.action);
        });
      }
    }
    Object.keys(obj)
      .forEach((prop) => {
        visitor(prop, obj[prop]);
      });
    return accesses;
  }
  children(configurationAccess, '');
  configurationAccess = newConfig;
  console.log(configurationAccess);
}

export function setHasAccessStrategy(accessTest: HasAccessStrategy) {
  hasAccessStrategy = accessTest;
}

export function can(path: string): Observable<boolean> {
  console.log(path);
  try {
    // const pathObject = getPathObject(path);
    // const access = group
    //   ? mergeChildrenActions(pathObject, action)
    //   : pathObject[action];
    const access = configurationAccess[path];
    console.log(path, access);
    if (!!access) {
      console.log(access);
      return testAccess(Array.from(access));
    }
    console.error(`Undefined ${path}`);
    return of(false);
  } catch (e) {
    console.error(e);
    return of(false);
  }
}

export function canExpression(accessExpression: string | Array<string>, group = false): Observable<boolean> {
  const access = Array.isArray(accessExpression)
    ? accessExpression
    : [accessExpression];
  return from(access)
    .pipe(
      // map(a => {
      //   const arr = a.split(PATH_SEPARATOR);
      //   const action = arr.pop();
      //   return { path: arr.join('.'), action };
      // }),
      mergeMap(a => can(a)),
      reduce((acc, value) => acc || value, false)
    );
}

function getPathObject(path: string) {
  return path.split(PATH_SEPARATOR)
    .reduce(({ currentPath, object }, prop) => {
      if (prop in object) {
        return { currentPath: `${currentPath}${prop}.`, object: object[prop] };
      }
      throw new Error(`${prop} is not defined inside ${currentPath} in your access configuration`);
    }, { currentPath: 'ROOT', object: configurationAccess })
    .object;
}

function mergeChildrenActions(path, action) {
  return Object.values(path)
    .filter(item => action in item)
    .map(item => item[action])
    .reduce((all, one) => [...all, one], []);
}

function testAccessReducer(
  access: Array<AccessType>,
  op: Operator,
  predicate: (a: boolean, v: boolean) => boolean,
  init: boolean
) {
  return from(access as Array<AccessType>)
    .pipe(
      mergeMap(currentAccess => testAccess(currentAccess, op)),
      reduce(predicate, init)
    );
}

function testAccess(access: AccessType | Array<AccessType>, op = Operator.OR): Observable<boolean> {
  return Array.isArray(access)
    ? (op === Operator.AND)
      ? testAccessReducer(access, op, (acc, value) => acc && value, true)
      : testAccessReducer(access, op, (acc, value) => acc || value, false)
    : typeof access === 'string'
      ? hasAccessStrategy(access)
      : testAccess(access.list, access.operator);
}
