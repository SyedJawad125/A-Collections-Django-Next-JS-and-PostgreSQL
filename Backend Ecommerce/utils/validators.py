import re
from django.core.validators import RegexValidator


val_name = RegexValidator(
            regex=r'^[A-Za-z\s]+$',
            message="Name can only contain alphabets and spaces.",
            code="invalid_name"
        )

val_mobile = RegexValidator(
            regex=r'^\+?[0-9 ]+$',
            message="Mobile number can only contain numbers and an optional leading '+'",
            code="invalid_mobile"
        )

val_code_name = RegexValidator(
            regex=r'^[A-Za-z_]+$',
            message="Code name can only contain alphabets and underscores (_).",
            code="invalid_code_name"
        )

val_num = RegexValidator(
            regex=r'^[0-9]+$',
            message="It can only contains numbers",
            code="invalid_code_name"
        )

val_business_name = RegexValidator(
    regex=r'^[A-Za-z0-9&\s]+$',
    message="Business Name can only contain alphabets, numbers, spaces, and '&' sign.",
    code="invalid_name"
)


val_long_lat = RegexValidator(
    regex=r'^-?[0-9]+(\.[0-9]+)?$',
    message="Longitude or Latitude must be a valid number and can only contain digits, a single optional leading '-', and one decimal point.",
    code="invalid_long_lat"
)

val_alpha_num = RegexValidator(
    regex=r'^[A-Za-z0-9\s]+$',
    message="Business Name can only contain alphabets, numbers and spaces.",
    code="invalid_name"
)


def clean_and_validate_mobile(mobile):
    # Remove all characters except digits and +
    mobile = re.sub(r"[^\d+]", "", mobile)
    # Validate: must start with optional + and then digits only
    if re.fullmatch(r"\+?\d{10,15}", mobile):
        return mobile
    else:
        raise ValueError("Invalid mobile number format")