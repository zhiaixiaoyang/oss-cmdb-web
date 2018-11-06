import {Injectable} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';

@Injectable()
export class UserService {

  constructor(private keycloak: KeycloakService) {}

  getUserInfo() {
    const userName  = this.keycloak.getUsername() || '';
    const userRoles = this.keycloak.getUserRoles() || [];
    return {
      'userName': userName,
      'userRoles': userRoles
    };
  }
  isAdmin() {
    const clientId = this.keycloak.getKeycloakInstance().clientId;
    return this.keycloak.getKeycloakInstance().hasResourceRole('admin', clientId);
  }
}
