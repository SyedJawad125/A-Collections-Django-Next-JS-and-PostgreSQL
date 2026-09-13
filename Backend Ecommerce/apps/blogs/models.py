from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils import timezone
from django.db.models import Q, Count
from utils.enums import *
from utils.reusable_classes import TimeUserStamps
from django_ckeditor_5.fields import CKEditor5Field


# ======================= CATEGORY =======================

class Category(TimeUserStamps):
    """Blog post categories with hierarchical structure"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    description = CKEditor5Field(config_name='extends', blank=True, null=True)
    # PROTECT instead of CASCADE: a soft-delete app should never let a hard
    # delete of a parent silently wipe out children. If you truly want to
    # remove a category, soft-delete it explicitly and cascade in code.
    parent = models.ForeignKey(
        'self', on_delete=models.PROTECT, null=True, blank=True,
        related_name='subcategories'
    )
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        constraints = [
            # Uniqueness only enforced among non-deleted rows, so a soft
            # deleted category doesn't permanently block a slug/name.
            models.UniqueConstraint(
                fields=['slug'],
                condition=Q(deleted=False),
                name='unique_active_category_slug',
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug, deleted=False).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def soft_delete_cascade(self, user=None):
        """
        Soft delete this category AND cascade the soft-delete flag down to
        subcategories, mirroring what CASCADE would have done at the DB
        level — but without destroying data.
        """
        self.deleted = True
        self.updated_by = user
        self.save(update_fields=['deleted', 'updated_by'])
        for sub in self.subcategories.filter(deleted=False):
            sub.soft_delete_cascade(user=user)

    def __str__(self):
        return self.name


# ======================= TAG =======================

class Tag(TimeUserStamps):
    """Tags for blog posts"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#007bff', help_text="Hex color code")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=Q(deleted=False),
                name='unique_active_tag_slug',
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Tag.objects.filter(slug=slug, deleted=False).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ======================= BLOG POST =======================

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
    content = CKEditor5Field(config_name='extends')
    excerpt = CKEditor5Field(config_name='default', blank=True)

    # Relationships
    author = models.CharField(max_length=100, blank=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)

    # Media
    featured_image = models.ImageField(upload_to='blog/featured/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=200, blank=True)

    # Status and Visibility. Use enum constants, not raw literals, so a
    # future rename of DRAFT/PUBLIC doesn't silently desync the default.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default=PUBLIC)
    # Never serialize this field (see serializers.py). Store a HASH, not
    # plaintext — set via set_password()/check_password() below.
    password = models.CharField(max_length=255, blank=True,
                                 help_text="Required if visibility is password protected. Stored hashed.")

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
        constraints = [
            models.UniqueConstraint(
                fields=['slug'],
                condition=Q(deleted=False),
                name='unique_active_blogpost_slug',
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug, deleted=False).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        """Hash and store the post's access password."""
        from django.contrib.auth.hashers import make_password
        self.password = make_password(raw_password) if raw_password else ''

    def check_password(self, raw_password):
        """Verify a supplied password against the stored hash."""
        from django.contrib.auth.hashers import check_password
        if not self.password:
            return False
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.title


# ======================= COMMENT =======================

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
    """
    Custom manager for Comment model.

    IMPORTANT: unlike a typical soft-delete manager, this does NOT filter
    out deleted rows by default — several call sites (moderation, staff
    views) legitimately need access to deleted comments via `objects`.
    Use `.active()` / `.approved()` explicitly wherever public-facing code
    reads comments. `check_rate_limit()` below has been fixed to do this.
    """

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

    # PROTECT rather than CASCADE — a hard delete of a BlogPost should never
    # silently wipe out its comments. Soft-delete the post instead.
    post = models.ForeignKey(
        'BlogPost', on_delete=models.PROTECT, related_name='comments'
    )
    parent = models.ForeignKey(
        'self', on_delete=models.PROTECT, null=True, blank=True,
        related_name='replies'
    )

    # Author - either authenticated user or guest
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True,
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING, db_index=True)
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='moderated_comments'
    )
    moderated_at = models.DateTimeField(null=True, blank=True)
    moderation_note = models.TextField(blank=True)

    # Tracking (never exposed via API — see CommentSerializer)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Soft delete
    deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='deleted_comments'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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

        if not self.user and not self.guest_name:
            raise ValidationError("Either user or guest_name must be provided")

        if self.user and (self.guest_name or self.guest_email):
            raise ValidationError("Cannot have both user and guest information")

        if not self.user and not (self.guest_name and self.guest_email):
            raise ValidationError("Guest comments require both name and email")

        if self.parent:
            if self.parent.post != self.post:
                raise ValidationError("Parent comment must belong to the same post")

            if self.parent.deleted:
                raise ValidationError("Cannot reply to a deleted comment")

            if self.parent.parent is not None:
                raise ValidationError(
                    "Cannot reply to a reply. Only one level of nesting allowed"
                )

            if self.pk and self.parent.pk == self.pk:
                raise ValidationError("Comment cannot be a reply to itself")

        if self.post and not self.post.allow_comments:
            raise ValidationError("This post does not allow comments")

        if self.content:
            content_stripped = self.content.strip()
            if len(content_stripped) < 3:
                raise ValidationError("Comment must be at least 3 characters long")

    def save(self, *args, **kwargs):
        """
        Only run full_clean() on genuine content creates/edits, not on the
        internal status-transition saves below (approve/reject/spam/edit/
        soft_delete/restore all pass update_fields). Otherwise, once a
        comment's parent gets soft-deleted, the "cannot reply to a deleted
        comment" rule in clean() blocks *every subsequent save* of the
        reply, including moderation and soft-delete/restore of the reply
        itself.
        """
        if kwargs.get('update_fields') is None:
            self.full_clean()
        super().save(*args, **kwargs)

    # Properties
    @property
    def author_name(self):
        if self.user:
            return self.user.get_full_name() or self.user.username
        return self.guest_name

    @property
    def author_email(self):
        if self.user:
            return self.user.email
        return self.guest_email

    @property
    def is_guest(self):
        return self.user is None

    @property
    def is_approved(self):
        return self.status == self.APPROVED

    @property
    def is_pending(self):
        return self.status == self.PENDING

    @property
    def is_reply(self):
        return self.parent is not None

    @property
    def reply_count(self):
        return self.replies.filter(status=self.APPROVED, deleted=False).count()

    # Permission Methods
    def can_edit(self, user):
        if not user or not user.is_authenticated:
            return False
        if self.deleted:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return self.user == user

    def can_delete(self, user):
        if not user or not user.is_authenticated:
            return False
        if self.deleted:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return self.user == user

    def can_moderate(self, user):
        if not user or not user.is_authenticated:
            return False
        return user.is_staff or user.is_superuser

    def can_view(self, user):
        if self.deleted:
            return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))

        if self.is_approved:
            return True

        if user and user.is_authenticated:
            if user.is_staff or user.is_superuser:
                return True
            if self.user == user:
                return True

        return False

    # Action Methods (all use update_fields -> skip full_clean, see save())
    def approve(self, moderator=None, note=''):
        self.status = self.APPROVED
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        if note:
            self.moderation_note = note
        self.save(update_fields=['status', 'moderated_by', 'moderated_at', 'moderation_note'])

    def reject(self, moderator=None, note=''):
        self.status = self.REJECTED
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        if note:
            self.moderation_note = note
        self.save(update_fields=['status', 'moderated_by', 'moderated_at', 'moderation_note'])

    def mark_as_spam(self, moderator=None, note=''):
        self.status = self.SPAM
        self.moderated_by = moderator
        self.moderated_at = timezone.now()
        if note:
            self.moderation_note = note
        self.save(update_fields=['status', 'moderated_by', 'moderated_at', 'moderation_note'])

    def mark_as_edited(self):
        self.is_edited = True
        self.edited_at = timezone.now()
        self.save(update_fields=['is_edited', 'edited_at'])

    def soft_delete(self, user=None):
        self.deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=['deleted', 'deleted_at', 'deleted_by'])

    def restore(self):
        self.deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['deleted', 'deleted_at', 'deleted_by'])

    # Query Methods
    def get_approved_replies(self):
        return self.replies.filter(status=self.APPROVED, deleted=False).select_related('user', 'post')

    # Class Methods
    @classmethod
    def get_pending_count(cls):
        return cls.objects.filter(status=cls.PENDING, deleted=False).count()

    @classmethod
    def check_rate_limit(cls, ip_address=None, user=None, minutes=60, max_comments=10):
        """
        Check if user/IP has exceeded comment rate limit.
        Fixed: now excludes soft-deleted comments, so a deleted comment
        can't keep counting against someone's rate limit forever.
        """
        time_threshold = timezone.now() - timezone.timedelta(minutes=minutes)

        if user and user.is_authenticated:
            count = cls.objects.filter(
                user=user, deleted=False, created_at__gte=time_threshold
            ).count()
        elif ip_address:
            count = cls.objects.filter(
                ip_address=ip_address, deleted=False, created_at__gte=time_threshold
            ).count()
        else:
            return False

        return count >= max_comments