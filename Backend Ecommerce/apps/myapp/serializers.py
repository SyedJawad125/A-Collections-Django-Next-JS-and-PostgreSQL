# from rest_framework import serializers
# from .models import Category, Tag, BlogPost, Comment, Media, Newsletter, Campaign
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from django.utils.text import slugify
# from utils.enums import *
# from config.settings import BACKEND_BASE_URL
# from utils.reusable_functions import get_first_error
# from django.db import transaction
# import re

# User = get_user_model()


# # ======================= CATEGORY SERIALIZERS =======================

# class CategoryListingSerializer(serializers.ModelSerializer):
#     """Minimal serializer for category listings in dropdowns/references"""
#     subcategories_count = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Category
#         fields = ['id', 'name', 'slug', 'image', 'is_active', 'subcategories_count']
    
#     def get_subcategories_count(self, obj):
#         # Check if object is deleted first
#         if obj.deleted:
#             return 0
#         return obj.subcategories.filter(deleted=False, is_active=True).count()
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         if instance.image:
#             data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
#         return data


# class CategorySerializer(serializers.ModelSerializer):
#     """Full category serializer with validations"""
#     subcategories_count = serializers.SerializerMethodField()
#     posts_count = serializers.SerializerMethodField()
#     created_by = serializers.SerializerMethodField()
#     updated_by = serializers.SerializerMethodField()
#     parent = serializers.SerializerMethodField()
#     subcategories = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Category
#         fields = [
#             'id', 
#             'name', 
#             'slug', 
#             'description', 
#             'image', 
#             'is_active', 
#             'meta_title', 
#             'meta_description',
#             'subcategories_count',
#             'posts_count',
#             'created_by',
#             'updated_by',
#             'parent',
#             'subcategories',
#             'created_at',
#             'updated_at'
#         ]
#         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'slug')
    
#     def get_subcategories_count(self, obj):
#         # Return 0 for deleted categories
#         if obj.deleted:
#             return 0
#         return obj.subcategories.filter(deleted=False, is_active=True).count()
    
#     def get_posts_count(self, obj):
#         # Return 0 for deleted categories
#         if obj.deleted:
#             return 0
#         return obj.blogpost_set.filter(deleted=False, status=PUBLISHED).count()
    
#     def get_created_by(self, obj):
#         """Get created by user with fallback to username"""
#         if obj.created_by:
#             full_name = obj.created_by.get_full_name()
#             return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
#         return None
    
#     def get_updated_by(self, obj):
#         """Get updated by user with fallback to username"""
#         if obj.updated_by:
#             full_name = obj.updated_by.get_full_name()
#             return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
#         return None
    
#     def get_parent(self, obj):
#         """Get parent category data"""
#         # Don't return parent data for deleted categories
#         if obj.deleted:
#             return None
#         if obj.parent and not obj.parent.deleted:
#             return CategoryListingSerializer(obj.parent).data
#         return None
    
#     def get_subcategories(self, obj):
#         """Get subcategories data"""
#         # Don't return subcategories for deleted categories
#         if obj.deleted:
#             return []
            
#         request = self.context.get('request')
#         if request and request.method == 'GET':
#             # Check if this is a single object retrieval (not list)
#             if hasattr(obj, 'id') and not isinstance(obj, list):
#                 subcategories = obj.subcategories.filter(deleted=False, is_active=True)
#                 return CategoryListingSerializer(subcategories, many=True, context=self.context).data
#         return []
    
#     def validate_name(self, value):
#         """Validate category name"""
#         if len(value.strip()) < 2:
#             raise serializers.ValidationError("Category name must be at least 2 characters long")
        
#         # Check for duplicate names (case-insensitive)
#         qs = Category.objects.filter(name__iexact=value.strip(), deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
        
#         if qs.exists():
#             raise serializers.ValidationError(f"Category with name '{value}' already exists")
        
#         return value.strip()
    
#     def validate_parent(self, value):
#         """Prevent circular parent relationships"""
#         if value and self.instance and value.id == self.instance.id:
#             raise serializers.ValidationError("A category cannot be its own parent")
        
#         # Check for circular reference
#         if value and self.instance:
#             current = value
#             while current:
#                 if current.id == self.instance.id:
#                     raise serializers.ValidationError("Circular parent relationship detected")
#                 current = current.parent
        
#         return value
    
#     def validate(self, attrs):
#         """Cross-field validation"""
#         # Auto-generate slug if not provided
#         if 'name' in attrs and not attrs.get('slug'):
#             attrs['slug'] = slugify(attrs['name'])
        
#         # Validate meta fields length
#         if attrs.get('meta_title') and len(attrs['meta_title']) > 160:
#             raise serializers.ValidationError({"meta_title": "Meta title cannot exceed 160 characters"})
        
#         if attrs.get('meta_description') and len(attrs['meta_description']) > 320:
#             raise serializers.ValidationError({"meta_description": "Meta description cannot exceed 320 characters"})
        
#         return attrs
    
#     def to_representation(self, instance):
#         """Customize output representation with desired field order"""
#         # Check if the instance was just soft-deleted (deleted flag is True)
#         # This indicates we're in a delete response
#         if instance.deleted:
#             return {
#                 'id': instance.id,
#                 'name': instance.name,
#                 'message': f'Category "{instance.name}" has been deleted successfully'
#             }
        
#         # Normal representation for other operations (GET, POST, PUT)
#         data = super().to_representation(instance)
        
#         # Handle image URL
#         if instance.image:
#             data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
#         else:
#             data['image'] = None
        
#         # Format datetime fields if needed
#         if isinstance(data.get('created_at'), str):
#             data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
#         if isinstance(data.get('updated_at'), str):
#             data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
#         return data
    
# # ======================= TAG SERIALIZERS =======================

# class TagListingSerializer(serializers.ModelSerializer):
#     """Minimal serializer for tag listings"""
#     class Meta:
#         model = Tag
#         fields = ['id', 'name', 'slug', 'color']


# class TagSerializer(serializers.ModelSerializer):
#     """Full tag serializer with validations"""
#     posts_count = serializers.SerializerMethodField()
#     created_by = serializers.SerializerMethodField()
#     updated_by = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Tag
#         fields = [
#             'id',
#             'name',
#             'slug',
#             'color',
#             'is_active',
#             'posts_count',
#             'created_by',
#             'updated_by',
#             'created_at',
#             'updated_at'
#         ]
#         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'slug')
    
#     def get_posts_count(self, obj):
#         """Get posts count"""
#         # Return 0 for deleted tags
#         if obj.deleted:
#             return 0
#         return obj.blogpost_set.filter(deleted=False, status=PUBLISHED).count()
    
#     def get_created_by(self, obj):
#         """Get created by user with fallback to username"""
#         if obj.created_by:
#             full_name = obj.created_by.get_full_name()
#             return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
#         return None
    
#     def get_updated_by(self, obj):
#         """Get updated by user with fallback to username"""
#         if obj.updated_by:
#             full_name = obj.updated_by.get_full_name()
#             return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
#         return None
    
#     def validate_name(self, value):
#         """Validate tag name"""
#         if len(value.strip()) < 2:
#             raise serializers.ValidationError("Tag name must be at least 2 characters long")
        
#         # Check for duplicate names (case-insensitive)
#         qs = Tag.objects.filter(name__iexact=value.strip(), deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
        
#         if qs.exists():
#             raise serializers.ValidationError(f"Tag with name '{value}' already exists")
        
#         return value.strip()
    
#     def validate_color(self, value):
#         """Validate hex color code"""
#         if value and not re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', value):
#             raise serializers.ValidationError("Invalid hex color code. Use format like #007bff")
#         return value
    
#     def validate(self, attrs):
#         """Auto-generate slug"""
#         if 'name' in attrs and not attrs.get('slug'):
#             attrs['slug'] = slugify(attrs['name'])
#         return attrs
    
#     def to_representation(self, instance):
#         """Customize output representation"""
#         # Check if the instance was just soft-deleted (deleted flag is True)
#         # This indicates we're in a delete response
#         if instance.deleted:
#             return {
#                 'id': instance.id,
#                 'name': instance.name,
#                 'message': f'Tag "{instance.name}" has been deleted successfully'
#             }
        
#         # Normal representation for other operations (GET, POST, PUT)
#         data = super().to_representation(instance)
        
#         # Format datetime fields if needed
#         if isinstance(data.get('created_at'), str):
#             data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
#         if isinstance(data.get('updated_at'), str):
#             data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
#         return data

# # ======================= BLOG POST SERIALIZERS =======================

# class BlogPostListingSerializer(serializers.ModelSerializer):
#     """Minimal serializer for blog post listings"""
#     author_name = serializers.CharField(source='author', read_only=True)
#     category_name = serializers.CharField(source='category.name', read_only=True)
    
#     class Meta:
#         model = BlogPost
#         fields = ['id', 'title', 'slug', 'excerpt', 'featured_image', 'author_name', 
#                   'category_name', 'status', 'published_at', 'view_count', 'reading_time']
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         if instance.featured_image:
#             data['featured_image'] = f"{BACKEND_BASE_URL}{instance.featured_image.url}"
#         return data


# class BlogPostSerializer(serializers.ModelSerializer):
#     """Full blog post serializer with validations"""
#     tags_list = serializers.SerializerMethodField()
#     comments_count = serializers.SerializerMethodField()
    
#     class Meta:
#         model = BlogPost
#         exclude = ['deleted']
#         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 
#                            'slug', 'view_count')
    
#     def get_tags_list(self, obj):
#         return TagListingSerializer(obj.tags.filter(deleted=False, is_active=True), many=True).data
    
#     def get_comments_count(self, obj):
#         return obj.comments.filter(deleted=False, status=APPROVED).count()
    
#     def validate_title(self, value):
#         """Validate blog post title"""
#         if len(value.strip()) < 5:
#             raise serializers.ValidationError("Title must be at least 5 characters long")
        
#         # Check for duplicate titles
#         qs = BlogPost.objects.filter(title__iexact=value.strip(), deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
        
#         if qs.exists():
#             raise serializers.ValidationError(f"Blog post with title '{value}' already exists")
        
#         return value.strip()
    
#     def validate_excerpt(self, value):
#         """Validate excerpt length"""
#         if value and len(value) > 500:
#             raise serializers.ValidationError("Excerpt cannot exceed 500 characters")
#         return value
    
#     def validate_content(self, value):
#         """Validate content"""
#         if len(value.strip()) < 50:
#             raise serializers.ValidationError("Content must be at least 50 characters long")
#         return value
    
#     def validate_reading_time(self, value):
#         """Validate reading time"""
#         if value and value < 0:
#             raise serializers.ValidationError("Reading time cannot be negative")
#         return value
    
#     def validate(self, attrs):
#         """Cross-field validation"""
#         # Auto-generate slug
#         if 'title' in attrs and not attrs.get('slug'):
#             base_slug = slugify(attrs['title'])
#             slug = base_slug
#             counter = 1
#             while BlogPost.objects.filter(slug=slug, deleted=False).exclude(
#                 id=self.instance.id if self.instance else None
#             ).exists():
#                 slug = f"{base_slug}-{counter}"
#                 counter += 1
#             attrs['slug'] = slug
        
#         # Validate password for password-protected posts
#         visibility = attrs.get('visibility', self.instance.visibility if self.instance else None)
#         password = attrs.get('password', self.instance.password if self.instance else None)
        
#         if visibility == PASSWORD and not password:
#             raise serializers.ValidationError({
#                 "password": "Password is required for password-protected posts"
#             })
        
#         # Validate published_at for published posts
#         status = attrs.get('status', self.instance.status if self.instance else None)
#         if status == PUBLISHED and not attrs.get('published_at') and (not self.instance or not self.instance.published_at):
#             attrs['published_at'] = timezone.now()
        
#         # Validate scheduled_at for scheduled posts
#         if status == SCHEDULED:
#             scheduled_at = attrs.get('scheduled_at', self.instance.scheduled_at if self.instance else None)
#             if not scheduled_at:
#                 raise serializers.ValidationError({
#                     "scheduled_at": "Scheduled date/time is required for scheduled posts"
#                 })
#             if scheduled_at <= timezone.now():
#                 raise serializers.ValidationError({
#                     "scheduled_at": "Scheduled date/time must be in the future"
#                 })
        
#         # Validate meta fields
#         if attrs.get('meta_title') and len(attrs['meta_title']) > 160:
#             raise serializers.ValidationError({"meta_title": "Meta title cannot exceed 160 characters"})
        
#         if attrs.get('meta_description') and len(attrs['meta_description']) > 320:
#             raise serializers.ValidationError({"meta_description": "Meta description cannot exceed 320 characters"})
        
#         # Auto-calculate reading time if not provided (rough estimate: 200 words per minute)
#         if 'content' in attrs and not attrs.get('reading_time'):
#             word_count = len(attrs['content'].split())
#             attrs['reading_time'] = max(1, round(word_count / 200))
        
#         return attrs
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
#         data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None
        
#         if instance.category:
#             data['category'] = CategoryListingSerializer(instance.category).data
        
#         if instance.featured_image:
#             data['featured_image'] = f"{BACKEND_BASE_URL}{instance.featured_image.url}"
        
#         return data

# class PublicBlogPostSerializer(serializers.ModelSerializer):
#     """Blog post serializer for GET operations only"""
#     tags_list = serializers.SerializerMethodField()
#     comments_count = serializers.SerializerMethodField()
#     created_by = serializers.SerializerMethodField()
#     updated_by = serializers.SerializerMethodField()
#     category = serializers.SerializerMethodField()
#     featured_image = serializers.SerializerMethodField()
    
#     class Meta:
#         model = BlogPost
#         exclude = ['deleted']
    
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         # Make all fields read-only
#         for field in self.fields:
#             self.fields[field].read_only = True
    
#     def get_tags_list(self, obj):
#         return TagListingSerializer(obj.tags.filter(deleted=False, is_active=True), many=True).data
    
#     def get_comments_count(self, obj):
#         return obj.comments.filter(deleted=False, status=APPROVED).count()
    
#     def get_created_by(self, obj):
#         return obj.created_by.get_full_name() if obj.created_by else None
    
#     def get_updated_by(self, obj):
#         return obj.updated_by.get_full_name() if obj.updated_by else None
    
#     def get_category(self, obj):
#         if obj.category:
#             return CategoryListingSerializer(obj.category).data
#         return None
    
#     def get_featured_image(self, obj):
#         if obj.featured_image:
#             return f"{BACKEND_BASE_URL}{obj.featured_image.url}"
#         return None
    
# # ======================= COMMENT SERIALIZERS =======================

# # class CommentListingSerializer(serializers.ModelSerializer):
# #     """Minimal serializer for comment listings"""
# #     author_name = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = Comment
# #         fields = ['id', 'content', 'author_name', 'status', 'created_at']
    
# #     def get_author_name(self, obj):
# #         if obj.user:
# #             return obj.user.get_full_name()
# #         return obj.guest_name


# # class CommentSerializer(serializers.ModelSerializer):
# #     """Full comment serializer with validations"""
# #     replies_count = serializers.SerializerMethodField()
# #     author_name = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = Comment
# #         exclude = ['deleted']
# #         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 
# #                            'ip_address', 'user_agent')
    
# #     def get_replies_count(self, obj):
# #         return obj.replies.filter(deleted=False, status=APPROVED).count()
    
# #     def get_author_name(self, obj):
# #         if obj.user:
# #             return obj.user.get_full_name()
# #         return obj.guest_name
    
# #     def validate_content(self, value):
# #         """Validate comment content"""
# #         if len(value.strip()) < 3:
# #             raise serializers.ValidationError("Comment must be at least 3 characters long")
        
# #         if len(value) > 1000:
# #             raise serializers.ValidationError("Comment cannot exceed 1000 characters")
        
# #         return value.strip()
    
# #     def validate_post(self, value):
# #         """Validate post allows comments"""
# #         if value and not value.allow_comments:
# #             raise serializers.ValidationError("This post does not allow comments")
        
# #         if value and value.status != PUBLISHED:
# #             raise serializers.ValidationError("Cannot comment on unpublished posts")
        
# #         return value
    
# #     def validate_parent(self, value):
# #         """Validate parent comment"""
# #         if value and value.parent:
# #             raise serializers.ValidationError("Cannot reply to a reply. Only one level of nesting allowed")
# #         return value
    
# #     def validate(self, attrs):
# #         """Cross-field validation"""
# #         request = self.context.get('request')
        
# #         # Validate author information
# #         user = attrs.get('user')
# #         guest_name = attrs.get('guest_name')
# #         guest_email = attrs.get('guest_email')
        
# #         if not user and not guest_name:
# #             raise serializers.ValidationError({
# #                 "guest_name": "Guest name is required for non-authenticated users"
# #             })
        
# #         if not user and not guest_email:
# #             raise serializers.ValidationError({
# #                 "guest_email": "Guest email is required for non-authenticated users"
# #             })
        
# #         # Auto-set user if authenticated
# #         if request and request.user.is_authenticated and not user:
# #             attrs['user'] = request.user
        
# #         # Capture IP and user agent on creation
# #         if not self.instance and request:
# #             attrs['ip_address'] = self.get_client_ip(request)
# #             attrs['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:255]
        
# #         return attrs
    
# #     def get_client_ip(self, request):
# #         """Get client IP address"""
# #         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
# #         if x_forwarded_for:
# #             ip = x_forwarded_for.split(',')[0]
# #         else:
# #             ip = request.META.get('REMOTE_ADDR')
# #         return ip
    
# #     def to_representation(self, instance):
# #         data = super().to_representation(instance)
# #         data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
# #         data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None
        
# #         if instance.post:
# #             data['post'] = {
# #                 'id': instance.post.id,
# #                 'title': instance.post.title,
# #                 'slug': instance.post.slug
# #             }
        
# #         if instance.parent:
# #             data['parent'] = CommentListingSerializer(instance.parent).data
        
# #         if instance.moderated_by:
# #             data['moderated_by'] = instance.moderated_by.get_full_name()
        
# #         # Include replies in detailed view
# #         if self.context.get('request') and self.context['request'].query_params.get('id'):
# #             data['replies'] = CommentListingSerializer(
# #                 instance.replies.filter(deleted=False, status=APPROVED), 
# #                 many=True
# #             ).data
        
# #         return data



# from rest_framework import serializers
# from .models import Comment


# class CommentSerializer(serializers.ModelSerializer):
#     """Main serializer for all comment operations"""
    
#     author_name = serializers.SerializerMethodField()
#     author_email = serializers.SerializerMethodField()
#     reply_count = serializers.SerializerMethodField()
#     is_guest = serializers.SerializerMethodField()
#     replies = serializers.SerializerMethodField()
    
#     # Permission fields
#     can_edit = serializers.SerializerMethodField()
#     can_delete = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Comment
#         exclude = ['deleted', 'deleted_at', 'deleted_by']
#         read_only_fields = [
#             'id',
#             'user',
#             'status',
#             'is_edited',
#             'edited_at',
#             'ip_address',
#             'user_agent',
#             'moderated_by',
#             'moderated_at',
#             'moderation_note',
#             'created_at',
#             'updated_at'
#         ]
#         extra_kwargs = {
#             'guest_name': {'required': False},
#             'guest_email': {'required': False},
#         }
    
#     def get_author_name(self, obj):
#         return obj.author_name
    
#     def get_author_email(self, obj):
#         # Only show email to staff or comment author
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             if request.user.is_staff or obj.user == request.user:
#                 return obj.author_email
#         return None
    
#     def get_reply_count(self, obj):
#         return obj.replies.approved().count()
    
#     def get_is_guest(self, obj):
#         return obj.is_guest
    
#     def get_replies(self, obj):
#         # Only show replies for top-level comments in detail view
#         if obj.is_reply or not self.context.get('show_replies'):
#             return []
        
#         replies = obj.get_approved_replies()
#         return CommentSerializer(
#             replies,
#             many=True,
#             context={'show_replies': False, 'request': self.context.get('request')}
#         ).data
    
#     def get_can_edit(self, obj):
#         request = self.context.get('request')
#         return obj.can_edit(request.user) if request else False
    
#     def get_can_delete(self, obj):
#         request = self.context.get('request')
#         return obj.can_delete(request.user) if request else False
    
#     # Validations
#     def validate_content(self, value):
#         if not value or len(value.strip()) < 3:
#             raise serializers.ValidationError(
#                 "Comment must be at least 3 characters long"
#             )
#         return value.strip()
    
#     def validate_post(self, value):
#         if value and not value.allow_comments:
#             raise serializers.ValidationError("This post does not allow comments")
        
#         if value and value.status != 'published':
#             raise serializers.ValidationError("Cannot comment on unpublished posts")
        
#         return value
    
#     def validate_parent(self, value):
#         if value:
#             if value.deleted:
#                 raise serializers.ValidationError("Cannot reply to deleted comment")
            
#             if value.parent:
#                 raise serializers.ValidationError("Cannot reply to a reply")
            
#             if value.status != Comment.APPROVED:
#                 raise serializers.ValidationError(
#                     "Cannot reply to unapproved comment"
#                 )
        
#         return value
    
#     def create(self, validated_data):
#         """
#         Override create to remove fields that don't exist in Comment model
#         Your BaseView may be adding created_by/updated_by automatically
#         """
#         # Remove fields that don't exist in the Comment model
#         validated_data.pop('created_by', None)
#         validated_data.pop('updated_by', None)
        
#         # Create the comment
#         comment = Comment.objects.create(**validated_data)
#         return comment
    
#     def validate(self, attrs):
#         request = self.context.get('request')
        
#         # For CREATE: Handle user vs guest
#         if not self.instance:
#             if request and request.user.is_authenticated:
#                 attrs['user'] = request.user
#                 attrs.pop('guest_name', None)
#                 attrs.pop('guest_email', None)
#                 attrs.pop('guest_website', None)
#             else:
#                 if not attrs.get('guest_name') or not attrs.get('guest_email'):
#                     raise serializers.ValidationError(
#                         "Guest name and email are required"
#                     )
            
#             # Rate limiting
#             if request:
#                 ip_address = self._get_client_ip(request)
#                 user = request.user if request.user.is_authenticated else None
                
#                 if Comment.check_rate_limit(ip_address=ip_address, user=user):
#                     raise serializers.ValidationError(
#                         "Too many comments. Please wait before commenting again."
#                     )
                
#                 # Capture metadata
#                 attrs['ip_address'] = ip_address
#                 attrs['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]
                
#                 # Auto-approve staff comments
#                 if request.user.is_authenticated and request.user.is_staff:
#                     attrs['status'] = Comment.APPROVED
        
#         # For UPDATE: Check permissions
#         else:
#             if not self.instance.can_edit(request.user if request else None):
#                 raise serializers.ValidationError("Cannot edit this comment")
        
#         return attrs
    
#     def update(self, instance, validated_data):
#         """
#         Override update to remove fields that don't exist in Comment model
#         """
#         # Remove fields that don't exist in the Comment model
#         validated_data.pop('created_by', None)
#         validated_data.pop('updated_by', None)
        
#         # Only allow updating content
#         instance.content = validated_data.get('content', instance.content)
#         instance.mark_as_edited()
#         return instance
    
#     def _get_client_ip(self, request):
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0].strip()
#         return request.META.get('REMOTE_ADDR')
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
        
#         # Add nested post info
#         if instance.post:
#             data['post'] = {
#                 'id': instance.post.id,
#                 'title': instance.post.title,
#                 'slug': instance.post.slug
#             }
        
#         # Add parent info for replies
#         if instance.parent:
#             data['parent_author'] = instance.parent.author_name
        
#         # Add moderation info for staff
#         request = self.context.get('request')
#         if request and request.user.is_authenticated and request.user.is_staff:
#             if instance.moderated_by:
#                 data['moderated_by'] = instance.moderated_by.get_full_name()
        
#         return data


# class CommentListSerializer(serializers.ModelSerializer):
#     """Lightweight serializer for listings"""
    
#     author_name = serializers.CharField(source='author_name', read_only=True)
#     reply_count = serializers.IntegerField(read_only=True)
    
#     class Meta:
#         model = Comment
#         fields = [
#             'id',
#             'post',
#             'content',
#             'author_name',
#             'status',
#             'is_edited',
#             'reply_count',
#             'created_at',
#             'updated_at'
#         ]


# class CommentModerationSerializer(serializers.Serializer):
#     """Simple serializer for moderation actions"""
    
#     action = serializers.ChoiceField(choices=['approve', 'reject', 'spam'])
#     note = serializers.CharField(required=False, max_length=500, allow_blank=True)
    
#     def validate(self, attrs):
#         request = self.context.get('request')
#         instance = self.context.get('instance')
        
#         if not instance.can_moderate(request.user if request else None):
#             raise serializers.ValidationError("No permission to moderate")
        
#         return attrs

# # ======================= MEDIA SERIALIZERS =======================

# class MediaListingSerializer(serializers.ModelSerializer):
#     """Minimal serializer for media listings"""
#     class Meta:
#         model = Media
#         fields = ['id', 'title', 'file', 'file_type', 'file_size']
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['file'] = f"{BACKEND_BASE_URL}{instance.file.url}"
#         return data


# class MediaSerializer(serializers.ModelSerializer):
#     """Full media serializer with validations"""
#     file_size_mb = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Media
#         exclude = ['deleted']
#         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 
#                            'file_size', 'mime_type', 'width', 'height')
    
#     def get_file_size_mb(self, obj):
#         return round(obj.file_size / (1024 * 1024), 2)
    
#     def validate_title(self, value):
#         """Validate media title"""
#         if len(value.strip()) < 2:
#             raise serializers.ValidationError("Title must be at least 2 characters long")
#         return value.strip()
    
#     def validate_file(self, value):
#         """Validate file upload"""
#         if not value:
#             raise serializers.ValidationError("File is required")
        
#         # Validate file size (e.g., max 10MB)
#         max_size = 10 * 1024 * 1024  # 10MB
#         if value.size > max_size:
#             raise serializers.ValidationError(f"File size cannot exceed {max_size / (1024 * 1024)}MB")
        
#         return value
    
#     def create(self, validated_data):
#         """Auto-populate file metadata on creation"""
#         file = validated_data.get('file')
        
#         if file:
#             validated_data['file_size'] = file.size
#             validated_data['mime_type'] = file.content_type
            
#             # For images, try to get dimensions
#             if file.content_type.startswith('image/'):
#                 try:
#                     from PIL import Image
#                     img = Image.open(file)
#                     validated_data['width'] = img.width
#                     validated_data['height'] = img.height
#                 except Exception:
#                     pass
        
#         return super().create(validated_data)
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
#         data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None
#         data['uploaded_by'] = instance.uploaded_by.get_full_name() if instance.uploaded_by else None
        
#         if instance.file:
#             data['file'] = f"{BACKEND_BASE_URL}{instance.file.url}"
        
#         return data


# # ======================= NEWSLETTER SERIALIZERS =======================

# class NewsletterListingSerializer(serializers.ModelSerializer):
#     """Minimal serializer for newsletter listings"""
#     full_name = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Newsletter
#         fields = ['id', 'email', 'full_name', 'status', 'created_at']
    
#     def get_full_name(self, obj):
#         return f"{obj.first_name} {obj.last_name}".strip() or "Anonymous"


# class NewsletterSerializer(serializers.ModelSerializer):
#     """Full newsletter serializer with validations"""
#     full_name = serializers.SerializerMethodField()
#     categories_list = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Newsletter
#         exclude = ['deleted']
#         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 
#                            'ip_address', 'confirmed_at', 'unsubscribed_at')
    
#     def get_full_name(self, obj):
#         return f"{obj.first_name} {obj.last_name}".strip() or "Anonymous"
    
#     def get_categories_list(self, obj):
#         return CategoryListingSerializer(
#             obj.interested_categories.filter(deleted=False, is_active=True), 
#             many=True
#         ).data
    
#     def validate_email(self, value):
#         """Validate email uniqueness"""
#         qs = Newsletter.objects.filter(email__iexact=value, deleted=False)
#         if self.instance:
#             qs = qs.exclude(id=self.instance.id)
        
#         if qs.exists():
#             raise serializers.ValidationError(f"Email '{value}' is already subscribed")
        
#         return value.lower()
    
#     def validate(self, attrs):
#         """Capture IP address on creation"""
#         request = self.context.get('request')
        
#         if not self.instance and request:
#             x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#             if x_forwarded_for:
#                 ip = x_forwarded_for.split(',')[0]
#             else:
#                 ip = request.META.get('REMOTE_ADDR')
#             attrs['ip_address'] = ip
        
#         return attrs
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
#         data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None
#         return data


# # ======================= CAMPAIGN SERIALIZERS =======================

# class CampaignListingSerializer(serializers.ModelSerializer):
#     """Minimal serializer for campaign listings"""
#     class Meta:
#         model = Campaign
#         fields = ['id', 'name', 'campaign_type', 'status', 'scheduled_at', 'sent_at']


# class CampaignSerializer(serializers.ModelSerializer):
#     """Full campaign serializer with validations"""
#     categories_list = serializers.SerializerMethodField()
#     open_rate = serializers.SerializerMethodField()
#     click_rate = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Campaign
#         exclude = ['deleted']
#         read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 
#                            'sent_at', 'recipients_count', 'delivered_count', 'opened_count',
#                            'clicked_count', 'bounced_count', 'unsubscribed_count')
    
#     def get_categories_list(self, obj):
#         return CategoryListingSerializer(
#             obj.target_categories.filter(deleted=False, is_active=True), 
#             many=True
#         ).data
    
#     def get_open_rate(self, obj):
#         if obj.delivered_count > 0:
#             return round((obj.opened_count / obj.delivered_count) * 100, 2)
#         return 0
    
#     def get_click_rate(self, obj):
#         if obj.delivered_count > 0:
#             return round((obj.clicked_count / obj.delivered_count) * 100, 2)
#         return 0
    
#     def validate_name(self, value):
#         """Validate campaign name"""
#         if len(value.strip()) < 3:
#             raise serializers.ValidationError("Campaign name must be at least 3 characters long")
#         return value.strip()
    
#     def validate_subject(self, value):
#         """Validate email subject"""
#         if len(value.strip()) < 5:
#             raise serializers.ValidationError("Subject must be at least 5 characters long")
        
#         if len(value) > 200:
#             raise serializers.ValidationError("Subject cannot exceed 200 characters")
        
#         return value.strip()
    
#     def validate_content(self, value):
#         """Validate campaign content"""
#         if len(value.strip()) < 20:
#             raise serializers.ValidationError("Content must be at least 20 characters long")
#         return value
    
#     def validate(self, attrs):
#         """Cross-field validation"""
#         status = attrs.get('status', self.instance.status if self.instance else None)
#         scheduled_at = attrs.get('scheduled_at', self.instance.scheduled_at if self.instance else None)
        
#         # Validate scheduled campaigns
#         if status == SCHEDULED:
#             if not scheduled_at:
#                 raise serializers.ValidationError({
#                     "scheduled_at": "Scheduled date/time is required for scheduled campaigns"
#                 })
#             if scheduled_at <= timezone.now():
#                 raise serializers.ValidationError({
#                     "scheduled_at": "Scheduled date/time must be in the future"
#                 })
        
#         # Validate targeting
#         target_all = attrs.get('target_all_subscribers', 
#                                self.instance.target_all_subscribers if self.instance else True)
#         target_categories = attrs.get('target_categories', 
#                                      self.instance.target_categories.all() if self.instance else [])
        
#         if not target_all and not target_categories:
#             raise serializers.ValidationError({
#                 "target_categories": "Either select 'target all subscribers' or choose specific categories"
#             })
        
#         return attrs
    
#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['created_by'] = instance.created_by.get_full_name() if instance.created_by else None
#         data['updated_by'] = instance.updated_by.get_full_name() if instance.updated_by else None
#         return data




"""
E-commerce Serializers
Comprehensive serializers for products, orders, categories, reviews with soft delete support
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.db import transaction
from config.settings import BACKEND_BASE_URL
import re

from .models import (
    Category,
    ProductTag,
    Product,
    ProductImage,
    Color,
    ProductVariant,
    Inventory,
    SalesProduct,
    SalesProductImage,
    Order,
    OrderDetail,
    Contact,
    Review
)

User = get_user_model()


# ============================================================================
# USER HELPER SERIALIZER
# ============================================================================

class UserListingSerializer(serializers.ModelSerializer):
    """Minimal user serializer for references"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']
    
    def get_full_name(self, obj):
        """Get full name with fallback to username"""
        full_name = obj.get_full_name()
        return full_name.strip() if full_name and full_name.strip() else obj.username


# ============================================================================
# CATEGORY SERIALIZERS
# ============================================================================

class CategoryListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for category listings in dropdowns/references"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'image', 'products_count']
    
    def get_products_count(self, obj):
        """Get active products count"""
        if obj.deleted:
            return 0
        return obj.products.filter(deleted=False).count()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None
        return data


class CategorySerializer(serializers.ModelSerializer):
    """Full category serializer with validations"""
    products_count = serializers.SerializerMethodField()
    sales_products_count = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'description',
            'image',
            'products_count',
            'sales_products_count',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_products_count(self, obj):
        """Get active products count"""
        if obj.deleted:
            return 0
        return obj.products.filter(deleted=False).count()
    
    def get_sales_products_count(self, obj):
        """Get active sales products count"""
        if obj.deleted:
            return 0
        return obj.sales_products.filter(deleted=False).count()
    
    def get_created_by(self, obj):
        """Get created by user with fallback to username"""
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        """Get updated by user with fallback to username"""
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_name(self, value):
        """Validate category name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long")
        
        # Check for duplicate names (case-insensitive, exclude deleted)
        qs = Category.objects.filter(name__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        
        if qs.exists():
            raise serializers.ValidationError(f"Category with name '{value}' already exists")
        
        return value.strip()
    
    def to_representation(self, instance):
        """Customize output representation"""
        # Handle soft delete response
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Category "{instance.name}" has been deleted successfully'
            }
        
        data = super().to_representation(instance)
        
        # Handle image URL
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        return data


# ============================================================================
# PRODUCT TAG SERIALIZERS
# ============================================================================

class ProductTagListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for tag listings"""
    class Meta:
        model = ProductTag
        fields = ['id', 'name', 'slug']


class ProductTagSerializer(serializers.ModelSerializer):
    """Full tag serializer with validations"""
    products_count = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductTag
        fields = [
            'id',
            'name',
            'slug',
            'products_count',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'slug')
    
    def get_products_count(self, obj):
        """Get active products count"""
        if obj.deleted:
            return 0
        return obj.product_set.filter(deleted=False).count()
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_name(self, value):
        """Validate tag name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Tag name must be at least 2 characters long")
        
        # Check for duplicate names
        qs = ProductTag.objects.filter(name__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        
        if qs.exists():
            raise serializers.ValidationError(f"Tag with name '{value}' already exists")
        
        return value.strip()
    
    def validate(self, attrs):
        """Auto-generate slug"""
        if 'name' in attrs and not attrs.get('slug'):
            attrs['slug'] = slugify(attrs['name'])
        return attrs
    
    def to_representation(self, instance):
        """Customize output representation"""
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Tag "{instance.name}" has been deleted successfully'
            }
        
        data = super().to_representation(instance)
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        return data


# ============================================================================
# PRODUCT IMAGE SERIALIZERS
# ============================================================================

class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'images', 'image_url', 'alt_text']
        extra_kwargs = {
            'alt_text': {'required': False}
        }
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.images:
            return f"{BACKEND_BASE_URL}{obj.images.url}"
        return None
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Remove the file field, only keep URL
        data.pop('images', None)
        return data


# ============================================================================
# PRODUCT SERIALIZERS
# ============================================================================

class ProductListingSerializer(serializers.ModelSerializer):
    """Minimal serializer for product listings"""
    category_name = serializers.CharField(source='prod_has_category.name', read_only=True)
    first_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'group', 'category_name', 'first_image']
    
    def get_first_image(self, obj):
        """Get first product image"""
        if obj.deleted:
            return None
        first_img = obj.images.filter(deleted=False).first()
        if first_img and first_img.images:
            return f"{BACKEND_BASE_URL}{first_img.images.url}"
        return None


class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer"""
    images = ProductImageSerializer(many=True, read_only=True)
    image_urls = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='prod_has_category.name', read_only=True)
    category_data = serializers.SerializerMethodField()
    tag_names = serializers.SerializerMethodField()
    tags_data = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    variants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'group',
            'prod_has_category',
            'category_name',
            'category_data',
            'tags',
            'tag_names',
            'tags_data',
            'images',
            'image_urls',
            'variants_count',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'prod_has_category': {'required': False, 'allow_null': True},
            'tags': {'required': False}
        }
    
    def get_image_urls(self, obj):
        """Get all product image URLs"""
        if obj.deleted:
            return []
        return [
            f"{BACKEND_BASE_URL}{img.images.url}" 
            for img in obj.images.filter(deleted=False) 
            if img.images
        ]
    
    def get_category_data(self, obj):
        """Get category data"""
        if obj.deleted or not obj.prod_has_category or obj.prod_has_category.deleted:
            return None
        return CategoryListingSerializer(obj.prod_has_category).data
    
    def get_tag_names(self, obj):
        """Get tag names list"""
        if obj.deleted:
            return []
        return [tag.name for tag in obj.tags.filter(deleted=False)]
    
    def get_tags_data(self, obj):
        """Get full tag data"""
        if obj.deleted:
            return []
        return ProductTagListingSerializer(
            obj.tags.filter(deleted=False), 
            many=True
        ).data
    
    def get_variants_count(self, obj):
        """Get variants count"""
        if obj.deleted:
            return 0
        return obj.variants.filter(deleted=False, is_active=True).count()
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_name(self, value):
        """Validate product name"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Product name must be at least 3 characters long")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long")
        return value.strip()
    
    def validate_price(self, value):
        """Validate price"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        if value > 1000000:
            raise serializers.ValidationError("Price cannot exceed 1,000,000")
        return value
    
    def validate_prod_has_category(self, value):
        """Validate category is not deleted"""
        if value and value.deleted:
            raise serializers.ValidationError("Cannot assign deleted category")
        return value
    
    def validate_tags(self, value):
        """Validate tags are not deleted"""
        for tag in value:
            if tag.deleted:
                raise serializers.ValidationError(f"Cannot assign deleted tag: {tag.name}")
        return value
    
    def to_representation(self, instance):
        """Customize output representation"""
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Product "{instance.name}" has been deleted successfully'
            }
        
        data = super().to_representation(instance)
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        return data


# ============================================================================
# COLOR SERIALIZERS
# ============================================================================

class ColorSerializer(serializers.ModelSerializer):
    """Color serializer"""
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Color
        fields = ['id', 'name', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_name(self, value):
        """Validate color name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Color name must be at least 2 characters long")
        
        # Check for duplicate
        qs = Color.objects.filter(name__iexact=value.strip(), deleted=False)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        
        if qs.exists():
            raise serializers.ValidationError(f"Color '{value}' already exists")
        
        return value.strip()
    
    def to_representation(self, instance):
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Color "{instance.name}" has been deleted successfully'
            }
        return super().to_representation(instance)


# ============================================================================
# PRODUCT VARIANT SERIALIZERS
# ============================================================================

class ProductVariantSerializer(serializers.ModelSerializer):
    """Product variant serializer"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()
    color_names = serializers.SerializerMethodField()
    colors_data = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'product_name',
            'product_price',
            'size',
            'colors',
            'color_names',
            'colors_data',
            'material',
            'sku',
            'stock_quantity',
            'additional_price',
            'total_price',
            'is_active',
            'is_low_stock',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'sku')
        extra_kwargs = {
            'size': {'required': False, 'allow_null': True, 'allow_blank': True},
            'material': {'required': False, 'allow_null': True, 'allow_blank': True},
            'additional_price': {'required': False}
        }
    
    def get_total_price(self, obj):
        """Calculate total price"""
        if obj.deleted or not obj.product or obj.product.deleted:
            return None
        return float(obj.product.price + obj.additional_price)
    
    def get_color_names(self, obj):
        """Get color names list"""
        if obj.deleted:
            return []
        return [color.name for color in obj.colors.filter(deleted=False)]
    
    def get_colors_data(self, obj):
        """Get full color data"""
        if obj.deleted:
            return []
        return ColorSerializer(obj.colors.filter(deleted=False), many=True).data
    
    def get_is_low_stock(self, obj):
        """Check if stock is low"""
        if obj.deleted:
            return False
        try:
            return obj.inventory.is_low_stock if hasattr(obj, 'inventory') else False
        except:
            return obj.stock_quantity < 10
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_product(self, value):
        """Validate product is not deleted"""
        if value and value.deleted:
            raise serializers.ValidationError("Cannot assign deleted product")
        return value
    
    def validate_stock_quantity(self, value):
        """Validate stock quantity"""
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative")
        return value
    
    def validate_additional_price(self, value):
        """Validate additional price"""
        if value < 0:
            raise serializers.ValidationError("Additional price cannot be negative")
        return value
    
    def to_representation(self, instance):
        if instance.deleted:
            return {
                'id': instance.id,
                'sku': instance.sku,
                'message': f'Product variant "{instance.sku}" has been deleted successfully'
            }
        return super().to_representation(instance)


# ============================================================================
# INVENTORY SERIALIZERS
# ============================================================================

class InventorySerializer(serializers.ModelSerializer):
    """Inventory serializer"""
    product_name = serializers.CharField(source='product_variant.product.name', read_only=True)
    variant_sku = serializers.CharField(source='product_variant.sku', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventory
        fields = [
            'id',
            'product_variant',
            'product_name',
            'variant_sku',
            'current_stock',
            'minimum_stock_level',
            'maximum_stock_level',
            'reorder_point',
            'cost_price',
            'last_restocked',
            'is_low_stock',
            'needs_reorder',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'cost_price': {'required': False, 'allow_null': True},
            'last_restocked': {'required': False, 'allow_null': True}
        }
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_product_variant(self, value):
        """Validate variant is not deleted"""
        if value and value.deleted:
            raise serializers.ValidationError("Cannot assign deleted product variant")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        current_stock = attrs.get('current_stock', self.instance.current_stock if self.instance else 0)
        min_level = attrs.get('minimum_stock_level', self.instance.minimum_stock_level if self.instance else 5)
        max_level = attrs.get('maximum_stock_level', self.instance.maximum_stock_level if self.instance else 1000)
        reorder = attrs.get('reorder_point', self.instance.reorder_point if self.instance else 10)
        
        if min_level >= max_level:
            raise serializers.ValidationError({
                "minimum_stock_level": "Minimum stock level must be less than maximum"
            })
        
        if reorder > max_level:
            raise serializers.ValidationError({
                "reorder_point": "Reorder point cannot exceed maximum stock level"
            })
        
        if current_stock < 0:
            raise serializers.ValidationError({
                "current_stock": "Current stock cannot be negative"
            })
        
        return attrs
    
    def to_representation(self, instance):
        if instance.deleted:
            return {
                'id': instance.id,
                'message': 'Inventory record has been deleted successfully'
            }
        return super().to_representation(instance)


# ============================================================================
# SALES PRODUCT SERIALIZERS
# ============================================================================

class SalesProductImageSerializer(serializers.ModelSerializer):
    """Sales product image serializer"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesProductImage
        fields = ['id', 'images', 'image_url', 'alt_text']
        extra_kwargs = {
            'alt_text': {'required': False}
        }
    
    def get_image_url(self, obj):
        if obj.images:
            return f"{BACKEND_BASE_URL}{obj.images.url}"
        return None
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('images', None)
        return data


class SalesProductListingSerializer(serializers.ModelSerializer):
    """Minimal sales product listing"""
    category_name = serializers.CharField(source='salesprod_has_category.name', read_only=True)
    first_image = serializers.SerializerMethodField()
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = SalesProduct
        fields = [
            'id', 'name', 'original_price', 'discount_percent', 
            'final_price', 'discount_amount', 'category_name', 'first_image'
        ]
    
    def get_first_image(self, obj):
        if obj.deleted:
            return None
        first_img = obj.images.filter(deleted=False).first()
        if first_img and first_img.images:
            return f"{BACKEND_BASE_URL}{first_img.images.url}"
        return None


class SalesProductSerializer(serializers.ModelSerializer):
    """Full sales product serializer"""
    images = SalesProductImageSerializer(many=True, read_only=True)
    image_urls = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='salesprod_has_category.name', read_only=True)
    category_data = serializers.SerializerMethodField()
    has_discount = serializers.BooleanField(read_only=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesProduct
        fields = [
            'id',
            'name',
            'description',
            'original_price',
            'discount_percent',
            'final_price',
            'discount_amount',
            'has_discount',
            'image',
            'salesprod_has_category',
            'category_name',
            'category_data',
            'images',
            'image_urls',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'final_price')
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'salesprod_has_category': {'required': False, 'allow_null': True},
            'discount_percent': {'required': False}
        }
    
    def get_image_urls(self, obj):
        """Get all sales product image URLs"""
        if obj.deleted:
            return []
        return [
            f"{BACKEND_BASE_URL}{img.images.url}" 
            for img in obj.images.filter(deleted=False) 
            if img.images
        ]
    
    def get_category_data(self, obj):
        """Get category data"""
        if obj.deleted or not obj.salesprod_has_category or obj.salesprod_has_category.deleted:
            return None
        return CategoryListingSerializer(obj.salesprod_has_category).data
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_name(self, value):
        """Validate sales product name"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Product name must be at least 3 characters long")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long")
        return value.strip()
    
    def validate_original_price(self, value):
        """Validate original price"""
        if value <= 0:
            raise serializers.ValidationError("Original price must be greater than 0")
        if value > 1000000:
            raise serializers.ValidationError("Original price cannot exceed 1,000,000")
        return value
    
    def validate_discount_percent(self, value):
        """Validate discount percentage"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount percentage must be between 0 and 100")
        return value
    
    def validate_salesprod_has_category(self, value):
        """Validate category is not deleted"""
        if value and value.deleted:
            raise serializers.ValidationError("Cannot assign deleted category")
        return value
    
    def to_representation(self, instance):
        """Customize output representation"""
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': f'Sales product "{instance.name}" has been deleted successfully'
            }
        
        data = super().to_representation(instance)
        
        # Handle main image URL
        if instance.image:
            data['image'] = f"{BACKEND_BASE_URL}{instance.image.url}"
        else:
            data['image'] = None
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        return data


# ============================================================================
# ORDER SERIALIZERS
# ============================================================================

class OrderDetailSerializer(serializers.ModelSerializer):
    """Order detail serializer"""
    product_name = serializers.SerializerMethodField()
    product_type = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderDetail
        fields = [
            'id',
            'order',
            'product',
            'sales_product',
            'product_name',
            'product_type',
            'unit_price',
            'quantity',
            'total_price',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'total_price')
        extra_kwargs = {
            'product': {'required': False, 'allow_null': True},
            'sales_product': {'required': False, 'allow_null': True}
        }
    
    def get_product_name(self, obj):
        """Get product name"""
        if obj.product and not obj.product.deleted:
            return obj.product.name
        elif obj.sales_product and not obj.sales_product.deleted:
            return obj.sales_product.name
        return None
    
    def get_product_type(self, obj):
        """Get product type"""
        if obj.product:
            return 'product'
        elif obj.sales_product:
            return 'sales_product'
        return None
    
    def validate(self, attrs):
        """Validate order detail"""
        product = attrs.get('product')
        sales_product = attrs.get('sales_product')
        
        if not product and not sales_product:
            raise serializers.ValidationError("Either product or sales_product must be provided")
        
        if product and sales_product:
            raise serializers.ValidationError("Cannot specify both product and sales_product")
        
        if product and product.deleted:
            raise serializers.ValidationError("Cannot order deleted product")
        
        if sales_product and sales_product.deleted:
            raise serializers.ValidationError("Cannot order deleted sales product")
        
        # Validate quantity
        quantity = attrs.get('quantity', 1)
        if quantity < 1:
            raise serializers.ValidationError({"quantity": "Quantity must be at least 1"})
        
        return attrs


class OrderSerializer(serializers.ModelSerializer):
    """Full order serializer"""
    order_details = OrderDetailSerializer(many=True, read_only=True)
    customer_name_display = serializers.CharField(source='customer_name', read_only=True)
    rider_name = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    created_at_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id',
            'bill',
            'customer',
            'customer_name',
            'customer_name_display',
            'customer_email',
            'customer_phone',
            'delivery_address',
            'city',
            'delivery_date',
            'rider',
            'rider_name',
            'status',
            'payment_method',
            'payment_status',
            'order_details',
            'total_amount',
            'items_count',
            'created_at',
            'created_at_date',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'customer': {'required': False, 'allow_null': True},
            'rider': {'required': False, 'allow_null': True},
            'bill': {'required': False, 'allow_null': True},
            'city': {'required': False, 'allow_null': True},
            'delivery_date': {'required': False, 'allow_null': True}
        }
    
    def get_rider_name(self, obj):
        """Get rider name"""
        if obj.rider:
            full_name = obj.rider.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.rider.username
        return None
    
    def get_total_amount(self, obj):
        """Calculate total from order details"""
        if obj.deleted:
            return None
        return obj.total_amount
    
    def get_items_count(self, obj):
        """Get order items count"""
        if obj.deleted:
            return 0
        return obj.order_details.filter(deleted=False).count()
    
    def get_created_at_date(self, obj):
        """Get creation date"""
        return obj.created_at.date() if obj.created_at else None
    
    def validate_customer_email(self, value):
        """Validate email format"""
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise serializers.ValidationError("Invalid email format")
        return value.lower()
    
    def validate_customer_phone(self, value):
        """Validate phone number"""
        if not re.match(r'^[\d\-\+\(\) ]+$', value):
            raise serializers.ValidationError("Invalid phone number format")
        return value
    
    def validate_bill(self, value):
        """Validate bill amount"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Bill amount cannot be negative")
        return value
    
    def to_representation(self, instance):
        """Customize output representation"""
        if instance.deleted:
            return {
                'id': instance.id,
                'customer_name': instance.customer_name,
                'message': f'Order #{instance.id} has been deleted successfully'
            }
        
        data = super().to_representation(instance)
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        return data


# ============================================================================
# CONTACT SERIALIZERS
# ============================================================================

class ContactSerializer(serializers.ModelSerializer):
    """Contact form serializer"""
    created_by = serializers.SerializerMethodField()
    updated_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Contact
        fields = [
            'id',
            'name',
            'email',
            'phone_number',
            'message',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'message': {'required': False, 'allow_null': True, 'allow_blank': True}
        }
    
    def get_created_by(self, obj):
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.created_by.username
        return None
    
    def get_updated_by(self, obj):
        if obj.updated_by:
            full_name = obj.updated_by.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.updated_by.username
        return None
    
    def validate_name(self, value):
        """Validate name (alphabetic only)"""
        if not re.match(r'^[a-zA-Z]+( [a-zA-Z]+)*$', value):
            raise serializers.ValidationError(
                "Name can only contain alphabetic characters and single spaces between words"
            )
        return value.strip()
    
    def validate_email(self, value):
        """Validate email format"""
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise serializers.ValidationError("Invalid email format")
        return value.lower()
    
    def validate_phone_number(self, value):
        """Validate phone number"""
        if not re.match(r'^[\d\-\+\(\) ]+$', value):
            raise serializers.ValidationError(
                "Phone number can only contain digits, spaces, dashes (-), parentheses (), and plus (+)"
            )
        return value
    
    def to_representation(self, instance):
        if instance.deleted:
            return {
                'id': instance.id,
                'name': instance.name,
                'message': 'Contact has been deleted successfully'
            }
        return super().to_representation(instance)


# ============================================================================
# REVIEW SERIALIZERS
# ============================================================================

class ReviewSerializer(serializers.ModelSerializer):
    """Full review serializer"""
    author_name = serializers.SerializerMethodField()
    author_email = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    item_data = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'user',
            'name',
            'email',
            'author_name',
            'author_email',
            'rating',
            'comment',
            'product',
            'sales_product',
            'item_name',
            'item_type',
            'item_data',
            'can_edit',
            'can_delete',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at', 'user')
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_null': True},
            'product': {'required': False, 'allow_null': True},
            'sales_product': {'required': False, 'allow_null': True}
        }
    
    def get_author_name(self, obj):
        """Get reviewer name"""
        if obj.user:
            full_name = obj.user.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.user.username
        return obj.name or 'Anonymous'
    
    def get_author_email(self, obj):
        """Get reviewer email (only for staff or review author)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.is_staff or obj.user == request.user:
                return obj.email if obj.email else (obj.user.email if obj.user else None)
        return None
    
    def get_item_name(self, obj):
        """Get reviewed item name"""
        if obj.product and not obj.product.deleted:
            return obj.product.name
        elif obj.sales_product and not obj.sales_product.deleted:
            return obj.sales_product.name
        return None
    
    def get_item_type(self, obj):
        """Get item type"""
        if obj.product:
            return 'product'
        elif obj.sales_product:
            return 'sales_product'
        return None
    
    def get_item_data(self, obj):
        """Get full item data"""
        if obj.product and not obj.product.deleted:
            return {
                'id': obj.product.id,
                'name': obj.product.name,
                'type': 'product',
                'price': float(obj.product.price)
            }
        elif obj.sales_product and not obj.sales_product.deleted:
            return {
                'id': obj.sales_product.id,
                'name': obj.sales_product.name,
                'type': 'sales_product',
                'original_price': float(obj.sales_product.original_price),
                'final_price': float(obj.sales_product.final_price),
                'discount_percent': float(obj.sales_product.discount_percent)
            }
        return None
    
    def get_can_edit(self, obj):
        """Check if user can edit"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return request.user.is_staff or obj.user == request.user
    
    def get_can_delete(self, obj):
        """Check if user can delete"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return request.user.is_staff or obj.user == request.user
    
    def validate_rating(self, value):
        """Validate rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_comment(self, value):
        """Validate comment"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters long")
        if len(value) > 1000:
            raise serializers.ValidationError("Comment cannot exceed 1000 characters")
        return value.strip()
    
    def validate(self, attrs):
        """Cross-field validation"""
        request = self.context.get('request')
        
        # For CREATE: Validate product/sales_product
        if not self.instance:
            product = attrs.get('product')
            sales_product = attrs.get('sales_product')
            
            if not product and not sales_product:
                raise serializers.ValidationError(
                    "Must specify either a product or sales product"
                )
            
            if product and sales_product:
                raise serializers.ValidationError(
                    "Cannot specify both product and sales product"
                )
            
            if product and product.deleted:
                raise serializers.ValidationError("Cannot review deleted product")
            
            if sales_product and sales_product.deleted:
                raise serializers.ValidationError("Cannot review deleted sales product")
            
            # Handle user vs guest
            if request and request.user.is_authenticated:
                attrs['user'] = request.user
                attrs.pop('name', None)
                attrs.pop('email', None)
            else:
                if not attrs.get('name'):
                    raise serializers.ValidationError({"name": "Name is required for guest reviews"})
                if not attrs.get('email'):
                    raise serializers.ValidationError({"email": "Email is required for guest reviews"})
        
        return attrs
    
    def to_representation(self, instance):
        """Customize output representation"""
        if instance.deleted:
            return {
                'id': instance.id,
                'message': 'Review has been deleted successfully'
            }
        
        data = super().to_representation(instance)
        
        # Remove product/sales_product IDs, keep item_data instead
        data.pop('product', None)
        data.pop('sales_product', None)
        
        # Format datetime fields
        if isinstance(data.get('created_at'), str):
            data['created_at'] = data['created_at'].replace('T', ' ').split('.')[0]
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = data['updated_at'].replace('T', ' ').split('.')[0]
        
        return data


class PublicReviewSerializer(serializers.ModelSerializer):
    """Public review serializer (simplified)"""
    author_name = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'name',
            'author_name',
            'rating',
            'comment',
            'item_name',
            'item_type',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_author_name(self, obj):
        if obj.user:
            full_name = obj.user.get_full_name()
            return full_name.strip() if full_name and full_name.strip() else obj.user.username
        return obj.name or 'Anonymous'
    
    def get_item_name(self, obj):
        if obj.product and not obj.product.deleted:
            return obj.product.name
        elif obj.sales_product and not obj.sales_product.deleted:
            return obj.sales_product.name
        return None
    
    def get_item_type(self, obj):
        if obj.product:
            return 'product'
        elif obj.sales_product:
            return 'sales_product'
        return None