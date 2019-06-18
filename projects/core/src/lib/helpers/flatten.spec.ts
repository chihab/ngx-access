import { flatten } from './flatten';
import { BehaviorSubject, Subject, of, from } from 'rxjs';
import { scan, reduce, tap, switchMap, take, distinctUntilChanged, startWith } from 'rxjs/operators';

describe('Flatten Library', () => {

  it('should construct a flattened tree', () => {

    const canAccess = (access: string) => {
      const userAccesses = ['CanWriteFirstName'];
      const evaluation = userAccesses.some(_access => _access === access);
      return evaluation;
    }

    const nodeEvaluator = (flatChildren, children: Array<boolean | string>) => {
      const evaluation = children.some(child =>
        typeof child === "string"
          ? flatChildren[child]
          : child
      );
      return evaluation;
    }

    const leafEvaluator = (value: string) => {
      return canAccess(value);
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
    }, nodeEvaluator, leafEvaluator);

    // console.log(flattened);
    expect(flattened['Main.ClassForm.Level:Read']).toBe(false);
    expect(flattened['Main:Read']).toBe(false);
    expect(flattened['Main:Write']).toBe(true);
  });


  describe('should evaluate access configuration reactively', () => {

    const canAccess = (access: string) => {
      const userAccesses = ['CanWriteFirstName', 'CanExport'];
      const evaluation = userAccesses.some(_access => _access === access);
      return of(evaluation).pipe(
        tap(v => console.log(access + ' evaluated to ' + v))
      );
    }

    const nodeEvaluator = (flatChildren, children: Array<boolean | string>) => {
      console.log('Node Evaluator: ', children)
      const evaluation = from(children)
        .pipe(
          tap(console.log),
          switchMap(child =>
            typeof child === "string"
              ? flatChildren[child]
              : child
          ),
          reduce((acc, v) => {
            return acc || v
          }, false)
        );
      return evaluation;
    }

    const leafEvaluator = (value: string) => {
      console.log('Leaf Evaluator: ', value)
      return canAccess(value).pipe(take(1));
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
    }, nodeEvaluator, leafEvaluator);

    function test(key, expected) {
      return (done) => {
        flattened[key].subscribe(value => {
          expect(value).toBe(expected);
          done();
        })
      }
    }

    it('Main.UserForm.FirstName:Write', test('Main.UserForm.FirstName:Write', true));
    it('Main.UserForm:Write', test('Main.UserForm:Write', true));
    it('Main:Write', test('Main:Write', true));
    it('Main:Read', test('Main:Read', false));

  });


  fdescribe('should evaluate access configuration reactively', () => {

    const canAccess = (access: string) => {
      const userAccesses = ['CanWriteFirstName', 'CanExport'];
      const evaluation = userAccesses.some(_access => _access === access);
      return of(evaluation).pipe(
        tap(v => console.log(access + ' evaluated to ' + v))
      );
    }

    const nodeEvaluator = (flatChildren, children) => {
      console.log('Node Evaluator: ', children)
      const evaluation$ = from(children)
        .pipe(
          switchMap(child => {
            if (typeof child === "string") {
              // console.log(child, flatChildren[child]);
              flatChildren[child].input.next();
              return flatChildren[child].output;
            }
            else {
              return child;
            }
          }),
          scan((acc, curr) => {
            console.log('Value ' + curr);
            return acc || curr
          }, false)
        );
      return evaluation$;
    }

    const leafEvaluator = (access: string) => {
      console.log('Leaf Evaluator: ', access)
      const input$ = new Subject();
      const output$ = new Subject();
      input$
        .subscribe(newAccess => {
          console.log('New value ', newAccess, access);
          output$.next(newAccess ? newAccess : access);
        });
      return {
        input: input$,
        output: output$.pipe(
          // switchMap(canAccess),
          tap(_ => {
            console.log('Waiting for data....')
          })
        )
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
    }, nodeEvaluator, leafEvaluator);

    console.log(flattened);

    function test(key, expected) {
      return (done) => {
        flattened[key].output.subscribe(value => {
          expect(value).toBe(expected);
          done();
        })
      }
    }

    // it('Main.UserForm.FirstName:Write', test('Main.UserForm.FirstName:Write', true));
    // it('Main.UserForm:Write', test('Main.UserForm:Write', true));
    // it('Main:Write', test('Main:Write', true));
    // it('Main:Read', test('Main:Read', false));

    // it('Emit expression to evaluate', (done) => {
    // const key = 'Main.UserForm.FirstName:Write';
    // flattened[key].output.subscribe(value => {
    //   expect(value).toBe(true);
    //   done();
    // })
    // flattened[key].input.next('CanExport');
    // })

    it('Emit expression to evaluate', (done) => {
      const key = 'Main.UserForm:Read';
      flattened[key].subscribe(value => {
        expect(value).toBe(true);
        done();
      })
    })

  });

});