import os
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from apps.users.models import User, Role, Permission
from django.contrib.auth.hashers import make_password
from config import settings
from apps.notification.models import EmailTemplate


def populate():
    permissions = Permission.objects.all()

    # ---- Create Super Role ----
    try:
        role = Role.objects.get(code_name='su')
        role.permissions.clear()
    except Role.DoesNotExist:
        role = Role.objects.create(name='Super', code_name='su')

    role.permissions.add(*permissions)
    role.save()

    # ---- Super Admin User ----
    try:
        s_user = User.objects.get(username='superuser')
    except User.DoesNotExist:
        s_user = User.objects.create_superuser(
            username="superuser",
            password="Admin@1234",
        )
        s_user.name = 'Super User'
        s_user.role = role
        s_user.save()

    s_user.is_active = True
    s_user.is_verified = True
    s_user.is_blocked = False
    s_user.save()

    # ---- Admin User ----
    try:
        admin = User.objects.get(username='syedjawadali92@gmail.com')
    except User.DoesNotExist:
        admin = User.objects.create(
            username="syedjawadali92@gmail.com",
            password=make_password("Admin@1234"),
            role=role,
            type='Employee',
        )
    admin.is_active = True
    admin.is_verified = True
    admin.is_blocked = False
    admin.save()

    # ---- Other Users (Optional) ----
    default_users = [
        ('nicenick1992@gmail.com', 'Jawad', 'Ali'),
    ]

    for username, first, last in default_users:
        User.objects.get_or_create(
            username=username,
            defaults={
                'password': make_password("Admin@1234"),
                'role': role,
                'first_name': first,
                'last_name': last,
                'type': 'Employee',
                'is_active': True,
                'is_blocked': False,
                'is_verified': True,
            },
        )


def email_templates():
    email_temp_dict = {
        "forget_password": "Forget Password",
        "user_invitation": "Invite Employee",
        "user_delete": "Delete Employee",
        "user_deactivated": "Deactivate Employee",
        "user_reactivated": "Reactivate Employee",
    }

    print("Updating Email Templates...")

    for key, value in email_temp_dict.items():
        file_path = os.path.join(settings.TEMPLATES[0]['DIRS'][0], "email", f"{key}.html")

        try:
            with open(file_path, "r", encoding="utf-8") as file:
                html_content = file.read()

            EmailTemplate.objects.update_or_create(
                code_name=key,
                defaults={
                    "name": key.replace("_", " ").title(),
                    "subject": value,
                    "alternative_text": value,
                    "html_template": html_content,
                }
            )

            print(f"✅ Updated: {key}")

        except FileNotFoundError:
            print(f"⚠ Template missing: {file_path}")


if __name__ == "__main__":
    print("🚀 Populating User, Role & Email Template Data...")
    populate()
    email_templates()
    print("✅ Done.")
