// Based on https://community.tyk.io/t/unable-to-integrate-tyk-gateway-and-keycloak/5924/14

var routeByRealm = new TykJS.TykMiddleware.NewMiddleware({});

var PREFIX = '/pref/';

routeByRealm.NewProcessRequest(function(request, session, config) {
  if (!request.URL.slice(PREFIX.length) == PREFIX) {
    log("### skip targetByRealm middleware: " + request.RequestURI)
    return routeByRealm.ReturnData(request, {});
  }

  var authorizationHeaderArray = request.Headers.Authorization;
  if (Array.isArray(authorizationHeaderArray)) {
    var authorizationHeader = authorizationHeaderArray[0];
    if (typeof authorizationHeader === "string") {
      var jwtToken = authorizationHeader.substring(7);
      var splitJwtToken = jwtToken.split(".");
      // log("Claims: " + b64dec(splitJwtToken[1]));
      var claims = JSON.parse(b64dec(splitJwtToken[1]));
      var realm = claims.iss;
      realm = realm.trim("/");
      realm = realm.substring(realm.lastIndexOf('/') + 1)
      log("### realm: " + realm)
      // request.SetHeaders["X-Realm"] = realm;
      // request.SetHeaders["X-Username"] = claims.preferred_username;
      var toUrl = "/" + realm + "/" + request.URL.slice(PREFIX.length)
      log("### rewrite: " + request.URL + " to: " + toUrl)
      request.URL = toUrl
    }
  }
  return routeByRealm.ReturnData(request, {});
});

log("#### Init targetByRealm middleware ")
