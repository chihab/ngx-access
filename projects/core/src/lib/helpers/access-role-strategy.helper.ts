import { HasAccessStrategy } from './access-helpers';

let userRoles: string[] = [];

export function setUserRoles(roles: string[]) {
  userRoles = roles;
}

const roleBasedStrategy: HasAccessStrategy = (accessName: string): boolean => {

  function hasRole(role: string) {
    return userRoles.some(userRole => userRole === role);
  }

  function hasAdminRole(): boolean {
    return hasRole('ADMIN');
  }

  function hasAnimationRole(): boolean {
    return hasRole('ANIM');
  }

  function hasApprovisionnementProduitRole(): boolean {
    return hasRole('AP');
  }

  function hasChefDeProjetRole(): boolean {
    return hasRole('CDP');
  }

  function hasSuperAdminRole(): boolean {
    return hasRole('SA');
  }

  switch (accessName) {

    case 'CanReadLaunchSheets':
    case 'CanReadLaunchSheet':
    case 'CanReadLsProduct':
    case 'CanReadFinance':
    case 'CanReadLifeCycle':
    case 'CanReadMobile':
    case 'CanReadMetaData':
    case 'CanReadNumberPdv':
    case 'CanReadDistribution':
    case 'CanReadForecast':
    case 'CanReadAssortment':
    case 'CanReadLifeCycles':
    case 'CanExportLifeCycle':
      return hasAdminRole() || hasSuperAdminRole() || hasChefDeProjetRole() || hasAnimationRole() || hasApprovisionnementProduitRole();

    case 'CanLightImportLaunchSheet':
    case 'CanExportLaunchSheet':

    case 'CanCreateLaunchSheet':
    case 'CanUpdateLaunchSheet':
    case 'CanDuplicateLaunchSheet':

    case 'CanReadLsProducts':
    case 'CanCreateLsProduct':
    case 'CanUpdateLsProduct':

    case 'CanCreateLifeCycle':
    case 'CanUpdateLifeCycle':

    case 'CanReadMobiles':
    case 'CanCreateMobile':
    case 'CanUpdateMobile':

    case 'CanReadNumberPdvs':
    case 'CanCreateNumberPdv':
    case 'CanUpdateNumberPdv':

    case 'CanReadDistributions':
    case 'CanCreateDistribution':
    case 'CanUpdateDistribution':

    case 'CanReadForecasts':
    case 'CanCreateForecast':
    case 'CanUpdateForecast':

    case 'CanReadFinances':
    case 'CanCreateFinance':
    case 'CanUpdateFinance':

    case 'CanReadAssortments':
    case 'CanCreateAssortment':
    case 'CanUpdateAssortment':

    case 'CanReadMetaDatas':
    case 'CanCreateMetaData':
    case 'CanUpdateMetaData':
    case 'CanDeleteMetaData':
      return hasAdminRole() || hasSuperAdminRole() || hasChefDeProjetRole();

    case 'CanReadUsers':
    case 'CanCreateUser':
    case 'CanReadUser':
    case 'CanUpdateUser':
    case 'CanReadRoles':
    case 'CanCreateRole':
    case 'CanReadRole':
    case 'CanDeleteRole':
    case 'CanUpdateRole':
    case 'CanDeleteLaunchSheet':
      return hasAdminRole() || hasSuperAdminRole();

    default:
      console.error('Unexpected access name: ' + accessName);
      return false;
  }
};

export default roleBasedStrategy;
