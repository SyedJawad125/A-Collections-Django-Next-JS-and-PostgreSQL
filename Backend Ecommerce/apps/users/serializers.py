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


"""
E-commerce Serializers
Follows the same patterns as apps/users/serializers.py
"""

from rest_framework import serializers
from django.utils import timezone
from django.db import transaction

from .models import (
    Category, ProductTag, Product, ProductImage, Color, ProductVariant,
    Inventory, SalesProduct, SalesProductImage, ShippingMethod, Coupon,
    Cart, CartItem, Wishlist, WishlistItem, Address,
    Order, OrderDetail, Payment, ReturnRequest,
    Contact, Review,
)


# ============================================================================
# CATEGORY
# ============================================================================

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        exclude = ('deleted',)

    def validate_name(self, value):
        qs = Category.objects.filter(name__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Category with this name already exists")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
        data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None
        return data


class CategoryListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ('id', 'name', 'image')


# ============================================================================
# PRODUCT TAG
# ============================================================================

class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model   = ProductTag
        exclude = ('deleted',)

    def validate_name(self, value):
        qs = ProductTag.objects.filter(name__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Tag with this name already exists")
        return value


# ============================================================================
# COLOR
# ============================================================================

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Color
        exclude = ('deleted',)


# ============================================================================
# PRODUCT IMAGE
# ============================================================================

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ('id', 'images', 'alt_text')


# ============================================================================
# PRODUCT VARIANT
# ============================================================================

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model   = ProductVariant
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['colors']      = ColorSerializer(instance.colors.all(), many=True).data
        data['total_price'] = str(instance.total_price)
        return data


class ProductVariantListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductVariant
        fields = ('id', 'size', 'material', 'sku', 'stock_quantity', 'additional_price', 'is_active')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['colors']      = ColorSerializer(instance.colors.all(), many=True).data
        data['total_price'] = str(instance.total_price)
        return data


# ============================================================================
# PRODUCT
# ============================================================================

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Product
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category']       = CategoryListingSerializer(instance.category).data if instance.category else None
        data['tags']           = ProductTagSerializer(instance.tags.all(), many=True).data
        data['images']         = ProductImageSerializer(instance.images.all(), many=True).data
        data['variants']       = ProductVariantListingSerializer(instance.variants.filter(is_active=True, deleted=False), many=True).data
        data['average_rating'] = instance.average_rating
        data['created_by']     = instance.created_by.get_full_name() if instance.created_by else None
        data['updated_by']     = instance.updated_by.get_full_name() if instance.updated_by else None
        return data


class ProductListingSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing views"""
    class Meta:
        model  = Product
        fields = ('id', 'name', 'price', 'group', 'is_active', 'category')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category']       = CategoryListingSerializer(instance.category).data if instance.category else None
        data['average_rating'] = instance.average_rating
        # First image only for list views
        first_image = instance.images.first()
        data['image'] = ProductImageSerializer(first_image).data if first_image else None
        return data


# ============================================================================
# INVENTORY
# ============================================================================

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model   = Inventory
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['is_low_stock']  = instance.is_low_stock
        data['needs_reorder'] = instance.needs_reorder
        data['product_name']  = instance.product_variant.product.name
        data['sku']           = instance.product_variant.sku
        return data


# ============================================================================
# SALES PRODUCT
# ============================================================================

class SalesProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SalesProductImage
        fields = ('id', 'images', 'alt_text')


class SalesProductSerializer(serializers.ModelSerializer):
    class Meta:
        model   = SalesProduct
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category']        = CategoryListingSerializer(instance.category).data if instance.category else None
        data['images']          = SalesProductImageSerializer(instance.images.all(), many=True).data
        data['discount_amount'] = str(instance.discount_amount)
        data['has_discount']    = instance.has_discount
        data['average_rating']  = instance.average_rating
        data['created_by']      = instance.created_by.get_full_name() if instance.created_by else None
        data['updated_by']      = instance.updated_by.get_full_name() if instance.updated_by else None
        return data


class SalesProductListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SalesProduct
        fields = ('id', 'name', 'original_price', 'discount_percent', 'final_price', 'image')


# ============================================================================
# SHIPPING METHOD
# ============================================================================

class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model   = ShippingMethod
        exclude = ('deleted',)


# ============================================================================
# COUPON
# ============================================================================

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Coupon
        exclude = ('deleted',)

    def validate_code(self, value):
        qs = Coupon.objects.filter(code__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Coupon with this code already exists")
        return value.upper()

    def validate(self, attrs):
        if attrs.get('valid_from') and attrs.get('valid_to'):
            if attrs['valid_from'] >= attrs['valid_to']:
                raise serializers.ValidationError("valid_to must be after valid_from")
        if attrs.get('discount_type') == 'percentage':
            if attrs.get('discount_value', 0) > 100:
                raise serializers.ValidationError("Percentage discount cannot exceed 100")
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['is_exhausted'] = instance.is_exhausted
        data['created_by']   = instance.created_by.get_full_name() if instance.created_by else None
        return data


class ValidateCouponSerializer(serializers.Serializer):
    """Used to validate a coupon code against an order total"""
    code         = serializers.CharField(max_length=50, required=True)
    order_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)


# ============================================================================
# ADDRESS
# ============================================================================

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Address
        exclude = ('deleted',)
        read_only_fields = ('user',)

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


# ============================================================================
# CART & CART ITEMS
# ============================================================================

class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model   = CartItem
        exclude = ('deleted',)

    def validate(self, attrs):
        if not attrs.get('product_variant') and not attrs.get('sales_product'):
            raise serializers.ValidationError("Either product_variant or sales_product must be provided")
        if attrs.get('product_variant') and attrs.get('sales_product'):
            raise serializers.ValidationError("Cannot set both product_variant and sales_product")
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.product_variant:
            data['item_name']  = str(instance.product_variant)
            data['item_image'] = None
            first_image        = instance.product_variant.product.images.first()
            if first_image:
                data['item_image'] = ProductImageSerializer(first_image).data
        else:
            data['item_name']  = instance.sales_product.name
            data['item_image'] = str(instance.sales_product.image) if instance.sales_product.image else None
        data['unit_price'] = str(instance.unit_price)
        data['line_total'] = str(instance.line_total)
        return data


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model   = Cart
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['total_items'] = instance.total_items
        data['subtotal']    = str(instance.subtotal)
        return data


# ============================================================================
# WISHLIST
# ============================================================================

class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model   = WishlistItem
        exclude = ('deleted',)

    def validate(self, attrs):
        if not attrs.get('product') and not attrs.get('sales_product'):
            raise serializers.ValidationError("Either product or sales_product must be provided")
        if attrs.get('product') and attrs.get('sales_product'):
            raise serializers.ValidationError("Cannot set both product and sales_product")
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.product:
            data['item_name']  = instance.product.name
            data['item_price'] = str(instance.product.price)
        else:
            data['item_name']  = instance.sales_product.name
            data['item_price'] = str(instance.sales_product.final_price)
        return data


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model   = Wishlist
        exclude = ('deleted',)


# ============================================================================
# ORDER
# ============================================================================

class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model   = OrderDetail
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.product:
            data['product_name'] = instance.product.name
        elif instance.sales_product:
            data['product_name'] = instance.sales_product.name
        else:
            data['product_name'] = "Deleted Product"
        return data


class OrderSerializer(serializers.ModelSerializer):
    order_details = OrderDetailSerializer(many=True, read_only=True)

    class Meta:
        model   = Order
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['shipping_method'] = ShippingMethodSerializer(instance.shipping_method).data if instance.shipping_method else None
        data['total_amount']    = str(instance.total_amount)
        if instance.coupon:
            data['coupon_code'] = instance.coupon.code
        return data


class OrderListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Order
        fields = ('id', 'customer_name', 'customer_email', 'status', 'payment_method',
                  'payment_status', 'bill', 'created_at')


class CreateOrderFromCartSerializer(serializers.Serializer):
    """Converts a user's cart into an Order"""
    customer_name    = serializers.CharField(max_length=100)
    customer_email   = serializers.EmailField()
    customer_phone   = serializers.CharField(max_length=20)
    delivery_address = serializers.CharField()
    city             = serializers.CharField(max_length=100, required=False)
    address_id       = serializers.IntegerField(required=False, help_text="Use a saved address")
    shipping_method  = serializers.IntegerField(required=False)
    payment_method   = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES)
    coupon_code      = serializers.CharField(max_length=50, required=False)

    def validate_coupon_code(self, value):
        from django.utils import timezone as tz
        coupon = Coupon.objects.filter(code__iexact=value, deleted=False, is_active=True).first()
        if not coupon:
            raise serializers.ValidationError("Invalid or inactive coupon code")
        if tz.now() < coupon.valid_from or tz.now() > coupon.valid_to:
            raise serializers.ValidationError("Coupon is not valid at this time")
        if coupon.is_exhausted:
            raise serializers.ValidationError("Coupon usage limit has been reached")
        return value


# ============================================================================
# PAYMENT
# ============================================================================

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Payment
        exclude = ('deleted',)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['order_number'] = instance.order.id
        return data


# ============================================================================
# RETURN REQUEST
# ============================================================================

class ReturnRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model   = ReturnRequest
        exclude = ('deleted',)

    def validate(self, attrs):
        order = attrs.get('order') or (self.instance.order if self.instance else None)
        if order and order.status != 'delivered':
            raise serializers.ValidationError("Returns can only be requested for delivered orders")
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['order_number']  = instance.order.id
        data['product_name']  = str(instance.order_detail)
        data['reviewed_by']   = instance.reviewed_by.get_full_name() if instance.reviewed_by else None
        return data


# ============================================================================
# CONTACT & REVIEW
# ============================================================================

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Contact
        exclude = ('deleted',)


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Review
        exclude = ('deleted',)

    def validate(self, attrs):
        if not attrs.get('product') and not attrs.get('sales_product'):
            raise serializers.ValidationError("Either product or sales_product must be provided")
        if attrs.get('product') and attrs.get('sales_product'):
            raise serializers.ValidationError("Cannot set both product and sales_product")
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['reviewer'] = instance.user.get_full_name() if instance.user else (instance.name or "Anonymous")
        return data