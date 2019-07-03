import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { flatten } from './flatten';

describe('Flatten Library', () => {
  describe('should evaluate access configuration reactively', () => {

    function nextTick(cb) {
      // setTimeout(cb);
      Promise.resolve()
        .then(cb)
    }

    const evaluateExpression = flatChildren => (key: string): Observable<boolean> => {
      const node = flatChildren[key];
      if (node.hasOwnProperty('input$')) {
        nextTick(_ => node.input$.next());
        return node.output$;
      }
      else {
        return node;
      }
    }

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
      // console.log('Leaf Evaluator: ', access)
      let input$;
      const output$ = new Subject<boolean>();

      function waitInput(access) {
        input$ = new Subject<string>();
        input$
          .pipe(
            // tap(_access => console.log (_access, _access ? 'Do not notify parent' : 'Notify parent' )),
            switchMap(_access => canAccess(_access || access))
          )
          .subscribe(hasAccess => {
            output$.next(hasAccess);
          });
      }
      waitInput(access);

      return {
        update: (access) => {
          // input$.complete();
          // waitInput(access);
          input$.next(access)
        },
        input$,
        output$: output$.asObservable()
      }
    }

    const flattened = flatten({
      Main: {
        UserForm: {
          FirstName: {
            Read: 'CanReadFirstName',
            Write: 'CanWriteFirstName'
          },
          Login: {
            Read: 'CanReadLogin',
          }
        },
        ClassForm: {
          Level: {
            Read: 'CanReadLevel',
          }
        }
      },
      Home: {
        Notifications: {
          Read: 'CanReadNotifications'
        }
      },
      Profile: {
        Read: 'CanReadProfile'
      },
      Export: 'CanExport'
    }, node$, leaf$);

    const evaluate = evaluateExpression(flattened);

    const canAccess = (access: string) => {
      const userAccesses = ['CanWriteFirstName', 'CanReadAll'];
      const evaluation = userAccesses.some(_access => _access === access);
      return of(evaluation).pipe(
        tap(v => console.log(access + ' evaluated to ' + v))
      );
    }

    function test(key, expected) {
      return (done) => {
        evaluate(key).subscribe(value => {
          expect(value).toBe(expected);
          done();
        })
      }
    }

    it('Main.UserForm.FirstName:Write', test('Main.UserForm.FirstName:Write', true));
    it('Main.UserForm:Write', test('Main.UserForm:Write', true));
    it('Main:Write', test('Main:Write', true));
    it('Main:Read', test('Main:Read', false));

    it('Update to successfull access', (done) => {
      evaluate('Main.UserForm:Read').subscribe(value => {
        console.log('Access evaluation Main.UserForm:Read ' + value);
      })
      evaluate('Main.UserForm.FirstName:Read').subscribe(value => {
        console.log('Access evaluation Main.UserForm.FirstName:Read ' + value);
      })
      setTimeout(done);
    })

  });

});