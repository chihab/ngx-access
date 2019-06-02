import { from, Observable, of, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { flatten } from './flatten';
import { operator } from './operator.rx';
import { ExpNode, parser, TokenType } from './parser';

export type HasAccessStrategy = (accessName: string) => Observable<boolean>;

let accessConfiguration = {};
let hasAccessStrategy: HasAccessStrategy = () => of(false);
let reactive = false;

export function setAccessConfiguration(_accessConfiguration, config = {}) {
  accessConfiguration = flatten(_accessConfiguration, { parse: parser, group: true, ...config });
  console.log(accessConfiguration);
}

export function setHasAccessStrategy(_hasAccessStrategy: HasAccessStrategy, _reactive = false) {
  hasAccessStrategy = _hasAccessStrategy;
  reactive = _reactive;
}

export function getAccessConfiguration() {
  return accessConfiguration;
}

export function parse(expression) {
  const arr = expression.replace(/\s/g, '').split(':');
  return {
    path: (arr[0] || ''),
    action: (arr[1] || '')
  };
}

export function getAccessExpression(accessKey: string) {
  return accessConfiguration[accessKey];
}

export function setAccessExpression(accessKey: string, accessExpression: string) {
  accessConfiguration[accessKey] = accessExpression;
}


export function canAccessExpression(accessExpression: string) {
  return reactive
    ? reactiveNodeEvaluator(parser(accessExpression), hasAccessStrategy)
    : nodeEvaluator(parser(accessExpression), hasAccessStrategy);
}

export function canAccessConfiguration(accessConfiguration: string | Array<string>): Observable<boolean> {
  try {
    const evaluatedExpressions = (Array.isArray(accessConfiguration)
      ? accessConfiguration
      : [accessConfiguration])
      .reduce((acc, ap) => {
        return acc.concat(Array.from(accessConfiguration[ap]))
      }, [])
    return reactive
      ? reactiveNodeEvaluator(ExpNode.CreateTree(evaluatedExpressions, TokenType.BINARY_OR), hasAccessStrategy)
      : from(evaluatedExpressions)
        .pipe(
          operator(ee => nodeEvaluator(ee, hasAccessStrategy), TokenType.BINARY_OR)
        );
  } catch (e) {
    console.error(e);
    return of(false);
  }
}

function reactiveNodeEvaluator(tree, literalEvaluator): Observable<boolean> {
  if (tree.isLeaf()) {
    return literalEvaluator(tree.getLiteralValue())
  }

  if (tree.op === TokenType.OP_NOT) {
    return reactiveNodeEvaluator(tree.left, literalEvaluator)
      .pipe(
        map(value => !value)
      )
  }

  if (tree.op === TokenType.BINARY_OR) {
    return zip(
      reactiveNodeEvaluator(tree.left, literalEvaluator),
      reactiveNodeEvaluator(tree.right, literalEvaluator),
      (left, right) => left || right)
  }

  if (tree.op === TokenType.BINARY_AND) {
    return zip(
      reactiveNodeEvaluator(tree.left, literalEvaluator),
      reactiveNodeEvaluator(tree.right, literalEvaluator),
      (left, right) => left && right)
  }
};

function nodeEvaluator(tree, literalEvaluator): Observable<boolean> {
  if (tree.isLeaf()) {
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

