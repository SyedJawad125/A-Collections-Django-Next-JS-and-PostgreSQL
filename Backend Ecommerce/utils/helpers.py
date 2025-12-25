# import hashlib
# import secrets
# import time
# import string
# import pytz
# import random
# from .custom_pagination import CustomPagination
# from django.utils import timezone
# from datetime import datetime


# def paginate_data(data, request):
#     limit = request.query_params.get('limit', None)
#     offset = request.query_params.get('offset', None)

#     if limit and offset:
#         pagination = CustomPagination()
#         data, count = pagination.paginate_queryset(data, request)
#         return data, count
#     else:
#         return data, data.count()


# def generate_token(str_):
#     secret_salt = "un_breakable"
#     str_ = f"{secrets.token_hex(32)}_{str_}_{timezone.now()}"
#     combined = str_ + secret_salt
#     token = hashlib.sha256(combined.encode('utf-8')).hexdigest()
#     return token


# def base36_encode(number):
#     chars = string.digits + string.ascii_uppercase
#     result = ''
#     while number > 0:
#         number, i = divmod(number, 36)
#         result = chars[i] + result
#     return result or '0'


# def generate_otp(user_id):
#     secret_salt = "tar*get_"
#     timestamp = int(time.time())
#     data = f"{user_id}_{timestamp}_{secret_salt}"
#     hash_digest = hashlib.sha256(data.encode('utf-8')).hexdigest()
#     hash_int = int(hash_digest, 16)
#     base36_token = base36_encode(hash_int)
#     otp = base36_token[:6].upper()
#     return otp


# def parse_datetime_string(dt_string: str):
#     try:
#         dt = datetime.fromisoformat(dt_string)
#         if timezone.is_naive(dt):
#             dt = pytz.UTC.localize(dt)
#         return timezone.localtime(dt)

#     except ValueError as e:
#         raise ValueError(f"Invalid datetime format: {e}")


# class UniqueSixDigitGenerator:
#     def __init__(self):
#         self.generated = set()

#     def generate(self):
#         if len(self.generated) >= 900000:
#             raise Exception("All 6-digit numbers exhausted!")

#         while True:
#             num = random.randint(100000, 999999)
#             if num not in self.generated:
#                 self.generated.add(num)
#                 return num

# def generate_numeric_otp():
#     obj = UniqueSixDigitGenerator()
#     return obj.generate()



# # utils/helpers.py - or wherever combine_role_permissions is defined
# def combine_role_permissions(role):
#     """
#     Combine permissions for a role
#     """
#     try:
#         if not role:
#             return {}
            
#         print(f"🔍 Getting permissions for role: {role.id} - {role.name}")
        
#         # If permissions is a ManyToMany field
#         if hasattr(role, 'permissions'):
#             permissions = role.permissions.all()
#             print(f"📋 Permissions found: {permissions.count()}")
            
#             # Return as list of dicts
#             return [
#                 {
#                     'id': perm.id,
#                     'name': perm.name,
#                     'code_name': perm.code_name
#                 }
#                 for perm in permissions
#             ]
        
#         # If permissions are stored differently
#         return {}
        
#     except Exception as e:
#         print(f"❌ Error in combine_role_permissions: {str(e)}")
#         return {}


# ============================================
# CORRECTED: utils/helpers.py
# All functions included
# ============================================

import hashlib
import secrets
import time
import string
import pytz
import random
from .custom_pagination import CustomPagination
from django.utils import timezone
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken


def paginate_data(data, request):
    limit = request.query_params.get('limit', None)
    offset = request.query_params.get('offset', None)

    if limit and offset:
        pagination = CustomPagination()
        data, count = pagination.paginate_queryset(data, request)
        return data, count
    else:
        return data, data.count()


def generate_token(str_):
    secret_salt = "un_breakable"
    str_ = f"{secrets.token_hex(32)}_{str_}_{timezone.now()}"
    combined = str_ + secret_salt
    token = hashlib.sha256(combined.encode('utf-8')).hexdigest()
    return token


def base36_encode(number):
    chars = string.digits + string.ascii_uppercase
    result = ''
    while number > 0:
        number, i = divmod(number, 36)
        result = chars[i] + result
    return result or '0'


def generate_otp(user_id):
    secret_salt = "tar*get_"
    timestamp = int(time.time())
    data = f"{user_id}_{timestamp}_{secret_salt}"
    hash_digest = hashlib.sha256(data.encode('utf-8')).hexdigest()
    hash_int = int(hash_digest, 16)
    base36_token = base36_encode(hash_int)
    otp = base36_token[:6].upper()
    return otp


def parse_datetime_string(dt_string: str):
    try:
        dt = datetime.fromisoformat(dt_string)
        if timezone.is_naive(dt):
            dt = pytz.UTC.localize(dt)
        return timezone.localtime(dt)

    except ValueError as e:
        raise ValueError(f"Invalid datetime format: {e}")


class UniqueSixDigitGenerator:
    def __init__(self):
        self.generated = set()

    def generate(self):
        if len(self.generated) >= 900000:
            raise Exception("All 6-digit numbers exhausted!")

        while True:
            num = random.randint(100000, 999999)
            if num not in self.generated:
                self.generated.add(num)
                return num


def generate_numeric_otp():
    obj = UniqueSixDigitGenerator()
    return obj.generate()


# ============================================
# ✅ ADDED: Missing Functions for Google Login
# ============================================

def create_response(message, data=None, count=None):
    """
    Create standardized API response format
    
    Args:
        message (str): Response message (e.g., "Successful", "Failed")
        data (dict/list): Response data
        count (int): Optional count for list responses
    
    Returns:
        dict: Standardized response format
    
    Example:
        create_response("Successful", {"id": 1, "email": "user@example.com"})
    """
    return {
        'message': message,
        'data': data,
        'count': count
    }


def get_first_error(errors):
    """
    Extract the first error message from Django REST serializer errors
    
    Args:
        errors (dict/list/str): Serializer validation errors
    
    Returns:
        str: First error message found
    
    Example:
        errors = {'email': ['This field is required.']}
        get_first_error(errors) -> "email: This field is required."
    """
    if isinstance(errors, dict):
        # Handle dictionary of errors (field: [messages])
        for field, messages in errors.items():
            if isinstance(messages, list) and messages:
                return f"{field}: {messages[0]}"
            elif isinstance(messages, dict):
                # Handle nested errors
                return get_first_error(messages)
            else:
                return f"{field}: {str(messages)}"
    elif isinstance(errors, list) and errors:
        # Handle list of errors
        return str(errors[0])
    else:
        # Handle string or other types
        return str(errors)
    
    return "Validation error occurred"


def get_tokens_for_user(user):
    """
    Generate JWT access and refresh tokens for a user
    
    Args:
        user: Django User object
    
    Returns:
        dict: {'refresh': str, 'access': str}
    
    Example:
        tokens = get_tokens_for_user(user)
        # Returns: {'refresh': 'eyJ...', 'access': 'eyJ...'}
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ============================================
# ✅ FIXED: combine_role_permissions
# Returns dict with permission_code: True format
# ============================================

def combine_role_permissions(role):
    """
    Combine permissions for a role into a dictionary format
    
    Args:
        role: Role object with permissions relation
    
    Returns:
        dict: {permission_code_name: True, ...}
    
    Example:
        combine_role_permissions(role)
        Returns: {
            'read_blog_post': True,
            'create_comment': True,
            'read_image': True
        }
    """
    try:
        if not role:
            print("⚠️ No role provided to combine_role_permissions")
            return {}
        
        print(f"🔍 Getting permissions for role: {role.id} - {role.name}")
        
        # Check if role has permissions attribute
        if not hasattr(role, 'permissions'):
            print(f"⚠️ Role {role.name} has no permissions attribute")
            return {}
        
        # Get all permissions for this role
        permissions = role.permissions.all()
        print(f"📋 Found {permissions.count()} permissions")
        
        # Convert to dictionary format: {code_name: True}
        permissions_dict = {}
        for perm in permissions:
            permissions_dict[perm.code_name] = True
            print(f"   ✅ {perm.code_name}")
        
        return permissions_dict
        
    except Exception as e:
        print(f"❌ Error in combine_role_permissions: {str(e)}")
        import traceback
        traceback.print_exc()
        return {}


# ============================================
# NOTES:
# ============================================
# 1. All your existing functions are preserved
# 2. Added: create_response, get_first_error, get_tokens_for_user
# 3. Fixed: combine_role_permissions to return dict format
# 4. Now returns: {'read_blog_post': True, 'create_comment': True}
#    Instead of: [{'id': 1, 'name': '...', 'code_name': '...'}]
# ============================================