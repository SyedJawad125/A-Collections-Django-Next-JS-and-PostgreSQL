from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from utils.enums import *
from utils.reusable_classes import TimeUserStamps
from django_ckeditor_5.fields import CKEditor5Field


class Category(TimeUserStamps):
    """Blog post categories with hierarchical structure"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    description = CKEditor5Field(config_name='extends',blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(TimeUserStamps):
    """Tags for blog posts"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#007bff', help_text="Hex color code")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(TimeUserStamps):
    """Main blog post model with rich content"""

    STATUS_CHOICES = [
        (DRAFT, DRAFT),
        (PUBLISHED, PUBLISHED),
        (ARCHIVED, ARCHIVED),
        (SCHEDULED, SCHEDULED),
        ]
    VISIBILITY_CHOICES = [
        (PUBLIC, PUBLIC),
        (PRIVATE, PRIVATE),
        (PASSWORD, PASSWORD),
        (MEMBERS, MEMBERS),
        ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    content = CKEditor5Field(config_name='extends')  # Using CKEditor 5
    excerpt = CKEditor5Field(config_name='default', blank=True)
    # Relationships
    author = models.CharField(max_length=100, blank=True)  # removed unique=True, because you’ll have many posts per author
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    # Media
    featured_image = models.ImageField(upload_to='blog/featured/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=200, blank=True)
    # Status and Visibility
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    password = models.CharField(max_length=100, blank=True, help_text="Required if visibility is password protected")
    # SEO
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    canonical_url = models.URLField(blank=True, null=True)
    # Engagement
    view_count = models.PositiveIntegerField(default=0)
    reading_time = models.PositiveIntegerField(default=0, help_text="Estimated reading time in minutes")
    # Scheduling
    published_at = models.DateTimeField(blank=True, null=True)
    scheduled_at = models.DateTimeField(blank=True, null=True)
    # Features
    is_featured = models.BooleanField(default=False)
    allow_comments = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['author', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# class Comment(TimeUserStamps):
#     """Comments system with moderation"""
    
#     STATUS_CHOICES = [
#         (PENDING, PENDING),
#         (APPROVED, APPROVED),
#         (REJECTED, REJECTED),
#         (SPAM, SPAM),
#         ]

#     # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
#     parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
#     # Author info (can be registered user or guest)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
#     guest_name = models.CharField(max_length=100, blank=True)
#     guest_email = models.EmailField(blank=True)
#     guest_website = models.URLField(blank=True)
#     content = models.TextField(max_length=1000)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     ip_address = models.GenericIPAddressField(protocol='both', null=True, blank=True)
#     user_agent = models.TextField(blank=True)
#     # Moderation
#     moderated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_comments')
#     moderation_note = models.TextField(blank=True)
    
#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         author = self.user.username if self.user else self.guest_name
#         return f"Comment by {author} on {self.post.title}"



from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q, Count


class CommentQuerySet(models.QuerySet):
    """Custom queryset for Comment model"""
    
    def active(self):
        """Get non-deleted comments"""
        return self.filter(deleted=False)
    
    def approved(self):
        """Get approved comments"""
        return self.filter(status='approved', deleted=False)
    
    def pending(self):
        """Get pending comments"""
        return self.filter(status='pending', deleted=False)
    
    def for_post(self, post):
        """Get comments for a specific post"""
        return self.filter(post=post, deleted=False)
    
    def top_level(self):
        """Get only top-level comments (not replies)"""
        return self.filter(parent__isnull=True)
    
    def with_reply_count(self):
        """Annotate with reply count"""
        return self.annotate(
            reply_count=Count(
                'replies',
                filter=Q(replies__deleted=False, replies__status='approved')
            )
        )


class CommentManager(models.Manager):
    """Custom manager for Comment model"""
    
    def get_queryset(self):
        return CommentQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()
    
    def approved(self):
        return self.get_queryset().approved()
    
    def pending(self):
        return self.get_queryset().pending()
    
    def for_post(self, post):
        return self.get_queryset().for_post(post)
    
    def top_level(self):
        return self.get_queryset().top_level()


class Comment(models.Model):
    """Comment model for blog posts with support for replies and guest comments"""
    
    # Status choices
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    SPAM = 'spam'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
        (SPAM, 'Spam'),
    ]
    
    # Core fields
    post = models.ForeignKey(
        'BlogPost',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    # Author - either authenticated user or guest
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='comments'
    )
    guest_name = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    guest_website = models.URLField(blank=True, null=True)
    
    # Content
    content = models.TextField(max_length=1000)
    
    # Edit tracking
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    # Moderation
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
        db_index=True
    )
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_comments'
    )
    moderated_at = models.DateTimeField(null=True, blank=True)
    moderation_note = models.TextField(blank=True)
    
    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Soft delete
    deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_comments'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Managers
    objects = CommentManager()
    all_objects = models.Manager()  # Includes deleted
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', 'status', 'deleted', '-created_at']),
            models.Index(fields=['parent', 'status', 'deleted']),
            models.Index(fields=['user', 'deleted', '-created_at']),
            models.Index(fields=['status', 'deleted']),
        ]
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
    
    def __str__(self):
        return f"Comment by {self.author_name} on {self.post.title}"
    
    def clean(self):
        """Validate comment data"""
        super().clean()
        
        # Must have either user or guest info
        if not self.user and not self.guest_name:
            raise ValidationError("Either user or guest_name must be provided")
        
        # Cannot have both user and guest info
        if self.user and (self.guest_name or self.guest_email):
            raise ValidationError("Cannot have both user and guest information")
        
        # Guest must provide name and email
        if not self.user and not (self.guest_name and self.guest_email):
            raise ValidationError("Guest comments require both name and email")
        
        # Validate parent comment
        if self.parent:
            if self.parent.post != self.post:
                raise ValidationError("Parent comment must belong to the same post")
            
            if self.parent.deleted:
                raise ValidationError("Cannot reply to a deleted comment")
            
            if self.parent.parent is not None:
                raise ValidationError(
                    "Cannot reply to a reply. Only one level of nesting allowed"
                )
            
            # Check self-reply only if object has been saved
            if self.pk and self.parent.pk == self.pk:
                raise ValidationError("Comment cannot be a reply to itself")
        
        # Validate post allows comments
        if self.post and not self.post.allow_comments:
            raise ValidationError("This post does not allow comments")
        
        # Content validation
        if self.content:
            content_stripped = self.content.strip()
            if len(content_stripped) < 3:
                raise ValidationError("Comment must be at least 3 characters long")
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    # Properties
    @property
    def author_name(self):
        """Get author name regardless of user type"""
        if self.user:
            return self.user.get_full_name() or self.user.username
        return self.guest_name
    
    @property
    def author_email(self):
        """Get author email regardless of user type"""
        if self.user:
            return self.user.email
        return self.guest_email
    
    @property
    def is_guest(self):
        """Check if comment is from a guest"""
        return self.user is None
    
    @property
    def is_approved(self):
        """Check if comment is approved"""
        return self.status == self.APPROVED
    
    @property
    def is_pending(self):
        """Check if comment is pending"""
        return self.status == self.PENDING
    
    @property
    def is_reply(self):
        """Check if this is a reply to another comment"""
        return self.parent is not None
    
    @property
    def reply_count(self):
        """Get count of approved, non-deleted replies"""
        return self.replies.filter(status=self.APPROVED, deleted=False).count()
    
    # Permission Methods
    def can_edit(self, user):
        """Check if given user can edit this comment"""
        if not user or not user.is_authenticated:
            return False
        
        if self.deleted:
            return False
        
        if user.is_staff or user.is_superuser:
            return True
        
        return self.user == user
    
    def can_delete(self, user):
        """Check if given user can delete this comment"""
        if not user or not user.is_authenticated:
            return False
        
        if self.deleted:
            return False
        
        if user.is_staff or user.is_superuser:
            return True
        
        return self.user == user
    
    def can_moderate(self, user):
        """Check if given user can moderate this comment"""
        if not user or not user.is_authenticated:
            return False
        return user.is_staff or user.is_superuser
    
    def can_view(self, user):
        """Check if given user can view this comment"""
        # Deleted comments visible only to staff
        if self.deleted:
            return user and user.is_authenticated and (
                user.is_staff or user.is_superuser
            )
        
        # Approved comments visible to all
        if self.is_approved:
            return True
        
        # Pending/rejected/spam visible to staff and author
        if user and user.is_authenticated:
            if user.is_staff or user.is_superuser:
                return True
            if self.user == user:
                return True
        
        return False
    
    # Action Methods
    def approve(self, moderator=None, note=''):
        """Approve the comment"""
        self.status = self.APPROVED
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        if note:
            self.moderation_note = note
        self.save(update_fields=[
            'status', 'moderated_by', 'moderated_at', 'moderation_note'
        ])
    
    def reject(self, moderator=None, note=''):
        """Reject the comment"""
        self.status = self.REJECTED
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        if note:
            self.moderation_note = note
        self.save(update_fields=[
            'status', 'moderated_by', 'moderated_at', 'moderation_note'
        ])
    
    def mark_as_spam(self, moderator=None, note=''):
        """Mark comment as spam"""
        self.status = self.SPAM
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        if note:
            self.moderation_note = note
        self.save(update_fields=[
            'status', 'moderated_by', 'moderated_at', 'moderation_note'
        ])
    
    def mark_as_edited(self):
        """Mark comment as edited"""
        self.is_edited = True
        self.edited_at = timezone.now()
        self.save(update_fields=['is_edited', 'edited_at'])
    
    def soft_delete(self, user=None):
        """Soft delete the comment"""
        self.deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=['deleted', 'deleted_at', 'deleted_by'])
    
    def restore(self):
        """Restore a soft-deleted comment"""
        self.deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['deleted', 'deleted_at', 'deleted_by'])
    
    # Query Methods
    def get_approved_replies(self):
        """Get all approved, non-deleted replies"""
        return self.replies.filter(
            status=self.APPROVED,
            deleted=False
        ).select_related('user', 'post')
    
    # Class Methods
    @classmethod
    def get_pending_count(cls):
        """Get count of pending comments for moderation"""
        return cls.objects.filter(status=cls.PENDING, deleted=False).count()
    
    @classmethod
    def check_rate_limit(cls, ip_address=None, user=None, minutes=60, max_comments=10):
        """Check if user/IP has exceeded comment rate limit"""
        time_threshold = timezone.now() - timezone.timedelta(minutes=minutes)
        
        if user and user.is_authenticated:
            count = cls.objects.filter(
                user=user,
                created_at__gte=time_threshold
            ).count()
        elif ip_address:
            count = cls.objects.filter(
                ip_address=ip_address,
                created_at__gte=time_threshold
            ).count()
        else:
            return False
        
        return count >= max_comments
    
class Media(TimeUserStamps):
    """Media library for managing images, videos, documents"""
    TYPE_CHOICES = [
            (IMAGE, IMAGE),
            (VIDEO, VIDEO),
            (AUDIO, AUDIO),
            (DOCUMENT, DOCUMENT),
            (OTHER, OTHER),
            ]
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='media/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    mime_type = models.CharField(max_length=100)
    # Image specific fields
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    # SEO
    alt_text = models.CharField(max_length=200, blank=True)
    caption = models.TextField(blank=True)
    # Organization
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    is_public = models.BooleanField(default=True)
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Newsletter(TimeUserStamps):
    """Newsletter subscription management"""
    STATUS_CHOICES = [
        (ACTIVE, ACTIVE),
        (INACTIVE, INACTIVE),
        (UNSUBSCRIBED, UNSUBSCRIBED),
        (BOUNCED, BOUNCED),
        ]
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')   
    # Preferences
    FREQUENCY_CHOICES = [
        (DAILY, DAILY),
        (WEEKLY, WEEKLY),
        (MONTHLY, MONTHLY),
        ]
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default=WEEKLY)
    # Categories they're interested in
    interested_categories = models.ManyToManyField(Category, blank=True)
    # Tracking
    subscription_source = models.CharField(max_length=100, blank=True, help_text="Where they subscribed from")
    # FIX: Add protocol parameter
    ip_address = models.GenericIPAddressField(protocol='both', null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        name = f"{self.first_name} {self.last_name}".strip() or "Anonymous"
        return f"{name} ({self.email})"


class Campaign(TimeUserStamps):
    """Email campaign management"""
    STATUS_CHOICES = [
        (DRAFT, DRAFT),
        (SCHEDULED, SCHEDULED),
        (SENDING, SENDING),
        (SENT, SENT),
        (PAUSED, PAUSED),
        (CANCELLED, CANCELLED),
        ]
    TYPE_CHOICES = [
        (NEWSLETTER, NEWSLETTER),
        (PROMOTION, PROMOTION),
        (ANNOUNCEMENT, ANNOUNCEMENT),
        (WELCOME, WELCOME),
        ]
    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    campaign_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='newsletter')
    # Targeting
    target_categories = models.ManyToManyField(Category, blank=True)
    target_all_subscribers = models.BooleanField(default=True)
    # Scheduling
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    # Statistics
    recipients_count = models.PositiveIntegerField(default=0)
    delivered_count = models.PositiveIntegerField(default=0)
    opened_count = models.PositiveIntegerField(default=0)
    clicked_count = models.PositiveIntegerField(default=0)
    bounced_count = models.PositiveIntegerField(default=0)
    unsubscribed_count = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name


# class Analytics(models.Model):
#     """Website analytics and tracking"""
    
#     EVENT_CHOICES = [
#         ('page_view', 'Page View'),
#         ('post_view', 'Post View'),
#         ('search', 'Search'),
#         ('download', 'Download'),
#         ('newsletter_signup', 'Newsletter Signup'),
#         ('comment_posted', 'Comment Posted'),
#         ('share', 'Social Share'),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    
#     # Content reference
#     post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, null=True, blank=True)
#     category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    
#     # User info
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     session_id = models.CharField(max_length=100, blank=True)
#     ip_address = models.GenericIPAddressField()
    
#     # Technical info
#     user_agent = models.TextField(blank=True)
#     referrer = models.URLField(blank=True)
#     page_url = models.URLField()
    
#     # Geographic
#     country = models.CharField(max_length=100, blank=True)
#     city = models.CharField(max_length=100, blank=True)
    
#     # Additional data (JSON field for flexibility)
#     extra_data = models.JSONField(default=dict, blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['event_type', 'created_at']),
#             models.Index(fields=['post', 'event_type']),
#         ]

#     def __str__(self):
#         return f"{self.event_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


# class SiteConfiguration(models.Model):
#     """Site-wide configuration settings"""
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     site_name = models.CharField(max_length=200, default="My Luxury Blog")
#     site_tagline = models.CharField(max_length=300, blank=True)
#     site_description = models.TextField(blank=True)
#     site_url = models.URLField(blank=True)
    
#     # Contact info
#     contact_email = models.EmailField(blank=True)
#     admin_email = models.EmailField(blank=True)
    
#     # SEO defaults
#     default_meta_title = models.CharField(max_length=160, blank=True)
#     default_meta_description = models.CharField(max_length=320, blank=True)
    
#     # Social media
#     facebook_url = models.URLField(blank=True)
#     twitter_url = models.URLField(blank=True)
#     instagram_url = models.URLField(blank=True)
#     linkedin_url = models.URLField(blank=True)
#     youtube_url = models.URLField(blank=True)
    
#     # Features
#     enable_comments = models.BooleanField(default=True)
#     require_comment_moderation = models.BooleanField(default=True)
#     enable_newsletter = models.BooleanField(default=True)
#     enable_analytics = models.BooleanField(default=True)
#     posts_per_page = models.PositiveIntegerField(default=10)
    
#     # Appearance
#     logo = models.ImageField(upload_to='site/', blank=True, null=True)
#     favicon = models.ImageField(upload_to='site/', blank=True, null=True)
#     primary_color = models.CharField(max_length=7, default='#007bff')
#     secondary_color = models.CharField(max_length=7, default='#6c757d')
    
#     # Maintenance
#     maintenance_mode = models.BooleanField(default=False)
#     maintenance_message = models.TextField(blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Site Configuration"
#         verbose_name_plural = "Site Configuration"

#     def __str__(self):
#         return self.site_name


# class ContactMessage(models.Model):
#     """Contact form messages"""
    
#     STATUS_CHOICES = [
#         ('new', 'New'),
#         ('read', 'Read'),
#         ('replied', 'Replied'),
#         ('archived', 'Archived'),
#     ]

#     PRIORITY_CHOICES = [
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('urgent', 'Urgent'),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100)
#     email = models.EmailField()
#     phone = models.CharField(max_length=20, blank=True)
#     subject = models.CharField(max_length=200)
#     message = models.TextField()
    
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
#     priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
#     # Admin response
#     admin_notes = models.TextField(blank=True)
#     replied_at = models.DateTimeField(null=True, blank=True)
#     replied_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
#     # Tracking
#     ip_address = models.GenericIPAddressField(null=True, blank=True)
#     user_agent = models.TextField(blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.subject} - {self.name}"