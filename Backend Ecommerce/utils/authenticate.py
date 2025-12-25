from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions


def enforce_csrf(request):
    check = CSRFCheck(request)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)


class CustomAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            access_token = request.headers.get('Authorization')
            if access_token and access_token.startswith("Bearer "):
                access_token = access_token.split(" ")[1]
            else:
                return None
            try:
                validated_token = self.get_validated_token(access_token)
            except Exception as e:
                raise exceptions.NotAuthenticated({'message': 'Token expired'})
            # enforce_csrf(request)
            return self.get_user(validated_token), validated_token

        except Exception as e:
            raise exceptions.AuthenticationFailed({'message': 'Invalid Token'})
