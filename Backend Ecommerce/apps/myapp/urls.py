from django.urls import include, path
from .views import BlogPostView, CampaignView, CategoryView, CommentModerationView, CommentView, MediaView, NewsletterView, PublicBlogPostView, TagView 

urlpatterns = [
        path('v1/category/', CategoryView.as_view()),
        path('v1/tag/', TagView.as_view()),
        path('v1/blog/post/', BlogPostView.as_view()),
        path('v1/public/blog/post/', PublicBlogPostView.as_view()),
        path('v1/comment/', CommentView.as_view()),
        path('v1/media/', MediaView.as_view()),
        path('v1/newsletter/', NewsletterView.as_view()),
        path('v1/campaign/', CampaignView.as_view()),
        path('ckeditor5/', include('django_ckeditor_5.urls')),

        # Comment moderation
        path('v1/comment/moderate/', CommentModerationView.as_view()),
        path('v1/comment/moderate/<int:pk>/', CommentModerationView.as_view()),
]
