from datetime import time
from django.db import models
from django.forms import ValidationError
from user_auth.models import User

from django.core.exceptions import ValidationError
from django.db.models.signals import pre_save
from django.dispatch import receiver

from utils.reusable_classes import TimeStamps, TimeUserStamps
# Create your models here.

# Superuser: nicenick@gmail.com, nicenick
# User: nicenick1992@gmail.com, adminuser


class Category(TimeUserStamps):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.FileField(upload_to='category_images/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='category_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='category_updated_by', null=True, blank=True)

class ProductTag(TimeUserStamps):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='producttag_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='producttag_updated_by', null=True, blank=True)

class Product(TimeUserStamps):
    for_choices = (
        ('Men', 'Men'),
        ('Women', 'Women'),
        ('Kids', 'Kids'),
        ('General', 'General'),
    )
    group = models.CharField(max_length=20, choices=for_choices, null=True, blank=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    price = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # image = models.FileField(upload_to='product_images/', blank=True, null=True)
    # images = models.JSONField(default=list,null=True, blank=True)
    prod_has_category = models.ForeignKey(Category, on_delete=models.CASCADE,related_name='prod_has_category1', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='product_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='product_updated_by', null=True, blank=True)
    tags = models.ManyToManyField(ProductTag, blank=True)
    @property
    def images(self):
        return self.images.all()
    

class ProductImage(TimeUserStamps):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    images = models.ImageField(upload_to='product_images_new/')
    alt_text = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='productimage_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='productimage_updated_by', null=True, blank=True)

    def __str__(self):
        return f"{self.product.name} Image"

class Color(TimeUserStamps):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='color_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='color_updated_by', null=True, blank=True)

    def __str__(self):
        return self.name

class ProductVariant(TimeUserStamps):
    """Handle product variations like size, color, etc."""
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=20, blank=True, null=True)  # S, M, L, XL
    # color = models.CharField(max_length=50, blank=True, null=True)
    color = models.ManyToManyField(Color, blank=True, related_name="variants")
    material = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True)  # Stock Keeping Unit
    stock_quantity = models.PositiveIntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='productvariant_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='productvariant_updated_by', null=True, blank=True)
    
    class Meta:
        unique_together = ['product', 'size', 'material']  # ✅ Removed color, since many-to-many

    def __str__(self):
        attributes = []
        if self.size:
            attributes.append(f"Size: {self.size}")
        if self.colors.exists():
            attributes.append(f"Colors: {', '.join([c.name for c in self.colors.all()])}")
        if self.material:
            attributes.append(f"Material: {self.material}")
        return f"{self.product.name} - {', '.join(attributes)}" if attributes else f"{self.product.name} - Base Variant"

    def save(self, *args, **kwargs):
        # Generate SKU automatically if not provided
        if not self.sku:
            base_sku = self.product.name.replace(' ', '').upper()[:6]
            attr_parts = []
            if self.size:
                attr_parts.append(self.size.upper())
            if self.material:
                attr_parts.append(self.material.upper()[:3])
            # Take only first color if multiple
            if self.pk and self.colors.exists():
                attr_parts.append(self.colors.first().name.upper()[:3])

            attr_str = '-'.join(attr_parts) if attr_parts else 'BASE'
            self.sku = f"{base_sku}-{attr_str}"

            # Ensure uniqueness of SKU
            counter = 1
            original_sku = self.sku
            while ProductVariant.objects.filter(sku=self.sku).exclude(pk=self.pk).exists():
                self.sku = f"{original_sku}-{counter}"
                counter += 1

        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.product.price + self.additional_price

class Inventory(TimeUserStamps):
    """Track inventory levels and stock movements"""
    product_variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='inventory')
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=5)
    maximum_stock_level = models.PositiveIntegerField(default=1000)
    reorder_point = models.PositiveIntegerField(default=10)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_restocked = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='productinventory_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='productinventory_updated_by', null=True, blank=True)
    
    @property
    def is_low_stock(self):
        return self.current_stock <= self.minimum_stock_level
    
    @property
    def needs_reorder(self):
        return self.current_stock <= self.reorder_point
        
class SalesProduct(TimeUserStamps):
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
        help_text="Final price after discount (auto-calculated)", null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.FileField(upload_to='saleproduct_images/', blank=True, null=True)
    salesprod_has_category = models.ForeignKey(Category, on_delete=models.CASCADE,related_name='saleprod_has_category1', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='saleproduct_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='saleproduct_updated_by', null=True, blank=True)
    
    class Meta:
        verbose_name = "Sales Product"
        verbose_name_plural = "Sales Products"

    def __str__(self):
        return self.name

    def clean(self):
        # Validate discount percentage
        if self.discount_percent < 0 or self.discount_percent > 100:
            raise ValidationError("Discount percentage must be between 0 and 100")
        
        # Calculate final price
        self.calculate_final_price()

    def calculate_final_price(self):
        """Calculate and set the final price based on original price and discount"""
        if self.discount_percent > 0:
            discount_amount = self.original_price * (self.discount_percent / 100)
            self.final_price = self.original_price - discount_amount
        else:
            self.final_price = self.original_price

    def save(self, *args, **kwargs):
        # Ensure clean() is called to calculate final_price
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

# Signal to ensure final_price is always calculated
@receiver(pre_save, sender=SalesProduct)
def calculate_final_price(sender, instance, **kwargs):
    instance.calculate_final_price()

class SalesProductImage(TimeUserStamps):
    sale_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='images')
    images = models.ImageField(upload_to='sale_product_images/')
    alt_text = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saleproductimage_created_by', null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saleproductimage_updated_by', null=True, blank=True)

    def __str__(self):
        return f"{self.sale_product.name} Sale Image"

class Order(TimeUserStamps):
    status_choices = (
        ("pending", "Pending"),
        ("booked", "Booked"),
        ("in_process", "In Process"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled")
    )
    
    payment_choices = (
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
        ("paypal", "PayPal"),
        ("cash_on_delivery", "Cash on Delivery")
    )
    
    bill = models.PositiveBigIntegerField(null=True, blank=True)
    customer_name = models.CharField(max_length=100)  # Can be different from User account name
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    city = models.CharField(max_length=100, null=True, blank=True)  
    status = models.CharField(max_length=50, choices=status_choices, default="pending")
    payment_method = models.CharField(max_length=50, choices=payment_choices)
    payment_status = models.BooleanField(default=False)
    delivery_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rider = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    # customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)

    # Other fields remain the same...


   


class OrderDetail(TimeUserStamps):
    unit_price = models.PositiveBigIntegerField(help_text="Price per unit at the time of purchase")
    quantity = models.PositiveIntegerField(default=1, help_text="Number of units ordered")
    total_price = models.PositiveBigIntegerField(blank=True, null=True, help_text="Automatically calculated as unit_price * quantity")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_details', null=True, blank=True)
    sales_product = models.ForeignKey(SalesProduct, on_delete=models.CASCADE, related_name='order_details', null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        verbose_name = "Order Detail"
        verbose_name_plural = "Order Details"
        ordering = ['-created_at']

    def __str__(self):
        name = self.product.name if self.product else self.sales_product.name
        return f"{self.quantity}x {name} (Order: {self.order.id})"

    def clean(self):
        """Calculate total_price before saving"""
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



from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, RegexValidator

class Contact(TimeUserStamps):
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
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contact_created_by',null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contact_updated_by',null=True, blank=True)




from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Review(TimeUserStamps):
    name = models.CharField(max_length=100, blank=True)  # For anonymous users
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    email = models.EmailField(unique=False, null=True, blank=True)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews'
    )

    # Either regular product or sales product (one must be null)
    product = models.ForeignKey(
        'Product',  # Your existing Product model
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )
    sales_product = models.ForeignKey(
        'SalesProduct',  # Your SalesProduct model
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        name = self.user.username if self.user else (self.name or "Anonymous")
        item = self.product if self.product else self.sales_product
        return f"Review by {name} for {item.name} (Rating: {self.rating})"

    @property
    def reviewed_item(self):
        """Helper method to get the associated product/sales_product"""
        return self.product or self.sales_product

# models.py
# class GuestCustomer(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField()
#     phone = models.CharField(max_length=20)
#     created_at = models.DateTimeField(auto_now_add=True)



# class Review(models.Model):

#     rating = models.PositiveSmallIntegerField()  # Assuming rating is from 1 to 5
#     comment = models.TextField()
#     date = models.DateTimeField(auto_now_add=True)
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='review_created_by', null=True, blank=True)
#     updated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_updated_by', null=True, blank=True)
#     restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='restaurant_reviews', null=True, blank=True)
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_can_reviews', null=True, blank=True)










