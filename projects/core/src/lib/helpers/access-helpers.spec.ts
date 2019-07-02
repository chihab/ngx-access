import { canAccessConfiguration, canAccessExpression, setAccessConfiguration, setHasAccessStrategy } from './access-helpers';
import { of, BehaviorSubject } from 'rxjs';

describe('AccessHelpers', () => {
  let hasAccessStrategy;
  beforeEach(() => {
    hasAccessStrategy = jasmine.createSpy();
    setHasAccessStrategy(hasAccessStrategy);
    hasAccessStrategy.and.returnValue(of(false));
  });

  it('should react to access event without blocking', (done: DoneFn) => {
    hasAccessStrategy.and.returnValue(new BehaviorSubject(false));
    canAccessExpression('CanRead&CanWrite')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('CanRead');
        done();
      });
  });

  it('should evaluate access expression', (done: DoneFn) => {
    canAccessExpression('(CanRead & CanWrite) | !(!Visitor | Admin)')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('CanRead');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('CanWrite');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Visitor');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('Admin');
        done();
      });
  });

  it('should prevent access when no access configuration has been set', (done: DoneFn) => {
    canAccessConfiguration('Resource:View')
      .subscribe(value => {
        expect(value).toBe(false);
        done();
      });
  });

  it('should prevent access when access configuration has been initialized with empty object', (done: DoneFn) => {
    setAccessConfiguration({});
    canAccessConfiguration('Resource:View')
      .subscribe(value => {
        expect(value).toBe(false);
        done();
      });
  });

  it('should not call access strategy when access path not found', (done: DoneFn) => {
    setAccessConfiguration({
      Resource: {
        read: 'SomeRandomAccess',
        create: 'UnknownAccess'
      }
    });
    canAccessConfiguration('Unknown:create').subscribe((value) => {
      expect(value).toBe(false);
      expect(hasAccessStrategy).not.toHaveBeenCalled();
      done();
    });
  });

  it('should call access strategy with expected access', (done: DoneFn) => {
    setAccessConfiguration({
      Resource: {
        SubResource1: {
          Update: 'UpdateAccess',
          Create: 'CreateAccess',
          Read: 'ReadAccess1 | ReadAccess2'
        }
      }
    });
    canAccessConfiguration('Resource.SubResource1:Read')
      .subscribe(_ => {
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess1');
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess2');
        done();
      });
  });

  it('should call access strategy with simple string access', (done: DoneFn) => {
    setAccessConfiguration({
      Resource: {
        read: 'ReadAccess',
        create: 'CreateAccess',
        array: 'Access1 | access2'
      }
    });
    canAccessConfiguration('Resource:create').subscribe(_ => {
      expect(hasAccessStrategy).toHaveBeenCalledWith('CreateAccess');
      done();
    });
  });

  it('should call access strategy with array access', (done: DoneFn) => {
    setAccessConfiguration({
      Resource: {
        read: 'ReadAccess',
        create: 'CreateAccess',
        array: 'Access1 | Access2'
      }
    });
    canAccessConfiguration('Resource:array').subscribe(_ => {
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
      done();
    });
  });

  it('should call access strategy with expected combined array access', (done: DoneFn) => {
    setAccessConfiguration({
      Resource: {
        read: 'ReadAccess',
        create: 'CreateAccess',
        array: 'Access1 | Access2',
        complex: '(Access1 | Access2) & (Access3 | Access 4)'
      }
    });
    canAccessConfiguration('Resource:complex').subscribe(_ => {
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access4');
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access5');
      done();
    });
  });

  it('should aggregate children access', (done: DoneFn) => {
    setAccessConfiguration({
      View: {
        Resource1: {
          Read: 'ReadResource1Access'
        },
        Resource2: {
          Read: 'ReadResource2Access',
          Update: 'UpdateResource2Access'
        },
        Resource3: {
          Update: 'UpdateResource3Access',
          SubResource3: {
            Read: 'ReadSubResource3ccess'
          }
        }
      }
    });
    hasAccessStrategy.and.returnValue(of(false)); // In order to check out all children access
    canAccessConfiguration('View:Read')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource1Access');
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource2Access');
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadSubResource3ccess');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('UpdateResource2Access');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('UpdateResource3Access');
        done();
      });
  });


  it('should evaluate expression with no operators', (done: DoneFn) => {
    setAccessConfiguration({
      View: {
        Resource0: {
          Read: 'Read3'
        }
      }
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['ReadResource2', 'Read3'];
      return of(userAccesses.findIndex(a => a === access) !== -1);
    });
    canAccessConfiguration('View:Read')
      .subscribe(value => {
        expect(value).toBe(true);
        expect(hasAccessStrategy).toHaveBeenCalledWith('Read3');
        done();
      });
  });

  it('should evaluate expression with ! operator', (done: DoneFn) => {
    setAccessConfiguration({
      View: {
        Resource0: {
          Read: '!Visitor'
        }
      }
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['Visitor'];
      return of(userAccesses.findIndex(a => a === access) !== -1);
    });
    canAccessConfiguration('View:Read')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('Visitor');
        done();
      });
  });

  it('should evaluate expression with | operator', (done: DoneFn) => {
    setAccessConfiguration({
      View: {
        Resource1: {
          Read: 'Read1 | Read2'
        }
      }
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['ReadResource2', 'Read3'];
      return of(userAccesses.findIndex(a => a === access) !== -1);
    });
    canAccessConfiguration('View:Read')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('Read1');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Read2');
        done();
      });
  });

  it('should evaluate expression with &, | operators and parenthesis', (done: DoneFn) => {
    setAccessConfiguration({
      View: {
        Resource1: {
          Read: '(Read1 | Read2) & Read3'
        },
        Resource2: {
          Read: 'ReadResource2'
        }
      }
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['ReadResource2', 'Read3'];
      return of(userAccesses.findIndex(a => a === access) !== -1);
    });
    canAccessConfiguration('View:Read')
      .subscribe(value => {
        expect(value).toBe(true);
        expect(hasAccessStrategy).toHaveBeenCalledWith('Read1');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Read2');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('Read3');
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource2');
        done();
      });
  });

  it('should evaluate expression with &, | operators and parenthesis ', (done: DoneFn) => {
    setAccessConfiguration({
      View: {
        Resource1: {
          Read: '(CanRead & CanWrite) | (Admin | !Visitor)'
        }
      }
    });
    canAccessConfiguration('View.Resource1:Read')
      .subscribe(value => {
        expect(value).toBe(true);
        expect(hasAccessStrategy).toHaveBeenCalledWith('CanRead');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('CanWrite');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Admin');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Visitor');
        done();
      });
  });

});


