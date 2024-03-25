# Tyk Keycloak Ratelimiting Demo

This is a super simple demo showing how to use [Tyk](https://tyk.io) to protect an API (here just https://httpbin.org),
blocking requests as unauthorized unless accompanied by an validly signed ID token from a [Keycloak](https://www.keycloak.org/documentation) instance.

For convenience, add the following lines to your `/etc/hosts`:

```
127.0.0.1       oidc
127.0.0.1       tyk
```

Then fire everything up - currently that's the OIDC IdP (Keycloak) and Tyk:

```bash
docker-compose up -d
```

When keycloak is up and running (when `docker-compose logs oidc` shows `Admin console listening` - you can wait or
you can run `./oidc/wait_keycloak.sh`), add the users and realm by running 

```bash
./oidc/config-oidc-service

./oidc/config-oidc-service realm2
```

(That will take 20 seconds or so).  The keycloak will then be configured with two users (user1 and user2),
with passwords pass1 and pass2.

Tyk here is configured with exactly one api, `http://tyk:8000/test-api` which just redirects to httpbin.   If you try accessing
it without a token, you will be sorely dissapointed and get a 401 error:

```bash
curl -v http://localhost:8000/pref/resource1/

# {
#    "error": "Key not authorised"
# }
```

or

```bash
curl -v http://tyk:8000/test-api/get

# {
#    "error": "Key not authorised"
# }
```

You might think "Hey, that's weird, what key?"  Every session gets a session key, and this one isn't authorized
you possibly malicious internet user, you.

If you _do_ have a token, however, all works.  Here we're getting one by using the client credentials flow which
isn't how we'd actually get the token, but:

```bash
TOKEN1=$(./oidc/test_scripts/get_token_user1.sh realm2 | jq .access_token | tr -d \" );
curl -H "Authorization: Bearer ${TOKEN1}" -v http://localhost:8000/pref/resource1/

# {
#   "realm_name":"realm2",
#   "response":{
#     "sub":"9d65fef1-c509-47a4-b761-d7ced1ebc7d4",
#     "email_verified":true,
#     "name":"user1 user1",
#     "preferred_username":"user1",
#     "given_name":"user1",
#     "family_name":"user1",
#     "email":"user1@localhost"
#   }
# }
```

or default realm

```bash
TOKEN1=$(./oidc/test_scripts/get_token_user1.sh | jq .access_token | tr -d \" );
curl -H "Authorization: Bearer ${TOKEN1}" -v http://localhost:8000/pref/resource1/

# {
#   "realm_name":"mockrealm",
#   "response":{
#     "sub":"9d65fef1-c509-47a4-b761-d7ced1ebc7d4",
#     "email_verified":true,
#     "name":"user1 user1",
#     "preferred_username":"user1",
#     "given_name":"user1",
#     "family_name":"user1",
#     "email":"user1@localhost"
#   }
# }
```

or

```bash
TOKEN1=$(./oidc/test_scripts/get_token_user1.sh | jq .access_token | tr -d \" );
curl -H "Authorization: Bearer ${TOKEN1}" -v  http://tyk:8000/test-api/get

# {
#   "args": {},
#   "headers": {
#     "Accept": "*/*",
#     "Accept-Encoding": "gzip",
#     "Authorization": "Bearer eyJhbGciOiJ[...]6oSgYwV2m-g",
#     "Host": "httpbin.org",
#     "User-Agent": "curl/7.64.1",
#     "X-Amzn-Trace-Id": "Root=1-60d245a2-30b49b0e4563478b1fa5091f"
#   },
#   "origin": "192.168.192.1, 216.181.72.113",
#   "url": "http://httpbin.org/get"
# }
```

Explore ReactJS application at http://localhost:5173/

Explore NextJS application at http://localhost:4000/

Userinfo:

```bash
./oidc/test_scripts/userinfo.sh realm2 $(./oidc/test_scripts/get_token_user1.sh realm2 | jq .access_token | tr -d \" )

# {
#   "sub":"9d65fef1-c509-47a4-b761-d7ced1ebc7d4",
#   "email_verified":true,
#   "name":"user1 user1",
#   "preferred_username":"user1",
#   "given_name":"user1",
#   "family_name":"user1",
#   "email":"user1@localhost"
# }
```

Introspection:

```bash
./oidc/test_scripts/introspect.sh realm2 $(./oidc/test_scripts/get_token_user1.sh realm2 | jq .access_token | tr -d \" )


# {
#   "exp":1711379868,
#   "iat":1711379568,
#   "jti":"2417178a-8ffa-4325-98f7-d5f6d54a5ba4",
#   "iss":"http://oidc:8080/realms/realm2",
#   "aud":["mock_gateway_client2","account"],
#   "sub":"9d65fef1-c509-47a4-b761-d7ced1ebc7d4",
#   "typ":"Bearer","azp":"mock_login_client2",
#   "session_state":"32a13421-372e-4a02-b845-dd8e1cae2464",
#   "acr":"1","realm_access":{
#     "roles":["offline_access","default-roles-realm2","uma_authorization"]
#   },
#   "resource_access":{
#     "account":{
#       "roles":["manage-account","manage-account-links","view-profile"]
#     }
#   },
#   "scope":"openid email profile",
#   "sid":"32a13421-372e-4a02-b845-dd8e1cae2464",
#   "email_verified":true,
#   "name":"user1 user1",
#   "preferred_username":"user1",
#   "given_name":"user1",
#   "family_name":"user1",
#   "email":"user1@localhost",
#   "client_id":"mock_login_client2",
#   "username":"user1",
#   "token_type":"Bearer","active":true
# }
```

Introspection:

```bash
./oidc/test_scripts/wellknown.sh realm2

# {
#   "issuer":"http://oidc:8080/realms/realm2",
#   ...
# }
```


Note a few things here:

* Tyk does not automatically do the OAuth2 dance for you; if you want that you have to implement it yourself in middleware and/or virtual endpoints.  Tyk (like a lot of other API Gateways) assumes that there is a front end to handle that for you, and that its job is to interpose between the front end and the back end.
* Those that will do that dance for you all have pretty hardcoded assumptions that there is exactly one ID provider.
* Tyk Identity Broker's job is to handle auth _for Tyk itself_, like to the dashboard or the developer portal (neither of which are part of the open source release of Tyk).
* Tyk does have OAuth2 handling but that doesn't do the dance, it just has Tyk masquerade as the IdP so that IdPs can change behind the scene without effecting the front end.
* Tyk has "apps" (collections of APIs) and "policies" (policies applied to APIs).  Each access rule for an API has a policy
  * API and their policies must be from the same organization id
  * API ids, policy ids, organizaiton ids are just strings
  * In this example, in the openid providers in [tyk/apps/httpbin.json](tyk/apps/httpbin.json), the line `"client_ids": {"bW9ja19nYXRld2F5X2NsaWVudA==": "authn_gateway"}` gives the base64 encoded client ID, and not the client secret (there is none here!) but the policy that attaches.
  * In Keycloak we can use a bearer-only client for the gateway - it's only used to match the audience in the JWT.  That's why there's two clients - one for login, one for gateway
* There's a secret in [tyk/tyk.conf](tyk/tyk.conf#L4) - it seems benign but it is **not**.  Everything that can be configured in Tyk with files can be configured via ReST API, which means anyone with that secret can rewrite your API definitions, send confidential tokens anywhere else, etc.  _Rotate your secrets_ and don't use default ones.

## Request Quotas

We can implement request quotas in the [policy](.tyk/policies/policies/.json) we've attached to the API

```json
{
    "authn_gateway": {
        "active": true,
        "name": "default gateway policy",
        "org_id": "gateway_demo",
        "quota_max": 5,
        "quota_remaining": 5,
        "quota_renewal_rate": 60
    }
}
```

Here the quota is set to 5 requests every 60 seconds (and we start at the full 5 remaining at the time Tyk starts up).
We can test this with the script [try_rate_limiting.sh](./try_rate_limiting.sh), which prints the http status codes of
6 consecutive requests to the API, waits a minute, and then tries again:

```bash
./try_rate_limiting.sh

# 1: 200
# 2: 200
# 3: 200
# 4: 200
# 5: 200
# 6: 403
# {
#     "error": "Quota exceeded"
# }
# Waiting one minute
# 200
```

To make sure it works with two different tokens issued to the same user (so can't readily bypass quotas by logging in
multiple times) we can try this with two different tokens for user1 (and another token again for a second user entirely),
as in [try_rate_limiting_2_tokens.sh](./try_rate_limiting_2_tokens.sh):

```bash
./try_rate_limiting_2_tokens.sh

# Generated two different tokens
# User 1 Token 1 Request 1: 200
# User 1 Token 2 Request 1: 200
# User 2 Request 1: 200
# User 1 Token 1 Request 2: 200
# User 1 Token 2 Request 2: 200
# User 2 Request 2: 200
# User 1 Token 1 Request 3: 200
# User 1 Token 2 Request 3: 403
# User 2 Request 3: 200
# User 1 Token 1 Request 4: 403
# User 1 Token 2 Request 4: 403
# User 2 Request 4: 200
# User 1 Token 1 Request 5: 403
# User 1 Token 2 Request 5: 403
# User 2 Request 5: 200
# User 1 Token 1 Request 6: 403
# User 1 Token 2 Request 6: 403
# User 2 Request 6: 403
# Full response User 1 Token 1: {
#     "error": "Quota exceeded"
# }Full response User 1 Token 2: {
#     "error": "Quota exceeded"
# }
# Waiting one minute

# User 1 Token 1 Retry:200
# User 1 Token 2 Retry: 200
# User 2 Retry: 200
```

Note that the first five requests for user 1 (3 for token 1, 2 for token 2) succeeded, and the rest failed with a 403.

Some parts of the code is based on https://github.com/AlTosterino/django-react-keycloak
and https://github.com/jackkweyunga/nextjs-keycloack-example

