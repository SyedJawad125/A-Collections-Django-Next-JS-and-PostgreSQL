from rest_framework.exceptions import PermissionDenied, ValidationError
from apps.users.models import Role


def permission_required(permissions):
    def decorator(drf_custom_method):
        def _decorator(self, *args, **kwargs):
            if self.request.user.deactivated:
                raise ValidationError({"message": "You have been deactivated, Please contact administrator."})
            if hasattr(self.request.user, 'role') and Role.objects.filter(pk=self.request.user.role.pk, permissions__code_name__in=permissions).exists():
                return drf_custom_method(self, *args, **kwargs)
            else:
                raise PermissionDenied({"message": "You do not have the required permission."})
        return _decorator
    return decorator