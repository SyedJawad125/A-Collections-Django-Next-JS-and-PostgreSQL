# from django.db.models import Q
# from rest_framework import serializers
# from rest_framework_simplejwt.tokens import RefreshToken, TokenError
# from django.contrib.auth import authenticate

# from utils.helpers import generate_token
# from utils.response_messages import *
# from utils.reusable_functions import combine_role_permissions, extract_permission_codes, get_first_error
# from django.db import transaction
# from utils.enums import *
# from utils.validators import clean_and_validate_mobile
# from django.utils import timezone
# from .models import User, Employee, Role, Permission
# from config.settings import (MAX_LOGIN_ATTEMPTS, SIMPLE_JWT, PASSWORD_MIN_LENGTH)
# from django.contrib.auth.hashers import check_password
# from .utils import validate_password


# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField(max_length=100, required=True)
#     password = serializers.CharField(max_length=100, required=True)

#     def validate(self, attrs):
#         username = attrs.get('username', None)
#         password = attrs.get("password", None)
#         if username and password:
#             user_obj = User.objects.filter(username=username, deleted=False).first()
#             if user_obj:
#                 if user_obj.activation_link_token or not user_obj.is_verified:
#                     raise serializers.ValidationError(FOLLOW_ACTIVATION_EMAIL)
#                 if not check_password(password, user_obj.password):
#                     if user_obj.login_attempts < MAX_LOGIN_ATTEMPTS:
#                         user_obj.login_attempts += 1
#                         user_obj.save()
#                     else:
#                         user_obj.is_blocked = True
#                         user_obj.save()
#                         raise serializers.ValidationError(ACCOUNT_BLOCKED)
#                     raise serializers.ValidationError(INVALID_CREDENTIALS)
#                 elif user_obj.deleted:
#                     raise serializers.ValidationError(INVALID_CREDENTIALS)
#                 elif user_obj.is_blocked:
#                     raise serializers.ValidationError(ACCOUNT_BLOCKED)
#                 else:
#                     user_obj.last_login = None
#                     user_obj.login_attempts = 0
#                     user_obj.save()
#             else:
#                 raise serializers.ValidationError(INVALID_CREDENTIALS)
#         else:
#             raise serializers.ValidationError(USERNAME_OR_PASSWORD_MISSING)

#         attrs['user'] = user_obj
#         return attrs


# class LoginUserSerializer(serializers.ModelSerializer):

#     role_name = serializers.CharField(source='role.name', read_only=True)
#     class Meta:
#         model = User
#         fields = ('id', 'first_name', 'last_name', 'full_name', 'username', 'email', 'mobile', 'profile_image', 'role', 'role_name', 'type')

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         tokens = self.context.get('tokens')
#         data['refresh_token'] = tokens['refresh']
#         data['access_token'] = tokens['access']
#         expiry = SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
#         data['age_in_seconds'] = expiry.total_seconds() * 1000
#         data['permissions'] = combine_role_permissions(instance.role)
#         return data


# class EmptySerializer(serializers.Serializer):
#     pass


# class LogoutSerializer(serializers.Serializer):
#     refresh_token = serializers.CharField(max_length=500, required=True)

#     def validate(self, attrs):
#         refresh_token = attrs.get('refresh_token', None)
#         try:
#             RefreshToken(refresh_token).blacklist()
#         except TokenError:
#             raise serializers.ValidationError(INVALID_TOKEN)
#         return attrs


# class SetPasswordSerializer(serializers.Serializer):
#     token = serializers.CharField(
#         label="token",
#         style={"input_type": "token"},
#         trim_whitespace=False,
#     )
#     new_password = serializers.CharField(
#         label="new_password",
#         style={"input_type": "new_password"},
#         trim_whitespace=True,
#     )
#     confirm_password = serializers.CharField(
#         label="confirm_password",
#         style={"input_type": "confirm_password"},
#         trim_whitespace=True,
#     )

#     def validate(self, instance):
#         if instance['new_password'] != instance['confirm_password']:
#             raise serializers.ValidationError(PASSWORD_DOES_NOT_MATCH)
#         elif len(instance["new_password"]) < PASSWORD_MIN_LENGTH:
#             raise serializers.ValidationError(PasswordMustBeEightChar)
#         elif not validate_password(instance["new_password"]):
#             raise serializers.ValidationError(FOLLOW_PASSWORD_PATTERN)
#         return instance


# class VerifyOTPSerializer(serializers.Serializer):
#     """Serializer for OTP verification"""
#     email = serializers.EmailField(required=True)
#     code = serializers.CharField(max_length=6, min_length=6, required=True)

#     def validate_code(self, value):
#         """Validate that code contains only digits"""
#         if not value.isdigit():
#             raise serializers.ValidationError("OTP code must contain only digits")
#         return value


# class ResetPasswordSimpleSerializer(serializers.Serializer):
#     """
#     Simplified serializer for password reset - only requires token and passwords
#     No need to send email or OTP code again after verification
#     """
#     reset_token = serializers.CharField(
#         required=True,
#         help_text="Reset token received from OTP verification step"
#     )
#     new_password = serializers.CharField(
#         required=True,
#         style={"input_type": "password"},
#         trim_whitespace=True,
#     )
#     confirm_password = serializers.CharField(
#         required=True,
#         style={"input_type": "password"},
#         trim_whitespace=True,
#     )

#     def validate(self, attrs):
#         """Validate password fields"""
#         if attrs['new_password'] != attrs['confirm_password']:
#             raise serializers.ValidationError({"confirm_password": PASSWORD_DOES_NOT_MATCH})
        
#         if len(attrs["new_password"]) < PASSWORD_MIN_LENGTH:
#             raise serializers.ValidationError({"new_password": PasswordMustBeEightChar})
        
#         if not validate_password(attrs["new_password"]):
#             raise serializers.ValidationError({"new_password": FOLLOW_PASSWORD_PATTERN})
        
#         return attrs

# # Add this serializer to your existing serializers.py file
# class ChangePasswordSerializer(serializers.Serializer):
#     """
#     Serializer for changing password when user is logged in
#     """
#     old_password = serializers.CharField(
#         required=True,
#         style={"input_type": "password"},
#         trim_whitespace=True,
#         write_only=True
#     )
#     new_password = serializers.CharField(
#         required=True,
#         style={"input_type": "password"},
#         trim_whitespace=True,
#         write_only=True
#     )
#     confirm_password = serializers.CharField(
#         required=True,
#         style={"input_type": "password"},
#         trim_whitespace=True,
#         write_only=True
#     )

#     def validate(self, attrs):
#         """Validate password fields"""
#         # Check if new passwords match
#         if attrs['new_password'] != attrs['confirm_password']:
#             raise serializers.ValidationError({"confirm_password": PASSWORD_DOES_NOT_MATCH})
        
#         # Check password length
#         if len(attrs["new_password"]) < PASSWORD_MIN_LENGTH:
#             raise serializers.ValidationError({"new_password": PasswordMustBeEightChar})
        
#         # Check password pattern
#         if not validate_password(attrs["new_password"]):
#             raise serializers.ValidationError({"new_password": FOLLOW_PASSWORD_PATTERN})
        
#         # Check if new password is same as old password
#         if attrs['old_password'] == attrs['new_password']:
#             raise serializers.ValidationError({"new_password": "New password cannot be same as old password"})
        
#         return attrs

#     def validate_old_password(self, value):
#         """Validate old password"""
#         user = self.context.get('request').user
#         if not user.check_password(value):
#             raise serializers.ValidationError("Current password is incorrect")
#         return value

# class PermissionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Permission
#         fields = '__all__'


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'

#     def validate(self, attrs):
#         email = attrs.get('username', attrs.get('email'))

#         if self.instance:
#             if User.objects.filter(email=email, deleted=False).exclude(id=self.instance.id).exists():
#                 raise serializers.ValidationError('User with this email already exists')
#         else:
#             if User.objects.filter(email=email, deleted=False).exists():
#                 raise serializers.ValidationError('User with this email already exists')
#         return attrs

#     def create(self, validated_data):
#         instance = User.objects.create(**validated_data)
#         token_string = f"{instance.id}_{instance.username}"
#         token = generate_token(token_string)
#         instance.activation_link_token = token
#         instance.activation_link_token_created_at = timezone.now()
#         instance.save()
#         return instance


# class UserListSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('id', 'first_name', 'last_name', 'full_name', 'email', 'mobile', 'profile_image', 'role', 'deactivated')

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['role'] = RoleListingSerializer(instance.role).data if instance.role else None
#         return data


# class EmployeeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Employee
#         exclude = ('deleted',)

#     def create(self, validated_data):
#         request = self.context.get('request')
#         request.data['type'] = EMPLOYEE
#         with transaction.atomic():
#             user_instance = UserSerializer(data=request.data)
#             if user_instance.is_valid():
#                 user_instance = user_instance.save()
#             else:
#                 transaction.set_rollback(True)
#                 raise Exception(get_first_error(user_instance.errors))

#             instance = Employee.objects.create(user=user_instance, **validated_data)
#         return instance

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         request = self.context.get('request')
#         data['created_by'] = instance.created_by.full_name
#         data['updated_by'] = instance.updated_by.full_name if instance.updated_by else None
#         user_data = UserListSerializer(instance.user).data
#         del user_data['id']
#         del data['user']
#         data.update(user_data)
#         if request.method == POST:
#             data['activation_link_token'] = instance.user.activation_link_token
#         return data


# class RoleListingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Role
#         fields = ('id', 'name', 'code_name')


# class PermissionListingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Permission
#         fields = ('id', 'name', 'code_name')


# class RoleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Role
#         fields = '__all__'

#     def validate(self, attrs):
#         name = attrs.get('name', None)
#         code_name = attrs.get('code_name', None)

#         if self.instance:
#             if Role.objects.filter(name__iexact=name, deleted=False).exclude(id=self.instance.id).exists():
#                 raise serializers.ValidationError('Role with this name already exists')
#             elif Role.objects.filter(code_name__iexact=code_name, deleted=False).exclude(id=self.instance.id).exists():
#                 raise serializers.ValidationError('Role with this code name already exists')
#         else:
#             if Role.objects.filter(name__iexact=name, deleted=False).exists():
#                 raise serializers.ValidationError('Role with this name already exists')
#             elif Role.objects.filter(code_name__iexact=code_name, deleted=False).exists():
#                 raise serializers.ValidationError('Role with this code name already exists')
#         return attrs

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['created_by'] = instance.created_by.full_name if instance.created_by else None
#         data['updated_by'] = instance.updated_by.full_name if instance.updated_by else None
#         data['permissions'] = PermissionListingSerializer(instance.permissions.all(), many=True).data if data['permissions'] else []
#         return data



from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate

from utils.helpers import generate_token
from utils.response_messages import *
from utils.reusable_functions import combine_role_permissions, extract_permission_codes, get_first_error
from django.db import transaction
from utils.enums import *
from utils.validators import clean_and_validate_mobile
from django.utils import timezone
from .models import User, Employee, Role, Permission
from config.settings import (MAX_LOGIN_ATTEMPTS, SIMPLE_JWT, PASSWORD_MIN_LENGTH)
from django.contrib.auth.hashers import check_password
from .utils import validate_password


# ─────────────────────────────────────────────
# Auth Serializers
# ─────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100, required=True)
    password = serializers.CharField(max_length=100, required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not (username and password):
            raise serializers.ValidationError(USERNAME_OR_PASSWORD_MISSING)

        user_obj = User.objects.filter(username=username, deleted=False).first()
        if not user_obj:
            raise serializers.ValidationError(INVALID_CREDENTIALS)

        if not user_obj.is_verified:
            raise serializers.ValidationError(FOLLOW_ACTIVATION_EMAIL)

        if not check_password(password, user_obj.password):
            user_obj.increment_login_attempts()
            if user_obj.is_blocked:
                raise serializers.ValidationError(ACCOUNT_BLOCKED)
            raise serializers.ValidationError(INVALID_CREDENTIALS)

        if user_obj.is_blocked:
            raise serializers.ValidationError(ACCOUNT_BLOCKED)

        if not user_obj.is_active:
            raise serializers.ValidationError(INVALID_CREDENTIALS)

        user_obj.reset_login_attempts()
        attrs['user'] = user_obj
        return attrs


class LoginUserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    full_name = serializers.CharField(read_only=True)   # property, not DB field

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'username',
                  'email', 'mobile', 'profile_image', 'role', 'role_name', 'type')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        tokens = self.context.get('tokens')
        data['refresh_token'] = tokens['refresh']
        data['access_token']  = tokens['access']
        expiry = SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        data['age_in_seconds'] = expiry.total_seconds() * 1000
        data['permissions'] = combine_role_permissions(instance.role)
        return data


class EmptySerializer(serializers.Serializer):
    pass


class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(max_length=500, required=True)

    def validate(self, attrs):
        try:
            RefreshToken(attrs['refresh_token']).blacklist()
        except TokenError:
            raise serializers.ValidationError(INVALID_TOKEN)
        return attrs


class SetPasswordSerializer(serializers.Serializer):
    """Used for account activation (employee invite link)."""
    token            = serializers.CharField(trim_whitespace=False)
    new_password     = serializers.CharField(trim_whitespace=True)
    confirm_password = serializers.CharField(trim_whitespace=True)

    def validate(self, instance):
        if instance['new_password'] != instance['confirm_password']:
            raise serializers.ValidationError(PASSWORD_DOES_NOT_MATCH)
        if len(instance['new_password']) < PASSWORD_MIN_LENGTH:
            raise serializers.ValidationError(PasswordMustBeEightChar)
        if not validate_password(instance['new_password']):
            raise serializers.ValidationError(FOLLOW_PASSWORD_PATTERN)
        return instance


# ─────────────────────────────────────────────
# OTP / Password Reset Serializers
# ─────────────────────────────────────────────

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    code  = serializers.CharField(max_length=6, min_length=6, required=True)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP code must contain only digits.")
        return value


class ResetPasswordSimpleSerializer(serializers.Serializer):
    """Step 3 of the OTP password reset flow."""
    reset_token      = serializers.CharField(required=True)
    new_password     = serializers.CharField(required=True, trim_whitespace=True)
    confirm_password = serializers.CharField(required=True, trim_whitespace=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": PASSWORD_DOES_NOT_MATCH})
        if len(attrs['new_password']) < PASSWORD_MIN_LENGTH:
            raise serializers.ValidationError({"new_password": PasswordMustBeEightChar})
        if not validate_password(attrs['new_password']):
            raise serializers.ValidationError({"new_password": FOLLOW_PASSWORD_PATTERN})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password for an already-authenticated user."""
    old_password     = serializers.CharField(required=True, trim_whitespace=True, write_only=True)
    new_password     = serializers.CharField(required=True, trim_whitespace=True, write_only=True)
    confirm_password = serializers.CharField(required=True, trim_whitespace=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": PASSWORD_DOES_NOT_MATCH})
        if len(attrs['new_password']) < PASSWORD_MIN_LENGTH:
            raise serializers.ValidationError({"new_password": PasswordMustBeEightChar})
        if not validate_password(attrs['new_password']):
            raise serializers.ValidationError({"new_password": FOLLOW_PASSWORD_PATTERN})
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the old password."})
        return attrs


# ─────────────────────────────────────────────
# Permission / Role Serializers
# ─────────────────────────────────────────────

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Permission
        fields = '__all__'


class PermissionListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Permission
        fields = ('id', 'name', 'code_name')


class RoleListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = ('id', 'name', 'code_name')


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Role
        fields = '__all__'

    def validate(self, attrs):
        name      = attrs.get('name')
        code_name = attrs.get('code_name')
        qs_name  = Role.objects.filter(name__iexact=name, deleted=False)
        qs_code  = Role.objects.filter(code_name__iexact=code_name, deleted=False)
        if self.instance:
            qs_name = qs_name.exclude(id=self.instance.id)
            qs_code = qs_code.exclude(id=self.instance.id)
        if qs_name.exists():
            raise serializers.ValidationError('Role with this name already exists.')
        if qs_code.exists():
            raise serializers.ValidationError('Role with this code name already exists.')
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['created_by']  = instance.created_by.full_name if instance.created_by else None
        data['updated_by']  = instance.updated_by.full_name if instance.updated_by else None
        data['permissions'] = PermissionListingSerializer(instance.permissions.all(), many=True).data
        return data


# ─────────────────────────────────────────────
# User Serializers
# ─────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'required': False, 'allow_null': True, 'allow_blank': True}
        }

    def validate(self, attrs):
        email = attrs.get('username', attrs.get('email'))
        qs = User.objects.filter(email=email, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError('User with this email already exists.')
        return attrs

    def create(self, validated_data):
        # Remove password if not provided (employee creation case)
        password = validated_data.pop('password', None)
        
        # If no password provided, set a temporary one for employee creation
        if not password:
            import secrets
            temp_password = secrets.token_urlsafe(16)
            validated_data['password'] = temp_password
        
        instance = User.objects.create(**validated_data)
        
        # Hash the password properly
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            instance.save()
        
        # Generate 6-digit OTP for account activation
        import random, string
        otp = ''.join(random.choices(string.digits, k=6))
        instance.activation_otp            = otp
        instance.activation_otp_created_at = timezone.now()
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)   # property

    class Meta:
        model  = User
        fields = ('id', 'username', 'first_name', 'last_name', 'full_name', 'email',
                  'mobile', 'profile_image', 'role', 'is_active')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = RoleListingSerializer(instance.role).data if instance.role else None
        return data


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Employee
        exclude = ('deleted',)

    def create(self, validated_data):
        request = self.context.get('request')
        request.data['type'] = EMPLOYEE
        with transaction.atomic():
            try:
                user_instance = UserSerializer(data=request.data)
                if user_instance.is_valid():
                    user_instance = user_instance.save()
                else:
                    transaction.set_rollback(True)
                    raise Exception(get_first_error(user_instance.errors))
                instance = Employee.objects.create(user=user_instance, **validated_data)
            except Exception as e:
                transaction.set_rollback(True)
                raise e
        return instance

    def to_representation(self, instance):
        data    = super().to_representation(instance)
        request = self.context.get('request')
        data['created_by'] = instance.created_by.full_name
        data['updated_by'] = instance.updated_by.full_name if instance.updated_by else None
        user_data = UserListSerializer(instance.user).data
        del user_data['id']
        del data['user']
        data.update(user_data)
        if request.method == POST:
            data['activation_otp'] = instance.user.activation_otp
        return data