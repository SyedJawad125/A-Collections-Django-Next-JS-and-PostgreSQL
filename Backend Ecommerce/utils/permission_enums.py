
SHOW_ROLE = 'show_role'
CREATE_ROLE = 'create_role'
READ_ROLE = 'read_role'
UPDATE_ROLE = 'update_role'
DELETE_ROLE = 'delete_role'

SHOW_USER = 'show_user'
CREATE_USER = 'create_user'
READ_USER = 'read_user'
UPDATE_USER = 'update_user'
DELETE_USER = 'delete_user'
TOGGLE_USER = 'toggle_user'

# Product Permissions
CREATE_PRODUCT = 'create_product'
READ_PRODUCT = 'read_product'
UPDATE_PRODUCT = 'update_product'
DELETE_PRODUCT = 'delete_product'

# Color Permissions
CREATE_COLOR = 'create_color'
READ_COLOR = 'read_color'
UPDATE_COLOR = 'update_color'
DELETE_COLOR = 'delete_color'

# Product Variant Permissions
CREATE_PRODUCTVARIANT = 'create_productvariant'
READ_PRODUCTVARIANT = 'read_productvariant'
UPDATE_PRODUCTVARIANT = 'update_productvariant'
DELETE_PRODUCTVARIANT = 'delete_productvariant'

# Inventory Permissions
CREATE_INVENTORY = 'create_inventory'
READ_INVENTORY = 'read_inventory'
UPDATE_INVENTORY = 'update_inventory'
DELETE_INVENTORY = 'delete_inventory'

# Sales Product Permissions
CREATE_SALES_PRODUCT = 'create_sales_product'
READ_SALES_PRODUCT = 'read_sales_product'
UPDATE_SALES_PRODUCT = 'update_sales_product'
DELETE_SALES_PRODUCT = 'delete_sales_product'

# Sales Product Color Permissions
CREATE_SALES_PRODUCTCOLOR = 'create_sales_productcolor'
READ_SALES_PRODUCTCOLOR = 'read_sales_productcolor'
UPDATE_SALES_PRODUCTCOLOR = 'update_sales_productcolor'
DELETE_SALES_PRODUCTCOLOR = 'delete_sales_productcolor'

# Sales Product Variant Permissions
CREATE_SALES_PRODUCTVARIANT = 'create_sales_productvariant'
READ_SALES_PRODUCTVARIANT = 'read_sales_productvariant'
UPDATE_SALES_PRODUCTVARIANT = 'update_sales_productvariant'
DELETE_SALES_PRODUCTVARIANT = 'delete_sales_productvariant'

# Sales Inventory Permissions
CREATE_SALES_INVENTORY = 'create_sales_inventory'
READ_SALES_INVENTORY = 'read_sales_inventory'
UPDATE_SALES_INVENTORY = 'update_sales_inventory'
DELETE_SALES_INVENTORY = 'delete_sales_inventory'

# Category Permissions
CREATE_CATEGORY = 'create_category'
READ_CATEGORY = 'read_category'
UPDATE_CATEGORY = 'update_category'
DELETE_CATEGORY = 'delete_category'

# Order Permissions
CREATE_ORDER = 'create_order'
READ_ORDER = 'read_order'
UPDATE_ORDER = 'update_order'
DELETE_ORDER = 'delete_order'

# Contact Permissions
READ_CONTACT = 'read_contact'
DELETE_CONTACT = 'delete_contact'

# Employee Permissions
CREATE_EMPLOYEE = 'create_employee'
READ_EMPLOYEE = 'read_employee'
UPDATE_EMPLOYEE = 'update_employee'
DELETE_EMPLOYEE = 'delete_employee'

# Review Permissions
CREATE_REVIEWS = 'create_reviews'
READ_REVIEWS = 'read_reviews'
UPDATE_REVIEWS = 'update_reviews'
DELETE_REVIEWS = 'delete_reviews' 

CREATE_IMAGE = 'create_image'
READ_IMAGE = 'read_image'
UPDATE_IMAGE = 'update_image'
DELETE_IMAGE = 'delete_image'

CREATE_IMAGE_CATEGORY = 'create_image_category'
READ_IMAGE_CATEGORY = 'read_image_category'
UPDATE_IMAGE_CATEGORY = 'update_image_category'
DELETE_IMAGE_CATEGORY = 'delete_image_category'


"""
Add these constants to your existing utils/permission_enums.py file.
They follow the same pattern as your existing CREATE_USER, READ_USER, etc.
"""

# ============================================================================
# PRODUCT PERMISSIONS
# ============================================================================
CREATE_PRODUCT  = 'create_product'
READ_PRODUCT    = 'read_product'
UPDATE_PRODUCT  = 'update_product'
DELETE_PRODUCT  = 'delete_product'

# ============================================================================
# INVENTORY PERMISSIONS
# ============================================================================
READ_INVENTORY   = 'read_inventory'
UPDATE_INVENTORY = 'update_inventory'

# ============================================================================
# ORDER PERMISSIONS
# ============================================================================
READ_ORDER   = 'read_order'
UPDATE_ORDER = 'update_order'
DELETE_ORDER = 'delete_order'

# ============================================================================
# COUPON PERMISSIONS
# ============================================================================
CREATE_COUPON = 'create_coupon'
READ_COUPON   = 'read_coupon'
UPDATE_COUPON = 'update_coupon'
DELETE_COUPON = 'delete_coupon'

# ============================================================================
# SHIPPING METHOD PERMISSIONS
# ============================================================================
CREATE_SHIPPING = 'create_shipping'
READ_SHIPPING   = 'read_shipping'
UPDATE_SHIPPING = 'update_shipping'
DELETE_SHIPPING = 'delete_shipping'

# ============================================================================
# COUPON PERMISSIONS
# ============================================================================
CREATE_COUPON = 'create_coupon'
READ_COUPON   = 'read_coupon'
UPDATE_COUPON = 'update_coupon'
DELETE_COUPON = 'delete_coupon'

# ============================================================================
# PAYMENT PERMISSIONS
# (no create/delete — Payment records are only ever created internally
#  when an order is placed, and never deleted through the API)
# ============================================================================
READ_PAYMENT   = 'read_payment'
UPDATE_PAYMENT = 'update_payment'

# ============================================================================
# RETURN REQUEST PERMISSIONS
# (no create — customers file their own returns via ReturnRequestView.post()
#  with no permission gate; no delete — the view has no delete route)
# ============================================================================
READ_RETURN   = 'read_return'
UPDATE_RETURN = 'update_return'

# ============================================================================
# OPTIONAL — not currently enforced in views.py (AddressView / CartView /
# CartItemView / WishlistView / WishlistItemView only check IsAuthenticated,
# no @permission_required decorator). Only wire these up if you add the
# decorator to those views; otherwise leave unused.
# ============================================================================
CREATE_ADDRESS = 'create_address'
READ_ADDRESS   = 'read_address'
UPDATE_ADDRESS = 'update_address'
DELETE_ADDRESS = 'delete_address'

READ_CART   = 'read_cart'
UPDATE_CART = 'update_cart'
DELETE_CART = 'delete_cart'

READ_WISHLIST   = 'read_wishlist'
UPDATE_WISHLIST = 'update_wishlist'
DELETE_WISHLIST = 'delete_wishlist'