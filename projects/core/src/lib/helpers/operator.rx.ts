import { Observable, Observer, OperatorFunction, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import TokenType, { TokenItem } from './parser/token-type';

type Operator = OperatorFunction<any, boolean>;

type OperatorFactory = (
  evaluator$: (tree: any) => Observable<boolean>,
  op: TokenItem
) => Operator;

export const operator: OperatorFactory = (evaluator$, op) => (source) => {
  return new Observable((observer: Observer<boolean>) => {
    const finish$ = new Subject<boolean>();
    let lastEval: boolean;
    finish$.pipe(take(1)).subscribe(
      (value: boolean) => {
        observer.next(value);
        observer.complete();
      },
      (e) => observer.error(e)
    );

    source.pipe(switchMap(evaluator$), takeUntil(finish$)).subscribe(
      (value: boolean) => {
        lastEval = op === TokenType.OP_NOT ? !value : value;
        if (op === TokenType.BINARY_AND && !lastEval) {
          finish$.next(false);
        } else if (op === TokenType.BINARY_OR && lastEval) {
          finish$.next(true);
        }
      },
      (e: any) => {
        finish$.error(e);
      },
      () => {
        finish$.next(lastEval);
      }
    );
  });
};
