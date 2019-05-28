import { Observable, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import TokenType from './parser/token-type';

export const operator = (evaluator$, op) => (source) => {
  return Observable.create((observer) => {
    const finish$ = new Subject();
    let lastEval;
    finish$
      .pipe(
        take(1)
      )
      .subscribe(
        (value) => {
          observer.next(value)
          observer.complete()
        },
        e => observer.error(e)
      );

    source.
      pipe(
        switchMap(access => evaluator$(access).pipe(take(1))),
        takeUntil(finish$)
      )
      .subscribe(
        value => {
          lastEval = op === TokenType.OP_NOT ? !value : value;
          if (op === TokenType.BINARY_AND && !lastEval) {
            finish$.next(false);
          }
          else if (op === TokenType.BINARY_OR && lastEval) {
            finish$.next(true);
          }
        },
        e => {
          finish$.error(e);
        },
        _ => {
          finish$.next(lastEval);
        })
  });
};