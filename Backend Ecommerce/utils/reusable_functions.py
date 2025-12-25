import ast
# import pyheif
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.utils.serializer_helpers import ReturnList
from io import BytesIO
from PIL import Image
from django.core.files.base import ContentFile
# from core.settings import MAX_IMAGE_SIZE
from utils.enums import PA, PS, CA
from django.db.models import Q
from dateutil.relativedelta import relativedelta
from datetime import datetime
from django.utils import timezone
from utils.enums import EXPIRED, ACTIVE


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def combine_role_permissions(role):
    permissions = {}
    role_permissions = role.permissions.all()
    for permission in role_permissions:
        permissions[permission.code_name] = True
    return permissions


def get_first_error(serialized_errors):
    default_message = "UNSUCCESSFUL"
    if not serialized_errors:
        return default_message
    try:
        serialized_error_dict = serialized_errors
        # ReturnList of serialized_errors when many=True on serializer
        if isinstance(serialized_errors, ReturnList):
            serialized_error_dict = serialized_errors[0]
        serialized_errors_keys = list(serialized_error_dict.keys())
        # getting first error message from serializer errors
        try:
            message = serialized_error_dict[serialized_errors_keys[0]][0].replace("This", serialized_errors_keys[0])
            return message
        except:
            return serialized_error_dict[serialized_errors_keys[0]][0]
    except Exception as e:
        # logger.error(f"Error parsing serializer errors:{e}")
        return default_message


def get_params(name, instance, kwargs):
    instance = check_for_one_or_many(instance)
    if type(instance) == list or type(instance) == tuple:
        kwargs[f"{name}__in"] = instance
    elif type(instance) == str and instance.lower() in ["true", "false"]:
        kwargs[f"{name}"] = bool(instance.lower() == "true")
    else:
        kwargs[f"{name}"] = instance
    return kwargs


def check_for_one_or_many(instances):
    try:
        instance = ast.literal_eval(instances)
        return instance
    except Exception as e:
        print(e)
        return instances


def create_response(message, data=None, count=None):
    return {"message": message, "count": count, "data": data}


def get_end_date(months):
    current_datetime = timezone.now()
    end_date = current_datetime + relativedelta(months=months)
    return end_date

# def get_image_path(instance, filename, prefix_path):
#     ext = filename.split('.')[-1].lower()
#     new_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4()}"
#     # if instance.logo.content_type.startswith("application/") or
#     if ext in ['pdf', 'zip']:
#         return f'{prefix_path}/{new_filename}.{ext}'
#
#     # Load image
#     else:
#         if ext in ['heic', 'heif']:
#             heif_file = pyheif.read(instance.logo.read())
#             image = Image.frombytes(
#                 heif_file.mode,
#                 heif_file.size,
#                 heif_file.data,
#                 "raw",
#                 heif_file.mode,
#                 heif_file.stride
#             )
#         else:
#             image = Image.open(instance.logo)
#
#     image = image.convert("RGB")  # Ensure consistent format
#
#     # Compress image
#     output = BytesIO()
#     image.save(output, format="PNG", optimize=True)
#     size = output.tell()
#
#     if size > MAX_IMAGE_SIZE:
#         # Try reducing dimensions until under 1MB
#         width, height = image.size
#         while size > MAX_IMAGE_SIZE and (width > 100 or height > 100):
#             width = int(width * 0.9)
#             height = int(height * 0.9)
#             resized_image = image.resize((width, height), Image.LANCZOS)
#
#             output = BytesIO()
#             resized_image.save(output, format="PNG", optimize=True)
#             size = output.tell()
#
#         image = resized_image  # final resized image
#
#     # Save final image to memory
#     output.seek(0)
#     instance.logo = ContentFile(output.read(), name=f"{new_filename}.png")
#     return f'{prefix_path}/{new_filename}.png'
#


def get_doc_path(instance, filename, prefix_path):
    ext = filename.split('.')[-1].lower()
    new_filename = f"{filename.split('.')[0]}_{instance.uploaded_by_id}_{instance.business_id}_{datetime.now()}"

    if ext in ['pdf', 'zip']:
        return f'{prefix_path}/{new_filename}.{ext}'

    elif ext in ['heic', 'heif']:
        pass
        # heif_file = pyheif.read(instance.file.read())  # Read HEIC file
        # image = Image.frombytes(
        #     heif_file.mode,
        #     heif_file.size,
        #     heif_file.data,
        #     "raw",
        #     heif_file.mode,
        #     heif_file.stride
        # )
    # pyheif == 0.8
    # .0

    else:
        image = Image.open(instance.file)
    output = BytesIO()
    image.convert("RGB").save(output, format="JPEG")
    output.seek(0)

    instance.file = ContentFile(output.read(), name=f"{new_filename}.jpg")
    return f'{prefix_path}/{new_filename}.jpg'


def extract_permission_codes(objs):
    permissions = {}
    for permission in objs:
        permissions[permission.code_name] = True
    return permissions
