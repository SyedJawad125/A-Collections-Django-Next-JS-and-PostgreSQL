# import uuid
# from django.db import models
# from utils.reusable_classes import TimeStamps, TimeUserStamps
# from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
# from utils.validators import val_name, val_mobile, val_code_name
# from utils.enums import *


# class UserManager(BaseUserManager):
#     def create_user(self, username, password=None):
#         if not username:
#             raise ValueError('User must have a username.')
#         user = self.model(
#             username=username,
#         )
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, username, password):
#         user = self.create_user(
#             username=username,
#             password=password
#         )
#         user.is_staff = True
#         user.is_superuser = True
#         user.save(using=self._db)
#         return user


# def get_profile_image_path(self, filename):
#     return f'profile_images/{self.pk}/{str(uuid.uuid4())}.png'


# class User(AbstractBaseUser, TimeStamps):
#     type_choices = (
#         (CUSTOMER, CUSTOMER),
#         (EMPLOYEE, EMPLOYEE),
#     )
#     username = models.CharField(max_length=100, unique=True)
#     first_name = models.CharField(max_length=100, validators=[val_name])
#     last_name = models.CharField(max_length=100, validators=[val_name])
#     full_name = models.CharField(max_length=200, validators=[val_name], null=True, blank=True)
#     email = models.EmailField(max_length=100, null=True, blank=True)
#     mobile = models.CharField(max_length=35, validators=[val_mobile], null=True, blank=True)
#     profile_image = models.ImageField(max_length=255, upload_to=get_profile_image_path, null=True, blank=True)
#     login_attempts = models.IntegerField(default=0)
#     is_blocked = models.BooleanField(default=False)
#     is_staff = models.BooleanField(default=False)
#     is_superuser = models.BooleanField(default=False)
#     is_active = models.BooleanField(default=False)
#     is_verified = models.BooleanField(default=False)
    
#     # Legacy token-based fields (kept for backward compatibility)
#     password_link_token = models.CharField(max_length=255, null=True, blank=True)
#     password_link_token_created_at = models.DateTimeField(null=True, blank=True)
    
#     # ============================================================================
#     # NEW OTP FIELDS - ADD THESE THREE LINES TO YOUR EXISTING USER MODEL
#     # ============================================================================
#     password_reset_code = models.CharField(max_length=6, null=True, blank=True)
#     password_reset_code_created_at = models.DateTimeField(null=True, blank=True)
#     password_reset_verified = models.BooleanField(default=False)
#     # ============================================================================
    
#     address = models.CharField(max_length=255, null=True, blank=True)
#     last_password_changed = models.DateTimeField(null=True, blank=True)
#     role = models.ForeignKey('Role', related_name='role_users', blank=True, null=True, on_delete=models.CASCADE)
#     type = models.CharField(max_length=10, choices=type_choices, default=CUSTOMER)
#     activation_link_token = models.CharField(max_length=255, null=True, blank=True)
#     activation_link_token_created_at = models.DateTimeField(null=True, blank=True)
#     deactivated = models.BooleanField(default=False)
#     password = models.CharField(max_length=128, null=True, blank=True)
#     objects = UserManager()
#     USERNAME_FIELD = 'username'

#     def save(self, *args, **kwargs):
#         self.email = self.username
#         self.first_name = self.first_name.title()
#         self.last_name = self.last_name.title()
#         self.full_name = f'{self.first_name} {self.last_name}'
#         return super().save(*args, **kwargs)

#     def has_perm(self, perm, obj=None):
#         return self.is_superuser

#     def has_module_perms(self, app_label):
#         return self.is_superuser

#     def get_full_name(self):
#         """Return the full name of the user."""
#         return self.full_name or f"{self.first_name} {self.last_name}"
    
#     def get_short_name(self):
#         """Return the short name for the user."""
#         return self.first_name


# class Role(TimeUserStamps):
#     name = models.CharField(max_length=100, validators=[val_name])
#     code_name = models.CharField(max_length=50, unique=True, validators=[val_code_name])
#     permissions = models.ManyToManyField('Permission', related_name='+')
#     description = models.CharField(max_length=250)

#     def __str__(self):
#         return self.name

#     def save(self, *args, **kwargs):
#         self.name = self.name.title()
#         return super().save(*args, **kwargs)


# class Permission(models.Model):
#     name = models.CharField(max_length=100, validators=[val_name])
#     code_name = models.CharField(max_length=100, unique=True, validators=[val_code_name])
#     module_name = models.CharField(max_length=100)
#     module_label = models.CharField(max_length=100, null=True, blank=True)
#     description = models.CharField(max_length=200)

#     def __str__(self):
#         return self.name


# class UserToken(TimeStamps):
#     user = models.ForeignKey('User', on_delete=models.PROTECT, related_name="user_token")
#     device_token = models.TextField(max_length=512, null=True, blank=True)


# class Employee(TimeUserStamps):
#     status_choices = (
#         (INVITED, INVITED),
#         (ACTIVE, ACTIVE),
#         (DEACTIVATED, DEACTIVATED),
#     )
#     user = models.OneToOneField('User', on_delete=models.SET_NULL, related_name="user_employee", null=True, blank=True)
#     status = models.CharField(max_length=20, choices=status_choices, default=INVITED)




"""
E-commerce Models
Handles products, orders, inventory, reviews, cart, wishlist, payments and more.
"""

# Standard library imports
from decimal import Decimal

# Django core imports
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, RegexValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from utils.reusable_classes import TimeStamps, TimeUserStamps

User = get_user_model()


# ============================================================================
# PRODUCT MANAGEMENT MODELS
# ============================================================================

class Category(TimeUserStamps):
    """Product categories for organizing products"""
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image       = models.FileField(upload_to='ecom/category_images/', blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class ProductTag(TimeUserStamps):
    """Tags for product categorization and filtering"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Product(TimeUserStamps):
    """Main product model"""
    FOR_CHOICES = (
        ('Men',     'Men'),
        ('Women',   'Women'),
        ('Kids',    'Kids'),
        ('General', 'General'),
    )

    group       = models.CharField(max_length=20, choices=FOR_CHOICES, null=True, blank=True)
    name        = models.CharField(max_length=100)
    description = models.TextField()
    # FIX: Was PositiveIntegerField — loses decimal precision for currency
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    category    = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='products',
        null=True,
        blank=True
    )
    tags        = models.ManyToManyField(ProductTag, blank=True)
    is_active   = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    @property
    def product_images(self):
        return self.images.all()

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)


class ProductImage(TimeUserStamps):
    """Images associated with products"""
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    images   = models.ImageField(upload_to='ecom/product_images/')
    alt_text = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.product.name} - Image"


class Color(TimeUserStamps):
    """Available colors for product variants"""
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class ProductVariant(TimeUserStamps):
    """Handle product variations like size, color, material"""
    product          = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size             = models.CharField(max_length=20, blank=True, null=True)
    colors           = models.ManyToManyField(Color, blank=True, related_name="variants")
    material         = models.CharField(max_length=100, blank=True, null=True)
    sku              = models.CharField(max_length=100, unique=True, blank=True)
    stock_quantity   = models.PositiveIntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active        = models.BooleanField(default=True)

    class Meta:
        unique_together = ['product', 'size', 'material']

    def __str__(self):
        attributes = []
        if self.size:
            attributes.append(f"Size: {self.size}")
        if self.pk and self.colors.exists():
            attributes.append(f"Colors: {', '.join([c.name for c in self.colors.all()])}")
        if self.material:
            attributes.append(f"Material: {self.material}")
        return f"{self.product.name} - {', '.join(attributes)}" if attributes else f"{self.product.name} - Base Variant"

    def save(self, *args, **kwargs):
        if not self.sku:
            base_sku   = self.product.name.replace(' ', '').upper()[:6]
            attr_parts = []
            if self.size:
                attr_parts.append(self.size.upper())
            if self.material:
                attr_parts.append(self.material.upper()[:3])
            attr_str  = '-'.join(attr_parts) if attr_parts else 'BASE'
            self.sku  = f"{base_sku}-{attr_str}"
            counter   = 1
            original  = self.sku
            while ProductVariant.objects.filter(sku=self.sku).exclude(pk=self.pk).exists():
                self.sku = f"{original}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.product.price + self.additional_price


# ============================================================================
# INVENTORY MANAGEMENT
# ============================================================================

class Inventory(TimeUserStamps):
    """Track inventory levels and stock movements"""
    product_variant     = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='inventory')
    current_stock       = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=5)
    maximum_stock_level = models.PositiveIntegerField(default=1000)
    reorder_point       = models.PositiveIntegerField(default=10)
    cost_price          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_restocked      = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Inventories"

    def __str__(self):
        return f"Inventory for {self.product_variant.product.name} - Stock: {self.current_stock}"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.minimum_stock_level

    @property
    def needs_reorder(self):
        return self.current_stock <= self.reorder_point


# ============================================================================
# ADDRESS MODEL
# ============================================================================

class Address(TimeUserStamps):
    """Saved user addresses for delivery"""
    ADDRESS_TYPE = (
        ('home',  'Home'),
        ('work',  'Work'),
        ('other', 'Other'),
    )

    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label        = models.CharField(max_length=20, choices=ADDRESS_TYPE, default='home')
    full_name    = models.CharField(max_length=100)
    phone        = models.CharField(max_length=20)
    street       = models.TextField()
    city         = models.CharField(max_length=100)
    province     = models.CharField(max_length=100)
    postal_code  = models.CharField(max_length=20, blank=True, null=True)
    is_default   = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.full_name} - {self.city} ({self.label})"

    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


# ============================================================================
# SHIPPING METHOD
# ============================================================================

class ShippingMethod(TimeUserStamps):
    """Configurable shipping options"""
    name            = models.CharField(max_length=100)
    estimated_days  = models.PositiveIntegerField(help_text="Estimated delivery in days")
    cost            = models.DecimalField(max_digits=10, decimal_places=2)
    is_active       = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.estimated_days} days) - Rs.{self.cost}"


# ============================================================================
# COUPON / PROMO CODE
# ============================================================================

class Coupon(TimeUserStamps):
    """Discount coupons and promo codes"""
    TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('flat',       'Flat Amount'),
    )

    code              = models.CharField(max_length=50, unique=True)
    discount_type     = models.CharField(max_length=20, choices=TYPE_CHOICES)
    discount_value    = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses          = models.PositiveIntegerField(null=True, blank=True, help_text="Null = unlimited")
    used_count        = models.PositiveIntegerField(default=0)
    valid_from        = models.DateTimeField()
    valid_to          = models.DateTimeField()
    is_active         = models.BooleanField(default=True)
    applicable_products = models.ManyToManyField(Product, blank=True, help_text="Empty = applies to all products")

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.discount_value})"

    @property
    def is_exhausted(self):
        if self.max_uses is None:
            return False
        return self.used_count >= self.max_uses

    def calculate_discount(self, order_amount):
        """Returns the discount amount for a given order total"""
        if self.discount_type == 'percentage':
            return round(order_amount * (self.discount_value / 100), 2)
        return min(self.discount_value, order_amount)


# ============================================================================
# SALES & PROMOTIONS
# ============================================================================

class SalesProduct(TimeUserStamps):
    """Products on sale with discount pricing"""
    name             = models.CharField(max_length=100)
    description      = models.TextField()
    original_price   = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=0, default=0)
    final_price      = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True, blank=True)
    image            = models.FileField(upload_to='ecom/saleproduct_images/', blank=True, null=True)
    category         = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='sales_products',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name        = "Sales Product"
        verbose_name_plural = "Sales Products"

    def __str__(self):
        return f"{self.name} ({self.discount_percent}% off)"

    def clean(self):
        if self.discount_percent < 0 or self.discount_percent > 100:
            raise ValidationError("Discount percentage must be between 0 and 100")
        self.calculate_final_price()

    def calculate_final_price(self):
        if self.discount_percent > 0:
            discount_amount = self.original_price * (self.discount_percent / 100)
            self.final_price = self.original_price - discount_amount
        else:
            self.final_price = self.original_price

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def has_discount(self):
        return self.discount_percent > 0

    @property
    def discount_amount(self):
        return self.original_price - self.final_price if self.has_discount else Decimal('0.00')

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)


@receiver(pre_save, sender=SalesProduct)
def calculate_sales_product_final_price(sender, instance, **kwargs):
    instance.calculate_final_price()


class SalesProductImage(TimeUserStamps):
    """Images for sales products"""
    sale_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='images')
    images       = models.ImageField(upload_to='ecom/sale_product_images/')
    alt_text     = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.sale_product.name} - Sale Image"


# ============================================================================
# CART & CART ITEMS
# ============================================================================

class Cart(TimeUserStamps):
    """
    Shopping cart. Supports both authenticated users and guest sessions.
    Each user has exactly one active cart (OneToOneField).
    Guest users are tracked by session_key.
    """
    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart', null=True, blank=True)
    session_key = models.CharField(max_length=100, null=True, blank=True, help_text="Used for guest/unauthenticated users")

    def __str__(self):
        owner = self.user.get_full_name() if self.user else f"Guest ({self.session_key})"
        return f"Cart of {owner}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())


class CartItem(TimeUserStamps):
    """Individual items inside a cart"""
    cart            = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    sales_product   = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, null=True, blank=True)
    quantity        = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product_variant__isnull=False, sales_product__isnull=True) |
                    models.Q(product_variant__isnull=True,  sales_product__isnull=False)
                ),
                name='cartitem_product_or_salesproduct'
            )
        ]

    def __str__(self):
        item = self.product_variant or self.sales_product
        return f"{self.quantity}x {item} in cart #{self.cart.id}"

    def clean(self):
        if not self.product_variant and not self.sales_product:
            raise ValidationError("Either product_variant or sales_product must be set")
        if self.product_variant and self.sales_product:
            raise ValidationError("Cannot set both product_variant and sales_product")

    @property
    def unit_price(self):
        if self.product_variant:
            return self.product_variant.total_price
        return self.sales_product.final_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity


# ============================================================================
# WISHLIST
# ============================================================================

class Wishlist(TimeUserStamps):
    """User's saved/wishlist products. One wishlist per user."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')

    def __str__(self):
        return f"Wishlist of {self.user.get_full_name()}"


class WishlistItem(TimeUserStamps):
    """Individual items inside a wishlist"""
    wishlist      = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product       = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    sales_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, sales_product__isnull=True) |
                    models.Q(product__isnull=True,  sales_product__isnull=False)
                ),
                name='wishlistitem_product_or_salesproduct'
            )
        ]

    def __str__(self):
        item = self.product or self.sales_product
        return f"{item.name} in wishlist #{self.wishlist.id}"

    def clean(self):
        if not self.product and not self.sales_product:
            raise ValidationError("Either product or sales_product must be set")
        if self.product and self.sales_product:
            raise ValidationError("Cannot set both product and sales_product")


# ============================================================================
# ORDER MANAGEMENT
# ============================================================================

class Order(TimeUserStamps):
    """Customer orders"""
    STATUS_CHOICES = (
        ("pending",    "Pending"),
        ("booked",     "Booked"),
        ("in_process", "In Process"),
        ("delivered",  "Delivered"),
        ("cancelled",  "Cancelled"),
    )

    PAYMENT_CHOICES = (
        ("credit_card",       "Credit Card"),
        ("debit_card",        "Debit Card"),
        ("paypal",            "PayPal"),
        ("cash_on_delivery",  "Cash on Delivery"),
        ("jazzcash",          "JazzCash"),
        ("easypaisa",         "EasyPaisa"),
    )

    # Customer
    customer       = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='orders', null=True, blank=True)
    customer_name  = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)

    # Delivery
    address         = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    delivery_address = models.TextField(help_text="Snapshot of address at time of order")
    city            = models.CharField(max_length=100, null=True, blank=True)
    delivery_date   = models.DateField(null=True, blank=True)
    shipping_method = models.ForeignKey(ShippingMethod, on_delete=models.SET_NULL, null=True, blank=True)
    rider           = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_deliveries'
    )

    # Pricing
    # FIX: Was PositiveBigIntegerField — wrong type for currency
    subtotal         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bill             = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Final total (auto-calculated)")
    coupon           = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    # Status & Payment
    status         = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
    payment_status = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.status})"

    def calculate_bill(self):
        """Recalculate and save the final bill"""
        self.subtotal        = sum(d.total_price or 0 for d in self.order_details.all())
        self.shipping_cost   = self.shipping_method.cost if self.shipping_method else Decimal('0')
        self.bill            = self.subtotal + self.shipping_cost - self.discount_amount
        self.save(update_fields=['subtotal', 'shipping_cost', 'bill'])

    @property
    def total_amount(self):
        return self.subtotal + self.shipping_cost - self.discount_amount


class OrderDetail(TimeUserStamps):
    """Individual items in an order"""
    order         = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    product       = models.ForeignKey(Product, on_delete=models.SET_NULL, related_name='order_details', null=True, blank=True)
    sales_product = models.ForeignKey(SalesProduct, on_delete=models.SET_NULL, related_name='order_details', null=True, blank=True)
    # FIX: Was PositiveBigIntegerField — wrong type for currency
    unit_price    = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of purchase")
    quantity      = models.PositiveIntegerField(default=1)
    total_price   = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        verbose_name        = "Order Detail"
        verbose_name_plural = "Order Details"
        ordering            = ['-created_at']

    def __str__(self):
        product_name = self.product.name if self.product else (self.sales_product.name if self.sales_product else "Deleted Product")
        return f"Order #{self.order.id} - {self.quantity}x {product_name}"

    def clean(self):
        if not self.product and not self.sales_product:
            raise ValidationError("Either product or sales_product must be set")
        if self.product and self.sales_product:
            raise ValidationError("Cannot set both product and sales_product")
        if self.unit_price and self.quantity:
            self.total_price = self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ============================================================================
# PAYMENT / TRANSACTION
# ============================================================================

class Payment(TimeUserStamps):
    """
    Records actual payment transactions for an order.
    Separate from Order.payment_status to support full audit trail,
    refunds, and gateway response logging.
    """
    STATUS_CHOICES = (
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
        ('refunded',  'Refunded'),
    )

    order            = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    transaction_id   = models.CharField(max_length=200, unique=True, null=True, blank=True)
    amount           = models.DecimalField(max_digits=10, decimal_places=2)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_gateway  = models.CharField(max_length=50, help_text="e.g. stripe, jazzcash, easypaisa")
    gateway_response = models.JSONField(null=True, blank=True, help_text="Raw response from payment gateway")
    paid_at          = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} - {self.status} ({self.amount})"


# ============================================================================
# RETURN & REFUND
# ============================================================================

class ReturnRequest(TimeUserStamps):
    """Customer return/refund requests for delivered orders"""
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('approved',  'Approved'),
        ('rejected',  'Rejected'),
        ('completed', 'Completed'),
    )

    REASON_CHOICES = (
        ('damaged',         'Damaged'),
        ('wrong_item',      'Wrong Item'),
        ('not_as_described','Not as Described'),
        ('other',           'Other'),
    )

    order         = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns')
    order_detail  = models.ForeignKey(OrderDetail, on_delete=models.CASCADE, related_name='returns')
    reason        = models.CharField(max_length=50, choices=REASON_CHOICES)
    description   = models.TextField(blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reviewed_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_returns')

    def __str__(self):
        return f"Return #{self.id} for Order #{self.order.id} - {self.status}"


# ============================================================================
# CUSTOMER INTERACTION MODELS
# ============================================================================

class Contact(TimeUserStamps):
    """Contact form submissions"""
    alphabetic_validator = RegexValidator(
        regex=r'^[a-zA-Z]+( [a-zA-Z]+)*$',
        message='Only alphabetic characters and single spaces between words.',
        code='invalid_input'
    )
    phone_number_validator = RegexValidator(
        regex=r'^[\d\-\+\(\) ]+$',
        message='Phone number can only contain digits, spaces, dashes, parentheses, and plus.',
        code='invalid_phone_number'
    )

    name         = models.CharField(max_length=100, validators=[alphabetic_validator])
    email        = models.EmailField(validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, validators=[phone_number_validator])
    message      = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Contact from {self.name} ({self.email})"


class Review(TimeUserStamps):
    """Product and sales product reviews"""
    user          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    name          = models.CharField(max_length=100, blank=True)
    email         = models.EmailField(null=True, blank=True)
    rating        = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment       = models.TextField()
    product       = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    sales_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, sales_product__isnull=True) |
                    models.Q(product__isnull=True,  sales_product__isnull=False)
                ),
                name='review_for_product_or_salesproduct'
            )
        ]

    def __str__(self):
        reviewer = self.user.username if self.user else (self.name or "Anonymous")
        item     = self.product or self.sales_product
        return f"Review by {reviewer} for {item.name} ({self.rating}⭐)"

    @property
    def reviewed_item(self):
        return self.product or self.sales_product