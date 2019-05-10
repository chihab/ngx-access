import { AccessName, HasAccessStrategy } from './access-helpers';

let userAccess: Array<AccessName> = ['CanAccess'];

export function setUserAccess(accesses: Array<AccessName>) {
  userAccess = accesses;
}

const accessBasedStrategy: HasAccessStrategy = (accessName: AccessName): boolean => {
  return userAccess.some((ua) => ua === accessName);
};

export default accessBasedStrategy;
