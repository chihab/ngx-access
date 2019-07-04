import { combineLatest, from, Observable, of, Subject, zip } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { flatten } from './flatten';
import { operator } from './operator.rx';
import { parser, TokenType } from './parser';

export type HasAccessStrategy = (accessName: string) => Observable<boolean>;

let accessConfiguration = {};
let hasAccessStrategy: HasAccessStrategy = () => of(false);
let reactive = false;
let flattened;

const evaluateExpression = flattened => (key: string): Observable<boolean> => {
  function nextTick(cb) {
    // setTimeout(cb);
    Promise.resolve()
      .then(cb)
  }
  console.log('Testing access with key ' + key);
  const node = flattened && flattened[key];
  if (!node)
    return of(false);
  if (node.hasOwnProperty('input$')) {
    nextTick(_ => node.input$.next());
    return node.output$;
  }
  else {
    return node;
  }
}

let evaluate;

export function setAccessConfiguration(_accessConfiguration) {

  const node$ = children => {
    const children$ = children.map(
      child => of(child)
        .pipe(
          mergeMap(node => evaluate(node))
        ),
    );
    const evaluation$ = combineLatest(...children$)
      .pipe(
        map((evaluates: boolean[]) => evaluates.findIndex(_evaluate => _evaluate) !== -1)
      );
    return evaluation$;
  }

  const leaf$ = (access: string) => {
    let input$;
    const output$ = new Subject<boolean>();

    function waitInput(access) {
      input$ = new Subject<string>();
      input$
        .pipe(
          // tap(_access => console.log (_access, _access ? 'Do not notify parent' : 'Notify parent' )),
          switchMap(_access => canAccessExpression(_access || access))
        )
        .subscribe(hasAccess => {
          output$.next(hasAccess);
        });
    }
    waitInput(access);

    return {
      expression: access,
      update: (access) => {
        // input$.complete();
        // waitInput(access);
        input$.next(access)
      },
      input$,
      output$: output$.asObservable()
    }
  }
  flattened = flatten(_accessConfiguration, node$, leaf$);
  evaluate = evaluateExpression(flattened);
  accessConfiguration = _accessConfiguration;
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
  return flattened[accessKey].expression;
}

export function setAccessExpression(accessKey: string, accessExpression: string) {
  flattened[accessKey].update(accessExpression);
}

export function canAccessExpression(accessExpression: string) {
  return reactive
    ? reactiveNodeEvaluator(parser(accessExpression), hasAccessStrategy)
    : nodeEvaluator(parser(accessExpression), hasAccessStrategy);
}

export function canAccessConfiguration(accessPath: string): Observable<boolean> {
  return evaluate(accessPath)
    .pipe(
      catchError(e => of(e))
    )
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

