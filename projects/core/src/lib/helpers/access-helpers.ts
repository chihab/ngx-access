import { combineLatest, from, Observable, of, Subject, zip, Subscription } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { flatten } from './flatten';
import { operator } from './operator.rx';
import { parser, TokenType } from './parser';

export type HasAccessStrategy = (accessName: string) => Observable<boolean>;

let accessConfiguration = {};
let hasAccessStrategy: HasAccessStrategy = () => of(false);
let reactive = false;
let flattened;
let evaluate;

class Leaf {
  private output: Subject<boolean> = new Subject<boolean>();
  input$: Subject<string> = new Subject<string>();
  output$: Observable<boolean>;
  constructor(public expression: string, private parent?) {
    this.output$ = this.output.asObservable();
    this.input$
      .pipe(
        switchMap(_ => canAccessExpression(this.expression))
      )
      .subscribe(hasAccess => {
        this.output.next(hasAccess);
      });
  }
  update(access: string) {
    this.expression = access;
    this.input$.next()
  }
}
/**
 * TODO
 * A node has to be reactive to adding/removing its children 
 * add$: child added => add child to children list
 * remove$: child removed => remove child from children list
 * output$: evaluation of children
 * each node react to its children output$s
 */
class Node {
  // private output: Subject<boolean> = new Subject<boolean>();
  input$: Subject<any> = new Subject<any>();
  output$: Observable<boolean>;
  private subsciption = new Subscription();
  constructor(private children: [], private parent?) {
    // this.output$ = this.output.asObservable();
    this.evaluate();
  }
  evaluate() {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
    const children$ = this.children.map(
      child => of(child)
        .pipe(
          mergeMap(child => evaluate(child))
        ),
    );
    this.output$ = combineLatest(...children$)
      .pipe(
        map((evaluates: boolean[]) => evaluates.some(_evaluate => _evaluate))
      )
      // .subscribe(hasAccess => {
      //   this.output.next(hasAccess);
      // });
  }
  add() {
    // add child
    this.evaluate();
  }
  remove() {
    // remove child
    this.evaluate();
  }
}

const evaluateExpression = flattened => (key: string): Observable<boolean> => {
  function nextTick(cb) {
    // setTimeout(cb);
    Promise.resolve()
      .then(cb)
  }
  const node = flattened && flattened[key];
  if (!node)
    return of(false);
  if (node instanceof Leaf) {
    nextTick(_ => node.input$.next());
  }
  return node.output$;
}

export function setAccessConfiguration(_accessConfiguration) {

  const node$ = children => {
    // const children$ = children.map(
    //   child => of(child)
    //     .pipe(
    //       mergeMap(child => evaluate(child))
    //     ),
    // );
    // const evaluation$ = combineLatest(...children$)
    //   .pipe(
    //     map((evaluates: boolean[]) => evaluates.some(_evaluate => _evaluate))
    //   );
    // return {
    //   output$: evaluation$
    // }
    return new Node(children);
  }

  const leaf$ = (access: string, parent) => {
    return new Leaf(access, parent);
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
  const expression = flattened[accessKey]
    ? flattened[accessKey] instanceof Leaf
      ? flattened[accessKey].expression
      : undefined
    : '';
  return expression;
}

export function setAccessExpression(accessKey: string, accessExpression: string) {
  if (!flattened[accessKey]) {
    flattened[accessKey] = new Leaf(accessExpression);
  } else {
    flattened[accessKey].update(accessExpression);
  }
  const [accessPath, groupBy] = accessKey.split(':');
  const obj = accessPath.split('.').reduce((obj, key) => obj[key], accessConfiguration);
  obj[groupBy] = accessExpression;
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

