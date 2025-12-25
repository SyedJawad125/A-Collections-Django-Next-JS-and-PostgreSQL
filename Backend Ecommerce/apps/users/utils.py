import re

def validate_password(s):
    has_upper = any(char.isupper() for char in s)
    has_digit = any(char.isdigit() for char in s)
    has_special = bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", s))
    return has_upper and has_digit and has_special