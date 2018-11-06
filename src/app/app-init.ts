import {KeycloakService} from 'keycloak-angular';
import {ApplicationParamService} from './shared';
import {CookiesService} from 'ng-zorro-iop';

export function initializer(keycloak: KeycloakService,
                            applicationParamService: ApplicationParamService,
                            cookieService: CookiesService): () => Promise<any> {

  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      let url = '';
      let realm = '';
      let clientId = '';
      await applicationParamService.getParams().then(datas => {
        if (datas && datas.auth) {
          url = datas.auth.url;
          realm = datas.auth.realm;
          clientId = datas.auth.clientId;
        }
      });
      // /?clientId=clientId1
      const hash = window.location.hash;
      const tempclientId = cookieService.getCookie('clientId');
      if (tempclientId) {
        clientId = tempclientId;
      }
      const groups = cookieService.getCookie('groups');
      if (groups !== '') {
        const groupIndex = groups.indexOf('group-');
        const groupIndexEnd = groups.indexOf('\"', groupIndex);
        const group = groups.substring(groupIndex, groupIndexEnd);
        const userName = group.substr(6);
        const userClientId = 'client-' + userName;
        if (userClientId !== clientId) {
          cookieService.setCookie('clientId', userClientId);
          // window.location.href = window.location.href;
          window.location.reload();
        }
      }
      console.log(clientId);
      try {
        await keycloak.init(
        {
          config: {
            url: url,
            realm: realm,
            clientId: clientId
          },
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: true
          },
          bearerExcludedUrls: [
            '/assets',
            '/clients/public'
          ],
        });
        console.log('start get token');
        await keycloak.getToken().then(res => {
          cookieService.setCookie('iotToken', res);
          const roles = keycloak.getUserRoles(true);
          let roleStr = '';
          roles.forEach(role => {
            roleStr = roleStr + ',' + role;
          });
          cookieService.setCookie('roles', roleStr);
          sessionStorage.clear();
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
