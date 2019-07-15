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
  constructor(public expression: string, public key) {
    this.output$ = this.output.asObservable();
    this.input$
      .pipe(
        switchMap(_ => canAccessExpression(this.expression))
      )
      .subscribe(hasAccess => {
        console.log('Emitting from ' + this.key);
        this.output.next(hasAccess);
      });
  }
  update(access: string/*, add = false*/) {
    this.expression = access;
    // if (add) {
    //   this.parent.add(this.expression);
    // }
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
  private subsciption = new Subscription();
  private output: Subject<boolean> = new Subject<boolean>();
  output$: Observable<boolean> = new Subject();
  input$: Subject<any> = new Subject<any>();
  constructor(private children: any[], public key) {
    this.output$ = this.output.asObservable();
    setTimeout(() => {
      this.evaluate();
    })
  }
  evaluate() {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
    // TODO: Refactor this
    console.log(this.children);
    const children$ = this.children.map(
      child => of(child)
        .pipe(
          mergeMap(child => evaluate(child))
        ),
    );
    this.subsciption = combineLatest(...children$)
      .pipe(
        map((evaluates: boolean[]) => evaluates.some(_evaluate => _evaluate))
      )
      .subscribe(hasAccess => {
        console.log('Emitting from ' + this.key);
        this.output.next(hasAccess);
      });
  }
  add(node) {
    // add child
    console.log('Pushing child!');
    this.children.push(node);
    this.evaluate();
  }
  remove() {
    // remove child
    this.evaluate();
  }
}

const evaluateExpression = flattened => (key: string): Observable<boolean> => {
  console.log('evaluateExpression: ' + key);
  function nextTick(cb) {
    // setTimeout(cb);
    Promise.resolve()
      .then(cb)
  }
  const node = flattened && flattened[key];
  if (!node) {
    console.error('Unnown key: ' + key);
    console.error(flattened);
    return of(false);
  }
  if (node instanceof Leaf) {
    nextTick(_ => node.input$.next());
  }
  console.log(node);
  return node.output$;
}

export function setAccessConfiguration(_accessConfiguration) {

  const node$ = (children, key) => {
    return new Node(children, key);
  }

  const leaf$ = (access: string, key) => {
    return new Leaf(access, key);
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
    const [accessPath, groupBy] = accessKey.split(':');
    const path = accessPath.split('.').slice(0, -1);
    const parentKey = path ? [path, groupBy].join(':') : groupBy;
    flattened[accessKey] = new Leaf(accessExpression, accessKey);
    if (flattened[parentKey])
      flattened[parentKey].add(accessKey);
    else
      flattened[parentKey] = new Node([accessKey], parentKey);
  }
  flattened[accessKey].update(accessExpression);

  const [accessPath, groupBy] = accessKey.split(':');
  const obj = accessPath.split('.').reduce((obj, key) => {
    if (!obj[key]) {
      obj[key] = {};
    }
    return obj[key];
  }, accessConfiguration);
  obj[groupBy] = accessExpression;
}

export function canAccessExpression(accessExpression: string) {
  return reactive
    ? reactiveNodeEvaluator(parser(accessExpression), hasAccessStrategy)
    : nodeEvaluator(parser(accessExpression), hasAccessStrategy);
}

export function canAccessConfiguration(accessPath: string): Observable<boolean> {
  console.log('canAccessConfiguration: ' + accessPath);
  return evaluate(accessPath)
    .pipe(
      tap(() => console.log('Evaluating ' + accessPath)),
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

