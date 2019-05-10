import { setHasAccessStrategy, setConfigurationAccess, can, canExpression } from './access-helpers';

describe('AccessHelpers', () => {
  let hasAccessStrategy;

  beforeEach(() => {
    hasAccessStrategy = jasmine.createSpy();
    setHasAccessStrategy(hasAccessStrategy);
  });

  it('should prevent access when no access configuration has been set', () => {
    expect(canExpression('Resource.View')).toBeFalsy();
  });

  it('should prevent access when access configuration has been initialized with empty obkect', () => {
    setConfigurationAccess({});
    expect(canExpression('Resource.View')).toBeFalsy();
  });

  it('should not call access strategy when access path not found', () => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess'],
        create: ['UnknownAccess']
      }
    });
    canExpression('Unknown:create');
    expect(hasAccessStrategy).not.toHaveBeenCalled();
  });

  /*
  xit('should parse expression and call can with expected flatten values ', () => {
    const canSpy = spyOn(can);
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [
          ['Access1', 'Access2'],
          {operator: 'OR', list: ['Access3', 'Access4']},
          'Access5'
        ]
      }
    });
    canExpression('Resource:read');
    expect(canSpy).toHaveBeenCalledWith('Resource', 'read', false);
  });
  */

  it('should call access strategy with expected inputs', () => {
    setConfigurationAccess({
      Resource: {
        read: ['ReadAccess'],
        create: ['CreateAccess'],
        array: ['Access1', 'Access2'],
        complex: [
          ['Access1', 'Access2'],
          { operator: 'OR', list: ['Access3', 'Access4'] },
          'Access5'
        ]
      }
    });
    canExpression('Resource:read');
    expect(hasAccessStrategy).toHaveBeenCalledWith('ReadAccess');

    hasAccessStrategy.calls.reset();
    canExpression('Resource:create');
    expect(hasAccessStrategy).toHaveBeenCalledWith('CreateAccess');

    hasAccessStrategy.calls.reset();
    canExpression('Resource:array');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');

    hasAccessStrategy.calls.reset();
    canExpression('Resource:complex');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access3');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access4');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access5');
  });

  it('should combine list, objects and string access configuration', () => {
    setConfigurationAccess({
      Resource: {
        combination: {
          operator: 'OR',
          list: [
            { operator: 'OR', list: ['Access1', 'Access2'] },
            {
              operator: 'OR', list: [
                'Access3',
                'Access4',
                { operator: 'AND', list: ['Access5', 'Access6'] },
              ]
            },
          ]
        }
      }
    });
    hasAccessStrategy.and.returnValue(false);
    expect(canExpression('Resource:combination')).toBe(false);
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('OtherAccess');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access2');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access3');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access4');
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access5');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access6');

    hasAccessStrategy.calls.reset();
    hasAccessStrategy.and.returnValue(true);
    expect(canExpression('Resource:combination')).toBe(true);
    expect(hasAccessStrategy).toHaveBeenCalledWith('Access1');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access2');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access3');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access4');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access5');
    expect(hasAccessStrategy).not.toHaveBeenCalledWith('Access6');
  });

  it('should combine list, objects and string access configuration', () => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess']
      }
    });
    hasAccessStrategy.and.returnValue(false);
    expect(canExpression('Resource:read')).toBeFalsy();
    hasAccessStrategy.and.returnValue(true);
    expect(canExpression('Resource:read')).toBeTruthy();
  });

  it('should prevent access when access path does not exist', () => {
    setConfigurationAccess({
      Resource: {
        read: ['SomeRandomAccess']
      }
    });
    hasAccessStrategy.and.returnValue(true);
    expect(canExpression('Resource:create')).toBeFalsy();
    expect(hasAccessStrategy).not.toHaveBeenCalledWith();
  });

  it('should aggregate children access when group flag has been set', () => {
    setConfigurationAccess({
      View: {
        Resource1: {
          read: ['ReadResource1Access']
        },
        Resource2: {
          read: ['ReadResource2Access']
        }
      }
    });
    hasAccessStrategy.and.returnValue(false); // In order to check out all children access
    expect(canExpression('View:read', true)).toBeFalsy();
    expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource1Access');
    expect(hasAccessStrategy).toHaveBeenCalledWith('ReadResource2Access');
  });

});
