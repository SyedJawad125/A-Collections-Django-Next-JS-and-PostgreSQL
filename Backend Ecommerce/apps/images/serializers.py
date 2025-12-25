from rest_framework import serializers
from .models import Categories, Images
from apps.users.serializers import UserListSerializer
from django.utils.text import slugify
from config.settings import BACKEND_BASE_URL
import re


# ======================= CATEGORY SERIALIZERS =======================

class CategoriesListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for category listings in dropdowns/references"""
    images_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Categories
        fields = ['id', 'category', 'images_count']  # Remove 'slug', 'is_active'
        # OR if you want to include all safe fields:
        # fields = ['id', 'category', 'description', 'created_at', 'updated_at', 'images_count']
    
    def get_images_count(self, obj):
        """Get count of active images in this category"""
        if hasattr(obj, 'deleted') and obj.deleted:
            return 0
        
        # Fix the query to match your actual relationships
        # Since your Images model has 'imagescategory' ForeignKey, use the related_name
        if hasattr(obj, 'categoriesimages'):  # This matches your related_name
            return obj.categoriesimages.filter(deleted=False).count()
        return 0

class CategoriesSerializer(serializers.ModelSerializer):
    images_count = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Categories
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted')
        # Make file/image fields optional
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'icon': {'required': False, 'allow_null': True},
            'thumbnail': {'required': False, 'allow_null': True},
            # Add any other file/image fields your model has
        }
    
    def get_images_count(self, obj):
        """Get count of active images in this category"""
        if obj.deleted:
            return 0
        
        # Check what the actual related name is for images
        if hasattr(obj, 'images') and obj.images.filter(deleted=False, is_active=True).exists():
            return obj.images.filter(deleted=False, is_active=True).count()
        elif hasattr(obj, 'image_set') and obj.image_set.filter(deleted=False, is_active=True).exists():
            return obj.image_set.filter(deleted=False, is_active=True).count()
        elif hasattr(obj, 'category_images') and obj.category_images.filter(deleted=False, is_active=True).exists():
            return obj.category_images.filter(deleted=False, is_active=True).count()
        else:
            return 0
    
    def get_created_by(self, obj):
        """Get created by user with proper serialization"""
        if obj.created_by:
            return UserListSerializer(obj.created_by).data
        return None
    
    def get_updated_by(self, obj):
        """Get updated by user with proper serialization"""
        if obj.updated_by:
            return UserListSerializer(obj.updated_by).data
        return None
    
    def validate_category(self, value):
        """Validate category name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long")
        
        # Check for duplicate names (case-insensitive)
        qs = Categories.objects.filter(category__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        
        if qs.exists():
            raise serializers.ValidationError(f"Category with name '{value}' already exists")
        
        return value.strip()
    
    def validate(self, attrs):
        """Cross-field validation"""
        # Debug print
        print("DEBUG - Incoming attrs:", attrs)
        print("DEBUG - Instance:", self.instance)
        
        # Set deleted=False for new instances
        if not self.instance:
            attrs['deleted'] = False
        
        print("DEBUG - Final attrs:", attrs)
        return attrs
    
    def to_representation(self, instance):
        """Customize output representation with desired field order"""
        # Check if the instance was just soft-deleted (deleted flag is True)
        # This indicates we're in a delete response
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.category,
                'message': f'Category "{instance.category}" has been deleted successfully'
            }
        
        # Normal representation for other operations (GET, POST, PUT)
        data = super().to_representation(instance)
        
        # Remove deleted field from output
        data.pop('deleted', None)
        
        # Create a new ordered dictionary with the desired field order
        ordered_data = {
            'id': data.get('id'),
            'category': data.get('category'),  # Category comes right after ID
            'images_count': data.get('images_count'),
            'created_by': data.get('created_by'),
            'updated_by': data.get('updated_by'),
            'created_at': data.get('created_at'),
            'updated_at': data.get('updated_at'),
        }
        
        # Add any remaining fields that weren't in our ordered list
        for key, value in data.items():
            if key not in ordered_data:
                ordered_data[key] = value
        
        # Format datetime fields if needed
        if isinstance(ordered_data.get('created_at'), str):
            ordered_data['created_at'] = ordered_data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(ordered_data.get('updated_at'), str):
            ordered_data['updated_at'] = ordered_data['updated_at'].replace('T', ' ').split('.')[0]
        
        return ordered_data

class TextBoxCategoriesSerializer(serializers.ModelSerializer):
    """Lightweight serializer for textbox/autocomplete components"""
    
    class Meta:
        model = Categories
        fields = ['id', 'category', 'slug']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Only include active categories
        if not instance.is_active or instance.deleted:
            return None
        return data


# ======================= IMAGE SERIALIZERS =======================

class ImagesListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for image listings"""
    category_name = serializers.CharField(source='imagescategory.category', read_only=True)
    
    class Meta:
        model = Images
        fields = ['id', 'title', 'image', 'category_name', 'is_active', 'created_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Handle image URL with full backend URL
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None
        
        return data


class ImagesSerializer(serializers.ModelSerializer):
    """Full image serializer with validations and nested data"""
    category_name = serializers.CharField(source='imagescategory.category', read_only=True)
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    category_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Images
        exclude = ['deleted']
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
    
    def get_created_by(self, obj):
        """Get created by user with proper serialization"""
        if obj.created_by:
            return UserListSerializer(obj.created_by).data
        return None
    
    def get_updated_by(self, obj):
        """Get updated by user with proper serialization"""
        if obj.updated_by:
            return UserListSerializer(obj.updated_by).data
        return None
    
    def get_category_details(self, obj):
        """Get full category details"""
        if obj.imagescategory and not obj.imagescategory.deleted:
            return CategoriesListingSerializer(obj.imagescategory).data
        return None
    
    def validate_name(self, value):
        """Validate image name"""
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long")
        return value.strip() if value else None
    
    def validate_image(self, value):
        """Validate image file"""
        if not value:
            raise serializers.ValidationError("Image file is required")
        
        # Validate file size (e.g., max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Image size cannot exceed {max_size / (1024 * 1024)}MB"
            )
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if hasattr(value, 'content_type') and value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        return value
    
    def validate_imagescategory(self, value):
        """Validate category is not deleted"""
        if value and value.deleted:
            raise serializers.ValidationError("Selected category is not available")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        return attrs
    
    def to_representation(self, instance):
        """Customize output representation with desired field order"""
        # Check if the instance was just soft-deleted (deleted flag is True)
        # This indicates we're in a delete response
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Image \"{instance.name}\" has been deleted successfully'
            }
        
        # Normal representation for other operations (GET, POST, PUT)
        data = super().to_representation(instance)
        
        # Handle image URL with full backend URL
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        # Create a new ordered dictionary with the desired field order
        ordered_data = {
            'id': data.get('id'),
            'category_name': data.get('category_name'),
            'name': data.get('name'),
            'description': data.get('description'),
            'bulletsdescription': data.get('bulletsdescription'),
            'image': data.get('image'),
            'imagescategory': data.get('imagescategory'),
            'category_details': data.get('category_details'),
            'created_by': data.get('created_by'),
            'updated_by': data.get('updated_by'),
            'created_at': data.get('created_at'),
            'updated_at': data.get('updated_at'),
        }
        
        # Add any remaining fields that weren't in our ordered list
        for key, value in data.items():
            if key not in ordered_data:
                ordered_data[key] = value
        
        return ordered_data
    
class PublicImagesSerializer(serializers.ModelSerializer):
    """Public-facing serializer with limited fields for anonymous users"""
    category_name = serializers.CharField(source='imagescategory.category', read_only=True)
    category_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Images
        fields = [
            'id', 
            'name', 
            'description', 
            'bulletsdescription', 
            'image', 
            'category_name', 
            'imagescategory',
            'category_details',
            'created_at',
            'updated_at'
        ]
        read_only_fields = fields  # All fields are read-only for public
    
    def get_category_details(self, obj):
        """Get full category details"""
        if obj.imagescategory and not obj.imagescategory.deleted:
            return CategoriesListingSerializer(obj.imagescategory).data
        return None
    
    def to_representation(self, instance):
        """Customize output - only show non-deleted images"""
        # Only check for deleted images
        if instance.deleted:
            return None
        
        data = super().to_representation(instance)
        
        # Handle image URL with full backend URL
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        # Create a new ordered dictionary with the desired field order
        ordered_data = {
            'id': data.get('id'),
            'category_name': data.get('category_name'),
            'name': data.get('name'),
            'description': data.get('description'),
            'bulletsdescription': data.get('bulletsdescription'),
            'image': data.get('image'),
            'imagescategory': data.get('imagescategory'),
            'category_details': data.get('category_details'),
            'created_at': data.get('created_at'),
            'updated_at': data.get('updated_at'),
        }
        
        # Add any remaining fields that weren't in our ordered list
        for key, value in data.items():
            if key not in ordered_data:
                ordered_data[key] = value
        
        return ordered_data
    
class TextBoxImagesSerializer(serializers.ModelSerializer):
    """Lightweight serializer for textbox/autocomplete components"""
    category_name = serializers.CharField(source='imagescategory.category', read_only=True)
    
    class Meta:
        model = Images
        fields = ['id', 'title', 'image', 'category_name']
    
    def to_representation(self, instance):
        """Only include active images"""
        if not instance.is_active or instance.deleted:
            return None
        
        data = super().to_representation(instance)
        
        # Provide thumbnail or small image URL
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        
        return data