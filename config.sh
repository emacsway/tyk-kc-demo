#!/usr/bin/env bash
# set -euo pipefail

REALM=${1:-'mockrealm'}

if [[ "${REALM}" == "mockrealm" ]]
then
    readonly REACT_CLIENT_ID=react
    readonly BACKEND_CLIENT_ID=backend
    readonly CLIENT_LOGIN_ID=mock_login_client
    readonly CLIENT_LOGIN_SECRET=mock_login_secret
    readonly CLIENT_GATEWAY_ID=mock_gateway_client
    readonly CLIENT_GATEWAY_SECRET=mock_gateway_secret
elif [[ "${REALM}" == "realm2" ]]
then
    readonly REACT_CLIENT_ID=react2
    readonly BACKEND_CLIENT_ID=backend2
    readonly CLIENT_LOGIN_ID=mock_login_client2
    readonly CLIENT_LOGIN_SECRET=mock_login_secret
    readonly CLIENT_GATEWAY_ID=mock_gateway_client2
    readonly CLIENT_GATEWAY_SECRET=mock_gateway_secret
fi

readonly ADMIN=admin ADMINPWD=admin
readonly USER1=user1 USER1PWD=pass1
readonly USER2=user2 USER2PWD=pass2

readonly BASEURL=http://oidc:8080/realms/${REALM}
export ADMIN ADMINPWD
export USER1 USER1PWD
export USER1 USER1PWD
export REACT_CLIENT_ID BACKEND_CLIENT_ID
export CLIENT_LOGIN_ID CLIENT_LOGIN_SECRET
export REALM
export BASEURL
