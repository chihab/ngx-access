import {
  canAccessPaths,
  canAccessExpression,
  setConfigurationAccess,
  setHasAccessStrategy,
  HasAccessStrategy,
} from './access-helpers';
import { of } from 'rxjs';

describe('AccessHelpers', () => {
  let hasAccessStrategy: jasmine.Spy<HasAccessStrategy>;

  beforeEach(() => {
    hasAccessStrategy = jasmine.createSpy();
    setHasAccessStrategy(hasAccessStrategy);
    hasAccessStrategy.and.returnValue(of(false));
  });

  it('should evaluate access expression', (done: DoneFn) => {
    canAccessExpression('(CanRead & CanWrite) | !(!Visitor | Admin)').subscribe(
      (value) => {
        expect(value).toBe(false);
        expect(hasAccessStrategy).toHaveBeenCalledWith('CanRead');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('CanWrite');
        expect(hasAccessStrategy).toHaveBeenCalledWith('Visitor');
        expect(hasAccessStrategy).not.toHaveBeenCalledWith('Admin');
        done();
      }
    );
  });

  it('should prevent access when no access configuration has been set', (done: DoneFn) => {
    canAccessPaths('Resource:View').subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should prevent access when access configuration has been initialized with empty object', (done: DoneFn) => {
    setConfigurationAccess({});
    canAccessPaths('Resource:View').subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should not call access strategy when access path not found', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess'],
        create: ['UnknownAccess'],
      },
    });
    canAccessPaths('Unknown:create').subscribe(() => {
      expect(hasAccessStrategy).not.toHaveBeenCalled();
      done();
    });
  });

  it('should call access strategy with expected access', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        SubResource1: {
          Update: ['UpdateAccess'],
          Create: ['CreateAccess'],
          Read: ['ReadAccess1', 'ReadAccess2'],
        },
        SubResource2: {
          Read: [['Access1', 'Access2'], ['Access3 AND Access4'], 'Access5'],
        },
      },
    });
    canAccessPaths('Resource.SubResource1:Read').subscribe((_) => {
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess2');
      done();
    });
  });

  it('should call access strategy with simple string access', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [['Access1', 'Access2'], 'Access5'],
      },
    });
    canAccessPaths('Resource:create').subscribe((_) => {
      expect(hasAccessStrategy).toHaveBeenCalledWith('CreateAccess');
      done();
    });
  });

  it('should call access strategy with array access', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [['Access1', 'Access2'], 'Access5'],
      },
    });
    canAccessPaths('Resource:array').subscribe((_) => {
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
      done();
    });
  });

  it('should call access strategy with expected combined array access', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [['Access1', 'Access2'], 'Access5'],
      },
    });
    canAccessPaths('Resource:complex').subscribe((_) => {
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Access5');
      done();
    });
  });

  it('should prevent access when access path does not exist', (done: DoneFn) => {
    setConfigurationAccess({
      Resource: {
        Read: ['SomeRandomAccess'],
      },
    });
    hasAccessStrategy.and.returnValue(of(true));
    canAccessPaths('Resource.Create').subscribe((value) => {
      expect(value).toBe(false);
      expect(hasAccessStrategy).not.toHaveBeenCalled();
      done();
    });
  });

  it('should aggregate children access', (done: DoneFn) => {
    setConfigurationAccess({
      View: {
        Resource1: {
          Read: 'ReadResource1Access',
        },
        Resource2: {
          Read: 'ReadResource2Access',
          Update: 'UpdateResource2Access',
        },
        Resource3: {
          Update: 'UpdateResource3Access',
          SubResource3: {
            Read: 'ReadSubResource3ccess',
          },
        },
      },
    });
    hasAccessStrategy.and.returnValue(of(false)); // In order to check out all children access
    canAccessPaths('View:Read').subscribe((value) => {
      expect(value).toBe(false);
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource1Access');
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource2Access');
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadSubResource3ccess');
      expect(hasAccessStrategy).not.toHaveBeenCalledWith(
        'UpdateResource2Access'
      );
      expect(hasAccessStrategy).not.toHaveBeenCalledWith(
        'UpdateResource3Access'
      );
      done();
    });
  });

  it('should evaluate expression with no operators', (done: DoneFn) => {
    setConfigurationAccess({
      View: {
        Resource0: {
          Read: 'Read3',
        },
      },
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['ReadResource2', 'Read3'];
      return of(userAccesses.findIndex((a) => a === access) !== -1);
    });
    canAccessPaths('View:Read').subscribe((value) => {
      expect(value).toBe(true);
      expect(hasAccessStrategy).toHaveBeenCalledWith('Read3');
      done();
    });
  });

  it('should evaluate expression with ! operator', (done: DoneFn) => {
    setConfigurationAccess({
      View: {
        Resource0: {
          Read: '!Visitor',
        },
      },
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['Visitor'];
      return of(userAccesses.findIndex((a) => a === access) !== -1);
    });
    canAccessPaths('View:Read').subscribe((value) => {
      expect(value).toBe(false);
      expect(hasAccessStrategy).toHaveBeenCalledWith('Visitor');
      done();
    });
  });

  it('should evaluate expression with & operator and parenthesis', (done: DoneFn) => {
    setConfigurationAccess({
      View: {
        Resource1: {
          Read: 'Read1 | Read2',
        },
      },
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['ReadResource2', 'Read3'];
      return of(userAccesses.findIndex((a) => a === access) !== -1);
    });
    canAccessPaths('View:Read').subscribe((value) => {
      expect(value).toBe(false);
      expect(hasAccessStrategy).toHaveBeenCalledWith('Read1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Read2');
      done();
    });
  });

  it('should evaluate expression with &, | operators and parenthesis', (done: DoneFn) => {
    setConfigurationAccess({
      View: {
        Resource1: {
          Read: '(Read1 | Read2) & Read3',
        },
        Resource2: {
          Read: 'ReadResource2',
        },
      },
    });
    hasAccessStrategy.and.callFake((access) => {
      const userAccesses = ['ReadResource2', 'Read3'];
      return of(userAccesses.findIndex((a) => a === access) !== -1);
    });
    canAccessPaths('View:Read').subscribe((value) => {
      expect(value).toBe(true);
      expect(hasAccessStrategy).toHaveBeenCalledWith('Read1');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Read2');
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('Read3');
      expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource2');
      done();
    });
  });

  xit('should evaluate expression with &, | operators and parenthesis ', (done: DoneFn) => {
    setConfigurationAccess({
      View: {
        Resource1: {
          Read: '(CanRead & CanWrite) | (Admin | !Visitor)',
        },
      },
    });
    canAccessPaths('View.Resource1:Read').subscribe((value) => {
      expect(value).toBe(false);
      expect(hasAccessStrategy).toHaveBeenCalledWith('CanRead');
      expect(hasAccessStrategy).not.toHaveBeenCalledWith('CanWrite');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Admin');
      expect(hasAccessStrategy).toHaveBeenCalledWith('Visitor');
      done();
    });
  });
});
