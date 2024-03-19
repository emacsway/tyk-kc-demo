#!/usr/bin/env bash
# set -euo pipefail

readonly ADMIN=admin ADMINPWD=admin
readonly USER1=user1 USER1PWD=pass1
readonly USER2=user2 USER2PWD=pass2
readonly REALM=mockrealm
readonly REACT_CLIENT_ID=react
readonly BACKEND_CLIENT_ID=backend
readonly CLIENT_LOGIN_ID=mock_login_client
readonly CLIENT_LOGIN_SECRET=mock_login_secret
readonly CLIENT_GATEWAY_ID=mock_gateway_client
readonly CLIENT_GATEWAY_SECRET=mock_gateway_secret

readonly BASEURL=http://oidc:8080/realms/${REALM}
export ADMIN ADMINPWD
export USER USERPWD
export REACT_CLIENT_ID BACKEND_CLIENT_ID
export CLIENT_LOGIN_ID CLIENT_LOGIN_SECRET
export REALM
export BASEURL
