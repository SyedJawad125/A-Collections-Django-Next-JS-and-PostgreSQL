"""
E-commerce URL Configuration
All existing URLs are kept exactly as-is.
New URLs for Address, ShippingMethod, Coupon, Cart, Wishlist, Payment, ReturnRequest added below.
"""

from django.urls import path
from .views import (
    # ── Existing views (unchanged) ─────────────────────────────────────────
    DropDownListProductViews, DropDownListSalesProductView,
    ProductView, PublicProductView, ProductDropdownView,
    ColorView, PublicProductColorView,
    ProductVariantView, PublicProductVariantView,
    InventoryView, PublicInventoryView,
    SalesProductView, PublicSalesProductView, SalesProductDropdownView,
    CategoryView, PublicCategoryView, PublicCategoryDetailView,
    CategoryDropdownView, CategorySearchView, PubliccategorywiseView,
    ProductTagView, CustomerReturnRequestView, AdminReturnRequestView,
    OrderView, OrderSearchView, PublicOrderView,
    ContactView, PublicContactView,
    ReviewView, PublicReviewView, 

    # ── New views ──────────────────────────────────────────────────────────
    SalesProductColorView,
    SalesProductVariantView, PublicSalesProductVariantView,
    SalesInventoryView, PublicSalesProductColorView, PublicSalesInventoryView,
    AddressView,
    ShippingMethodView, PublicShippingMethodView,
    CouponView, ValidateCouponView,
    CartView, CartItemView,
    WishlistView, WishlistItemView,
    PaymentView
)

app_name = 'ecommerce'

urlpatterns = [

    # =========================================================================
    # PRODUCT
    # =========================================================================
    path('v1/product/',                 ProductView.as_view(),          name='product'),
    path('v1/public/product/',          PublicProductView.as_view(),    name='public-product'),
    path('v1/dropdown/product/',        ProductDropdownView.as_view(),  name='product-dropdown'),

    # =========================================================================
    # COLOR
    # =========================================================================
    path('v1/color/',                   ColorView.as_view(),            name='color'),
    path('v1/public/color/',            PublicProductColorView.as_view(), name='public-color'),

    # =========================================================================
    # PRODUCT VARIANT
    # =========================================================================
    path('v1/product/variant/',         ProductVariantView.as_view(),       name='product-variant'),
    path('v1/public/product/variant/',  PublicProductVariantView.as_view(), name='public-product-variant'),

    # =========================================================================
    # INVENTORY
    # =========================================================================
    path('v1/inventory/',               InventoryView.as_view(),        name='inventory'),
    path('v1/public/inventory/',        PublicInventoryView.as_view(),  name='public-inventory'),

    # =========================================================================
    # SALES PRODUCT
    # =========================================================================
    path('v1/sales/product/',           SalesProductView.as_view(),         name='sales-product'),
    path('v1/public/sales/product/',    PublicSalesProductView.as_view(),   name='public-sales-product'),
    path('v1/dropdown/sales/product/',  SalesProductDropdownView.as_view(), name='sales-product-dropdown'),

    # =========================================================================
    # SALES PRODUCT COLOR  ── NEW
    # =========================================================================
    path('v1/sales/product/color/',     SalesProductColorView.as_view(),    name='sales-product-color'),
    path('v1/public/sales/product/color/',     PublicSalesProductColorView.as_view(),    name='sales-public-product-color'), 

    # =========================================================================
    # SALES PRODUCT VARIANT  ── NEW
    # =========================================================================
    path('v1/sales/product/variant/',  SalesProductVariantView.as_view(),   name='sales-product-variant'),
    path('v1/public/sales/product/variant/', PublicSalesProductVariantView.as_view(), name='public-sales-product-variant'),

    # =========================================================================
    # SALES INVENTORY  ── NEW
    # =========================================================================
    path('v1/sales/inventory/',         SalesInventoryView.as_view(),        name='sales-inventory'),
    path('v1/public/sales/inventory/',  PublicSalesInventoryView.as_view(),  name='public-sales-inventory'),

    # =========================================================================
    # CATEGORY
    # =========================================================================
    path('v1/category/',                    CategoryView.as_view(),             name='category'),
    path('v1/public/category/',             PublicCategoryView.as_view(),       name='public-category'),
    path('v1/public/category/<int:pk>/',    PublicCategoryDetailView.as_view(), name='public-category-detail'),
    path('v1/dropdown/category/',           CategoryDropdownView.as_view(),     name='category-dropdown'),
    path('v1/category/search/',             CategorySearchView.as_view(),       name='category-search'),
    path('v1/category/suggestions/',        CategorySearchView.as_view(),       name='category-suggestions'),
    path('v1/public/category/wise/',        PubliccategorywiseView.as_view(),   name='category-wise'),

    # =========================================================================
    # PRODUCT TAG
    # =========================================================================
    path('v1/product/tag/',             ProductTagView.as_view(),       name='product-tag'),

    # =========================================================================
    # ORDER
    # =========================================================================
    path('v1/order/',                   OrderView.as_view(),            name='order'),
    path('v1/order/search/',            OrderSearchView.as_view(),      name='order-search'),
    path('v1/public/order/',            PublicOrderView.as_view(),      name='public-order'),

    # =========================================================================
    # CONTACT
    # =========================================================================
    path('v1/contact/',                 ContactView.as_view(),          name='contact'),
    path('v1/public/contact/',          PublicContactView.as_view(),    name='public-contact'),

    # =========================================================================
    # REVIEW
    # =========================================================================
    path('v1/review/',                  ReviewView.as_view(),           name='review'),
    path('v1/public/review/',           PublicReviewView.as_view(),     name='public-review'),

    # =========================================================================
    # DROPDOWN  (legacy)
    # =========================================================================
    path('v1/dropdown/product/',        DropDownListProductViews.as_view(),    name='dropdown-product'),
    path('v1/dropdown/sales/product/',  DropDownListSalesProductView.as_view(), name='dropdown-sales-product'),

    # =========================================================================
    # ADDRESS  ── NEW
    # =========================================================================
    # GET    /v1/address/          → list user's addresses
    # POST   /v1/address/          → create address
    # PATCH  /v1/address/?id=N     → update address
    # DELETE /v1/address/?id=N     → soft-delete address
    path('v1/address/',             AddressView.as_view(),              name='address'),

    # =========================================================================
    # SHIPPING METHOD  ── NEW
    # =========================================================================
    # Admin CRUD
    path('v1/shipping/',            ShippingMethodView.as_view(),       name='shipping-method'),
    # Public listing for checkout
    path('v1/public/shipping/',     PublicShippingMethodView.as_view(), name='public-shipping-method'),

    # =========================================================================
    # COUPON  ── NEW
    # =========================================================================
    # Admin CRUD
    path('v1/coupon/',              CouponView.as_view(),               name='coupon'),
    # Customer validates coupon at checkout
    path('v1/public/coupon/validate/', ValidateCouponView.as_view(),   name='validate-coupon'),

    # =========================================================================
    # CART  ── NEW
    # =========================================================================
    # GET  /v1/cart/         → view cart
    # DELETE /v1/cart/       → clear entire cart
    path('v1/cart/',            CartView.as_view(),                     name='cart'),
    # POST   /v1/cart/item/          → add item (or increment qty)
    # PATCH  /v1/cart/item/?id=N     → change quantity
    # DELETE /v1/cart/item/?id=N     → remove item
    path('v1/cart/item/',       CartItemView.as_view(),                 name='cart-item'),

    # =========================================================================
    # WISHLIST  ── NEW
    # =========================================================================
    # GET  /v1/wishlist/           → view wishlist
    path('v1/wishlist/',        WishlistView.as_view(),                 name='wishlist'),
    # POST   /v1/wishlist/item/        → add item
    # DELETE /v1/wishlist/item/?id=N   → remove item
    path('v1/wishlist/item/',   WishlistItemView.as_view(),             name='wishlist-item'),

    # =========================================================================
    # PAYMENT  ── NEW
    # =========================================================================
    # Admin views / updates payment records
    path('v1/payment/',         PaymentView.as_view(),                  name='payment'),

    # =========================================================================
    # RETURN REQUEST  ── NEW
    # =========================================================================
    # POST /api/v1/return/
    # GET  /api/v1/return/
    # GET   /api/v1/admin/return/
    # PATCH /api/v1/admin/return/?id=15
    path('v1/return/',          CustomerReturnRequestView.as_view(),    name='customer-return-request'),
    path('v1/admin/return/',    AdminReturnRequestView.as_view(),       name='admin-return-request'),
]