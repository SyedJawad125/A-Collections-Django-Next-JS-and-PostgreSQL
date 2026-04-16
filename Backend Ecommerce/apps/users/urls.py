# from django.urls import path
# from .views import (LoginView, RefreshView, LogoutView, ForgetPasswordView, VerifyLinkView, 
#                     ResetPasswordView, VerifyOTPView, PermissionView, EmployeeView, 
#                     EmployeeToggleView, RoleView, AccountActivateView, ChangePasswordView)

# urlpatterns = [
#     # Authentication endpoints
#     path('v1/login/', LoginView.as_view(), name='login'),
#     path('v1/refresh/', RefreshView.as_view(), name='refresh-token'),
#     path('v1/logout/', LogoutView.as_view(), name='logout'),

#     # Change Password (for logged-in users)
#     path('v1/change/password/', ChangePasswordView.as_view(), name='change-password'),  # Add this line

#     # OTP-based Password Reset Flow (New - Recommended)
#     path('v1/forget/password/', ForgetPasswordView.as_view(), name='forget-password'),  # Step 1: Request OTP
#     path('v1/verify/otp/', VerifyOTPView.as_view(), name='verify-otp'),  # Step 2: Verify OTP
#     path('v1/reset/password/', ResetPasswordView.as_view(), name='reset-password'),  # Step 3: Reset Password
    
#     # Legacy link-based verification (kept for backward compatibility)
#     path('v1/verify/link/', VerifyLinkView.as_view(), name='verify-link'),

#     # Employee Management
#     path('v1/employee/', EmployeeView.as_view(), name='employee'),
#     path('v1/toggle/', EmployeeToggleView.as_view(), name='employee-toggle'),

#     # Role & Permission Management
#     path('v1/permission/', PermissionView.as_view(), name='permission'),
#     path('v1/role/', RoleView.as_view(), name='role'),

#     # Account Activation
#     path('v1/account/activate/', AccountActivateView.as_view(), name='account-activate'),
# ]







"""
E-commerce URL Configuration
Follows the same naming pattern as apps/users/urls.py
"""

from django.urls import path
from .views import (
    # Category
    CategoryView, PublicCategoryView,
    # Product
    ProductTagView, ColorView,
    ProductView, PublicProductView, ProductDetailView, ProductImageView,
    ProductVariantView,
    # Inventory
    InventoryView, LowStockAlertView,
    # Sales
    SalesProductView, PublicSalesProductView,
    # Shipping
    ShippingMethodView, PublicShippingMethodView,
    # Coupon
    CouponView, ValidateCouponView,
    # Address
    AddressView,
    # Cart
    CartView, CartItemView,
    # Wishlist
    WishlistView, WishlistItemView,
    # Order
    OrderView, PlaceOrderView, CustomerOrderView, OrderStatusUpdateView,
    # Payment
    PaymentView,
    # Return
    ReturnRequestView,
    # Contact & Review
    ContactView, ContactListView,
    ReviewView, PublicReviewView,
)

urlpatterns = [

    # =========================================================================
    # CATEGORY
    # =========================================================================
    path('v1/category/',        CategoryView.as_view(),       name='category'),         # Admin CRUD
    path('v1/pub/category/',    PublicCategoryView.as_view(), name='public-category'),  # Public listing

    # =========================================================================
    # PRODUCT META (Tags & Colors)
    # =========================================================================
    path('v1/tag/',             ProductTagView.as_view(),     name='product-tag'),
    path('v1/color/',           ColorView.as_view(),          name='color'),

    # =========================================================================
    # PRODUCT
    # =========================================================================
    path('v1/product/',         ProductView.as_view(),        name='product'),          # Admin CRUD
    path('v1/pub/product/',     PublicProductView.as_view(),  name='public-product'),   # Public listing
    path('v1/pub/product/detail/', ProductDetailView.as_view(), name='product-detail'), # Public single product
    path('v1/product/image/',   ProductImageView.as_view(),   name='product-image'),    # Admin image management

    # =========================================================================
    # PRODUCT VARIANT
    # =========================================================================
    path('v1/variant/',         ProductVariantView.as_view(), name='product-variant'),

    # =========================================================================
    # INVENTORY
    # =========================================================================
    path('v1/inventory/',       InventoryView.as_view(),      name='inventory'),
    path('v1/inventory/low-stock/', LowStockAlertView.as_view(), name='low-stock'),

    # =========================================================================
    # SALES PRODUCT
    # =========================================================================
    path('v1/sale/',            SalesProductView.as_view(),       name='sales-product'),
    path('v1/pub/sale/',        PublicSalesProductView.as_view(), name='public-sales-product'),

    # =========================================================================
    # SHIPPING METHOD
    # =========================================================================
    path('v1/shipping/',        ShippingMethodView.as_view(),       name='shipping-method'),
    path('v1/pub/shipping/',    PublicShippingMethodView.as_view(), name='public-shipping-method'),

    # =========================================================================
    # COUPON
    # =========================================================================
    path('v1/coupon/',          CouponView.as_view(),          name='coupon'),           # Admin CRUD
    path('v1/coupon/validate/', ValidateCouponView.as_view(),  name='validate-coupon'),  # Customer validates coupon

    # =========================================================================
    # ADDRESS
    # =========================================================================
    path('v1/address/',         AddressView.as_view(),         name='address'),          # Customer manages their addresses

    # =========================================================================
    # CART
    # =========================================================================
    path('v1/cart/',            CartView.as_view(),            name='cart'),             # GET cart | DELETE clear cart
    path('v1/cart/item/',       CartItemView.as_view(),        name='cart-item'),        # POST add | PATCH qty | DELETE remove

    # =========================================================================
    # WISHLIST
    # =========================================================================
    path('v1/wishlist/',        WishlistView.as_view(),        name='wishlist'),         # GET wishlist
    path('v1/wishlist/item/',   WishlistItemView.as_view(),    name='wishlist-item'),    # POST add | DELETE remove

    # =========================================================================
    # ORDER
    # =========================================================================
    path('v1/order/',           OrderView.as_view(),           name='order'),            # Admin: list, update, delete
    path('v1/order/place/',     PlaceOrderView.as_view(),      name='place-order'),      # Customer: checkout from cart
    path('v1/order/my/',        CustomerOrderView.as_view(),   name='my-orders'),        # Customer: their own orders
    path('v1/order/status/',    OrderStatusUpdateView.as_view(), name='order-status'),   # Admin: update order status

    # =========================================================================
    # PAYMENT
    # =========================================================================
    path('v1/payment/',         PaymentView.as_view(),         name='payment'),

    # =========================================================================
    # RETURN REQUEST
    # =========================================================================
    path('v1/return/',          ReturnRequestView.as_view(),   name='return-request'),

    # =========================================================================
    # CONTACT
    # =========================================================================
    path('v1/contact/',         ContactView.as_view(),         name='contact'),          # Public: submit form
    path('v1/contact/list/',    ContactListView.as_view(),     name='contact-list'),     # Admin: view submissions

    # =========================================================================
    # REVIEW
    # =========================================================================
    path('v1/review/',          ReviewView.as_view(),          name='review'),           # Auth: submit | Admin: list/delete
    path('v1/pub/review/',      PublicReviewView.as_view(),    name='public-review'),    # Public: view reviews by product
]