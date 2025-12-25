import uuid
from django.db import models
from utils.reusable_classes import TimeStamps, TimeUserStamps
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from utils.validators import val_name, val_mobile, val_code_name
from utils.enums import *


class UserManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise ValueError('User must have a username.')
        user = self.model(
            username=username,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        user = self.create_user(
            username=username,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


def get_profile_image_path(self, filename):
    return f'profile_images/{self.pk}/{str(uuid.uuid4())}.png'


class User(AbstractBaseUser, TimeStamps):
    type_choices = (
        (CUSTOMER, CUSTOMER),
        (EMPLOYEE, EMPLOYEE),
    )
    username = models.CharField(max_length=100, unique=True)
    first_name = models.CharField(max_length=100, validators=[val_name])
    last_name = models.CharField(max_length=100, validators=[val_name])
    full_name = models.CharField(max_length=200, validators=[val_name], null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    mobile = models.CharField(max_length=35, validators=[val_mobile], null=True, blank=True)
    profile_image = models.ImageField(max_length=255, upload_to=get_profile_image_path, null=True, blank=True)
    login_attempts = models.IntegerField(default=0)
    is_blocked = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    password_link_token = models.CharField(max_length=255, null=True, blank=True)
    password_link_token_created_at = models.DateTimeField(null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    last_password_changed = models.DateTimeField(null=True, blank=True)
    role = models.ForeignKey('Role', related_name='role_users', blank=True, null=True, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=type_choices, default=CUSTOMER)
    activation_link_token = models.CharField(max_length=255, null=True, blank=True)
    activation_link_token_created_at = models.DateTimeField(null=True, blank=True)
    deactivated = models.BooleanField(default=False)
    password = models.CharField(max_length=128, null=True, blank=True)
    objects = UserManager()
    USERNAME_FIELD = 'username'

    def save(self, *args, **kwargs):
        self.email = self.username
        self.first_name = self.first_name.title()
        self.last_name = self.last_name.title()
        self.full_name = f'{self.first_name} {self.last_name}'
        return super().save(*args, **kwargs)

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def get_full_name(self):
        """Return the full name of the user."""
        return self.full_name or f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

class Role(TimeUserStamps):
    name = models.CharField(max_length=100, validators=[val_name])
    code_name = models.CharField(max_length=50, unique=True, validators=[val_code_name])
    permissions = models.ManyToManyField('Permission', related_name='+')
    description = models.CharField(max_length=250)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.title()
        return super().save(*args, **kwargs)


class Permission(models.Model):
    name = models.CharField(max_length=100, validators=[val_name])
    code_name = models.CharField(max_length=100, unique=True, validators=[val_code_name])
    module_name = models.CharField(max_length=100)
    module_label = models.CharField(max_length=100, null=True, blank=True)
    description = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class UserToken(TimeStamps):
    user = models.ForeignKey('User', on_delete=models.PROTECT, related_name="user_token")
    device_token = models.TextField(max_length=512, null=True, blank=True)


class Employee(TimeUserStamps):
    status_choices = (
        (INVITED, INVITED),
        (ACTIVE, ACTIVE),
        (DEACTIVATED, DEACTIVATED),
    )
    user = models.OneToOneField('User', on_delete=models.SET_NULL, related_name="user_employee", null=True, blank=True)
    status = models.CharField(max_length=20, choices=status_choices, default=INVITED)