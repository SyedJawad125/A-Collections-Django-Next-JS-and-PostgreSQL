# """
# E-commerce Models
# Handles products, orders, inventory, reviews, cart, wishlist, address, payments, returns
# """

# from decimal import Decimal
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.core.validators import EmailValidator, RegexValidator
# from django.db.models.signals import pre_save
# from django.dispatch import receiver
# from django.contrib.auth import get_user_model

# from utils.reusable_classes import TimeStamps, TimeUserStamps

# User = get_user_model()


# # ============================================================================
# # CATEGORY
# # ============================================================================

# class Category(TimeUserStamps):
#     name        = models.CharField(max_length=100)
#     description = models.TextField(blank=True, null=True)
#     image       = models.FileField(upload_to='ecom/category_images/', blank=True, null=True)

#     class Meta:
#         verbose_name_plural = "Categories"

#     def __str__(self):
#         return self.name


# # ============================================================================
# # PRODUCT TAG
# # ============================================================================

# class ProductTag(TimeUserStamps):
#     name = models.CharField(max_length=50)
#     slug = models.SlugField(max_length=50)

#     def __str__(self):
#         return self.name


# # ============================================================================
# # PRODUCT
# # ============================================================================

# class Product(TimeUserStamps):
#     FOR_CHOICES = (
#         ('Men',     'Men'),
#         ('Women',   'Women'),
#         ('Kids',    'Kids'),
#         ('General', 'General'),
#     )

#     group             = models.CharField(max_length=20, choices=FOR_CHOICES, null=True, blank=True)
#     name              = models.CharField(max_length=100)
#     description       = models.TextField()
#     # FIX: was PositiveIntegerField — loses decimal precision for currency
#     price             = models.DecimalField(max_digits=10, decimal_places=2)
#     prod_has_category = models.ForeignKey(
#         Category,
#         on_delete=models.SET_NULL,   # FIX: was CASCADE — deleting category deleted all products
#         related_name='products',
#         null=True,
#         blank=True
#     )
#     tags = models.ManyToManyField(ProductTag, blank=True)

#     def __str__(self):
#         return self.name

#     @property
#     def product_images(self):
#         return self.images.filter(deleted=False)

#     @property
#     def average_rating(self):
#         reviews = self.reviews.filter(deleted=False)
#         if not reviews.exists():
#             return 0
#         return round(sum(r.rating for r in reviews) / reviews.count(), 1)


# class ProductImage(TimeUserStamps):
#     product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
#     images   = models.ImageField(upload_to='ecom/product_images_new/')
#     alt_text = models.CharField(max_length=100, blank=True)

#     def __str__(self):
#         return f"{self.product.name} - Image"


# # ============================================================================
# # COLOR
# # ============================================================================

# class Color(TimeUserStamps):
#     name = models.CharField(max_length=50)

#     def __str__(self):
#         return self.name


# # ============================================================================
# # PRODUCT VARIANT
# # ============================================================================

# class ProductVariant(TimeUserStamps):
#     product          = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
#     size             = models.CharField(max_length=20, blank=True, null=True)
#     colors           = models.ManyToManyField(Color, blank=True, related_name="variants")
#     material         = models.CharField(max_length=100, blank=True, null=True)
#     sku              = models.CharField(max_length=100, unique=True)
#     stock_quantity   = models.PositiveIntegerField(default=0)
#     additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
#     is_active        = models.BooleanField(default=True)

#     class Meta:
#         unique_together = ['product', 'size', 'material']

#     def __str__(self):
#         attributes = []
#         if self.size:
#             attributes.append(f"Size: {self.size}")
#         if self.pk and self.colors.exists():
#             attributes.append(f"Colors: {', '.join([c.name for c in self.colors.all()])}")
#         if self.material:
#             attributes.append(f"Material: {self.material}")
#         return f"{self.product.name} - {', '.join(attributes)}" if attributes else f"{self.product.name} - Base Variant"

#     def save(self, *args, **kwargs):
#         if not self.sku:
#             base_sku     = self.product.name.replace(' ', '').upper()[:6]
#             attr_parts   = []
#             if self.size:
#                 attr_parts.append(self.size.upper())
#             if self.material:
#                 attr_parts.append(self.material.upper()[:3])
#             attr_str     = '-'.join(attr_parts) if attr_parts else 'BASE'
#             self.sku     = f"{base_sku}-{attr_str}"
#             counter      = 1
#             original_sku = self.sku
#             while ProductVariant.objects.filter(sku=self.sku).exclude(pk=self.pk).exists():
#                 self.sku = f"{original_sku}-{counter}"
#                 counter += 1
#         super().save(*args, **kwargs)

#     @property
#     def total_price(self):
#         return self.product.price + self.additional_price


# # ============================================================================
# # INVENTORY
# # ============================================================================

# class Inventory(TimeUserStamps):
#     product_variant     = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='inventory')
#     current_stock       = models.PositiveIntegerField(default=0)
#     minimum_stock_level = models.PositiveIntegerField(default=5)
#     maximum_stock_level = models.PositiveIntegerField(default=1000)
#     reorder_point       = models.PositiveIntegerField(default=10)
#     cost_price          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     last_restocked      = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         verbose_name_plural = "Inventories"

#     def __str__(self):
#         return f"Inventory for {self.product_variant.product.name} - Stock: {self.current_stock}"

#     @property
#     def is_low_stock(self):
#         return self.current_stock <= self.minimum_stock_level

#     @property
#     def needs_reorder(self):
#         return self.current_stock <= self.reorder_point


# # ============================================================================
# # SALES PRODUCT
# # ============================================================================

# class SalesProduct(TimeUserStamps):
#     name             = models.CharField(max_length=100)
#     description      = models.TextField()
#     original_price   = models.DecimalField(max_digits=10, decimal_places=2)
#     discount_percent = models.DecimalField(max_digits=5, decimal_places=0, default=0)
#     final_price      = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True, blank=True)
#     image            = models.FileField(upload_to='ecom/saleproduct_images/', blank=True, null=True)
#     salesprod_has_category = models.ForeignKey(
#         Category,
#         on_delete=models.SET_NULL,   # FIX: was CASCADE
#         related_name='sales_products',
#         null=True,
#         blank=True
#     )

#     class Meta:
#         verbose_name        = "Sales Product"
#         verbose_name_plural = "Sales Products"

#     def __str__(self):
#         return f"{self.name} ({self.discount_percent}% off)"

#     def clean(self):
#         if self.discount_percent < 0 or self.discount_percent > 100:
#             raise ValidationError("Discount percentage must be between 0 and 100")
#         self.calculate_final_price()

#     def calculate_final_price(self):
#         if self.discount_percent > 0:
#             discount_amount  = self.original_price * (self.discount_percent / 100)
#             self.final_price = self.original_price - discount_amount
#         else:
#             self.final_price = self.original_price

#     def save(self, *args, **kwargs):
#         self.full_clean()
#         super().save(*args, **kwargs)

#     @property
#     def has_discount(self):
#         return self.discount_percent > 0

#     @property
#     def discount_amount(self):
#         return self.original_price - self.final_price if self.has_discount else Decimal('0.00')

#     @property
#     def average_rating(self):
#         reviews = self.reviews.filter(deleted=False)
#         if not reviews.exists():
#             return 0
#         return round(sum(r.rating for r in reviews) / reviews.count(), 1)


# @receiver(pre_save, sender=SalesProduct)
# def calculate_sales_product_final_price(sender, instance, **kwargs):
#     instance.calculate_final_price()


# class SalesProductImage(TimeUserStamps):
#     sale_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='images')
#     images       = models.ImageField(upload_to='ecom/sale_product_images/')
#     alt_text     = models.CharField(max_length=100, blank=True)

#     def __str__(self):
#         return f"{self.sale_product.name} - Sale Image"


# # ============================================================================
# # ADDRESS  ── NEW
# # ============================================================================

# class Address(TimeUserStamps):
#     """
#     Saved delivery addresses per user.
#     When an order is placed, the address text is snapshotted onto Order.delivery_address
#     so historical orders are never affected by address edits/deletions.
#     """
#     ADDRESS_TYPE = (
#         ('home',  'Home'),
#         ('work',  'Work'),
#         ('other', 'Other'),
#     )

#     user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
#     label       = models.CharField(max_length=20, choices=ADDRESS_TYPE, default='home')
#     full_name   = models.CharField(max_length=100)
#     phone       = models.CharField(max_length=20)
#     street      = models.TextField()
#     city        = models.CharField(max_length=100)
#     province    = models.CharField(max_length=100)
#     postal_code = models.CharField(max_length=20, blank=True, null=True)
#     is_default  = models.BooleanField(default=False)

#     class Meta:
#         verbose_name_plural = "Addresses"

#     def __str__(self):
#         return f"{self.full_name} - {self.city} ({self.label})"

#     def save(self, *args, **kwargs):
#         # Ensure only one default address per user at a time
#         if self.is_default:
#             Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
#         super().save(*args, **kwargs)


# # ============================================================================
# # SHIPPING METHOD  ── NEW
# # ============================================================================

# class ShippingMethod(TimeUserStamps):
#     """
#     Admin-configurable shipping options displayed at checkout.
#     e.g. "Standard Delivery (3 days) – Rs.200" or "Express (1 day) – Rs.500"
#     """
#     name           = models.CharField(max_length=100)
#     estimated_days = models.PositiveIntegerField(help_text="Estimated delivery in days")
#     cost           = models.DecimalField(max_digits=10, decimal_places=2)
#     is_active      = models.BooleanField(default=True)

#     def __str__(self):
#         return f"{self.name} ({self.estimated_days} days) - Rs.{self.cost}"


# # ============================================================================
# # COUPON  ── NEW
# # ============================================================================

# class Coupon(TimeUserStamps):
#     """
#     Discount coupons / promo codes.
#     Supports percentage discounts (e.g. 10%) and flat discounts (e.g. Rs.200 off).
#     Can be restricted to specific products or applied to all products (empty M2M).
#     """
#     TYPE_CHOICES = (
#         ('percentage', 'Percentage'),
#         ('flat',       'Flat Amount'),
#     )

#     code             = models.CharField(max_length=50, unique=True)
#     discount_type    = models.CharField(max_length=20, choices=TYPE_CHOICES)
#     discount_value   = models.DecimalField(max_digits=10, decimal_places=2)
#     min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
#                                            help_text="Minimum cart total to apply this coupon")
#     max_uses         = models.PositiveIntegerField(null=True, blank=True,
#                                                     help_text="Leave blank for unlimited uses")
#     used_count       = models.PositiveIntegerField(default=0)
#     valid_from       = models.DateTimeField()
#     valid_to         = models.DateTimeField()
#     is_active        = models.BooleanField(default=True)
#     applicable_products = models.ManyToManyField(
#         Product, blank=True, help_text="Leave empty to apply to all products"
#     )

#     def __str__(self):
#         return f"{self.code} ({self.discount_type}: {self.discount_value})"

#     @property
#     def is_exhausted(self):
#         if self.max_uses is None:
#             return False
#         return self.used_count >= self.max_uses

#     def calculate_discount(self, order_amount):
#         """Returns the discount rupee amount for a given order subtotal."""
#         if self.discount_type == 'percentage':
#             return round(Decimal(str(order_amount)) * (self.discount_value / 100), 2)
#         return min(self.discount_value, Decimal(str(order_amount)))


# # ============================================================================
# # ORDER
# # ============================================================================

# class Order(TimeUserStamps):
#     STATUS_CHOICES = (
#         ("pending",    "Pending"),
#         ("booked",     "Booked"),
#         ("in_process", "In Process"),
#         ("delivered",  "Delivered"),
#         ("cancelled",  "Cancelled"),
#     )
#     PAYMENT_CHOICES = (
#         ("credit_card",      "Credit Card"),
#         ("debit_card",       "Debit Card"),
#         ("paypal",           "PayPal"),
#         ("cash_on_delivery", "Cash on Delivery"),
#         ("jazzcash",         "JazzCash"),
#         ("easypaisa",        "EasyPaisa"),
#     )

#     # Customer
#     customer       = models.ForeignKey(
#         User, on_delete=models.SET_NULL, related_name='orders', null=True, blank=True  # FIX: was CASCADE
#     )
#     customer_name  = models.CharField(max_length=100)
#     customer_email = models.EmailField()
#     customer_phone = models.CharField(max_length=20)

#     # Delivery
#     address          = models.ForeignKey(
#         Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
#     )
#     delivery_address = models.TextField(help_text="Snapshot of address at time of order")
#     city             = models.CharField(max_length=100, null=True, blank=True)
#     delivery_date    = models.DateField(null=True, blank=True)
#     shipping_method  = models.ForeignKey(ShippingMethod, on_delete=models.SET_NULL, null=True, blank=True)
#     rider            = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_deliveries'
#     )

#     # Pricing  — FIX: was PositiveBigIntegerField
#     subtotal        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
#     shipping_cost   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     bill            = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
#                                           help_text="Final total = subtotal + shipping - discount")
#     coupon          = models.ForeignKey(
#         Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
#     )

#     # Status & Payment
#     status         = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
#     payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
#     payment_status = models.BooleanField(default=False)

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"Order #{self.id} - {self.customer_name} ({self.status})"

#     @property
#     def total_amount(self):
#         return sum(detail.total_price or 0 for detail in self.order_details.filter(deleted=False))


# class OrderDetail(TimeUserStamps):
#     order         = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
#     product       = models.ForeignKey(
#         Product, on_delete=models.SET_NULL, related_name='order_details', null=True, blank=True  # FIX: was CASCADE
#     )
#     sales_product = models.ForeignKey(
#         SalesProduct, on_delete=models.SET_NULL, related_name='order_details', null=True, blank=True  # FIX: was CASCADE
#     )
#     # FIX: was PositiveBigIntegerField
#     unit_price  = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of purchase")
#     quantity    = models.PositiveIntegerField(default=1)
#     total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

#     class Meta:
#         verbose_name        = "Order Detail"
#         verbose_name_plural = "Order Details"
#         ordering            = ['-created_at']

#     def __str__(self):
#         name = (
#             self.product.name if self.product
#             else (self.sales_product.name if self.sales_product else "Deleted Product")
#         )
#         return f"Order #{self.order.id} - {self.quantity}x {name}"

#     def clean(self):
#         if not self.product and not self.sales_product:
#             raise ValidationError("Either product or sales_product must be set")
#         if self.product and self.sales_product:
#             raise ValidationError("Cannot set both product and sales_product")
#         if self.unit_price and self.quantity:
#             self.total_price = self.unit_price * self.quantity

#     def save(self, *args, **kwargs):
#         self.full_clean()
#         super().save(*args, **kwargs)


# # ============================================================================
# # PAYMENT  ── NEW
# # ============================================================================

# class Payment(TimeUserStamps):
#     """
#     Full payment transaction record for an order.
#     Separate from Order.payment_status to support audit trail,
#     gateway response logging, and refund tracking.
#     """
#     STATUS_CHOICES = (
#         ('pending',   'Pending'),
#         ('completed', 'Completed'),
#         ('failed',    'Failed'),
#         ('refunded',  'Refunded'),
#     )

#     order            = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
#     transaction_id   = models.CharField(max_length=200, unique=True, null=True, blank=True)
#     amount           = models.DecimalField(max_digits=10, decimal_places=2)
#     status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     payment_gateway  = models.CharField(max_length=50, help_text="e.g. stripe, jazzcash, easypaisa")
#     gateway_response = models.JSONField(null=True, blank=True, help_text="Raw gateway JSON response")
#     paid_at          = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         return f"Payment for Order #{self.order.id} - {self.status} ({self.amount})"


# # ============================================================================
# # CART & CART ITEM  ── NEW
# # ============================================================================

# class Cart(TimeUserStamps):
#     """
#     Shopping cart — one per authenticated user (OneToOne).
#     session_key enables guest / unauthenticated carts.
#     Cart is cleared automatically when an Order is successfully placed.
#     """
#     user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart', null=True, blank=True)
#     session_key = models.CharField(max_length=100, null=True, blank=True,
#                                    help_text="Used for guest/unauthenticated users")

#     def __str__(self):
#         owner = self.user.get_full_name() if self.user else f"Guest ({self.session_key})"
#         return f"Cart of {owner}"

#     @property
#     def total_items(self):
#         return sum(item.quantity for item in self.items.filter(deleted=False))

#     @property
#     def subtotal(self):
#         return sum(item.line_total for item in self.items.filter(deleted=False))


# class CartItem(TimeUserStamps):
#     """
#     One line inside a Cart.
#     Must reference either a ProductVariant OR a SalesProduct — never both.
#     Adding the same item again increments quantity (handled in the view).
#     """
#     cart            = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
#     product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
#     sales_product   = models.ForeignKey(SalesProduct,   on_delete=models.CASCADE, null=True, blank=True)
#     quantity        = models.PositiveIntegerField(default=1)

#     class Meta:
#         constraints = [
#             models.CheckConstraint(
#                 check=(
#                     models.Q(product_variant__isnull=False, sales_product__isnull=True) |
#                     models.Q(product_variant__isnull=True,  sales_product__isnull=False)
#                 ),
#                 name='cartitem_variant_or_salesproduct'
#             )
#         ]

#     def __str__(self):
#         item = self.product_variant or self.sales_product
#         return f"{self.quantity}x {item} in cart #{self.cart.id}"

#     def clean(self):
#         if not self.product_variant and not self.sales_product:
#             raise ValidationError("Either product_variant or sales_product must be set")
#         if self.product_variant and self.sales_product:
#             raise ValidationError("Cannot set both product_variant and sales_product")

#     @property
#     def unit_price(self):
#         if self.product_variant:
#             return self.product_variant.total_price
#         return self.sales_product.final_price

#     @property
#     def line_total(self):
#         return self.unit_price * self.quantity


# # ============================================================================
# # WISHLIST  ── NEW
# # ============================================================================

# class Wishlist(TimeUserStamps):
#     """One wishlist per user. Items are saved products they want to buy later."""
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')

#     def __str__(self):
#         return f"Wishlist of {self.user.get_full_name()}"


# class WishlistItem(TimeUserStamps):
#     wishlist      = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
#     product       = models.ForeignKey(Product,      on_delete=models.CASCADE, null=True, blank=True)
#     sales_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, null=True, blank=True)

#     class Meta:
#         constraints = [
#             models.CheckConstraint(
#                 check=(
#                     models.Q(product__isnull=False, sales_product__isnull=True) |
#                     models.Q(product__isnull=True,  sales_product__isnull=False)
#                 ),
#                 name='wishlistitem_product_or_salesproduct'
#             )
#         ]

#     def __str__(self):
#         item = self.product or self.sales_product
#         return f"{item.name} in wishlist #{self.wishlist.id}"

#     def clean(self):
#         if not self.product and not self.sales_product:
#             raise ValidationError("Either product or sales_product must be set")
#         if self.product and self.sales_product:
#             raise ValidationError("Cannot set both product and sales_product")


# # ============================================================================
# # RETURN REQUEST  ── NEW
# # ============================================================================

# class ReturnRequest(TimeUserStamps):
#     """
#     Customer return / refund request for a delivered order item.
#     Admin reviews and approves or rejects.
#     Only allowed when order.status == 'delivered'.
#     """
#     STATUS_CHOICES = (
#         ('requested', 'Requested'),
#         ('approved',  'Approved'),
#         ('rejected',  'Rejected'),
#         ('completed', 'Completed'),
#     )
#     REASON_CHOICES = (
#         ('damaged',          'Damaged'),
#         ('wrong_item',       'Wrong Item'),
#         ('not_as_described', 'Not as Described'),
#         ('other',            'Other'),
#     )

#     order         = models.ForeignKey(Order,       on_delete=models.CASCADE, related_name='returns')
#     order_detail  = models.ForeignKey(OrderDetail, on_delete=models.CASCADE, related_name='returns')
#     reason        = models.CharField(max_length=50, choices=REASON_CHOICES)
#     description   = models.TextField(blank=True)
#     status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
#     refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     reviewed_by   = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_returns'
#     )

#     def __str__(self):
#         return f"Return #{self.id} for Order #{self.order.id} - {self.status}"


# # ============================================================================
# # CONTACT
# # ============================================================================

# class Contact(TimeUserStamps):
#     alphabetic_validator = RegexValidator(
#         regex=r'^[a-zA-Z]+( [a-zA-Z]+)*$',
#         message='Only alphabetic characters and single spaces between words.',
#         code='invalid_input'
#     )
#     phone_number_validator = RegexValidator(
#         regex=r'^[\d\-\+\(\) ]+$',
#         message='Phone number can only contain digits, spaces, dashes, parentheses and plus.',
#         code='invalid_phone_number'
#     )

#     name         = models.CharField(max_length=100, validators=[alphabetic_validator])
#     email        = models.EmailField(unique=False, validators=[EmailValidator()])
#     phone_number = models.CharField(max_length=20, validators=[phone_number_validator])
#     message      = models.TextField(null=True, blank=True)

#     def __str__(self):
#         return f"Contact from {self.name} ({self.email})"


# # ============================================================================
# # REVIEW
# # ============================================================================

# class Review(TimeUserStamps):
#     user          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
#     name          = models.CharField(max_length=100, blank=True)
#     email         = models.EmailField(unique=False, null=True, blank=True)
#     rating        = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
#     comment       = models.TextField()
#     product       = models.ForeignKey(Product,      on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
#     sales_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)

#     class Meta:
#         ordering = ['-created_at']
#         constraints = [
#             models.CheckConstraint(
#                 check=(
#                     models.Q(product__isnull=False, sales_product__isnull=True) |
#                     models.Q(product__isnull=True,  sales_product__isnull=False)
#                 ),
#                 name='review_for_product_or_salesproduct'
#             )
#         ]

#     def __str__(self):
#         reviewer = self.user.username if self.user else (self.name or "Anonymous")
#         item     = self.product or self.sales_product
#         return f"Review by {reviewer} for {item.name} ({self.rating}⭐)"

#     @property
#     def reviewed_item(self):
#         return self.product or self.sales_product







"""
E-commerce Models
Handles products, orders, inventory, reviews, cart, wishlist, address, payments, returns

FIXES applied in this pass (search "FIX:" for each):
1. ProductVariant no longer enforces (product, size, material) uniqueness at the
   DB level, because that constraint ignores `deleted=True` rows and permanently
   blocks recreating a variant after a soft delete. Uniqueness is now enforced in
   the serializer against non-deleted rows only (see serializers.py).
2. Coupon.code drops DB-level unique=True for the same reason — a soft-deleted
   coupon code was blocking reuse forever. Enforced in the serializer instead.
3. ReturnRequest.clean() now verifies order_detail actually belongs to order,
   so a return can't be filed referencing a mismatched order/order_detail pair.
4. Cart.total_items / Cart.subtotal always return a real value (0 / Decimal('0.00'))
   instead of relying on Python's sum() default which can differ in type.
"""

from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, RegexValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from utils.reusable_classes import TimeStamps, TimeUserStamps

User = get_user_model()


# ============================================================================
# CATEGORY
# ============================================================================

class Category(TimeUserStamps):
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image       = models.FileField(upload_to='ecom/category_images/', blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


# ============================================================================
# PRODUCT TAG
# ============================================================================

class ProductTag(TimeUserStamps):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50)

    def __str__(self):
        return self.name


# ============================================================================
# PRODUCT
# ============================================================================

class Product(TimeUserStamps):
    FOR_CHOICES = (
        ('Men',     'Men'),
        ('Women',   'Women'),
        ('Kids',    'Kids'),
        ('General', 'General'),
    )

    group             = models.CharField(max_length=20, choices=FOR_CHOICES, null=True, blank=True)
    name              = models.CharField(max_length=100)
    description       = models.TextField()
    price             = models.DecimalField(max_digits=10, decimal_places=2)
    prod_has_category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='products',
        null=True,
        blank=True
    )
    tags = models.ManyToManyField(ProductTag, blank=True)

    def __str__(self):
        return self.name

    @property
    def product_images(self):
        return self.images.filter(deleted=False)

    @property
    def average_rating(self):
        reviews = self.reviews.filter(deleted=False)
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)


class ProductImage(TimeUserStamps):
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    images   = models.ImageField(upload_to='ecom/product_images_new/')
    alt_text = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.product.name} - Image"


# ============================================================================
# COLOR
# ============================================================================

class Color(TimeUserStamps):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


# ============================================================================
# PRODUCT VARIANT
# ============================================================================

class ProductVariant(TimeUserStamps):
    product          = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size             = models.CharField(max_length=20, blank=True, null=True)
    colors           = models.ManyToManyField(Color, blank=True, related_name="variants")
    material         = models.CharField(max_length=100, blank=True, null=True)
    sku              = models.CharField(max_length=100, unique=True)
    stock_quantity   = models.PositiveIntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active        = models.BooleanField(default=True)

    class Meta:
        # FIX: removed `unique_together = ['product', 'size', 'material']`.
        # That constraint ignored `deleted=True`, so once a variant with a
        # given (product, size, material) was soft-deleted, the exact same
        # combination could never be created again — the DB would reject the
        # insert before any application code ran. Uniqueness among *active*
        # (non-deleted) variants is now enforced in
        # ProductVariantSerializer.validate() instead.
        pass

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
            base_sku     = self.product.name.replace(' ', '').upper()[:6]
            attr_parts   = []
            if self.size:
                attr_parts.append(self.size.upper())
            if self.material:
                attr_parts.append(self.material.upper()[:3])
            attr_str     = '-'.join(attr_parts) if attr_parts else 'BASE'
            self.sku     = f"{base_sku}-{attr_str}"
            counter      = 1
            original_sku = self.sku
            while ProductVariant.objects.filter(sku=self.sku).exclude(pk=self.pk).exists():
                self.sku = f"{original_sku}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.product.price + self.additional_price


# ============================================================================
# INVENTORY
# ============================================================================

class Inventory(TimeUserStamps):
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
# SALES PRODUCT
# ============================================================================

class SalesProduct(TimeUserStamps):
    name             = models.CharField(max_length=100)
    description      = models.TextField()
    original_price   = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=0, default=0)
    final_price      = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True, blank=True)
    image            = models.FileField(upload_to='ecom/saleproduct_images/', blank=True, null=True)
    salesprod_has_category = models.ForeignKey(
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
            discount_amount  = self.original_price * (self.discount_percent / 100)
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
        reviews = self.reviews.filter(deleted=False)
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)


@receiver(pre_save, sender=SalesProduct)
def calculate_sales_product_final_price(sender, instance, **kwargs):
    instance.calculate_final_price()


class SalesProductImage(TimeUserStamps):
    sale_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='images')
    images       = models.ImageField(upload_to='ecom/sale_product_images/')
    alt_text     = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.sale_product.name} - Sale Image"

# ============================================================================
# COLOR
# ============================================================================

class SalesProductColor(TimeUserStamps):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


# ============================================================================
# PRODUCT VARIANT
# ============================================================================

class SalesProductVariant(TimeUserStamps):
    salesproduct     = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='salesvariants')
    size             = models.CharField(max_length=20, blank=True, null=True)
    colors           = models.ManyToManyField(Color, blank=True, related_name="variants")
    material         = models.CharField(max_length=100, blank=True, null=True)
    sku              = models.CharField(max_length=100, unique=True)
    stock_quantity   = models.PositiveIntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active        = models.BooleanField(default=True)

    class Meta:
        # FIX: removed `unique_together = ['product', 'size', 'material']`.
        # That constraint ignored `deleted=True`, so once a variant with a
        # given (product, size, material) was soft-deleted, the exact same
        # combination could never be created again — the DB would reject the
        # insert before any application code ran. Uniqueness among *active*
        # (non-deleted) variants is now enforced in
        # ProductVariantSerializer.validate() instead.
        pass

    def __str__(self):
        attributes = []
        if self.size:
            attributes.append(f"Size: {self.size}")
        if self.pk and self.colors.exists():
            attributes.append(f"Colors: {', '.join([c.name for c in self.colors.all()])}")
        if self.material:
            attributes.append(f"Material: {self.material}")
        return f"{self.salesproduct.name} - {', '.join(attributes)}" if attributes else f"{self.salesproduct.name} - Base Variant"

    def save(self, *args, **kwargs):
        if not self.sku:
            base_sku     = self.salesproduct.name.replace(' ', '').upper()[:6]
            attr_parts   = []
            if self.size:
                attr_parts.append(self.size.upper())
            if self.material:
                attr_parts.append(self.material.upper()[:3])
            attr_str     = '-'.join(attr_parts) if attr_parts else 'BASE'
            self.sku     = f"{base_sku}-{attr_str}"
            counter      = 1
            original_sku = self.sku
            while ProductVariant.objects.filter(sku=self.sku).exclude(pk=self.pk).exists():
                self.sku = f"{original_sku}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.salesproduct.price + self.additional_price


# ============================================================================
# INVENTORY
# ============================================================================

class SalesInventory(TimeUserStamps):
    sales_product_variant = models.OneToOneField(SalesProductVariant, on_delete=models.CASCADE, related_name='salesinventory')
    current_stock       = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=5)
    maximum_stock_level = models.PositiveIntegerField(default=1000)
    reorder_point       = models.PositiveIntegerField(default=10)
    cost_price          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_restocked      = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Sales Inventories"

    def __str__(self):
        return f"Inventory for {self.sales_product_variant.salesproduct.name} - Stock: {self.current_stock}"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.minimum_stock_level

    @property
    def needs_reorder(self):
        return self.current_stock <= self.reorder_point

# ============================================================================
# ADDRESS
# ============================================================================

class Address(TimeUserStamps):
    """
    Saved delivery addresses per user.
    When an order is placed, the address text is snapshotted onto Order.delivery_address
    so historical orders are never affected by address edits/deletions.
    """
    ADDRESS_TYPE = (
        ('home',  'Home'),
        ('work',  'Work'),
        ('other', 'Other'),
    )

    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label       = models.CharField(max_length=20, choices=ADDRESS_TYPE, default='home')
    full_name   = models.CharField(max_length=100)
    phone       = models.CharField(max_length=20)
    street      = models.TextField()
    city        = models.CharField(max_length=100)
    province    = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    is_default  = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.full_name} - {self.city} ({self.label})"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


# ============================================================================
# SHIPPING METHOD
# ============================================================================

class ShippingMethod(TimeUserStamps):
    name           = models.CharField(max_length=100)
    estimated_days = models.PositiveIntegerField(help_text="Estimated delivery in days")
    cost           = models.DecimalField(max_digits=10, decimal_places=2)
    is_active      = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.estimated_days} days) - Rs.{self.cost}"


# ============================================================================
# COUPON
# ============================================================================

class Coupon(TimeUserStamps):
    """
    Discount coupons / promo codes.
    Supports percentage discounts (e.g. 10%) and flat discounts (e.g. Rs.200 off).
    Can be restricted to specific products or applied to all products (empty M2M).
    """
    TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('flat',       'Flat Amount'),
    )

    # FIX: dropped `unique=True` at the DB level. A soft-deleted coupon kept
    # its row (deleted=True) and the unique index blocked ever reusing that
    # code again. Uniqueness among non-deleted coupons is enforced in
    # CouponSerializer.validate_code().
    code             = models.CharField(max_length=50, db_index=True)
    discount_type    = models.CharField(max_length=20, choices=TYPE_CHOICES)
    discount_value   = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                           help_text="Minimum cart total to apply this coupon")
    max_uses         = models.PositiveIntegerField(null=True, blank=True,
                                                    help_text="Leave blank for unlimited uses")
    used_count       = models.PositiveIntegerField(default=0)
    valid_from       = models.DateTimeField()
    valid_to         = models.DateTimeField()
    is_active        = models.BooleanField(default=True)
    applicable_products = models.ManyToManyField(
        Product, blank=True, help_text="Leave empty to apply to all products"
    )

    def __str__(self):
        return f"{self.code} ({self.discount_type}: {self.discount_value})"

    @property
    def is_exhausted(self):
        if self.max_uses is None:
            return False
        return self.used_count >= self.max_uses

    def calculate_discount(self, order_amount):
        """Returns the discount rupee amount for a given order subtotal."""
        if self.discount_type == 'percentage':
            return round(Decimal(str(order_amount)) * (self.discount_value / 100), 2)
        return min(self.discount_value, Decimal(str(order_amount)))


# ============================================================================
# ORDER
# ============================================================================

class Order(TimeUserStamps):
    STATUS_CHOICES = (
        ("pending",    "Pending"),
        ("booked",     "Booked"),
        ("in_process", "In Process"),
        ("delivered",  "Delivered"),
        ("cancelled",  "Cancelled"),
    )
    PAYMENT_CHOICES = (
        ("credit_card",      "Credit Card"),
        ("debit_card",       "Debit Card"),
        ("paypal",           "PayPal"),
        ("cash_on_delivery", "Cash on Delivery"),
        ("jazzcash",         "JazzCash"),
        ("easypaisa",        "EasyPaisa"),
    )

    customer       = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name='orders', null=True, blank=True
    )
    customer_name  = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)

    address          = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    delivery_address = models.TextField(help_text="Snapshot of address at time of order")
    city             = models.CharField(max_length=100, null=True, blank=True)
    delivery_date    = models.DateField(null=True, blank=True)
    shipping_method  = models.ForeignKey(ShippingMethod, on_delete=models.SET_NULL, null=True, blank=True)
    rider            = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_deliveries'
    )

    subtotal        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bill            = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True,
                                          help_text="Final total = subtotal + shipping - discount")
    coupon          = models.ForeignKey(
        Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )

    status         = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
    payment_status = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.status})"

    @property
    def total_amount(self):
        return sum(detail.total_price or 0 for detail in self.order_details.filter(deleted=False))


class OrderDetail(TimeUserStamps):
    order         = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    product       = models.ForeignKey(
        Product, on_delete=models.SET_NULL, related_name='order_details', null=True, blank=True
    )
    sales_product = models.ForeignKey(
        SalesProduct, on_delete=models.SET_NULL, related_name='order_details', null=True, blank=True
    )
    unit_price  = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at time of purchase")
    quantity    = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        verbose_name        = "Order Detail"
        verbose_name_plural = "Order Details"
        ordering            = ['-created_at']

    def __str__(self):
        name = (
            self.product.name if self.product
            else (self.sales_product.name if self.sales_product else "Deleted Product")
        )
        return f"Order #{self.order.id} - {self.quantity}x {name}"

    def clean(self):
        if not self.product and not self.sales_product:
            raise ValidationError("Either product or sales_product must be set")
        if self.product and self.sales_product:
            raise ValidationError("Cannot set both product and sales_product")
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1")
        if self.unit_price and self.quantity:
            self.total_price = self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# ============================================================================
# PAYMENT
# ============================================================================

class Payment(TimeUserStamps):
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
    gateway_response = models.JSONField(null=True, blank=True, help_text="Raw gateway JSON response")
    paid_at          = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} - {self.status} ({self.amount})"


# ============================================================================
# CART & CART ITEM
# ============================================================================

class Cart(TimeUserStamps):
    """
    Shopping cart — one per authenticated user (OneToOne).
    session_key enables guest / unauthenticated carts.
    Cart is cleared automatically when an Order is successfully placed.
    """
    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart', null=True, blank=True)
    session_key = models.CharField(max_length=100, null=True, blank=True,
                                   help_text="Used for guest/unauthenticated users")

    def __str__(self):
        owner = self.user.get_full_name() if self.user else f"Guest ({self.session_key})"
        return f"Cart of {owner}"

    @property
    def total_items(self):
        # FIX: explicit 0 default so this is always an int, never falls back
        # to sum()'s implicit start value in a confusing way for an empty cart.
        return sum((item.quantity for item in self.items.filter(deleted=False)), 0)

    @property
    def subtotal(self):
        # FIX: explicit Decimal('0.00') start value — sum() over an empty
        # generator would otherwise return the int 0, not a Decimal, which is
        # inconsistent with line_total's Decimal type further down the chain.
        return sum((item.line_total for item in self.items.filter(deleted=False)), Decimal('0.00'))


class CartItem(TimeUserStamps):
    """
    One line inside a Cart.
    Must reference either a ProductVariant OR a SalesProduct — never both.
    Adding the same item again increments quantity (handled in the view).
    """
    cart            = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    sales_product   = models.ForeignKey(SalesProduct,   on_delete=models.CASCADE, null=True, blank=True)
    quantity        = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(product_variant__isnull=False, sales_product__isnull=True) |
                    models.Q(product_variant__isnull=True,  sales_product__isnull=False)
                ),
                name='cartitem_variant_or_salesproduct'
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
    """One wishlist per user. Items are saved products they want to buy later."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')

    def __str__(self):
        return f"Wishlist of {self.user.get_full_name()}"


class WishlistItem(TimeUserStamps):
    wishlist      = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product       = models.ForeignKey(Product,      on_delete=models.CASCADE, null=True, blank=True)
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
# RETURN REQUEST
# ============================================================================

class ReturnRequest(TimeUserStamps):
    """
    Customer return / refund request for a delivered order item.
    Admin reviews and approves or rejects.
    Only allowed when order.status == 'delivered'.
    """
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('approved',  'Approved'),
        ('rejected',  'Rejected'),
        ('completed', 'Completed'),
    )
    REASON_CHOICES = (
        ('damaged',          'Damaged'),
        ('wrong_item',       'Wrong Item'),
        ('not_as_described', 'Not as Described'),
        ('other',            'Other'),
    )

    order         = models.ForeignKey(Order,       on_delete=models.CASCADE, related_name='returns')
    order_detail  = models.ForeignKey(OrderDetail, on_delete=models.CASCADE, related_name='returns')
    reason        = models.CharField(max_length=50, choices=REASON_CHOICES)
    description   = models.TextField(blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reviewed_by   = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_returns'
    )

    def __str__(self):
        return f"Return #{self.id} for Order #{self.order.id} - {self.status}"

    def clean(self):
        # FIX: previously nothing verified that order_detail actually
        # belongs to order — a return could be filed referencing a mismatched
        # order / order_detail pair (e.g. order #5 with an order_detail that
        # actually belongs to order #9).
        if self.order_id and self.order_detail_id and self.order_detail.order_id != self.order_id:
            raise ValidationError("order_detail does not belong to the given order")


# ============================================================================
# CONTACT
# ============================================================================

class Contact(TimeUserStamps):
    alphabetic_validator = RegexValidator(
        regex=r'^[a-zA-Z]+( [a-zA-Z]+)*$',
        message='Only alphabetic characters and single spaces between words.',
        code='invalid_input'
    )
    phone_number_validator = RegexValidator(
        regex=r'^[\d\-\+\(\) ]+$',
        message='Phone number can only contain digits, spaces, dashes, parentheses and plus.',
        code='invalid_phone_number'
    )

    name         = models.CharField(max_length=100, validators=[alphabetic_validator])
    email        = models.EmailField(unique=False, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, validators=[phone_number_validator])
    message      = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Contact from {self.name} ({self.email})"


# ============================================================================
# REVIEW
# ============================================================================

class Review(TimeUserStamps):
    user          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    name          = models.CharField(max_length=100, blank=True)
    email         = models.EmailField(unique=False, null=True, blank=True)
    rating        = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment       = models.TextField()
    product       = models.ForeignKey(Product,      on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
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