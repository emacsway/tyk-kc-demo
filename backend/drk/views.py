from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from drk.authentication import KeyCloakAuthentication

class SampleResource(ViewSet):
    authentication_classes = [KeyCloakAuthentication]

    def list(self, request):
        return Response({
            "realm_name": "mockrealm",
            "response": request.user.user_info
        })
