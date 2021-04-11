import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Scan<T> {
  values: Observable<T[]>;
  add: (osb$: Observable<T>) => void;
  remove: (osb$: Observable<T>) => void;
}

export function scanStream<T>(initialValue: T): Scan<T> {
  const subject = new Subject<Observable<T>>();
  const obsValues: Map<Observable<T>, T> = new Map();
  const values: Observable<T[]> = subject.pipe(
    map((_) => Array.from(obsValues.values()))
  );
  return {
    values,
    add(obs$: Observable<T>): void {
      obs$.subscribe((value: T) => {
        obsValues.set(obs$, value);
        subject.next();
      });
      obsValues.set(obs$, initialValue);
    },
    remove(obs$: Observable<T>) {
      obsValues.delete(obs$);
      subject.next();
    },
  };
}
