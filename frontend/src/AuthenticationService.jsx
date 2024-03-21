import Keycloak from "keycloak-js";
import Cookies from 'universal-cookie';


class AuthenticationServiceType {

    #providers = {
        mockrealm: new Keycloak({
          url: "http://oidc:8080",
          realm: "mockrealm",
          clientId: "react",
        }),
        react2: new Keycloak({
          url: "http://oidc:8080",
          realm: "realm2",
          clientId: "react2",
        }),
    }
    #cookies;
    #realm;

    constructor(defaultRealm) {
        this.#cookies = new Cookies(null, { path: '/' });
        !this.getRealm() && this.setRealm(defaultRealm)
    }

    get #activeProvider() {
        return this.#providers[this.getRealm()]
    }

    initKeycloak(onAuthenticatedCallback) {
      this.#activeProvider
        .init({
          checkLoginIframe: false,
          onLoad: "check-sso",
          silentCheckSsoRedirectUri:
            window.location.origin + "/silent-check-sso.html",
          pkceMethod: "S256",
        })
        .then((authenticated) => {
          if (!authenticated) {
            console.log("User not authenticated");
          }
          onAuthenticatedCallback();
        })
        .catch(error => console.log(error));
    };

    doLogin() {
        return this.#activeProvider.login;
    }

    getToken() {
        return this.#activeProvider.token;
    }

    isLoggedIn() {
        return !!this.#activeProvider.token;
    }

    updateToken(successCallback) {
        this.#activeProvider.updateToken(5).then(successCallback).catch(doLogin);
    }

    getLoginUrl() {
        return this.#activeProvider.createLoginUrl();
    }

    getRealms() {
        return Object.keys(this.#providers)
    }

    getLogoutUrl() {
        return this.#activeProvider.createLogoutUrl();
    }

    setRealm(realm) {
        this.#realm = realm
        this.#cookies.set('activeRealm', realm, { path: '/' });
    }

    getRealm() {
        // return this.#realm
        return this.#cookies.get('activeRealm')
    }

}


const AuthenticationService = new AuthenticationServiceType('mockrealm');

export default AuthenticationService;
