from django.urls import include, path
from .views import (
    CategorySearchView, CategoryView, ColorView, ContactView, 
    InventoryView, ProductVariantView, PublicContactView, EmployeeView, 
    ProductTagView, ProductView, OrderView, PublicOrderView, 
    PublicSalesProductView, PublicCategoryWiseView, PublicReviewView,
    PublicProductView, PublicCategoryView, ReviewView, SalesProductView,
    SliderCategoryView, SliderProductView, DropDownListCategoryView, 
    DropDownListProductView, DropDownListSalesProductView, TextBoxOrderView
)

urlpatterns = [
    # Product related endpoints
    path('v1/product/', ProductView.as_view()),
    path('v1/public/product/', PublicProductView.as_view()),
    path('v1/slider/product/', SliderProductView.as_view()),
    path('v1/dropdown/product/', DropDownListProductView.as_view()),
    
    # Category related endpoints
    path('v1/category/', CategoryView.as_view()),
    path('v1/public/category/', PublicCategoryView.as_view()),
    path('v1/public/category/<int:pk>/', PublicCategoryWiseView.as_view()),
    path('v1/dropdown/category/', DropDownListCategoryView.as_view()),
    path('v1/slider/category/', SliderCategoryView.as_view()),
    path('v1/category/search/', CategorySearchView.as_view()),
    path('v1/category/search/suggestions/', CategorySearchView.as_view({'get': 'suggestions'}), name='category-suggestions'),
    
    # Product variants and inventory
    path('v1/color/', ColorView.as_view()),
    path('v1/product/variant/', ProductVariantView.as_view()),
    path('v1/inventory/', InventoryView.as_view()),
    
    # Sales related endpoints
    path('v1/sales/product/', SalesProductView.as_view()),
    path('v1/public/sales/product/', PublicSalesProductView.as_view()),
    path('v1/dropdown/sales/product/', DropDownListSalesProductView.as_view()),
    
    # Product tags
    path('v1/product/tag/', ProductTagView.as_view()),
    
    # Order related endpoints
    path('v1/order/', OrderView.as_view()),
    path('v1/textbox/order/', TextBoxOrderView.as_view()),
    path('v1/public/order/', PublicOrderView.as_view()),
    
    # Contact endpoints
    path('v1/contact/', ContactView.as_view()),
    path('v1/public/contact/', PublicContactView.as_view()),
    
    # Employee endpoints
    path('v1/employee/', EmployeeView.as_view()),
    
    # Review endpoints
    path('v1/review/', ReviewView.as_view()),
    path('v1/public/review/', PublicReviewView.as_view()),
]