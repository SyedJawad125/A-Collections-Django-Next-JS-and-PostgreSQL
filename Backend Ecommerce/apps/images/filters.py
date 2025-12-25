from django_filters import CharFilter, FilterSet, NumberFilter, BooleanFilter
from .models import *

# Base filter with common functionality
class BaseImagesFilter(FilterSet):
    id = NumberFilter(field_name='id')
    name = CharFilter(field_name='name', lookup_expr='icontains')
    imagescategory = CharFilter(field_name='imagescategory__category', lookup_expr='icontains')
    imagescategory_id = NumberFilter(field_name='imagescategory_id')

    class Meta:
        model = Images
        exclude = ['image']

# Base categories filter
class BaseCategoriesFilter(FilterSet):
    id = NumberFilter(field_name='id')
    category = CharFilter(field_name='category', lookup_expr='icontains')

    class Meta:
        model = Categories
        fields = '__all__'

# Specific filter classes for different APIs
class ImagesFilter(BaseImagesFilter):
    """
    For regular Images API - most comprehensive filtering
    """
    # Add any specific filters for regular images API
    has_description = BooleanFilter(field_name='description', lookup_expr='isnull', exclude=True)
    
    class Meta(BaseImagesFilter.Meta):
        pass


class PublicImagesFilter(BaseImagesFilter):
    """
    For Public Images API - might have additional public-specific filters
    """
    # Example: Only show images that are marked as public
    # is_public = BooleanFilter(field_name='is_public')  # if you have such field
    
    class Meta(BaseImagesFilter.Meta):
        # You can further restrict fields for public API if needed
        pass


class TextBoxImagesFilter(BaseImagesFilter):
    """
    For TextBox Images API - specific to text box context
    """
    # Example: Filter images suitable for text boxes
    # is_textbox_suitable = BooleanFilter(field_name='is_textbox_suitable')
    
    class Meta(BaseImagesFilter.Meta):
        # You might want to exclude certain fields for textbox context
        pass


class CategoriesFilter(BaseCategoriesFilter):
    """
    For regular Categories API
    """
    # Add any category-specific filters for regular API
    class Meta(BaseCategoriesFilter.Meta):
        pass


class TextCategoriesFilter(BaseCategoriesFilter):
    """
    For Text Categories API - might have text-specific filtering
    """
    # Example: Only categories that have text-related images
    # has_text_images = BooleanFilter(method='filter_has_text_images')
    
    # def filter_has_text_images(self, queryset, name, value):
    #     if value:
    #         return queryset.filter(categoriesimages__description__isnull=False).distinct()
    #     return queryset
    
    class Meta(BaseCategoriesFilter.Meta):
        pass