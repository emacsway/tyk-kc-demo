#!/usr/bin/env bash
# Start up keycloak and config for new user & client
#
set -euo pipefail

source /opt/keycloak/config.sh

readonly KC_PATH=/opt/keycloak/bin

echo "# Connecting to keycloak..."
${KC_PATH}/kcadm.sh config credentials --server http://oidc:8080 --realm master --user ${ADMIN} --password ${ADMINPWD}

echo "# Creating realm.."
${KC_PATH}/kcadm.sh create realms -s realm=${REALM} -s enabled=true

echo "# Creating login client.."
LOGIN_ID=$(${KC_PATH}/kcadm.sh create clients -r ${REALM} -s clientId=${CLIENT_LOGIN_ID} \
                               -s enabled=true -s 'redirectUris=["*"]' -s directAccessGrantsEnabled=true \
                               -s secret=${CLIENT_LOGIN_SECRET} \
                               -i)

echo "# Adding audience mapper"
${KC_PATH}/kcadm.sh \
        create clients/${LOGIN_ID}/protocol-mappers/models -r ${REALM} \
        -s name=audience-mapping \
        -s protocol=openid-connect \
        -s protocolMapper=oidc-audience-mapper \
        -s config.\"included.client.audience\"=\"${CLIENT_GATEWAY_ID}\" \
        -s config.\"access.token.claim\"="true" \
        -s config.\"id.token.claim\"="false"

echo "# Login client ID follows..."
echo $LOGIN_ID

echo "# Creating tyk client.."
GATEWAY_ID=$(${KC_PATH}/kcadm.sh create clients -r ${REALM} -s clientId=${CLIENT_GATEWAY_ID} \
                                     -s secret=${CLIENT_GATEWAY_SECRET} \
                                     -s enabled=true -s 'redirectUris=["*"]' \
                                     -s bearerOnly=true \
                                     -i)

echo "# Permissions client ID follows..."
echo $GATEWAY_ID

echo "# Client config follows..."
${KC_PATH}/kcadm.sh get clients/${GATEWAY_ID}/installation/providers/keycloak-oidc-keycloak-json -r ${REALM}

echo "# Login client config follows..."
${KC_PATH}/kcadm.sh get clients/${LOGIN_ID}/installation/providers/keycloak-oidc-keycloak-json -r ${REALM}

echo "# Creating user1"
${KC_PATH}/kcadm.sh create users -r ${REALM} -s username=${USER1} -s enabled=true -o --fields id,username
${KC_PATH}/kcadm.sh set-password -r ${REALM} --username ${USER1} --new-password ${USER1PWD}

echo "# Creating user2"
${KC_PATH}/kcadm.sh create users -r ${REALM} -s username=${USER2} -s enabled=true -o --fields id,username
${KC_PATH}/kcadm.sh set-password -r ${REALM} --username ${USER2} --new-password ${USER2PWD}

echo "# Now restart"
