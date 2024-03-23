#!/bin/bash

source config.sh
# echo "${BASEURL}/protocol/openid-connect/token"
# curl -k -H "Content-Type: application/x-www-form-urlencoded" -d "client_id=${CLIENT_LOGIN_ID}" -d "client_secret=${CLIENT_LOGIN_SECRET}" -d "username=${USER1}" -d "password=${USER1PWD}" -d "grant_type=password" -X POST "${BASEURL}/protocol/openid-connect/token"

curl -u ${CLIENT_LOGIN_ID}:${CLIENT_LOGIN_SECRET} \
     -X POST "${BASEURL}/protocol/openid-connect/token" \
     -d "grant_type=password&scope=openid&username=${USER1}&password=${USER1PWD}&redirect_uri=http://tyk:3000/auth/oidc"


