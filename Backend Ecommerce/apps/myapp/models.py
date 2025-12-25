"""
E-commerce Models
Handles products, orders, inventory, reviews, and sales management
"""

# Standard library imports
from datetime import time

# Django core imports
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, RegexValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

# Local imports
from apps.users.models import User
from utils.reusable_classes import TimeStamps, TimeUserStamps


# ============================================================================
# PRODUCT MANAGEMENT MODELS
# ============================================================================

class Category(TimeUserStamps):
    """Product categories for organizing products"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    image = models.FileField(upload_to='ecom/category_images/', blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name


class ProductTag(TimeUserStamps):
    """Tags for product categorization and filtering"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name


class Product(TimeUserStamps):
    """Main product model"""
    FOR_CHOICES = (
        ('Men', 'Men'),
        ('Women', 'Women'),
        ('Kids', 'Kids'),
        ('General', 'General'),
    )
    
    group = models.CharField(max_length=20, choices=FOR_CHOICES, null=True, blank=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    price = models.PositiveIntegerField()  # Consider using DecimalField for currency
    prod_has_category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='products',  # More intuitive related name
        null=True, 
        blank=True
    )
    tags = models.ManyToManyField(ProductTag, blank=True)
    
    def __str__(self):
        return self.name
    
    @property
    def product_images(self):
        """Get all images for this product"""
        return self.images.all()


class ProductImage(TimeUserStamps):
    """Images associated with products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    images = models.ImageField(upload_to='ecom/product_images_new/')
    alt_text = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.product.name} - Image"


class Color(TimeUserStamps):
    """Available colors for product variants"""
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class ProductVariant(TimeUserStamps):
    """Handle product variations like size, color, material"""
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=20, blank=True, null=True)  # S, M, L, XL
    colors = models.ManyToManyField(Color, blank=True, related_name="variants")
    material = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True)  # Stock Keeping Unit
    stock_quantity = models.PositiveIntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    
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
        """Generate SKU automatically if not provided"""
        if not self.sku:
            base_sku = self.product.name.replace(' ', '').upper()[:6]
            attr_parts = []
            
            if self.size:
                attr_parts.append(self.size.upper())
            if self.material:
                attr_parts.append(self.material.upper()[:3])
            
            # Note: Colors are handled after save due to ManyToMany relationship
            attr_str = '-'.join(attr_parts) if attr_parts else 'BASE'
            self.sku = f"{base_sku}-{attr_str}"

            # Ensure SKU uniqueness
            counter = 1
            original_sku = self.sku
            while ProductVariant.objects.filter(sku=self.sku).exclude(pk=self.pk).exists():
                self.sku = f"{original_sku}-{counter}"
                counter += 1

        super().save(*args, **kwargs)

    @property
    def total_price(self):
        """Calculate total price including additional price"""
        return self.product.price + self.additional_price


# ============================================================================
# INVENTORY MANAGEMENT
# ============================================================================

class Inventory(TimeUserStamps):
    """Track inventory levels and stock movements"""
    product_variant = models.OneToOneField(
        ProductVariant, 
        on_delete=models.CASCADE, 
        related_name='inventory'
    )
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=5)
    maximum_stock_level = models.PositiveIntegerField(default=1000)
    reorder_point = models.PositiveIntegerField(default=10)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_restocked = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Inventories"
    
    def __str__(self):
        return f"Inventory for {self.product_variant.product.name} - Stock: {self.current_stock}"
   
    @property
    def is_low_stock(self):
        """Check if stock is below minimum level"""
        return self.current_stock <= self.minimum_stock_level
    
    @property
    def needs_reorder(self):
        """Check if stock needs reordering"""
        return self.current_stock <= self.reorder_point


# ============================================================================
# SALES & PROMOTIONS
# ============================================================================

class SalesProduct(TimeUserStamps):
    """Products on sale with discount pricing"""
    name = models.CharField(max_length=50)
    description = models.TextField()
    original_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Original price before any discounts"
    )
    discount_percent = models.DecimalField(
        max_digits=5, 
        decimal_places=0, 
        default=0,
        help_text="Discount percentage (e.g., 10 for 10%)"
    )
    final_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        editable=False,
        help_text="Final price after discount (auto-calculated)", 
        null=True, 
        blank=True
    )
    image = models.FileField(upload_to='ecom/saleproduct_images/', blank=True, null=True)
    salesprod_has_category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='sales_products',  # More intuitive related name
        null=True, 
        blank=True
    )
    
    class Meta:
        verbose_name = "Sales Product"
        verbose_name_plural = "Sales Products"

    def __str__(self):
        return f"{self.name} ({self.discount_percent}% off)"

    def clean(self):
        """Validate discount percentage and calculate final price"""
        if self.discount_percent < 0 or self.discount_percent > 100:
            raise ValidationError("Discount percentage must be between 0 and 100")
        
        self.calculate_final_price()

    def calculate_final_price(self):
        """Calculate and set the final price based on original price and discount"""
        if self.discount_percent > 0:
            discount_amount = self.original_price * (self.discount_percent / 100)
            self.final_price = self.original_price - discount_amount
        else:
            self.final_price = self.original_price

    def save(self, *args, **kwargs):
        """Ensure clean() is called to calculate final_price"""
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def has_discount(self):
        """Check if product has any discount"""
        return self.discount_percent > 0

    @property
    def discount_amount(self):
        """Returns the actual discount amount"""
        return self.original_price - self.final_price if self.has_discount else 0


@receiver(pre_save, sender=SalesProduct)
def calculate_sales_product_final_price(sender, instance, **kwargs):
    """Signal to ensure final_price is always calculated"""
    instance.calculate_final_price()


class SalesProductImage(TimeUserStamps):
    """Images for sales products"""
    sale_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='images')
    images = models.ImageField(upload_to='ecom/sale_product_images/')
    alt_text = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.sale_product.name} - Sale Image"


# ============================================================================
# ORDER MANAGEMENT
# ============================================================================

class Order(TimeUserStamps):
    """Customer orders"""
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("booked", "Booked"),
        ("in_process", "In Process"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled")
    )
    
    PAYMENT_CHOICES = (
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
        ("paypal", "PayPal"),
        ("cash_on_delivery", "Cash on Delivery")
    )
    
    # Consider using DecimalField instead of PositiveBigIntegerField for currency
    # and auto-calculating from OrderDetails
    bill = models.PositiveBigIntegerField(
        null=True, 
        blank=True,
        help_text="Total bill amount - consider auto-calculating from order details"
    )
    
    # Customer information
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='orders', 
        null=True, 
        blank=True
    )
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    
    # Delivery information
    delivery_address = models.TextField()
    city = models.CharField(max_length=100, null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    rider = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_deliveries'
    )
    
    # Order status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    
    # Payment information
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
    payment_status = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.status})"
    
    @property
    def total_amount(self):
        """Calculate total from order details"""
        return sum(detail.total_price or 0 for detail in self.order_details.all())


class OrderDetail(TimeUserStamps):
    """Individual items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='order_details', 
        null=True, 
        blank=True
    )
    sales_product = models.ForeignKey(
        SalesProduct, 
        on_delete=models.CASCADE, 
        related_name='order_details', 
        null=True, 
        blank=True
    )
    unit_price = models.PositiveBigIntegerField(
        help_text="Price per unit at the time of purchase"
    )
    quantity = models.PositiveIntegerField(default=1, help_text="Number of units ordered")
    total_price = models.PositiveBigIntegerField(
        blank=True, 
        null=True, 
        help_text="Automatically calculated as unit_price * quantity"
    )
    
    class Meta:
        verbose_name = "Order Detail"
        verbose_name_plural = "Order Details"
        ordering = ['-created_at']

    def __str__(self):
        product_name = self.product.name if self.product else self.sales_product.name
        return f"Order #{self.order.id} - {self.quantity}x {product_name}"

    def clean(self):
        """Validate and calculate total_price before saving"""
        if not self.product and not self.sales_product:
            raise ValidationError("Either product or sales_product must be set")
        if self.product and self.sales_product:
            raise ValidationError("Cannot set both product and sales_product")
            
        if self.unit_price and self.quantity:
            self.total_price = self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        """Ensure clean() is called and total_price is calculated"""
        self.full_clean()
        super().save(*args, **kwargs)


# ============================================================================
# CUSTOMER INTERACTION MODELS
# ============================================================================

class Contact(TimeUserStamps):
    """Contact form submissions"""
    
    # Validators
    alphabetic_validator = RegexValidator(
        regex=r'^[a-zA-Z]+( [a-zA-Z]+)*$',
        message='This field accepts only alphabetic characters and single spaces between words.',
        code='invalid_input'
    )
    phone_number_validator = RegexValidator(
        regex=r'^[\d\-\+\(\) ]+$',
        message='Phone number can only contain digits, spaces, dashes (-), parentheses (), and plus (+).',
        code='invalid_phone_number'
    )
    
    name = models.CharField(max_length=100, validators=[alphabetic_validator])
    email = models.EmailField(unique=False, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, validators=[phone_number_validator])
    message = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Contact from {self.name} ({self.email})"


User = get_user_model()


class Review(TimeUserStamps):
    """Product and sales product reviews"""
    
    # User information
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews'
    )
    name = models.CharField(max_length=100, blank=True)  # For anonymous users
    email = models.EmailField(unique=False, null=True, blank=True)
    
    # Review content
    rating = models.PositiveSmallIntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating from 1 to 5 stars"
    )
    comment = models.TextField()
    
    # Associated product (either regular or sales product)
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )
    sales_product = models.ForeignKey(
        'SalesProduct',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-created_at']
        constraints = [
            # Ensure review is for either Product OR SalesProduct, not both
            models.CheckConstraint(
                check=(
                    models.Q(product__isnull=False, sales_product__isnull=True) |
                    models.Q(product__isnull=True, sales_product__isnull=False)
                ),
                name='review_for_product_or_salesproduct'
            )
        ]

    def __str__(self):
        reviewer = self.user.username if self.user else (self.name or "Anonymous")
        item = self.product if self.product else self.sales_product
        return f"Review by {reviewer} for {item.name} ({self.rating}⭐)"

    @property
    def reviewed_item(self):
        """Helper method to get the associated product/sales_product"""
        return self.product or self.sales_product