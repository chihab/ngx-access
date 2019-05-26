import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { flatten } from './flatten';
import { operator } from './operator.rx';
import { parser, TokenType } from './parser';


export type HasAccessStrategy = (accessName: string) => Observable<boolean>;

let configurationAccess = {};
let hasAccessStrategy: HasAccessStrategy = () => of(false);

export function setConfigurationAccess(config) {
  configurationAccess = flatten(config, { parse: parser, group: true });
}

export function setHasAccessStrategy(accessTest: HasAccessStrategy) {
  hasAccessStrategy = accessTest;
}

export function parse(expression) {
  const arr = expression.replace(/\s/g, '').split(':');
  return {
    path: (arr[0] || ''),
    action: (arr[1] || '')
  };
}

export function canAccessExpression(accessExpression: string) {
  return of(accessExpression)
    .pipe(
      map(ae => ae.replace(/\s/g, '')),
      switchMap(ae => nodeEvaluator(parser(ae), hasAccessStrategy)),
    );
}


export function canAccessPaths(accessPath: string | Array<string>): Observable<boolean> {
  const access = Array.isArray(accessPath)
    ? accessPath
    : [accessPath];
  return from(access)
    .pipe(
      map(ap => ap.replace(/\s/g, '')),
      operator(ap => canAccessPath(ap), TokenType.BINARY_OR)
    );
}

function canAccessPath(path: string): Observable<boolean> {
  try {
    const access = configurationAccess[path];
    if (!!access) {
      return from(access)
        .pipe(
          operator(tree => nodeEvaluator(tree, hasAccessStrategy), TokenType.BINARY_OR)
        )
    }
    console.error(`Undefined path ${path}`);
    return of(false);
  } catch (e) {
    console.error(e);
    return of(false);
  }
}

function nodeEvaluator(tree, literalEvaluator): Observable<boolean> {
  if (tree.isLeaf()) {
    console.log('Evaluating with ' + tree.getLiteralValue());
    return literalEvaluator(tree.getLiteralValue());
  }

  if (tree.op === TokenType.OP_NOT) {
    return of(tree.left)
      .pipe(
        operator(tree => nodeEvaluator(tree, literalEvaluator), TokenType.OP_NOT)
      )
  }

  if (tree.op === TokenType.BINARY_OR) {
    return from([tree.left, tree.right])
      .pipe(
        operator(tree => nodeEvaluator(tree, literalEvaluator), TokenType.BINARY_OR)
      )
  }

  if (tree.op === TokenType.BINARY_AND) {
    return from([tree.left, tree.right])
      .pipe(
        operator(tree => nodeEvaluator(tree, literalEvaluator), TokenType.BINARY_AND)
      )
  }
};

