import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from apps.users.models import Permission

permissions = [
        Permission(name='Show Role', code_name='show_role', module_name='Role', module_label='User Management', description='User can see role'),
        Permission(name='Create Role', code_name='create_role', module_name='Role', module_label='User Management', description='User can create role'),
        Permission(name='Read Role', code_name='read_role', module_name='Role', module_label='User Management', description='User can read role'),
        Permission(name='Update Role', code_name='update_role', module_name='Role', module_label='User Management', description='User can update role'),
        Permission(name='Delete Role', code_name='delete_role', module_name='Role', module_label='User Management', description='User can delete role'),

        Permission(name='Show User', code_name='show_user', module_name='User', module_label='User Management',
                description='User can see user'),
        Permission(name='Create User', code_name='create_user', module_name='User', module_label='User Management',
                description='User can create user'),
        Permission(name='Read User', code_name='read_user', module_name='User', module_label='User Management',
                description='User can read user'),
        Permission(name='Update User', code_name='update_user', module_name='User', module_label='User Management',
                description='User can update user'),
        Permission(name='Delete User', code_name='delete_user', module_name='User', module_label='User Management',
                description='User can delete user'),
        Permission(name='Deactivate User', code_name='toggle_user', module_name='User', module_label='User Management',
                description='User can deactivate user'),


        # ---------- Image ----------
        Permission(name='Create Image', code_name='create_image', module_name='Image', module_label='Image Management',
                description='User can create Image'),
        Permission(name='Read Image', code_name='read_image', module_name='Image', module_label='Image Management',
                description='User can read Image'),
        Permission(name='Update Image', code_name='update_image', module_name='Image', module_label='Image Management',
                description='User can update Image'),
        Permission(name='Delete Image', code_name='delete_image', module_name='Image', module_label='Image Management',
                description='User can delete Image'),


                # ---------- Category ----------
        Permission(name='Create Image Category', code_name='create_image_category', module_name='Image Category', module_label=' Image Category Management',
                description='User can create Image Category'),
        Permission(name='Read Image Category', code_name='read_image_category', module_name='Image Category', module_label='Image Category Management',
                description='User can read Image Category'),
        Permission(name='Update Image Category', code_name='update_image_category', module_name='Image Category', module_label='Image Category Management',
                description='User can update Image Category'),
        Permission(name='Delete Image Category', code_name='delete_image_category', module_name='Image Category', module_label='Image Category Management',
                description='User can delete Image Category'),
                # ---------- Category ----------
        Permission(name='Show Permission', code_name='show_permission', module_name='Permission', module_label='User Permission', description='User can see Permission'),
        Permission(name='Create Permission', code_name='create_permission', module_name='Permission', module_label='User Permission', description='User can create Permission'),
        Permission(name='Read Permission', code_name='read_permission', module_name='Permission', module_label='User Permission', description='User can read Permission'),
        Permission(name='Update Permission', code_name='update_permission', module_name='Permission', module_label='User Permission', description='User can update Permission'),
        Permission(name='Delete Permission', code_name='delete_permission', module_name='Permission', module_label='User Permission', description='User can delete Permission'),

    # Permission Objects for E-commerce Application

        # Product Permissions
        Permission(name='Create Product', code_name='create_product', module_name='Product', module_label='Product Management', description='User can create product'),
        Permission(name='Read Product', code_name='read_product', module_name='Product', module_label='Product Management', description='User can read product'),
        Permission(name='Update Product', code_name='update_product', module_name='Product', module_label='Product Management', description='User can update product'),
        Permission(name='Delete Product', code_name='delete_product', module_name='Product', module_label='Product Management', description='User can delete product'),

        # Color Permissions
        Permission(name='Create Color', code_name='create_color', module_name='Color', module_label='Product Management', description='User can create color'),
        Permission(name='Read Color', code_name='read_color', module_name='Color', module_label='Product Management', description='User can read color'),
        Permission(name='Update Color', code_name='update_color', module_name='Color', module_label='Product Management', description='User can update color'),
        Permission(name='Delete Color', code_name='delete_color', module_name='Color', module_label='Product Management', description='User can delete color'),

        # Product Variant Permissions
        Permission(name='Create Product Variant', code_name='create_productvariant', module_name='Product Variant', module_label='Product Management', description='User can create product variant'),
        Permission(name='Read Product Variant', code_name='read_productvariant', module_name='Product Variant', module_label='Product Management', description='User can read product variant'),
        Permission(name='Update Product Variant', code_name='update_productvariant', module_name='Product Variant', module_label='Product Management', description='User can update product variant'),
        Permission(name='Delete Product Variant', code_name='delete_productvariant', module_name='Product Variant', module_label='Product Management', description='User can delete product variant'),

        # Inventory Permissions
        Permission(name='Create Inventory', code_name='create_inventory', module_name='Inventory', module_label='Product Management', description='User can create inventory'),
        Permission(name='Read Inventory', code_name='read_inventory', module_name='Inventory', module_label='Product Management', description='User can read inventory'),
        Permission(name='Update Inventory', code_name='update_inventory', module_name='Inventory', module_label='Product Management', description='User can update inventory'),
        Permission(name='Delete Inventory', code_name='delete_inventory', module_name='Inventory', module_label='Product Management', description='User can delete inventory'),

        # Sales Product Permissions
        Permission(name='Create Sales Product', code_name='create_sales_product', module_name='Sales Product', module_label='Product Management', description='User can create sales product'),
        Permission(name='Read Sales Product', code_name='read_sales_product', module_name='Sales Product', module_label='Product Management', description='User can read sales product'),
        Permission(name='Update Sales Product', code_name='update_sales_product', module_name='Sales Product', module_label='Product Management', description='User can update sales product'),
        Permission(name='Delete Sales Product', code_name='delete_sales_product', module_name='Sales Product', module_label='Product Management', description='User can delete sales product'),

        # Category Permissions
        Permission(name='Create Category', code_name='create_category', module_name='Category', module_label='Category Management', description='User can create category'),
        Permission(name='Read Category', code_name='read_category', module_name='Category', module_label='Category Management', description='User can read category'),
        Permission(name='Update Category', code_name='update_category', module_name='Category', module_label='Category Management', description='User can update category'),
        Permission(name='Delete Category', code_name='delete_category', module_name='Category', module_label='Category Management', description='User can delete category'),

        # Order Permissions
        Permission(name='Create Order', code_name='create_order', module_name='Order', module_label='Order Management', description='User can create order'),
        Permission(name='Read Order', code_name='read_order', module_name='Order', module_label='Order Management', description='User can read order'),
        Permission(name='Update Order', code_name='update_order', module_name='Order', module_label='Order Management', description='User can update order'),
        Permission(name='Delete Order', code_name='delete_order', module_name='Order', module_label='Order Management', description='User can delete order'),

        # Contact Permissions
        Permission(name='Read Contact', code_name='read_contact', module_name='Contact', module_label='Contact Management', description='User can read contact'),
        Permission(name='Delete Contact', code_name='delete_contact', module_name='Contact', module_label='Contact Management', description='User can delete contact'),

        # Employee Permissions
        Permission(name='Create Employee', code_name='create_employee', module_name='Employee', module_label='Employee Management', description='User can create employee'),
        Permission(name='Read Employee', code_name='read_employee', module_name='Employee', module_label='Employee Management', description='User can read employee'),
        Permission(name='Update Employee', code_name='update_employee', module_name='Employee', module_label='Employee Management', description='User can update employee'),
        Permission(name='Delete Employee', code_name='delete_employee', module_name='Employee', module_label='Employee Management', description='User can delete employee'),

        # Review Permissions
        Permission(name='Create Reviews', code_name='create_reviews', module_name='Reviews', module_label='Review Management', description='User can create reviews'),
        Permission(name='Read Reviews', code_name='read_reviews', module_name='Reviews', module_label='Review Management', description='User can read reviews'),
        Permission(name='Update Reviews', code_name='update_reviews', module_name='Reviews', module_label='Review Management', description='User can update reviews'),
        Permission(name='Delete Reviews', code_name='delete_reviews', module_name='Reviews', module_label='Review Management', description='User can delete reviews'),
]


def add_permission():
    for permission in permissions:
        try:
            Permission.objects.get(code_name=permission.code_name)
        except Permission.DoesNotExist:
            permission.save()


if __name__ == '__main__':
    print("Populating Permissions ...")
    add_permission()