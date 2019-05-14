import { from, Observable, of } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';
import { flatten } from './flatten';

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

let configurationAccess = {};
let hasAccessStrategy: HasAccessStrategy = () => of(false);

export function setConfigurationAccess(config) {
  function parse(expression: string) {
    return {
      list: expression.split(' && '),
      operator: Operator.AND
    };
  }
  configurationAccess = flatten(config, { parse, group: true });
}

export function setHasAccessStrategy(accessTest: HasAccessStrategy) {
  hasAccessStrategy = accessTest;
}

export function canExpression(accessExpression: string | Array<string>): Observable<boolean> {
  const access = Array.isArray(accessExpression)
    ? accessExpression
    : [accessExpression];
  return from(access)
    .pipe(
      mergeMap(a => can(a)),
      reduce((acc, value) => acc || value, false)
    );
}

function can(path: string): Observable<boolean> {
  try {
    const access = configurationAccess[path];
    if (!!access) {
      return testAccess(Array.from(access));
    }
    console.error(`Undefined ${path}`);
    return of(false);
  } catch (e) {
    console.error(e);
    return of(false);
  }
}

function testAccessReducer(
  access: Array<AccessType>,
  op: Operator,
  predicate: (a: boolean, v: boolean) => boolean,
  init: boolean
): Observable<boolean> {
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
