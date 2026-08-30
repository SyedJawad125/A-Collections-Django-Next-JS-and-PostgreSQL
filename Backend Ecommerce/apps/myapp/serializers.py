# """
# E-commerce Serializers
# Follows existing patterns: SerializerMethodField for computed/related data,
# full_name fallback to username, deleted-state short response, datetime formatting.
# """

# import re
# from decimal import Decimal

# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from django.utils.text import slugify
# from django.utils import timezone
# from django.db import transaction
# from config.settings import BACKEND_BASE_URL

# from .models import (
#     Category, ProductTag, Product, ProductImage, Color, ProductVariant,
#     Inventory, SalesProduct, SalesProductImage,
#     Address, ShippingMethod, Coupon,
#     Order, OrderDetail, Payment,
#     Cart, CartItem, Wishlist, WishlistItem,
#     ReturnRequest, Contact, Review,
# )

# User = get_user_model()


# # ─────────────────────────────────────────────
# # Shared helpers
# # ─────────────────────────────────────────────

# def _full_name(user):
#     if not user:
#         return None
#     name = user.get_full_name()
#     return name.strip() if name and name.strip() else user.username

# def _fmt_dt(value):
#     if isinstance(value, str):
#         return value.replace('T', ' ').split('.')[0]
#     return value


# # ============================================================================
# # CATEGORY
# # ============================================================================

# class CategoryListingSerializer(serializers.ModelSerializer):
#     products_count = serializers.SerializerMethodField()

#     class Meta:
#         model  = Category
#         fields = ['id', 'name', 'image', 'products_count']

#     def get_products_count(self, obj):
#         return obj.products.filter(deleted=False).count() if not obj.deleted else 0

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}" if instance.image else None
#         return data


# class CategorySerializer(serializers.ModelSerializer):
#     products_count       = serializers.SerializerMethodField()
#     sales_products_count = serializers.SerializerMethodField()
#     created_by           = serializers.SerializerMethodField()
#     updated_by           = serializers.SerializerMethodField()

#     class Meta:
#         model  = Category
#         fields = ['id', 'name', 'description', 'image', 'products_count',
#                   'sales_products_count', 'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')

#     def get_products_count(self, obj):
#         return obj.products.filter(deleted=False).count() if not obj.deleted else 0

#     def get_sales_products_count(self, obj):
#         return obj.sales_products.filter(deleted=False).count() if not obj.deleted else 0

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_name(self, value):
#         value = value.strip()
#         if len(value) < 2:
#             raise serializers.ValidationError("Name must be at least 2 characters")
#         qs = Category.objects.filter(name__iexact=value, deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
#         if qs.exists():
#             raise serializers.ValidationError(f"Category '{value}' already exists")
#         return value

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'name': instance.name,
#                     'message': f'Category "{instance.name}" deleted successfully'}
#         data = super().to_representation(instance)
#         data['image']      = f"{BACKEND_BASE_URL}{instance.image.url}" if instance.image else None
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# # ============================================================================
# # PRODUCT TAG
# # ============================================================================

# class ProductTagListingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model  = ProductTag
#         fields = ['id', 'name', 'slug']


# class ProductTagSerializer(serializers.ModelSerializer):
#     products_count = serializers.SerializerMethodField()
#     created_by     = serializers.SerializerMethodField()
#     updated_by     = serializers.SerializerMethodField()

#     class Meta:
#         model        = ProductTag
#         fields       = ['id', 'name', 'slug', 'products_count', 'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'slug')

#     def get_products_count(self, obj):
#         return obj.product_set.filter(deleted=False).count() if not obj.deleted else 0

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_name(self, value):
#         value = value.strip()
#         if len(value) < 2:
#             raise serializers.ValidationError("Tag name must be at least 2 characters")
#         return value

#     def validate(self, attrs):
#         if 'name' in attrs and not attrs.get('slug'):
#             attrs['slug'] = slugify(attrs['name'])
#         return attrs

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'name': instance.name,
#                     'message': f'Tag "{instance.name}" deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# # ============================================================================
# # PRODUCT IMAGE
# # ============================================================================

# class ProductImageSerializer(serializers.ModelSerializer):
#     image_url = serializers.SerializerMethodField()

#     class Meta:
#         model  = ProductImage
#         fields = ['id', 'images', 'image_url', 'alt_text']
#         extra_kwargs = {'alt_text': {'required': False}}

#     def get_image_url(self, obj):
#         return f"{BACKEND_BASE_URL}{obj.images.url}" if obj.images else None

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data.pop('images', None)
#         return data


# # ============================================================================
# # PRODUCT
# # ============================================================================

# class ProductListingSerializer(serializers.ModelSerializer):
#     category_name = serializers.CharField(source='prod_has_category.name', read_only=True)
#     first_image   = serializers.SerializerMethodField()
#     average_rating = serializers.FloatField(read_only=True)

#     class Meta:
#         model  = Product
#         fields = ['id', 'name', 'price', 'group', 'category_name', 'first_image', 'average_rating']

#     def get_first_image(self, obj):
#         if obj.deleted:
#             return None
#         img = obj.images.filter(deleted=False).first()
#         return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None


# class ProductSerializer(serializers.ModelSerializer):
#     images         = ProductImageSerializer(many=True, read_only=True)
#     image_urls     = serializers.SerializerMethodField()
#     category_name  = serializers.CharField(source='prod_has_category.name', read_only=True)
#     category_data  = serializers.SerializerMethodField()
#     tag_names      = serializers.SerializerMethodField()
#     tags_data      = serializers.SerializerMethodField()
#     variants_count = serializers.SerializerMethodField()
#     average_rating = serializers.FloatField(read_only=True)
#     created_by     = serializers.SerializerMethodField()
#     updated_by     = serializers.SerializerMethodField()

#     class Meta:
#         model  = Product
#         fields = ['id', 'name', 'description', 'price', 'group',
#                   'prod_has_category', 'category_name', 'category_data',
#                   'tags', 'tag_names', 'tags_data',
#                   'images', 'image_urls', 'variants_count', 'average_rating',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')
#         extra_kwargs = {
#             'prod_has_category': {'required': False, 'allow_null': True},
#             'tags':              {'required': False},
#         }

#     def get_image_urls(self, obj):
#         return [f"{BACKEND_BASE_URL}{i.images.url}"
#                 for i in obj.images.filter(deleted=False) if i.images] if not obj.deleted else []

#     def get_category_data(self, obj):
#         if obj.deleted or not obj.prod_has_category or obj.prod_has_category.deleted:
#             return None
#         return CategoryListingSerializer(obj.prod_has_category).data

#     def get_tag_names(self, obj):
#         return [t.name for t in obj.tags.filter(deleted=False)] if not obj.deleted else []

#     def get_tags_data(self, obj):
#         return ProductTagListingSerializer(obj.tags.filter(deleted=False), many=True).data if not obj.deleted else []

#     def get_variants_count(self, obj):
#         return obj.variants.filter(deleted=False, is_active=True).count() if not obj.deleted else 0

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_name(self, value):
#         if len(value.strip()) < 3:
#             raise serializers.ValidationError("Name must be at least 3 characters")
#         return value.strip()

#     def validate_price(self, value):
#         if value <= 0:
#             raise serializers.ValidationError("Price must be greater than 0")
#         return value

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'name': instance.name,
#                     'message': f'Product "{instance.name}" deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# # ============================================================================
# # COLOR
# # ============================================================================

# class ColorSerializer(serializers.ModelSerializer):
#     created_by = serializers.SerializerMethodField()
#     updated_by = serializers.SerializerMethodField()

#     class Meta:
#         model  = Color
#         fields = ['id', 'name', 'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_name(self, value):
#         value = value.strip()
#         if len(value) < 2:
#             raise serializers.ValidationError("Color name must be at least 2 characters")
#         qs = Color.objects.filter(name__iexact=value, deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
#         if qs.exists():
#             raise serializers.ValidationError(f"Color '{value}' already exists")
#         return value

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'name': instance.name,
#                     'message': f'Color "{instance.name}" deleted successfully'}
#         return super().to_representation(instance)


# # ============================================================================
# # PRODUCT VARIANT
# # ============================================================================

# class ProductVariantSerializer(serializers.ModelSerializer):
#     product_name  = serializers.CharField(source='product.name', read_only=True)
#     product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
#     total_price   = serializers.SerializerMethodField()
#     color_names   = serializers.SerializerMethodField()
#     colors_data   = serializers.SerializerMethodField()
#     is_low_stock  = serializers.SerializerMethodField()
#     created_by    = serializers.SerializerMethodField()
#     updated_by    = serializers.SerializerMethodField()

#     class Meta:
#         model  = ProductVariant
#         fields = ['id', 'product', 'product_name', 'product_price',
#                   'size', 'colors', 'color_names', 'colors_data',
#                   'material', 'sku', 'stock_quantity', 'additional_price',
#                   'total_price', 'is_active', 'is_low_stock',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'sku')
#         extra_kwargs = {
#             'size':             {'required': False, 'allow_null': True, 'allow_blank': True},
#             'material':         {'required': False, 'allow_null': True, 'allow_blank': True},
#             'additional_price': {'required': False},
#         }

#     def get_total_price(self, obj):
#         return float(obj.product.price + obj.additional_price) if not obj.deleted and obj.product else None

#     def get_color_names(self, obj):
#         return [c.name for c in obj.colors.filter(deleted=False)] if not obj.deleted else []

#     def get_colors_data(self, obj):
#         return ColorSerializer(obj.colors.filter(deleted=False), many=True).data if not obj.deleted else []

#     def get_is_low_stock(self, obj):
#         try:
#             return obj.inventory.is_low_stock if hasattr(obj, 'inventory') else False
#         except Exception:
#             return obj.stock_quantity < 10

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'sku': instance.sku,
#                     'message': f'Variant "{instance.sku}" deleted successfully'}
#         return super().to_representation(instance)


# # ============================================================================
# # INVENTORY
# # ============================================================================

# class InventorySerializer(serializers.ModelSerializer):
#     product_name  = serializers.CharField(source='product_variant.product.name', read_only=True)
#     variant_sku   = serializers.CharField(source='product_variant.sku', read_only=True)
#     is_low_stock  = serializers.BooleanField(read_only=True)
#     needs_reorder = serializers.BooleanField(read_only=True)
#     created_by    = serializers.SerializerMethodField()
#     updated_by    = serializers.SerializerMethodField()

#     class Meta:
#         model  = Inventory
#         fields = ['id', 'product_variant', 'product_name', 'variant_sku',
#                   'current_stock', 'minimum_stock_level', 'maximum_stock_level',
#                   'reorder_point', 'cost_price', 'last_restocked',
#                   'is_low_stock', 'needs_reorder',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')
#         extra_kwargs = {
#             'cost_price':     {'required': False, 'allow_null': True},
#             'last_restocked': {'required': False, 'allow_null': True},
#         }

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate(self, attrs):
#         min_l  = attrs.get('minimum_stock_level', getattr(self.instance, 'minimum_stock_level', 5))
#         max_l  = attrs.get('maximum_stock_level', getattr(self.instance, 'maximum_stock_level', 1000))
#         reorder = attrs.get('reorder_point',      getattr(self.instance, 'reorder_point', 10))
#         if min_l >= max_l:
#             raise serializers.ValidationError({'minimum_stock_level': "Must be less than maximum"})
#         if reorder > max_l:
#             raise serializers.ValidationError({'reorder_point': "Cannot exceed maximum stock level"})
#         return attrs

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Inventory record deleted successfully'}
#         return super().to_representation(instance)


# # ============================================================================
# # SALES PRODUCT
# # ============================================================================

# class SalesProductImageSerializer(serializers.ModelSerializer):
#     image_url = serializers.SerializerMethodField()

#     class Meta:
#         model  = SalesProductImage
#         fields = ['id', 'images', 'image_url', 'alt_text']
#         extra_kwargs = {'alt_text': {'required': False}}

#     def get_image_url(self, obj):
#         return f"{BACKEND_BASE_URL}{obj.images.url}" if obj.images else None

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data.pop('images', None)
#         return data


# class SalesProductListingSerializer(serializers.ModelSerializer):
#     category_name   = serializers.CharField(source='salesprod_has_category.name', read_only=True)
#     first_image     = serializers.SerializerMethodField()
#     discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
#     average_rating  = serializers.FloatField(read_only=True)

#     class Meta:
#         model  = SalesProduct
#         fields = ['id', 'name', 'original_price', 'discount_percent', 'final_price',
#                   'discount_amount', 'category_name', 'first_image', 'average_rating']

#     def get_first_image(self, obj):
#         img = obj.images.filter(deleted=False).first()
#         return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None


# class SalesProductSerializer(serializers.ModelSerializer):
#     images          = SalesProductImageSerializer(many=True, read_only=True)
#     image_urls      = serializers.SerializerMethodField()
#     category_name   = serializers.CharField(source='salesprod_has_category.name', read_only=True)
#     category_data   = serializers.SerializerMethodField()
#     has_discount    = serializers.BooleanField(read_only=True)
#     discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
#     average_rating  = serializers.FloatField(read_only=True)
#     created_by      = serializers.SerializerMethodField()
#     updated_by      = serializers.SerializerMethodField()

#     class Meta:
#         model  = SalesProduct
#         fields = ['id', 'name', 'description', 'original_price', 'discount_percent',
#                   'final_price', 'discount_amount', 'has_discount',
#                   'image', 'salesprod_has_category', 'category_name', 'category_data',
#                   'images', 'image_urls', 'average_rating',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'final_price')
#         extra_kwargs = {
#             'image':                   {'required': False, 'allow_null': True},
#             'salesprod_has_category':  {'required': False, 'allow_null': True},
#             'discount_percent':        {'required': False},
#         }

#     def get_image_urls(self, obj):
#         return [f"{BACKEND_BASE_URL}{i.images.url}"
#                 for i in obj.images.filter(deleted=False) if i.images] if not obj.deleted else []

#     def get_category_data(self, obj):
#         if obj.deleted or not obj.salesprod_has_category or obj.salesprod_has_category.deleted:
#             return None
#         return CategoryListingSerializer(obj.salesprod_has_category).data

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_original_price(self, value):
#         if value <= 0:
#             raise serializers.ValidationError("Original price must be greater than 0")
#         return value

#     def validate_discount_percent(self, value):
#         if value < 0 or value > 100:
#             raise serializers.ValidationError("Discount must be between 0 and 100")
#         return value

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'name': instance.name,
#                     'message': f'Sales product "{instance.name}" deleted successfully'}
#         data = super().to_representation(instance)
#         data['image']      = f"{BACKEND_BASE_URL}{instance.image.url}" if instance.image else None
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# # ============================================================================
# # ADDRESS  ── NEW
# # ============================================================================

# class AddressSerializer(serializers.ModelSerializer):
#     created_by = serializers.SerializerMethodField()

#     class Meta:
#         model  = Address
#         fields = ['id', 'user', 'label', 'full_name', 'phone', 'street',
#                   'city', 'province', 'postal_code', 'is_default',
#                   'created_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'user')

#     def get_created_by(self, obj): return _full_name(obj.created_by)

#     def create(self, validated_data):
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             validated_data['user'] = request.user
#         return super().create(validated_data)

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Address deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# # ============================================================================
# # SHIPPING METHOD  ── NEW
# # ============================================================================

# class ShippingMethodSerializer(serializers.ModelSerializer):
#     created_by = serializers.SerializerMethodField()
#     updated_by = serializers.SerializerMethodField()

#     class Meta:
#         model  = ShippingMethod
#         fields = ['id', 'name', 'estimated_days', 'cost', 'is_active',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Shipping method deleted successfully'}
#         return super().to_representation(instance)


# # ============================================================================
# # COUPON  ── NEW
# # ============================================================================

# class CouponSerializer(serializers.ModelSerializer):
#     is_exhausted = serializers.BooleanField(read_only=True)
#     created_by   = serializers.SerializerMethodField()
#     updated_by   = serializers.SerializerMethodField()

#     class Meta:
#         model  = Coupon
#         fields = ['id', 'code', 'discount_type', 'discount_value',
#                   'min_order_amount', 'max_uses', 'used_count',
#                   'valid_from', 'valid_to', 'is_active',
#                   'applicable_products', 'is_exhausted',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'used_count')

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_code(self, value):
#         value = value.strip().upper()
#         qs = Coupon.objects.filter(code__iexact=value, deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
#         if qs.exists():
#             raise serializers.ValidationError("Coupon code already exists")
#         return value

#     def validate(self, attrs):
#         vf = attrs.get('valid_from')
#         vt = attrs.get('valid_to')
#         if vf and vt and vf >= vt:
#             raise serializers.ValidationError("valid_to must be after valid_from")
#         if attrs.get('discount_type') == 'percentage' and attrs.get('discount_value', 0) > 100:
#             raise serializers.ValidationError("Percentage discount cannot exceed 100")
#         return attrs

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'code': instance.code, 'message': 'Coupon deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# class ValidateCouponSerializer(serializers.Serializer):
#     """Validates a coupon code at checkout before placing an order."""
#     code         = serializers.CharField(max_length=50)
#     order_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


# # ============================================================================
# # ORDER DETAIL & ORDER
# # ============================================================================

# class OrderDetailSerializer(serializers.ModelSerializer):
#     product_name = serializers.SerializerMethodField()
#     product_type = serializers.SerializerMethodField()

#     class Meta:
#         model  = OrderDetail
#         fields = ['id', 'order', 'product', 'sales_product', 'product_name',
#                   'product_type', 'unit_price', 'quantity', 'total_price',
#                   'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'total_price')
#         extra_kwargs = {
#             'product':       {'required': False, 'allow_null': True},
#             'sales_product': {'required': False, 'allow_null': True},
#         }

#     def get_product_name(self, obj):
#         if obj.product and not obj.product.deleted:
#             return obj.product.name
#         if obj.sales_product and not obj.sales_product.deleted:
#             return obj.sales_product.name
#         return None

#     def get_product_type(self, obj):
#         if obj.product:
#             return 'product'
#         if obj.sales_product:
#             return 'sales_product'
#         return None

#     def validate(self, attrs):
#         product       = attrs.get('product')
#         sales_product = attrs.get('sales_product')
#         if not product and not sales_product:
#             raise serializers.ValidationError("Either product or sales_product is required")
#         if product and sales_product:
#             raise serializers.ValidationError("Cannot specify both product and sales_product")
#         if attrs.get('quantity', 1) < 1:
#             raise serializers.ValidationError({"quantity": "Must be at least 1"})
#         return attrs


# class OrderSerializer(serializers.ModelSerializer):
#     order_details  = OrderDetailSerializer(many=True, read_only=True)
#     rider_name     = serializers.SerializerMethodField()
#     total_amount   = serializers.SerializerMethodField()
#     items_count    = serializers.SerializerMethodField()
#     shipping_info  = serializers.SerializerMethodField()
#     coupon_code    = serializers.SerializerMethodField()

#     class Meta:
#         model  = Order
#         fields = ['id', 'bill', 'subtotal', 'shipping_cost', 'discount_amount',
#                   'customer', 'customer_name', 'customer_email', 'customer_phone',
#                   'address', 'delivery_address', 'city', 'delivery_date',
#                   'shipping_method', 'shipping_info', 'rider', 'rider_name',
#                   'coupon', 'coupon_code',
#                   'status', 'payment_method', 'payment_status',
#                   'order_details', 'total_amount', 'items_count',
#                   'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')
#         extra_kwargs = {
#             'customer':        {'required': False, 'allow_null': True},
#             'rider':           {'required': False, 'allow_null': True},
#             'bill':            {'required': False, 'allow_null': True},
#             'city':            {'required': False, 'allow_null': True},
#             'delivery_date':   {'required': False, 'allow_null': True},
#             'address':         {'required': False, 'allow_null': True},
#             'shipping_method': {'required': False, 'allow_null': True},
#             'coupon':          {'required': False, 'allow_null': True},
#         }

#     def get_rider_name(self, obj):   return _full_name(obj.rider)
#     def get_total_amount(self, obj): return obj.total_amount if not obj.deleted else None
#     def get_items_count(self, obj):  return obj.order_details.filter(deleted=False).count() if not obj.deleted else 0
#     def get_coupon_code(self, obj):  return obj.coupon.code if obj.coupon else None

#     def get_shipping_info(self, obj):
#         if obj.shipping_method:
#             return ShippingMethodSerializer(obj.shipping_method).data
#         return None

#     def validate_customer_email(self, value):
#         if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
#             raise serializers.ValidationError("Invalid email format")
#         return value.lower()

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'customer_name': instance.customer_name,
#                     'message': f'Order #{instance.id} deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# # ============================================================================
# # PAYMENT  ── NEW
# # ============================================================================

# class PaymentSerializer(serializers.ModelSerializer):
#     order_number = serializers.IntegerField(source='order.id', read_only=True)
#     created_by   = serializers.SerializerMethodField()

#     class Meta:
#         model  = Payment
#         fields = ['id', 'order', 'order_number', 'transaction_id', 'amount',
#                   'status', 'payment_gateway', 'gateway_response', 'paid_at',
#                   'created_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')

#     def get_created_by(self, obj): return _full_name(obj.created_by)

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Payment record deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         return data


# # ============================================================================
# # CART & CART ITEM  ── NEW
# # ============================================================================

# class CartItemSerializer(serializers.ModelSerializer):
#     item_name  = serializers.SerializerMethodField()
#     item_image = serializers.SerializerMethodField()
#     unit_price = serializers.SerializerMethodField()
#     line_total = serializers.SerializerMethodField()

#     class Meta:
#         model  = CartItem
#         fields = ['id', 'cart', 'product_variant', 'sales_product',
#                   'item_name', 'item_image', 'quantity',
#                   'unit_price', 'line_total', 'created_at']
#         read_only_fields = ('created_at',)
#         extra_kwargs = {
#             'product_variant': {'required': False, 'allow_null': True},
#             'sales_product':   {'required': False, 'allow_null': True},
#         }

#     def get_item_name(self, obj):
#         if obj.product_variant:
#             return str(obj.product_variant)
#         return obj.sales_product.name if obj.sales_product else None

#     def get_item_image(self, obj):
#         if obj.product_variant:
#             img = obj.product_variant.product.images.filter(deleted=False).first()
#             return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None
#         if obj.sales_product and obj.sales_product.image:
#             return f"{BACKEND_BASE_URL}{obj.sales_product.image.url}"
#         return None

#     def get_unit_price(self, obj):
#         try:
#             return str(obj.unit_price)
#         except Exception:
#             return None

#     def get_line_total(self, obj):
#         try:
#             return str(obj.line_total)
#         except Exception:
#             return None

#     def validate(self, attrs):
#         if not attrs.get('product_variant') and not attrs.get('sales_product'):
#             raise serializers.ValidationError("Either product_variant or sales_product is required")
#         if attrs.get('product_variant') and attrs.get('sales_product'):
#             raise serializers.ValidationError("Cannot set both product_variant and sales_product")
#         return attrs


# class CartSerializer(serializers.ModelSerializer):
#     items       = CartItemSerializer(many=True, read_only=True)
#     total_items = serializers.IntegerField(read_only=True)
#     subtotal    = serializers.SerializerMethodField()

#     class Meta:
#         model  = Cart
#         fields = ['id', 'user', 'session_key', 'items', 'total_items', 'subtotal', 'created_at']
#         read_only_fields = ('created_at',)

#     def get_subtotal(self, obj):
#         try:
#             return str(obj.subtotal)
#         except Exception:
#             return '0'


# # ============================================================================
# # WISHLIST  ── NEW
# # ============================================================================

# class WishlistItemSerializer(serializers.ModelSerializer):
#     item_name  = serializers.SerializerMethodField()
#     item_price = serializers.SerializerMethodField()
#     item_image = serializers.SerializerMethodField()

#     class Meta:
#         model  = WishlistItem
#         fields = ['id', 'wishlist', 'product', 'sales_product',
#                   'item_name', 'item_price', 'item_image', 'created_at']
#         read_only_fields = ('created_at',)
#         extra_kwargs = {
#             'product':       {'required': False, 'allow_null': True},
#             'sales_product': {'required': False, 'allow_null': True},
#         }

#     def get_item_name(self, obj):
#         item = obj.product or obj.sales_product
#         return item.name if item else None

#     def get_item_price(self, obj):
#         if obj.product:
#             return str(obj.product.price)
#         if obj.sales_product:
#             return str(obj.sales_product.final_price)
#         return None

#     def get_item_image(self, obj):
#         if obj.product:
#             img = obj.product.images.filter(deleted=False).first()
#             return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None
#         if obj.sales_product and obj.sales_product.image:
#             return f"{BACKEND_BASE_URL}{obj.sales_product.image.url}"
#         return None

#     def validate(self, attrs):
#         if not attrs.get('product') and not attrs.get('sales_product'):
#             raise serializers.ValidationError("Either product or sales_product is required")
#         if attrs.get('product') and attrs.get('sales_product'):
#             raise serializers.ValidationError("Cannot set both product and sales_product")
#         return attrs


# class WishlistSerializer(serializers.ModelSerializer):
#     items = WishlistItemSerializer(many=True, read_only=True)

#     class Meta:
#         model  = Wishlist
#         fields = ['id', 'user', 'items', 'created_at']
#         read_only_fields = ('created_at',)


# # ============================================================================
# # RETURN REQUEST  ── NEW
# # ============================================================================

# class ReturnRequestSerializer(serializers.ModelSerializer):
#     order_number = serializers.IntegerField(source='order.id', read_only=True)
#     product_name = serializers.SerializerMethodField()
#     reviewed_by_name = serializers.SerializerMethodField()
#     created_by   = serializers.SerializerMethodField()

#     class Meta:
#         model  = ReturnRequest
#         fields = ['id', 'order', 'order_number', 'order_detail',
#                   'reason', 'description', 'status', 'refund_amount',
#                   'product_name', 'reviewed_by', 'reviewed_by_name',
#                   'created_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')

#     def get_product_name(self, obj):
#         try:
#             d = obj.order_detail
#             return (d.product.name if d.product else
#                     (d.sales_product.name if d.sales_product else "Deleted Product"))
#         except Exception:
#             return None

#     def get_reviewed_by_name(self, obj): return _full_name(obj.reviewed_by)
#     def get_created_by(self, obj):       return _full_name(obj.created_by)

#     def validate(self, attrs):
#         order = attrs.get('order') or (self.instance.order if self.instance else None)
#         if order and order.status != 'delivered':
#             raise serializers.ValidationError("Returns can only be requested for delivered orders")
#         return attrs

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Return request deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         return data


# # ============================================================================
# # CONTACT
# # ============================================================================

# class ContactSerializer(serializers.ModelSerializer):
#     created_by = serializers.SerializerMethodField()
#     updated_by = serializers.SerializerMethodField()

#     class Meta:
#         model  = Contact
#         fields = ['id', 'name', 'email', 'phone_number', 'message',
#                   'created_by', 'updated_by', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at')
#         extra_kwargs = {'message': {'required': False, 'allow_null': True, 'allow_blank': True}}

#     def get_created_by(self, obj): return _full_name(obj.created_by)
#     def get_updated_by(self, obj): return _full_name(obj.updated_by)

#     def validate_name(self, value):
#         if not re.match(r'^[a-zA-Z]+( [a-zA-Z]+)*$', value):
#             raise serializers.ValidationError("Name must contain only alphabetic characters")
#         return value.strip()

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Contact deleted successfully'}
#         data = super().to_representation(instance)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         return data


# # ============================================================================
# # REVIEW
# # ============================================================================

# class ReviewSerializer(serializers.ModelSerializer):
#     author_name = serializers.SerializerMethodField()
#     item_name   = serializers.SerializerMethodField()
#     item_type   = serializers.SerializerMethodField()
#     item_data   = serializers.SerializerMethodField()
#     can_edit    = serializers.SerializerMethodField()
#     can_delete  = serializers.SerializerMethodField()

#     class Meta:
#         model  = Review
#         fields = ['id', 'user', 'name', 'email', 'author_name',
#                   'rating', 'comment',
#                   'product', 'sales_product', 'item_name', 'item_type', 'item_data',
#                   'can_edit', 'can_delete', 'created_at', 'updated_at']
#         read_only_fields = ('created_at', 'updated_at', 'user')
#         extra_kwargs = {
#             'name':          {'required': False, 'allow_blank': True},
#             'email':         {'required': False, 'allow_null': True},
#             'product':       {'required': False, 'allow_null': True},
#             'sales_product': {'required': False, 'allow_null': True},
#         }

#     def get_author_name(self, obj):
#         if obj.user:
#             return _full_name(obj.user)
#         return obj.name or 'Anonymous'

#     def get_item_name(self, obj):
#         if obj.product and not obj.product.deleted:     return obj.product.name
#         if obj.sales_product and not obj.sales_product.deleted: return obj.sales_product.name
#         return None

#     def get_item_type(self, obj):
#         if obj.product:       return 'product'
#         if obj.sales_product: return 'sales_product'
#         return None

#     def get_item_data(self, obj):
#         if obj.product and not obj.product.deleted:
#             return {'id': obj.product.id, 'name': obj.product.name,
#                     'type': 'product', 'price': float(obj.product.price)}
#         if obj.sales_product and not obj.sales_product.deleted:
#             return {'id': obj.sales_product.id, 'name': obj.sales_product.name,
#                     'type': 'sales_product',
#                     'original_price': float(obj.sales_product.original_price),
#                     'final_price':    float(obj.sales_product.final_price),
#                     'discount_percent': float(obj.sales_product.discount_percent)}
#         return None

#     def get_can_edit(self, obj):
#         request = self.context.get('request')
#         if not request or not request.user.is_authenticated: return False
#         return request.user.is_staff or obj.user == request.user

#     def get_can_delete(self, obj):
#         return self.get_can_edit(obj)

#     def validate_rating(self, value):
#         if value < 1 or value > 5:
#             raise serializers.ValidationError("Rating must be between 1 and 5")
#         return value

#     def validate_comment(self, value):
#         if not value or len(value.strip()) < 3:
#             raise serializers.ValidationError("Comment must be at least 3 characters")
#         if len(value) > 1000:
#             raise serializers.ValidationError("Comment cannot exceed 1000 characters")
#         return value.strip()

#     def validate(self, attrs):
#         request = self.context.get('request')
#         if not self.instance:
#             if not attrs.get('product') and not attrs.get('sales_product'):
#                 raise serializers.ValidationError("Must specify either a product or sales product")
#             if attrs.get('product') and attrs.get('sales_product'):
#                 raise serializers.ValidationError("Cannot specify both product and sales product")
#             if request and request.user.is_authenticated:
#                 attrs['user'] = request.user
#                 attrs.pop('name', None)
#                 attrs.pop('email', None)
#             else:
#                 if not attrs.get('name'):
#                     raise serializers.ValidationError({"name": "Required for guest reviews"})
#                 if not attrs.get('email'):
#                     raise serializers.ValidationError({"email": "Required for guest reviews"})
#         return attrs

#     def to_representation(self, instance):
#         if instance.deleted:
#             return {'id': instance.id, 'message': 'Review deleted successfully'}
#         data = super().to_representation(instance)
#         data.pop('product', None)
#         data.pop('sales_product', None)
#         data['created_at'] = _fmt_dt(data.get('created_at'))
#         data['updated_at'] = _fmt_dt(data.get('updated_at'))
#         return data


# class PublicReviewSerializer(serializers.ModelSerializer):
#     author_name = serializers.SerializerMethodField()
#     item_name   = serializers.SerializerMethodField()
#     item_type   = serializers.SerializerMethodField()

#     class Meta:
#         model  = Review
#         fields = ['id', 'name', 'author_name', 'rating', 'comment',
#                   'item_name', 'item_type', 'created_at']
#         read_only_fields = ['id', 'created_at']

#     def get_author_name(self, obj):
#         if obj.user:
#             return _full_name(obj.user)
#         return obj.name or 'Anonymous'

#     def get_item_name(self, obj):
#         if obj.product and not obj.product.deleted:           return obj.product.name
#         if obj.sales_product and not obj.sales_product.deleted: return obj.sales_product.name
#         return None

#     def get_item_type(self, obj):
#         if obj.product:       return 'product'
#         if obj.sales_product: return 'sales_product'
#         return None


# # ============================================================================
# # DROPDOWN helpers  (kept for backward compat)
# # ============================================================================

# class DropDownListProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model  = Product
#         fields = '__all__'


# class DropDownListSalesProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model  = SalesProduct
#         fields = '__all__'


# class PubliccategorywiseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model  = Category
#         fields = '__all__'





"""
E-commerce Serializers
Follows existing patterns: SerializerMethodField for computed/related data,
full_name fallback to username, deleted-state short response, datetime formatting.

FIXES applied in this pass (search "FIX:"):
1. ProductVariantSerializer.validate() — now enforces (product, size, material)
   uniqueness among NON-deleted variants only, replacing the DB-level
   unique_together that was removed from the model (it ignored deleted=True
   rows and permanently blocked recreating a variant after soft delete).
2. CouponSerializer.validate_code() — unchanged logic, but now this is the
   ONLY place uniqueness is enforced (the model no longer has unique=True),
   so a soft-deleted coupon's code can be reused.
3. ReturnRequestSerializer.validate() — now checks order_detail.order == order,
   matching the same check added to ReturnRequest.clean() in models.py.
4. CartItemSerializer.validate() — now checks requested quantity against
   ProductVariant.stock_quantity and is_active so out-of-stock / inactive
   variants can't be added to a cart.
"""

import re
from decimal import Decimal

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone
from django.db import transaction
from config.settings import BACKEND_BASE_URL

from .models import (
    Category, ProductTag, Product, ProductImage, Color, ProductVariant,
    Inventory, SalesProduct, SalesProductImage, SalesProductColor, SalesProductVariant, SalesInventory,
    Address, ShippingMethod, Coupon,
    Order, OrderDetail, Payment,
    Cart, CartItem, Wishlist, WishlistItem,
    ReturnRequest, Contact, Review,
)

User = get_user_model()


# ─────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────

def _full_name(user):
    if not user:
        return None
    name = user.get_full_name()
    return name.strip() if name and name.strip() else user.username

def _fmt_dt(value):
    if isinstance(value, str):
        return value.replace('T', ' ').split('.')[0]
    return value


# ============================================================================
# CATEGORY
# ============================================================================

class CategoryListingSerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'image', 'products_count']

    def get_products_count(self, obj):
        return obj.products.filter(deleted=False).count() if not obj.deleted else 0

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}" if instance.image else None
        return data


class CategorySerializer(serializers.ModelSerializer):
    products_count       = serializers.SerializerMethodField()
    sales_products_count = serializers.SerializerMethodField()
    created_by           = serializers.SerializerMethodField()
    updated_by           = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'description', 'image', 'products_count',
                  'sales_products_count', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_products_count(self, obj):
        return obj.products.filter(deleted=False).count() if not obj.deleted else 0

    def get_sales_products_count(self, obj):
        return obj.sales_products.filter(deleted=False).count() if not obj.deleted else 0

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters")
        qs = Category.objects.filter(name__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(f"Category '{value}' already exists")
        return value

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'name': instance.name,
                    'message': f'Category "{instance.name}" deleted successfully'}
        data = super().to_representation(instance)
        data['image']      = f"{BACKEND_BASE_URL}{instance.image.url}" if instance.image else None
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


# ============================================================================
# PRODUCT TAG
# ============================================================================

class ProductTagListingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductTag
        fields = ['id', 'name', 'slug']


class ProductTagSerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    created_by     = serializers.SerializerMethodField()
    updated_by     = serializers.SerializerMethodField()

    class Meta:
        model        = ProductTag
        fields       = ['id', 'name', 'slug', 'products_count', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'slug')

    def get_products_count(self, obj):
        return obj.product_set.filter(deleted=False).count() if not obj.deleted else 0

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Tag name must be at least 2 characters")
        return value

    def validate(self, attrs):
        if 'name' in attrs and not attrs.get('slug'):
            attrs['slug'] = slugify(attrs['name'])
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'name': instance.name,
                    'message': f'Tag "{instance.name}" deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


# ============================================================================
# PRODUCT IMAGE
# ============================================================================

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = ['id', 'images', 'image_url', 'alt_text']
        extra_kwargs = {'alt_text': {'required': False}}

    def get_image_url(self, obj):
        return f"{BACKEND_BASE_URL}{obj.images.url}" if obj.images else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('images', None)
        return data


# ============================================================================
# PRODUCT
# ============================================================================

class ProductListingSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='prod_has_category.name', read_only=True)
    first_image   = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'name', 'price', 'group', 'category_name', 'first_image', 'average_rating']

    def get_first_image(self, obj):
        if obj.deleted:
            return None
        img = obj.images.filter(deleted=False).first()
        return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None


class ProductSerializer(serializers.ModelSerializer):
    images         = ProductImageSerializer(many=True, read_only=True)
    image_urls     = serializers.SerializerMethodField()
    category_name  = serializers.CharField(source='prod_has_category.name', read_only=True)
    category_data  = serializers.SerializerMethodField()
    tag_names      = serializers.SerializerMethodField()
    tags_data      = serializers.SerializerMethodField()
    variants_count = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    created_by     = serializers.SerializerMethodField()
    updated_by     = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'name', 'description', 'price', 'group',
                  'prod_has_category', 'category_name', 'category_data',
                  'tags', 'tag_names', 'tags_data',
                  'images', 'image_urls', 'variants_count', 'average_rating',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'prod_has_category': {'required': False, 'allow_null': True},
            'tags':              {'required': False},
        }

    def get_image_urls(self, obj):
        return [f"{BACKEND_BASE_URL}{i.images.url}"
                for i in obj.images.filter(deleted=False) if i.images] if not obj.deleted else []

    def get_category_data(self, obj):
        if obj.deleted or not obj.prod_has_category or obj.prod_has_category.deleted:
            return None
        return CategoryListingSerializer(obj.prod_has_category).data

    def get_tag_names(self, obj):
        return [t.name for t in obj.tags.filter(deleted=False)] if not obj.deleted else []

    def get_tags_data(self, obj):
        return ProductTagListingSerializer(obj.tags.filter(deleted=False), many=True).data if not obj.deleted else []

    def get_variants_count(self, obj):
        return obj.variants.filter(deleted=False, is_active=True).count() if not obj.deleted else 0

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters")
        return value.strip()

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'name': instance.name,
                    'message': f'Product "{instance.name}" deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


# ============================================================================
# COLOR
# ============================================================================

class ColorSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model  = Color
        fields = ['id', 'name', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Color name must be at least 2 characters")
        qs = Color.objects.filter(name__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(f"Color '{value}' already exists")
        return value

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'name': instance.name,
                    'message': f'Color "{instance.name}" deleted successfully'}
        return super().to_representation(instance)


# ============================================================================
# PRODUCT VARIANT
# ============================================================================

class ProductVariantSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price   = serializers.SerializerMethodField()
    color_names   = serializers.SerializerMethodField()
    colors_data   = serializers.SerializerMethodField()
    is_low_stock  = serializers.SerializerMethodField()
    created_by    = serializers.SerializerMethodField()
    updated_by    = serializers.SerializerMethodField()

    class Meta:
        model  = ProductVariant
        fields = ['id', 'product', 'product_name', 'product_price',
                  'size', 'colors', 'color_names', 'colors_data',
                  'material', 'sku', 'stock_quantity', 'additional_price',
                  'total_price', 'is_active', 'is_low_stock',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'sku')
        extra_kwargs = {
            'size':             {'required': False, 'allow_null': True, 'allow_blank': True},
            'material':         {'required': False, 'allow_null': True, 'allow_blank': True},
            'additional_price': {'required': False},
        }

    def get_total_price(self, obj):
        return float(obj.product.price + obj.additional_price) if not obj.deleted and obj.product else None

    def get_color_names(self, obj):
        return [c.name for c in obj.colors.filter(deleted=False)] if not obj.deleted else []

    def get_colors_data(self, obj):
        return ColorSerializer(obj.colors.filter(deleted=False), many=True).data if not obj.deleted else []

    def get_is_low_stock(self, obj):
        try:
            return obj.inventory.is_low_stock if hasattr(obj, 'inventory') else False
        except Exception:
            return obj.stock_quantity < 10

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate(self, attrs):
        # FIX: this replaces the DB-level unique_together=['product','size','material']
        # that was removed from the model. That constraint blocked recreating a
        # variant forever once its (product, size, material) combo was soft-deleted.
        # Here we only check uniqueness among currently NON-deleted variants.
        product  = attrs.get('product',  getattr(self.instance, 'product',  None))
        size     = attrs.get('size',     getattr(self.instance, 'size',     None))
        material = attrs.get('material', getattr(self.instance, 'material', None))

        qs = ProductVariant.objects.filter(
            product=product, size=size, material=material, deleted=False
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "An active variant with this product, size, and material combination already exists"
            )
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'sku': instance.sku,
                    'message': f'Variant "{instance.sku}" deleted successfully'}
        return super().to_representation(instance)


# ============================================================================
# INVENTORY
# ============================================================================

class InventorySerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product_variant.product.name', read_only=True)
    variant_sku   = serializers.CharField(source='product_variant.sku', read_only=True)
    is_low_stock  = serializers.BooleanField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)
    created_by    = serializers.SerializerMethodField()
    updated_by    = serializers.SerializerMethodField()

    class Meta:
        model  = Inventory
        fields = ['id', 'product_variant', 'product_name', 'variant_sku',
                  'current_stock', 'minimum_stock_level', 'maximum_stock_level',
                  'reorder_point', 'cost_price', 'last_restocked',
                  'is_low_stock', 'needs_reorder',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'cost_price':     {'required': False, 'allow_null': True},
            'last_restocked': {'required': False, 'allow_null': True},
        }

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate(self, attrs):
        min_l  = attrs.get('minimum_stock_level', getattr(self.instance, 'minimum_stock_level', 5))
        max_l  = attrs.get('maximum_stock_level', getattr(self.instance, 'maximum_stock_level', 1000))
        reorder = attrs.get('reorder_point',      getattr(self.instance, 'reorder_point', 10))
        if min_l >= max_l:
            raise serializers.ValidationError({'minimum_stock_level': "Must be less than maximum"})
        if reorder > max_l:
            raise serializers.ValidationError({'reorder_point': "Cannot exceed maximum stock level"})
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Inventory record deleted successfully'}
        return super().to_representation(instance)


# ============================================================================
# SALES PRODUCT
# ============================================================================

class SalesProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = SalesProductImage
        fields = ['id', 'images', 'image_url', 'alt_text']
        extra_kwargs = {'alt_text': {'required': False}}

    def get_image_url(self, obj):
        return f"{BACKEND_BASE_URL}{obj.images.url}" if obj.images else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('images', None)
        return data


class SalesProductListingSerializer(serializers.ModelSerializer):
    category_name   = serializers.CharField(source='salesprod_has_category.name', read_only=True)
    first_image     = serializers.SerializerMethodField()
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating  = serializers.FloatField(read_only=True)

    class Meta:
        model  = SalesProduct
        fields = ['id', 'name', 'original_price', 'discount_percent', 'final_price',
                  'discount_amount', 'category_name', 'first_image', 'average_rating']

    def get_first_image(self, obj):
        img = obj.images.filter(deleted=False).first()
        return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None


class SalesProductSerializer(serializers.ModelSerializer):
    images          = SalesProductImageSerializer(many=True, read_only=True)
    image_urls      = serializers.SerializerMethodField()
    category_name   = serializers.CharField(source='salesprod_has_category.name', read_only=True)
    category_data   = serializers.SerializerMethodField()
    has_discount    = serializers.BooleanField(read_only=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating  = serializers.FloatField(read_only=True)
    created_by      = serializers.SerializerMethodField()
    updated_by      = serializers.SerializerMethodField()

    class Meta:
        model  = SalesProduct
        fields = ['id', 'name', 'description', 'original_price', 'discount_percent',
                  'final_price', 'discount_amount', 'has_discount',
                  'image', 'salesprod_has_category', 'category_name', 'category_data',
                  'images', 'image_urls', 'average_rating',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'final_price')
        extra_kwargs = {
            'image':                   {'required': False, 'allow_null': True},
            'salesprod_has_category':  {'required': False, 'allow_null': True},
            'discount_percent':        {'required': False},
        }

    def get_image_urls(self, obj):
        return [f"{BACKEND_BASE_URL}{i.images.url}"
                for i in obj.images.filter(deleted=False) if i.images] if not obj.deleted else []

    def get_category_data(self, obj):
        if obj.deleted or not obj.salesprod_has_category or obj.salesprod_has_category.deleted:
            return None
        return CategoryListingSerializer(obj.salesprod_has_category).data

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_original_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Original price must be greater than 0")
        return value

    def validate_discount_percent(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100")
        return value

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'name': instance.name,
                    'message': f'Sales product "{instance.name}" deleted successfully'}
        data = super().to_representation(instance)
        data['image']      = f"{BACKEND_BASE_URL}{instance.image.url}" if instance.image else None
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


# ============================================================================
# SALES PRODUCT COLOR
# ============================================================================

class SalesProductColorSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model  = SalesProductColor
        fields = ['id', 'name', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Color name must be at least 2 characters")
        qs = SalesProductColor.objects.filter(name__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError(f"Sales product color '{value}' already exists")
        return value

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'name': instance.name,
                    'message': f'Sales product color "{instance.name}" deleted successfully'}
        return super().to_representation(instance)


# ============================================================================
# SALES PRODUCT VARIANT
# ============================================================================

class SalesProductVariantSerializer(serializers.ModelSerializer):
    salesproduct_name = serializers.CharField(source='salesproduct.name', read_only=True)
    salesproduct_price = serializers.DecimalField(source='salesproduct.final_price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()
    color_names = serializers.SerializerMethodField()
    colors_data = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model  = SalesProductVariant
        fields = ['id', 'salesproduct', 'salesproduct_name', 'salesproduct_price',
                  'size', 'colors', 'color_names', 'colors_data',
                  'material', 'sku', 'stock_quantity', 'additional_price',
                  'total_price', 'is_active', 'is_low_stock',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'sku')
        extra_kwargs = {
            'size': {'required': False, 'allow_null': True, 'allow_blank': True},
            'material': {'required': False, 'allow_null': True, 'allow_blank': True},
            'additional_price': {'required': False},
        }

    def get_total_price(self, obj):
        return float(obj.salesproduct.final_price + obj.additional_price) if not obj.deleted and obj.salesproduct else None

    def get_color_names(self, obj):
        return [c.name for c in obj.colors.filter(deleted=False)] if not obj.deleted else []

    def get_colors_data(self, obj):
        return ColorSerializer(obj.colors.filter(deleted=False), many=True).data if not obj.deleted else []

    def get_is_low_stock(self, obj):
        try:
            return obj.salesinventory.is_low_stock if hasattr(obj, 'salesinventory') else False
        except Exception:
            return obj.stock_quantity < 10

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate(self, attrs):
        # Similar validation as ProductVariant - check uniqueness among non-deleted variants
        salesproduct = attrs.get('salesproduct', getattr(self.instance, 'salesproduct', None))
        size = attrs.get('size', getattr(self.instance, 'size', None))
        material = attrs.get('material', getattr(self.instance, 'material', None))

        qs = SalesProductVariant.objects.filter(
            salesproduct=salesproduct, size=size, material=material, deleted=False
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "An active sales variant with this sales product, size, and material combination already exists"
            )
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'sku': instance.sku,
                    'message': f'Sales variant "{instance.sku}" deleted successfully'}
        return super().to_representation(instance)


# ============================================================================
# SALES INVENTORY
# ============================================================================

class SalesInventorySerializer(serializers.ModelSerializer):
    salesproduct_name = serializers.CharField(source='sales_product_variant.salesproduct.name', read_only=True)
    variant_sku = serializers.CharField(source='sales_product_variant.sku', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model  = SalesInventory
        fields = ['id', 'sales_product_variant', 'salesproduct_name', 'variant_sku',
                  'current_stock', 'minimum_stock_level', 'maximum_stock_level',
                  'reorder_point', 'cost_price', 'last_restocked',
                  'is_low_stock', 'needs_reorder',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'cost_price': {'required': False, 'allow_null': True},
            'last_restocked': {'required': False, 'allow_null': True},
        }

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate(self, attrs):
        min_l = attrs.get('minimum_stock_level', getattr(self.instance, 'minimum_stock_level', 5))
        max_l = attrs.get('maximum_stock_level', getattr(self.instance, 'maximum_stock_level', 1000))
        reorder = attrs.get('reorder_point', getattr(self.instance, 'reorder_point', 10))
        if min_l >= max_l:
            raise serializers.ValidationError({'minimum_stock_level': "Must be less than maximum"})
        if reorder > max_l:
            raise serializers.ValidationError({'reorder_point': "Cannot exceed maximum stock level"})
        return attrs


# ============================================================================
# ADDRESS
# ============================================================================

class AddressSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model  = Address
        fields = ['id', 'user', 'label', 'full_name', 'phone', 'street',
                  'city', 'province', 'postal_code', 'is_default',
                  'created_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'user')

    def get_created_by(self, obj): return _full_name(obj.created_by)

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Address deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


# ============================================================================
# SHIPPING METHOD
# ============================================================================

class ShippingMethodSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model  = ShippingMethod
        fields = ['id', 'name', 'estimated_days', 'cost', 'is_active',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Shipping method deleted successfully'}
        return super().to_representation(instance)


# ============================================================================
# COUPON
# ============================================================================

class CouponSerializer(serializers.ModelSerializer):
    is_exhausted = serializers.BooleanField(read_only=True)
    created_by   = serializers.SerializerMethodField()
    updated_by   = serializers.SerializerMethodField()

    class Meta:
        model  = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value',
                  'min_order_amount', 'max_uses', 'used_count',
                  'valid_from', 'valid_to', 'is_active',
                  'applicable_products', 'is_exhausted',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'used_count')

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_code(self, value):
        # FIX: this is now the ONLY place coupon-code uniqueness is enforced
        # (model no longer has unique=True) — so a soft-deleted coupon's code
        # is free to reuse, matching the pattern already used for Category/Color.
        value = value.strip().upper()
        qs = Coupon.objects.filter(code__iexact=value, deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Coupon code already exists")
        return value

    def validate(self, attrs):
        vf = attrs.get('valid_from')
        vt = attrs.get('valid_to')
        if vf and vt and vf >= vt:
            raise serializers.ValidationError("valid_to must be after valid_from")
        if attrs.get('discount_type') == 'percentage' and attrs.get('discount_value', 0) > 100:
            raise serializers.ValidationError("Percentage discount cannot exceed 100")
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'code': instance.code, 'message': 'Coupon deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


class ValidateCouponSerializer(serializers.Serializer):
    """Validates a coupon code at checkout before placing an order."""
    code         = serializers.CharField(max_length=50)
    order_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


# ============================================================================
# ORDER DETAIL & ORDER
# ============================================================================

class OrderDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_type = serializers.SerializerMethodField()

    class Meta:
        model  = OrderDetail
        fields = ['id', 'order', 'product', 'sales_product', 'product_name',
                  'product_type', 'unit_price', 'quantity', 'total_price',
                  'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'total_price')
        extra_kwargs = {
            'product':       {'required': False, 'allow_null': True},
            'sales_product': {'required': False, 'allow_null': True},
        }

    def get_product_name(self, obj):
        if obj.product and not obj.product.deleted:
            return obj.product.name
        if obj.sales_product and not obj.sales_product.deleted:
            return obj.sales_product.name
        return None

    def get_product_type(self, obj):
        if obj.product:
            return 'product'
        if obj.sales_product:
            return 'sales_product'
        return None

    def validate(self, attrs):
        product       = attrs.get('product')
        sales_product = attrs.get('sales_product')
        if not product and not sales_product:
            raise serializers.ValidationError("Either product or sales_product is required")
        if product and sales_product:
            raise serializers.ValidationError("Cannot specify both product and sales_product")
        if attrs.get('quantity', 1) < 1:
            raise serializers.ValidationError({"quantity": "Must be at least 1"})
        return attrs


class OrderSerializer(serializers.ModelSerializer):
    order_details  = OrderDetailSerializer(many=True, read_only=True)
    rider_name     = serializers.SerializerMethodField()
    total_amount   = serializers.SerializerMethodField()
    items_count    = serializers.SerializerMethodField()
    shipping_info  = serializers.SerializerMethodField()
    coupon_code    = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = ['id', 'bill', 'subtotal', 'shipping_cost', 'discount_amount',
                  'customer', 'customer_name', 'customer_email', 'customer_phone',
                  'address', 'delivery_address', 'city', 'delivery_date',
                  'shipping_method', 'shipping_info', 'rider', 'rider_name',
                  'coupon', 'coupon_code',
                  'status', 'payment_method', 'payment_status',
                  'order_details', 'total_amount', 'items_count',
                  'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'customer':        {'required': False, 'allow_null': True},
            'rider':           {'required': False, 'allow_null': True},
            'bill':            {'required': False, 'allow_null': True},
            'city':            {'required': False, 'allow_null': True},
            'delivery_date':   {'required': False, 'allow_null': True},
            'address':         {'required': False, 'allow_null': True},
            'shipping_method': {'required': False, 'allow_null': True},
            'coupon':          {'required': False, 'allow_null': True},
        }

    def get_rider_name(self, obj):   return _full_name(obj.rider)
    def get_total_amount(self, obj): return obj.total_amount if not obj.deleted else None
    def get_items_count(self, obj):  return obj.order_details.filter(deleted=False).count() if not obj.deleted else 0
    def get_coupon_code(self, obj):  return obj.coupon.code if obj.coupon else None

    def get_shipping_info(self, obj):
        if obj.shipping_method:
            return ShippingMethodSerializer(obj.shipping_method).data
        return None

    def validate_customer_email(self, value):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise serializers.ValidationError("Invalid email format")
        return value.lower()

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'customer_name': instance.customer_name,
                    'message': f'Order #{instance.id} deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


# ============================================================================
# PAYMENT
# ============================================================================

class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.IntegerField(source='order.id', read_only=True)
    created_by   = serializers.SerializerMethodField()

    class Meta:
        model  = Payment
        fields = ['id', 'order', 'order_number', 'transaction_id', 'amount',
                  'status', 'payment_gateway', 'gateway_response', 'paid_at',
                  'created_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_created_by(self, obj): return _full_name(obj.created_by)

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Payment record deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        return data


# ============================================================================
# CART & CART ITEM
# ============================================================================

class CartItemSerializer(serializers.ModelSerializer):
    item_name  = serializers.SerializerMethodField()
    item_image = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    line_total = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = ['id', 'cart', 'product_variant', 'sales_product',
                  'item_name', 'item_image', 'quantity',
                  'unit_price', 'line_total', 'created_at']
        read_only_fields = ('created_at',)
        extra_kwargs = {
            'product_variant': {'required': False, 'allow_null': True},
            'sales_product':   {'required': False, 'allow_null': True},
        }

    def get_item_name(self, obj):
        if obj.product_variant:
            return str(obj.product_variant)
        return obj.sales_product.name if obj.sales_product else None

    def get_item_image(self, obj):
        if obj.product_variant:
            img = obj.product_variant.product.images.filter(deleted=False).first()
            return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None
        if obj.sales_product and obj.sales_product.image:
            return f"{BACKEND_BASE_URL}{obj.sales_product.image.url}"
        return None

    def get_unit_price(self, obj):
        try:
            return str(obj.unit_price)
        except Exception:
            return None

    def get_line_total(self, obj):
        try:
            return str(obj.line_total)
        except Exception:
            return None

    def validate(self, attrs):
        product_variant = attrs.get('product_variant', getattr(self.instance, 'product_variant', None))
        sales_product   = attrs.get('sales_product',   getattr(self.instance, 'sales_product',   None))
        quantity        = attrs.get('quantity',         getattr(self.instance, 'quantity', 1))

        if not product_variant and not sales_product:
            raise serializers.ValidationError("Either product_variant or sales_product is required")
        if product_variant and sales_product:
            raise serializers.ValidationError("Cannot set both product_variant and sales_product")

        # FIX: previously nothing stopped adding an out-of-stock or inactive
        # variant to the cart. Now we check availability up front.
        if product_variant:
            if product_variant.deleted or not product_variant.is_active:
                raise serializers.ValidationError("This product variant is not currently available")
            if quantity > product_variant.stock_quantity:
                raise serializers.ValidationError(
                    f"Only {product_variant.stock_quantity} unit(s) available in stock"
                )
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items       = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal    = serializers.SerializerMethodField()

    class Meta:
        model  = Cart
        fields = ['id', 'user', 'session_key', 'items', 'total_items', 'subtotal', 'created_at']
        read_only_fields = ('created_at',)

    def get_subtotal(self, obj):
        try:
            return str(obj.subtotal)
        except Exception:
            return '0'


# ============================================================================
# WISHLIST
# ============================================================================

class WishlistItemSerializer(serializers.ModelSerializer):
    item_name  = serializers.SerializerMethodField()
    item_price = serializers.SerializerMethodField()
    item_image = serializers.SerializerMethodField()

    class Meta:
        model  = WishlistItem
        fields = ['id', 'wishlist', 'product', 'sales_product',
                  'item_name', 'item_price', 'item_image', 'created_at']
        read_only_fields = ('created_at',)
        extra_kwargs = {
            'product':       {'required': False, 'allow_null': True},
            'sales_product': {'required': False, 'allow_null': True},
        }

    def get_item_name(self, obj):
        item = obj.product or obj.sales_product
        return item.name if item else None

    def get_item_price(self, obj):
        if obj.product:
            return str(obj.product.price)
        if obj.sales_product:
            return str(obj.sales_product.final_price)
        return None

    def get_item_image(self, obj):
        if obj.product:
            img = obj.product.images.filter(deleted=False).first()
            return f"{BACKEND_BASE_URL}{img.images.url}" if img and img.images else None
        if obj.sales_product and obj.sales_product.image:
            return f"{BACKEND_BASE_URL}{obj.sales_product.image.url}"
        return None

    def validate(self, attrs):
        if not attrs.get('product') and not attrs.get('sales_product'):
            raise serializers.ValidationError("Either product or sales_product is required")
        if attrs.get('product') and attrs.get('sales_product'):
            raise serializers.ValidationError("Cannot set both product and sales_product")
        return attrs


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Wishlist
        fields = ['id', 'user', 'items', 'created_at']
        read_only_fields = ('created_at',)


# ============================================================================
# RETURN REQUEST
# ============================================================================

class ReturnRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.IntegerField(source='order.id', read_only=True)
    product_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    created_by   = serializers.SerializerMethodField()

    class Meta:
        model  = ReturnRequest
        fields = ['id', 'order', 'order_number', 'order_detail',
                  'reason', 'description', 'status', 'refund_amount',
                  'product_name', 'reviewed_by', 'reviewed_by_name',
                  'created_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_product_name(self, obj):
        try:
            d = obj.order_detail
            return (d.product.name if d.product else
                    (d.sales_product.name if d.sales_product else "Deleted Product"))
        except Exception:
            return None

    def get_reviewed_by_name(self, obj): return _full_name(obj.reviewed_by)
    def get_created_by(self, obj):       return _full_name(obj.created_by)

    def validate(self, attrs):
        order        = attrs.get('order')        or (self.instance.order        if self.instance else None)
        order_detail = attrs.get('order_detail')  or (self.instance.order_detail if self.instance else None)

        if order and order.status != 'delivered':
            raise serializers.ValidationError("Returns can only be requested for delivered orders")

        # FIX: previously nothing checked that order_detail actually belongs
        # to order — a request could reference mismatched order/order_detail
        # pairs. Mirrors the same check added to ReturnRequest.clean().
        if order and order_detail and order_detail.order_id != order.id:
            raise serializers.ValidationError("This order item does not belong to the given order")

        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Return request deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        return data


# ============================================================================
# CONTACT
# ============================================================================

class ContactSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model  = Contact
        fields = ['id', 'name', 'email', 'phone_number', 'message',
                  'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {'message': {'required': False, 'allow_null': True, 'allow_blank': True}}

    def get_created_by(self, obj): return _full_name(obj.created_by)
    def get_updated_by(self, obj): return _full_name(obj.updated_by)

    def validate_name(self, value):
        if not re.match(r'^[a-zA-Z]+( [a-zA-Z]+)*$', value):
            raise serializers.ValidationError("Name must contain only alphabetic characters")
        return value.strip()

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Contact deleted successfully'}
        data = super().to_representation(instance)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        return data


# ============================================================================
# REVIEW
# ============================================================================

class ReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    item_name   = serializers.SerializerMethodField()
    item_type   = serializers.SerializerMethodField()
    item_data   = serializers.SerializerMethodField()
    can_edit    = serializers.SerializerMethodField()
    can_delete  = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ['id', 'user', 'name', 'email', 'author_name',
                  'rating', 'comment',
                  'product', 'sales_product', 'item_name', 'item_type', 'item_data',
                  'can_edit', 'can_delete', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'user')
        extra_kwargs = {
            'name':          {'required': False, 'allow_blank': True},
            'email':         {'required': False, 'allow_null': True},
            'product':       {'required': False, 'allow_null': True},
            'sales_product': {'required': False, 'allow_null': True},
        }

    def get_author_name(self, obj):
        if obj.user:
            return _full_name(obj.user)
        return obj.name or 'Anonymous'

    def get_item_name(self, obj):
        if obj.product and not obj.product.deleted:     return obj.product.name
        if obj.sales_product and not obj.sales_product.deleted: return obj.sales_product.name
        return None

    def get_item_type(self, obj):
        if obj.product:       return 'product'
        if obj.sales_product: return 'sales_product'
        return None

    def get_item_data(self, obj):
        if obj.product and not obj.product.deleted:
            return {'id': obj.product.id, 'name': obj.product.name,
                    'type': 'product', 'price': float(obj.product.price)}
        if obj.sales_product and not obj.sales_product.deleted:
            return {'id': obj.sales_product.id, 'name': obj.sales_product.name,
                    'type': 'sales_product',
                    'original_price': float(obj.sales_product.original_price),
                    'final_price':    float(obj.sales_product.final_price),
                    'discount_percent': float(obj.sales_product.discount_percent)}
        return None

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated: return False
        return request.user.is_staff or obj.user == request.user

    def get_can_delete(self, obj):
        return self.get_can_edit(obj)

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def validate_comment(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters")
        if len(value) > 1000:
            raise serializers.ValidationError("Comment cannot exceed 1000 characters")
        return value.strip()

    def validate(self, attrs):
        request = self.context.get('request')
        if not self.instance:
            if not attrs.get('product') and not attrs.get('sales_product'):
                raise serializers.ValidationError("Must specify either a product or sales product")
            if attrs.get('product') and attrs.get('sales_product'):
                raise serializers.ValidationError("Cannot specify both product and sales product")
            if request and request.user.is_authenticated:
                attrs['user'] = request.user
                attrs.pop('name', None)
                attrs.pop('email', None)
            else:
                if not attrs.get('name'):
                    raise serializers.ValidationError({"name": "Required for guest reviews"})
                if not attrs.get('email'):
                    raise serializers.ValidationError({"email": "Required for guest reviews"})
        return attrs

    def to_representation(self, instance):
        if instance.deleted:
            return {'id': instance.id, 'message': 'Review deleted successfully'}
        data = super().to_representation(instance)
        data.pop('product', None)
        data.pop('sales_product', None)
        data['created_at'] = _fmt_dt(data.get('created_at'))
        data['updated_at'] = _fmt_dt(data.get('updated_at'))
        return data


class PublicReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    item_name   = serializers.SerializerMethodField()
    item_type   = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = ['id', 'name', 'author_name', 'rating', 'comment',
                  'item_name', 'item_type', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_author_name(self, obj):
        if obj.user:
            return _full_name(obj.user)
        return obj.name or 'Anonymous'

    def get_item_name(self, obj):
        if obj.product and not obj.product.deleted:           return obj.product.name
        if obj.sales_product and not obj.sales_product.deleted: return obj.sales_product.name
        return None

    def get_item_type(self, obj):
        if obj.product:       return 'product'
        if obj.sales_product: return 'sales_product'
        return None


# ============================================================================
# DROPDOWN helpers  (kept for backward compat)
# ============================================================================

class DropDownListProductSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = '__all__'


class DropDownListSalesProductSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SalesProduct
        fields = '__all__'


class PubliccategorywiseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = '__all__'