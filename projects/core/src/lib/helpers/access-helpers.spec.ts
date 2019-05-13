import { canExpression, setConfigurationAccess, setHasAccessStrategy } from './access-helpers';
import { of } from 'rxjs';

describe('AccessHelpers', () => {
  let hasAccessStrategy;

  beforeEach(() => {
    hasAccessStrategy = jasmine.createSpy();
    setHasAccessStrategy(hasAccessStrategy);
    hasAccessStrategy.and.returnValue(of(false));
  });

  it('should prevent access when no access configuration has been set', (done: DoneFn) => {
    canExpression('Resource.View')
      .subscribe(value => {
        expect(value).toBe(false);
        done();
      });
  });

  it('should prevent access when access configuration has been initialized with empty object', (done: DoneFn) => {
    setConfigurationAccess({});
    canExpression('Resource.View')
      .subscribe(value => {
        expect(value).toBe(false);
        done();
      });
  });

  it('should not call access strategy when access path not found', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess'],
        create: ['UnknownAccess']
      }
    });
    canExpression('Unknown.create').subscribe(() => {
      expect(hasAccessStrategy).not.toHaveBeenCalled();
      done();
    });
  });

  // fit('should combine list, objects and string access configuration', (done: DoneFn) => {
  //   setConfigurationAccess({
  //     Resource: {
  //       read: ['SomeRandomAccess']
  //     }
  //   });
  //   hasAccessStrategy.and.returnValue(of(true));
  //   canExpression('Resource.reads')
  //     .subscribe(value => {
  //       expect(value).toBe(false);
  //       done();
  //     });
  // });

  it('should call access strategy with expected access', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        SubResource1: {
          Update: ['UpdateAccess'],
          Create: ['CreateAccess'],
          Read: ['ReadAccess1', 'ReadAccess2']
        },
        SubResource2: {
          Read: [
            ['Access1', 'Access2'],
            // { operator: 'OR', list: ['Access3', 'Access4'] },
            'Access5'
          ]
        }
      }
    });
    canExpression('Resource.SubResource1.Read').subscribe(_ => {
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess2');
      done();
    });
  });

  it('should call access strategy with expected access 2', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [
          ['Access1', 'Access2'],
          // { operator: 'OR', list: ['Access3', 'Access4'] },
          'Access5'
        ]
      }
    });
    canExpression('Resource.create').subscribe(_ => {
      expect(hasAccessStrategy).toHaveBeenCalledWith('CreateAccess');
      done();
    });
  });

  it('should call access strategy with expected inputs 3', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [
          ['Access1', 'Access2'],
          // { operator: 'OR', list: ['Access3', 'Access4'] },
          'Access5'
        ]
      }
    });
    canExpression('Resource.array').subscribe(_ => {
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
      done();
    });
  });

  it('should call access strategy with expected inputs 4', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [
          ['Access1', 'Access2'],
          // { operator: 'OR', list: ['Access3', 'Access4'] },
          'Access5'
        ]
      }
    });
    canExpression('Resource.complex').subscribe(_ => {
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
      // expect(hasAccessStrategy).toHaveBeenCalledWith('Access3');
      // expect(hasAccessStrategy).toHaveBeenCalledWith('Access4');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access5');
      done();
    });
  });

  xit('should combine list, objects and string access configuration', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        combination: {
          // operator: 'OR',
          // list: [
          //   { operator: 'OR', list: ['Access1', 'Access2'] },
          //   {
          //     operator: 'OR', list: [
          //       'Access3',
          //       'Access4',
          //       { operator: 'AND', list: ['Access5', 'Access6'] },
          //     ]
          //   },
          // ]
        }
      }
    });
    hasAccessStrategy.and.returnValue(of(false));
    canExpression('Resource.combination')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access3');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access4');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access5');
        // Better not to call this one
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access6');
        done();
      });

    hasAccessStrategy.calls.reset();
    hasAccessStrategy.and.returnValue(of(true));
    canExpression('Resource.combination')
      .subscribe(value => {
        expect(value).toBe(true);
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
        // Better not to call these
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access3');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access4');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access5');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Access6');
        done();
      });
  });

  it('should combine list, objects and string access configuration', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess']
      }
    });
    hasAccessStrategy.and.returnValue(of(true));
    canExpression('Resource.read')
      .subscribe(value => {
        expect(value).toBe(true);
        done();
      });
  });

  it('should prevent access when access path does not exist', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess']
      }
    });
    hasAccessStrategy.and.returnValue(of(true));
    canExpression('Resource.create')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).not.toHaveBeenCalledWith();
        done();
      });
  });

  it('should aggregate children access when group flag has been set', (done: DoneFn) => {
    setConfigurationAccess({
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
    canExpression('View.Read')
      .subscribe(value => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource1Access');
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource2Access');
        expect(hasAccessStrategy).toHaveBeenCalledWith('ReadSubResource3ccess');
        done();
      });
  });

});
