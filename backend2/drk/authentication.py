import logging

from django.contrib.auth.models import AnonymousUser
from keycloak import KeycloakOpenID, KeycloakError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

KEYCLOAK_OPENID = KeycloakOpenID(
    server_url="http://oidc:8080/",
    client_id="backend2",
    realm_name="realm2",
    client_secret_key=""
)

logger = logging.getLogger(__name__)

class TokenNoopUser(AnonymousUser):
    """
    Django Rest Framework needs an user to consider authenticated
    """

    def __init__(self, user_info):
        super().__init__()
        self.user_info = user_info

    @property
    def is_authenticated(self):
        return True


class KeyCloakAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get("Authorization")
        if not token:
            raise AuthenticationFailed()

        try:
            _, token = token.split(" ")
            logger.info(token)
            user_info = KEYCLOAK_OPENID.userinfo(token)
        except (AttributeError, KeycloakError) as e:
            raise
            raise AuthenticationFailed()
        return (TokenNoopUser(user_info=user_info), None)
