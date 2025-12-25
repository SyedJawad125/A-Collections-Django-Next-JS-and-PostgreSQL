from datetime import timedelta
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


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100, required=True)
    password = serializers.CharField(max_length=100, required=True)

    def validate(self, attrs):
        username = attrs.get('username', None)
        password = attrs.get("password", None)
        if username and password:
            user_obj = User.objects.filter(username=username, deleted=False).first()
            # user = authenticate(username=username, password=password, deleted=False)
            # if not user:
            if user_obj:
                if user_obj.activation_link_token or not user_obj.is_verified:
                    raise serializers.ValidationError(FOLLOW_ACTIVATION_EMAIL)
                if not check_password(password, user_obj.password):
                    if user_obj.login_attempts < MAX_LOGIN_ATTEMPTS:
                        user_obj.login_attempts += 1
                        user_obj.save()
                    else:
                        user_obj.is_blocked = True
                        user_obj.save()
                        raise serializers.ValidationError(ACCOUNT_BLOCKED)
                    raise serializers.ValidationError(INVALID_CREDENTIALS)
                elif user_obj.deleted:
                    raise serializers.ValidationError(INVALID_CREDENTIALS)
                elif user_obj.is_blocked:
                    raise serializers.ValidationError(ACCOUNT_BLOCKED)
                else:
                    user_obj.last_login = None
                    user_obj.login_attempts = 0
                    user_obj.save()
            else:
                raise serializers.ValidationError(INVALID_CREDENTIALS)
        else:
            raise serializers.ValidationError(USERNAME_OR_PASSWORD_MISSING)

        attrs['user'] = user_obj
        return attrs


# class LoginUserSerializer(serializers.ModelSerializer):
    
#     role_name = serializers.CharField(source='role.name', read_only=True)
#     class Meta:
#         model = User
#         fields = ('id', 'first_name', 'last_name', 'full_name', 'username', 'email', 'mobile', 'profile_image', 'role', 'role_name', 'type')

#     # def to_representation(self, instance):
#     #     data = super().to_representation(instance)
#     #     tokens = self.context.get('tokens')
#     #     data['refresh_token'] = tokens['refresh']
#     #     data['access_token'] = tokens['access']
#     #     expiry = SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
#     #     data['age_in_seconds'] = expiry.total_seconds() * 1000
#     #     data['permissions'] = combine_role_permissions(instance.role)
#     #     return data

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         tokens = self.context.get('tokens')
#         data['refresh_token'] = tokens['refresh']
#         data['access_token'] = tokens['access']
#         expiry = SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
#         data['age_in_seconds'] = expiry.total_seconds() * 1000
        
#         # ✅ FIX: Check if user has role before getting permissions
#         if instance.role:
#             data['permissions'] = combine_role_permissions(instance.role)
#         else:
#             data['permissions'] = {}
        
#         return data


class LoginUserSerializer(serializers.ModelSerializer):
    
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'username', 'email', 'mobile', 'profile_image', 'role', 'role_name', 'type')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        tokens = self.context.get('tokens')
        data['refresh_token'] = tokens['refresh']
        data['access_token'] = tokens['access']
        expiry = SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        data['age_in_seconds'] = expiry.total_seconds() * 1000
        
        # ✅ Check if user has role before getting permissions
        if instance.role:
            data['permissions'] = combine_role_permissions(instance.role)
        else:
            data['permissions'] = {}
        
        return data
    

class EmptySerializer(serializers.Serializer):
    pass


class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(max_length=500, required=True)

    def validate(self, attrs):
        refresh_token = attrs.get('refresh_token', None)
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            raise serializers.ValidationError(INVALID_TOKEN)
        return attrs


class SetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(
        label="token",
        style={"input_type": "token"},
        trim_whitespace=False,
    )
    new_password = serializers.CharField(
        label="new_password",
        style={"input_type": "new_password"},
        trim_whitespace=True,
    )
    confirm_password = serializers.CharField(
        label="confirm_password",
        style={"input_type": "confirm_password"},
        trim_whitespace=True,
    )

    def validate(self, instance):
        if instance['new_password'] != instance['confirm_password']:
            raise serializers.ValidationError(PASSWORD_DOES_NOT_MATCH)
        elif len(instance["new_password"]) < PASSWORD_MIN_LENGTH:
            raise serializers.ValidationError(PasswordMustBeEightChar)
        elif not validate_password(instance["new_password"]):
            raise serializers.ValidationError(FOLLOW_PASSWORD_PATTERN)
        return instance


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    def validate(self, attrs):
        email = attrs.get('username', attrs.get('email'))

        if self.instance:
            if User.objects.filter(email=email, deleted=False).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError('User with this email already exists')
        else:
            if User.objects.filter(email=email, deleted=False).exists():
                raise serializers.ValidationError('User with this email already exists')
        return attrs

    def create(self, validated_data):
        instance = User.objects.create(**validated_data)
        token_string = f"{instance.id}_{instance.username}"
        token = generate_token(token_string)
        instance.activation_link_token = token
        instance.activation_link_token_created_at = timezone.now()
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'full_name', 'email', 'mobile', 'profile_image', 'role', 'deactivated')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = RoleListingSerializer(instance.role).data if instance.role else None
        return data

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        exclude = ('deleted',)

    def create(self, validated_data):
        request = self.context.get('request')
        request.data['type'] = EMPLOYEE
        with transaction.atomic():
            user_instance = UserSerializer(data=request.data)
            if user_instance.is_valid():
                user_instance = user_instance.save()
            else:
                transaction.set_rollback(True)
                raise Exception(get_first_error(user_instance.errors))

            instance = Employee.objects.create(user=user_instance, **validated_data)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        data['created_by'] = instance.created_by.full_name
        data['updated_by'] = instance.updated_by.full_name if instance.updated_by else None
        user_data = UserListSerializer(instance.user).data
        del user_data['id']
        del data['user']
        data.update(user_data)
        if request.method == POST:
            data['activation_link_token'] = instance.user.activation_link_token
        return data


class RoleListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'name', 'code_name')


class PermissionListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'code_name')


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

    def validate(self, attrs):
        name = attrs.get('name', None)
        code_name = attrs.get('code_name', None)

        if self.instance:
            if Role.objects.filter(name__iexact=name, deleted=False).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError('Role with this name already exists')
            elif Role.objects.filter(code_name__iexact=code_name, deleted=False).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError('Role with this code name already exists')
        else:
            if Role.objects.filter(name__iexact=name, deleted=False).exists():
                raise serializers.ValidationError('Role with this name already exists')
            elif Role.objects.filter(code_name__iexact=code_name, deleted=False).exists():
                raise serializers.ValidationError('Role with this code name already exists')
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['created_by'] = instance.created_by.full_name if instance.created_by else None
        data['updated_by'] = instance.updated_by.full_name if instance.updated_by else None
        data['permissions'] = PermissionListingSerializer(instance.permissions.all(), many=True).data if data['permissions'] else []
        return data



# ============================================
# ADD THIS TO YOUR serializers.py FILE
# ============================================

# from rest_framework import serializers
# from firebase_admin import auth as firebase_auth
# from django.db import transaction
# from .models import User, Employee
# from utils.enums import *
# from utils.response_messages import *


# class GoogleLoginSerializer(serializers.Serializer):
#     """
#     Serializer for Google Login with Firebase ID Token
#     Verifies token and creates/retrieves user
#     """
#     id_token = serializers.CharField(required=True, write_only=True)

#     def validate(self, attrs):
#         id_token = attrs.get('id_token')
        
#         if not id_token:
#             raise serializers.ValidationError("ID token is required")
        
#         try:
#             # Verify Firebase ID token
#             decoded_token = firebase_auth.verify_id_token(id_token)
            
#             # Extract user information from token
#             email = decoded_token.get('email')
#             name = decoded_token.get('name', '')
#             profile_picture = decoded_token.get('picture')
#             firebase_uid = decoded_token.get('uid')
            
#             if not email:
#                 raise serializers.ValidationError("Email not found in Google account")
            
#             # Split name into first and last name
#             name_parts = name.split(' ', 1) if name else ['', '']
#             first_name = name_parts[0] or 'User'
#             last_name = name_parts[1] if len(name_parts) > 1 else ''
            
#             # Check if user exists or create new one
#             with transaction.atomic():
#                 user = User.objects.filter(
#                     email=email,
#                     deleted=False
#                 ).first()
                
#                 if user:
#                     # Update existing user info if needed
#                     updated = False
                    
#                     if not user.first_name or user.first_name == 'User':
#                         user.first_name = first_name
#                         updated = True
                    
#                     if not user.last_name:
#                         user.last_name = last_name
#                         updated = True
                    
#                     # Activate user if they logged in with Google
#                     if not user.is_active or not user.is_verified:
#                         user.is_active = True
#                         user.is_verified = True
#                         user.is_blocked = False
#                         updated = True
                    
#                     if updated:
#                         user.save()
                    
#                     # Update employee status if exists
#                     if hasattr(user, 'user_employee'):
#                         employee = user.user_employee
#                         if employee.status != ACTIVE:
#                             employee.status = ACTIVE
#                             employee.save()
                
#                 else:
#                     # Create new user
#                     user = User.objects.create(
#                         username=email,
#                         email=email,
#                         first_name=first_name,
#                         last_name=last_name,
#                         is_active=True,
#                         is_verified=True,
#                         is_blocked=False,
#                         type=CUSTOMER,  # Default type, change as needed
#                     )
                    
#                     # Optionally create Employee record
#                     # Uncomment if all Google users should be employees
#                     # Employee.objects.create(
#                     #     user=user,
#                     #     status=ACTIVE,
#                     #     created_by=user
#                     # )
                
#                 # Store user in validated data
#                 attrs['user'] = user
                
#         except firebase_auth.InvalidIdTokenError:
#             raise serializers.ValidationError("Invalid Google authentication token")
#         except firebase_auth.ExpiredIdTokenError:
#             raise serializers.ValidationError("Google authentication token has expired")
#         except firebase_auth.RevokedIdTokenError:
#             raise serializers.ValidationError("Google authentication token has been revoked")
#         except Exception as e:
#             print(f"Firebase token verification error: {str(e)}")
#             raise serializers.ValidationError(f"Authentication failed: {str(e)}")
        
#         return attrs


# ============================================
# FIXED: Complete Google Login Implementation
# Works for BOTH new and existing users
# ============================================

from rest_framework import serializers
from firebase_admin import auth as firebase_auth
from django.db import transaction
from .models import User, Employee, Role
from utils.enums import *
from utils.response_messages import *


class GoogleLoginSerializer(serializers.Serializer):
    """
    Handles Google OAuth login with Firebase
    - New users: Assigned "Guest" role automatically
    - Existing users: Keep their current role
    """
    id_token = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        id_token = attrs.get('id_token')
        
        if not id_token:
            raise serializers.ValidationError("ID token is required")
        
        try:
            # Step 1: Verify Firebase ID token
            decoded_token = firebase_auth.verify_id_token(id_token)
            
            # Step 2: Extract user information
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')
            firebase_uid = decoded_token.get('uid')
            
            if not email:
                raise serializers.ValidationError("Email not found in Google account")
            
            # Step 3: Parse name
            name_parts = name.split(' ', 1) if name else ['', '']
            first_name = name_parts[0] or 'User'
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Step 4: Get Guest role for potential new users
            guest_role = Role.objects.filter(
                code_name='guest',
                deleted=False
            ).first()
            
            if not guest_role:
                print("❌ CRITICAL ERROR: 'guest' role not found!")
                print("   Please create Guest role in Django admin with code_name='guest'")
                raise serializers.ValidationError("Guest role not configured. Contact administrator.")
            
            with transaction.atomic():
                # Step 5: Check if user exists - IMPORTANT: Use select_related for role
                user = User.objects.filter(
                    email=email,
                    deleted=False
                ).select_related('role').first()
                
                if user:
                    # ============================================
                    # EXISTING USER - Update info, keep current role
                    # ============================================
                    print(f"\n{'='*70}")
                    print(f"🔵 EXISTING USER: {email}")
                    
                    # Check if user actually has a role
                    if user.role:
                        print(f"   Current role: {user.role.name}")
                        print(f"   Role ID: {user.role.id}")
                    else:
                        print(f"   Current role: No role")
                        print(f"   Role ID: N/A")
                        
                        # If existing user has no role, assign Guest role
                        user.role = guest_role
                        print(f"   ⚠️  Assigning Guest role to existing user without role")
                    
                    print(f"{'='*70}")
                    
                    updated = False
                    
                    # Update name if empty
                    if not user.first_name or user.first_name == 'User':
                        user.first_name = first_name
                        updated = True
                    
                    if not user.last_name:
                        user.last_name = last_name
                        updated = True
                    
                    # Activate if inactive
                    if not user.is_active or not user.is_verified:
                        user.is_active = True
                        user.is_verified = True
                        user.is_blocked = False
                        updated = True
                    
                    if updated:
                        user.save()
                        print(f"   ✅ User info updated")
                    else:
                        print(f"   ℹ️  No updates needed")
                    
                    # Update employee status if exists
                    if hasattr(user, 'user_employee'):
                        employee = user.user_employee
                        if employee.status != ACTIVE:
                            employee.status = ACTIVE
                            employee.save()
                            print(f"   ✅ Employee status activated")
                
                else:
                    # ============================================
                    # NEW USER - Assign Guest role
                    # ============================================
                    print(f"\n{'='*70}")
                    print(f"🟢 NEW USER: {email}")
                    print(f"   Assigning Guest role: {guest_role.name} (ID={guest_role.id})")
                    print(f"{'='*70}")
                    
                    # Generate username from email (remove domain)
                    base_username = email.split('@')[0]
                    username = base_username
                    counter = 1
                    
                    # Ensure username is unique
                    while User.objects.filter(username=username, deleted=False).exists():
                        username = f"{base_username}{counter}"
                        counter += 1
                    
                    # Create new user with Guest role
                    user = User.objects.create(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=True,
                        is_verified=True,
                        is_blocked=False,
                        type=CUSTOMER,
                        role=guest_role  # Assign Guest role to new users only
                    )
                    
                    print(f"   ✅ User created with ID: {user.id}")
                    print(f"   ✅ Username: {user.username}")
                    print(f"   ✅ Role assigned: {user.role.name}")
                
                # Step 6: CRITICAL - Refresh user with role and permissions preloaded
                user = User.objects.filter(
                    id=user.id
                ).select_related(
                    'role'
                ).prefetch_related(
                    'role__permissions'
                ).first()
                
                # Step 7: Verify role is properly loaded
                print(f"\n✅ FINAL CHECK:")
                print(f"   User: {user.email}")
                print(f"   Username: {user.username}")
                
                if user.role:
                    print(f"   Role: {user.role.name} (ID: {user.role.id})")
                    print(f"   Role Code: {user.role.code_name}")
                    
                    # Check permissions
                    perms = user.role.permissions.all()
                    perm_codes = [p.code_name for p in perms]
                    print(f"   Permissions ({len(perms)}): {perm_codes}")
                    
                    # Debug info
                    if user.role.code_name == 'guest':
                        print(f"   ✅ User has Guest role (as expected for new user)")
                    elif user.role.code_name == 'su':
                        print(f"   ✅ User has Super role")
                    else:
                        print(f"   ✅ User has {user.role.name} role")
                else:
                    print(f"\n❌ CRITICAL ERROR: User has NO role!")
                    print(f"   user.role_id: {user.role_id}")
                    print(f"   ⚠️  Assigning Guest role as fallback...")
                    
                    # Emergency fallback
                    user.role = guest_role
                    user.save()
                    user.refresh_from_db()
                    
                    print(f"   ✅ Assigned Guest role as fallback")
                
                print(f"{'='*70}\n")
                
                # Return user
                attrs['user'] = user
                
        except firebase_auth.InvalidIdTokenError:
            raise serializers.ValidationError("Invalid Google authentication token")
        except firebase_auth.ExpiredIdTokenError:
            raise serializers.ValidationError("Google authentication token has expired")
        except firebase_auth.RevokedIdTokenError:
            raise serializers.ValidationError("Google authentication token has been revoked")
        except Exception as e:
            print(f"\n❌ ERROR in GoogleLoginSerializer:")
            print(f"   {str(e)}")
            import traceback
            traceback.print_exc()
            raise serializers.ValidationError(f"Authentication failed: {str(e)}")
        
        return attrs