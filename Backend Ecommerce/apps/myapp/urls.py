# from django.urls import include, path
# from .views import (
#     CategorySearchView, CategoryView, ColorView, ContactView, 
#     InventoryView, ProductVariantView, PublicContactView, EmployeeView, 
#     ProductTagView, ProductView, OrderView, PublicOrderView, 
#     PublicSalesProductView, PublicCategoryWiseView, PublicReviewView,
#     PublicProductView, PublicCategoryView, ReviewView, SalesProductView,
#     SliderCategoryView, SliderProductView, DropDownListCategoryView, 
#     DropDownListProductView, DropDownListSalesProductView, TextBoxOrderView
# )

# urlpatterns = [
#     # Product related endpoints
#     path('v1/product/', ProductView.as_view()),
#     path('v1/public/product/', PublicProductView.as_view()),
#     path('v1/slider/product/', SliderProductView.as_view()),
#     path('v1/dropdown/product/', DropDownListProductView.as_view()),
    
#     # Category related endpoints
#     path('v1/category/', CategoryView.as_view()),
#     path('v1/public/category/', PublicCategoryView.as_view()),
#     path('v1/public/category/<int:pk>/', PublicCategoryWiseView.as_view()),
#     path('v1/dropdown/category/', DropDownListCategoryView.as_view()),
#     path('v1/slider/category/', SliderCategoryView.as_view()),
#     path('v1/category/search/', CategorySearchView.as_view()),
#     path('v1/category/search/suggestions/', CategorySearchView.as_view({'get': 'suggestions'}), name='category-suggestions'),
    
#     # Product variants and inventory
#     path('v1/color/', ColorView.as_view()),
#     path('v1/product/variant/', ProductVariantView.as_view()),
#     path('v1/inventory/', InventoryView.as_view()),
    
#     # Sales related endpoints
#     path('v1/sales/product/', SalesProductView.as_view()),
#     path('v1/public/sales/product/', PublicSalesProductView.as_view()),
#     path('v1/dropdown/sales/product/', DropDownListSalesProductView.as_view()),
    
#     # Product tags
#     path('v1/product/tag/', ProductTagView.as_view()),
    
#     # Order related endpoints
#     path('v1/order/', OrderView.as_view()),
#     path('v1/textbox/order/', TextBoxOrderView.as_view()),
#     path('v1/public/order/', PublicOrderView.as_view()),
    
#     # Contact endpoints
#     path('v1/contact/', ContactView.as_view()),
#     path('v1/public/contact/', PublicContactView.as_view()),
    
#     # Employee endpoints
#     path('v1/employee/', EmployeeView.as_view()),
    
#     # Review endpoints
#     path('v1/review/', ReviewView.as_view()),
#     path('v1/public/review/', PublicReviewView.as_view()),
# ]



"""
E-commerce URL Configuration
Maps views to endpoints with clean RESTful patterns
"""

from django.urls import path
from .views import (
    # Product views
    ProductView,
    PublicProductView,
    ProductDropdownView,
    
    # Color views
    ColorView,
    
    # Product variant views
    ProductVariantView,
    PublicProductVariantView,
    
    # Inventory views
    InventoryView,
    
    # Sales product views
    SalesProductView,
    PublicSalesProductView,
    SalesProductDropdownView,
    
    # Category views
    CategoryView,
    PublicCategoryView,
    PublicCategoryDetailView,
    CategoryDropdownView,
    CategorySearchView,
    
    # Product tag views
    ProductTagView,
    
    # Order views
    OrderView,
    OrderSearchView,
    PublicOrderView,
    
    # Contact views
    ContactView,
    PublicContactView,
    
    # Review views
    ReviewView,
    PublicReviewView,
)

app_name = 'ecommerce'

urlpatterns = [
    # ====================================================================
    # PRODUCT ENDPOINTS
    # ====================================================================
    
    # Admin product management (CRUD)
    path('v1/product/', ProductView.as_view(), name='product'),
    # POST   - Create product
    # GET    - List/retrieve products (with ?id=N for single)
    # PATCH  - Update product (with ?id=N)
    # DELETE - Soft delete product (with ?id=N)
    
    # Public product listing
    path('v1/public/product/', PublicProductView.as_view(), name='public-product'),
    # Method: GET via get_publicproduct
    # Supports filters: category, price range, tags, search, pagination
    
    # Product dropdown (for forms)
    path('v1/dropdown/product/', ProductDropdownView.as_view(), name='product-dropdown'),
    # Method: GET via get_dropdown
    # Returns minimal product data for dropdowns
    
    # ====================================================================
    # COLOR ENDPOINTS
    # ====================================================================
    
    # Color management (CRUD)
    path('v1/color/', ColorView.as_view(), name='color'),
    
    # ====================================================================
    # PRODUCT VARIANT ENDPOINTS
    # ====================================================================
    
    # Admin product variant management (CRUD)
    path('v1/product/variant/', ProductVariantView.as_view(), name='product-variant'),
    
    # Public product variants
    path('v1/public/product/variant/', PublicProductVariantView.as_view(), name='public-product-variant'),
    # Method: GET via get_variants
    # Shows only active, non-deleted variants
    
    # ====================================================================
    # INVENTORY ENDPOINTS
    # ====================================================================
    
    # Inventory management (CRUD)
    path('v1/inventory/', InventoryView.as_view(), name='inventory'),
    
    # ====================================================================
    # SALES PRODUCT ENDPOINTS
    # ====================================================================
    
    # Admin sales product management (CRUD)
    path('v1/sales/product/', SalesProductView.as_view(), name='sales-product'),
    
    # Public sales products listing
    path('v1/public/sales/product/', PublicSalesProductView.as_view(), name='public-sales-product'),
    # Method: GET via get_publicsalesproduct
    # Supports filters: category, price range, discount, search, pagination
    
    # Sales product dropdown (for forms)
    path('v1/dropdown/sales/product/', SalesProductDropdownView.as_view(), name='sales-product-dropdown'),
    # Method: GET via get_dropdown
    
    # ====================================================================
    # CATEGORY ENDPOINTS
    # ====================================================================
    
    # Admin category management (CRUD)
    path('v1/category/', CategoryView.as_view(), name='category'),
    
    # Public category listing
    path('v1/public/category/', PublicCategoryView.as_view(), name='public-category'),
    # Method: GET via get_publiccategory
    # Supports pagination and filters
    
    # Public category detail (single category or list)
    path('v1/public/category/<int:pk>/', PublicCategoryDetailView.as_view(), name='public-category-detail'),
    # Method: GET via get_category_detail
    # With pk: returns single category
    # Without pk: returns paginated list
    
    # Category dropdown (for forms)
    path('v1/dropdown/category/', CategoryDropdownView.as_view(), name='category-dropdown'),
    # Method: GET via get_dropdown
    
    # Category search
    path('v1/category/search/', CategorySearchView.as_view(), name='category-search'),
    # Method: GET via get_search
    # Query param: ?q=search_term
    
    # Category search suggestions
    path('v1/category/suggestions/', CategorySearchView.as_view(), name='category-suggestions'),
    # Method: GET via get_suggestions
    # Query param: ?q=search_term
    
    # ====================================================================
    # PRODUCT TAG ENDPOINTS
    # ====================================================================
    
    # Product tag management (CRUD)
    path('v1/product/tag/', ProductTagView.as_view(), name='product-tag'),
    
    # ====================================================================
    # ORDER ENDPOINTS
    # ====================================================================
    
    # Admin order management (CRUD)
    path('v1/order/', OrderView.as_view(), name='order'),
    
    # Order search
    path('v1/order/search/', OrderSearchView.as_view(), name='order-search'),
    # Method: GET via get_search
    # Query param: ?id=N for single order
    # Or filters for searching multiple orders
    
    # Public order creation
    path('v1/public/order/', PublicOrderView.as_view(), name='public-order'),
    # Method: POST via post or create_mixed_order
    # Supports creating orders with products and/or sales products
    
    # ====================================================================
    # CONTACT ENDPOINTS
    # ====================================================================
    
    # Admin contact management (read/delete only)
    path('v1/contact/', ContactView.as_view(), name='contact'),
    # GET - List/retrieve contacts
    # DELETE - Soft delete contact
    
    # Public contact form submission
    path('v1/public/contact/', PublicContactView.as_view(), name='public-contact'),
    # Method: POST - Submit contact form
    # Method: GET via get_publiccontact (if needed)
    
    # ====================================================================
    # REVIEW ENDPOINTS
    # ====================================================================
    
    # Admin review management (full CRUD with ownership checks)
    path('v1/review/', ReviewView.as_view(), name='review'),
    # POST - Create review
    # GET - List/retrieve reviews with filters
    # PATCH - Update review (ownership check)
    # DELETE - Soft delete review (ownership check)
    
    # Public review operations (read and create only)
    path('v1/public/review/', PublicReviewView.as_view(), name='public-review'),
    # Method: POST - Create review (authenticated or guest)
    # Method: GET via get_publicreview - Get reviews for a product/sales_product
    # Query params: ?product_id=N or ?sales_product_id=N
]


# ====================================================================
# URL PATTERNS REFERENCE
# ====================================================================

"""
## Admin Endpoints (Require Authentication)

### Products
- POST   /v1/product/                  - Create product
- GET    /v1/product/                  - List products
- GET    /v1/product/?id=N             - Get product by ID
- PATCH  /v1/product/?id=N             - Update product
- DELETE /v1/product/?id=N             - Delete product (soft)

### Categories
- POST   /v1/category/                 - Create category
- GET    /v1/category/                 - List categories
- GET    /v1/category/?id=N            - Get category by ID
- PATCH  /v1/category/?id=N            - Update category
- DELETE /v1/category/?id=N            - Delete category (soft)

### Sales Products
- POST   /v1/sales/product/            - Create sales product
- GET    /v1/sales/product/            - List sales products
- GET    /v1/sales/product/?id=N       - Get sales product by ID
- PATCH  /v1/sales/product/?id=N       - Update sales product
- DELETE /v1/sales/product/?id=N       - Delete sales product (soft)

### Orders
- POST   /v1/order/                    - Create order
- GET    /v1/order/                    - List orders
- GET    /v1/order/?id=N               - Get order by ID
- PATCH  /v1/order/?id=N               - Update order
- DELETE /v1/order/?id=N               - Delete order (soft)
- GET    /v1/order/search/?id=N        - Search orders

### Colors
- POST   /v1/color/                    - Create color
- GET    /v1/color/                    - List colors
- GET    /v1/color/?id=N               - Get color by ID
- PATCH  /v1/color/?id=N               - Update color
- DELETE /v1/color/?id=N               - Delete color (soft)

### Product Variants
- POST   /v1/product/variant/          - Create variant
- GET    /v1/product/variant/          - List variants
- GET    /v1/product/variant/?id=N     - Get variant by ID
- PATCH  /v1/product/variant/?id=N     - Update variant
- DELETE /v1/product/variant/?id=N     - Delete variant (soft)

### Inventory
- POST   /v1/inventory/                - Create inventory record
- GET    /v1/inventory/                - List inventory
- GET    /v1/inventory/?id=N           - Get inventory by ID
- PATCH  /v1/inventory/?id=N           - Update inventory
- DELETE /v1/inventory/?id=N           - Delete inventory (soft)

### Product Tags
- POST   /v1/product/tag/              - Create tag
- GET    /v1/product/tag/              - List tags
- GET    /v1/product/tag/?id=N         - Get tag by ID
- PATCH  /v1/product/tag/?id=N         - Update tag
- DELETE /v1/product/tag/?id=N         - Delete tag (soft)

### Contacts
- GET    /v1/contact/                  - List contacts
- GET    /v1/contact/?id=N             - Get contact by ID
- DELETE /v1/contact/?id=N             - Delete contact (soft)

### Reviews
- POST   /v1/review/                   - Create review
- GET    /v1/review/                   - List reviews
- GET    /v1/review/?page=1&limit=10   - Paginated reviews
- PATCH  /v1/review/                   - Update review (requires id in body)
- DELETE /v1/review/?id=N              - Delete review (soft)

### Dropdowns (for forms)
- GET    /v1/dropdown/product/         - Product dropdown list
- GET    /v1/dropdown/category/        - Category dropdown list
- GET    /v1/dropdown/sales/product/   - Sales product dropdown list

## Public Endpoints (No Authentication Required)

### Products
- GET    /v1/public/product/           - List public products
  Query params: ?page=1&limit=24&category=N&min_price=100&max_price=5000

### Sales Products
- GET    /v1/public/sales/product/     - List public sales products
  Query params: ?page=1&limit=12&category=N&min_discount=10

### Categories
- GET    /v1/public/category/          - List public categories
- GET    /v1/public/category/N/        - Get category detail by ID

### Product Variants
- GET    /v1/public/product/variant/   - List public variants (active only)
  Query params: ?product_id=N&size=M

### Orders
- POST   /v1/public/order/             - Create public order
  Body: {customer_name, customer_email, customer_phone, items: [...]}

### Contacts
- POST   /v1/public/contact/           - Submit contact form
  Body: {name, email, phone_number, message}

### Reviews
- POST   /v1/public/review/            - Create review (authenticated or guest)
  Body: {rating, comment, product OR sales_product, name?, email?}
- GET    /v1/public/review/            - Get reviews
  Query params: ?product_id=N or ?sales_product_id=N

### Search
- GET    /v1/category/search/?q=term   - Search categories
- GET    /v1/category/suggestions/?q=term - Get category suggestions

## Filter Examples

### Products
?category=1&min_price=1000&max_price=5000&tags=summer&group=Men&search=shirt

### Sales Products
?category=2&min_discount=20&max_price=3000&search=dress

### Categories
?name=electronics&is_active=true

### Orders
?status=pending&payment_status=false&date_from=2024-01-01&city=karachi

### Inventory
?min_stock=0&max_stock=10&is_low_stock=true&needs_reorder=true

### Reviews
?product_id=1&min_rating=4&date_from=2024-01-01

## Pagination

All list endpoints support pagination:
- ?page=1 (default: 1)
- ?limit=24 (default varies by endpoint)
- ?offset=0 (default: 0)

Response includes:
{
    "count": 100,
    "total_pages": 5,
    "current_page": 1,
    "next": true,
    "previous": false,
    "data": [...]
}
"""