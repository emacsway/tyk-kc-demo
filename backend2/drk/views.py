from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from drk.authentication import KeyCloakAuthentication

class SampleResource(ViewSet):
    authentication_classes = [KeyCloakAuthentication]

    def list(self, request):
        return Response({
            "realm_name": "realm2",
            "response": request.user.user_info
        })
