from django.urls import include, path
from .views import ImagesView, PublicImagesView, TextBoxImagesView, CategoriesView, TextCategoriesView, CategoryDropdownView

urlpatterns = [
    path('v1/images/', ImagesView.as_view()),
    path('v1/public/images/', PublicImagesView.as_view()),
    path('v1/textbox/images/', TextBoxImagesView.as_view()),
    path('v1/categories/', CategoriesView.as_view()),
    path('v1/text/categories/', TextCategoriesView.as_view()),
    path('v1/dropdown/categories/', CategoryDropdownView.as_view()),
    path('ckeditor5/', include('django_ckeditor_5.urls')),
]