import Keycloak from "keycloak-js";

const _kcMap = {
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

var _kc = _kcMap['mockrealm']

const initKeycloak = (onAuthenticatedCallback) => {
  _kc
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

const doLogin = () => _kc.login;

const getToken = () => _kc.token;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback) =>
  _kc.updateToken(5).then(successCallback).catch(doLogin);
const getLoginUrl = () => _kc.createLoginUrl();
const getLogoutUrl = () => _kc.createLogoutUrl();

const setRealm = (realm) => { _kc = _kcMap[realm] };

const AuthenticationService = {
  initKeycloak,
  doLogin,
  isLoggedIn,
  getToken,
  updateToken,
  getLoginUrl,
  getLogoutUrl,
  setRealm
};

export default AuthenticationService;
