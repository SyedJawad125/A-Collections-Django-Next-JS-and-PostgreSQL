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

        # ---------- CATEGORY ----------
    Permission(name='Create Category', code_name='create_category', module_name='Category', module_label='Blog Management',
            description='User can create category'),
    Permission(name='Read Category', code_name='read_category', module_name='Category', module_label='Blog Management',
            description='User can read category'),
    Permission(name='Update Category', code_name='update_category', module_name='Category', module_label='Blog Management',
            description='User can update category'),
    Permission(name='Delete Category', code_name='delete_category', module_name='Category', module_label='Blog Management',
            description='User can delete category'),

    # ---------- TAG ----------
    Permission(name='Create Tag', code_name='create_tag', module_name='Tag', module_label='Blog Management',
            description='User can create tag'),
    Permission(name='Read Tag', code_name='read_tag', module_name='Tag', module_label='Blog Management',
            description='User can read tag'),
    Permission(name='Update Tag', code_name='update_tag', module_name='Tag', module_label='Blog Management',
            description='User can update tag'),
    Permission(name='Delete Tag', code_name='delete_tag', module_name='Tag', module_label='Blog Management',
            description='User can delete tag'),

    # ---------- BLOG POST ----------
    Permission(name='Create Blog Post', code_name='create_blog_post', module_name='BlogPost', module_label='Blog Management',
            description='User can create blog post'),
    Permission(name='Read Blog Post', code_name='read_blog_post', module_name='BlogPost', module_label='Blog Management',
            description='User can read blog post'),
    Permission(name='Update Blog Post', code_name='update_blog_post', module_name='BlogPost', module_label='Blog Management',
            description='User can update blog post'),
    Permission(name='Delete Blog Post', code_name='delete_blog_post', module_name='BlogPost', module_label='Blog Management',
            description='User can delete blog post'),

    # ---------- COMMENT ----------
    Permission(name='Create Comment', code_name='create_comment', module_name='Comment', module_label='Blog Management',
            description='User can create comment'),
    Permission(name='Read Comment', code_name='read_comment', module_name='Comment', module_label='Blog Management',
            description='User can read comment'),
    Permission(name='Update Comment', code_name='update_comment', module_name='Comment', module_label='Blog Management',
            description='User can update comment'),
    Permission(name='Delete Comment', code_name='delete_comment', module_name='Comment', module_label='Blog Management',
            description='User can delete comment'),

    # ---------- MEDIA ----------
    Permission(name='Create Media', code_name='create_media', module_name='Media', module_label='Media Library',
            description='User can create media'),
    Permission(name='Read Media', code_name='read_media', module_name='Media', module_label='Media Library',
            description='User can read media'),
    Permission(name='Update Media', code_name='update_media', module_name='Media', module_label='Media Library',
            description='User can update media'),
    Permission(name='Delete Media', code_name='delete_media', module_name='Media', module_label='Media Library',
            description='User can delete media'),

    # ---------- NEWSLETTER ----------
    Permission(name='Create Newsletter', code_name='create_newsletter', module_name='Newsletter', module_label='Campaign Management',
            description='User can create newsletter'),
    Permission(name='Read Newsletter', code_name='read_newsletter', module_name='Newsletter', module_label='Campaign Management',
            description='User can read newsletter'),
    Permission(name='Update Newsletter', code_name='update_newsletter', module_name='Newsletter', module_label='Campaign Management',
            description='User can update newsletter'),
    Permission(name='Delete Newsletter', code_name='delete_newsletter', module_name='Newsletter', module_label='Campaign Management',
            description='User can delete newsletter'),

    # ---------- CAMPAIGN ----------
    Permission(name='Create Campaign', code_name='create_campaign', module_name='Campaign', module_label='Campaign Management',
            description='User can create campaign'),
    Permission(name='Read Campaign', code_name='read_campaign', module_name='Campaign', module_label='Campaign Management',
            description='User can read campaign'),
    Permission(name='Update Campaign', code_name='update_campaign', module_name='Campaign', module_label='Campaign Management',
            description='User can update campaign'),
    Permission(name='Delete Campaign', code_name='delete_campaign', module_name='Campaign', module_label='Campaign Management',
            description='User can delete campaign'),

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
    Permission(name='Create Category', code_name='create_category', module_name='Category', module_label='Category Management',
            description='User can create Category'),
    Permission(name='Read Category', code_name='read_category', module_name='Category', module_label='Category Management',
            description='User can read Category'),
    Permission(name='Update Category', code_name='update_category', module_name='Category', module_label='Category Management',
            description='User can update Category'),
    Permission(name='Delete Category', code_name='delete_category', module_name='Category', module_label='Category Management',
            description='User can delete Category'),

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