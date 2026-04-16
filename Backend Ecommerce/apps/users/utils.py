# import re

# def validate_password(s):
#     has_upper = any(char.isupper() for char in s)
#     has_digit = any(char.isdigit() for char in s)
#     has_special = bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", s))
#     return has_upper and has_digit and has_special



import re


def validate_password(s: str) -> bool:
    """
    Password must contain:
    - At least one uppercase letter
    - At least one digit
    - At least one special character
    """
    has_upper   = any(c.isupper() for c in s)
    has_digit   = any(c.isdigit() for c in s)
    has_special = bool(re.search(r'[!@#$%^&*(),.?\":{}|<>]', s))
    return has_upper and has_digit and has_special