from django.urls import include, path
from .views import (
    BlogPostView,
    CampaignView,
    CategoryView,
    CommentModerationView,
    CommentView,
    MediaView,
    NewsletterView,
    PublicBlogPostView,
    TagView,
    # Previously defined in views.py but never routed anywhere:
    PublicCommentView,
    PostCommentsView,
    UserCommentsView,
)

urlpatterns = [
    path('v1/category/', CategoryView.as_view()),
    path('v1/tag/', TagView.as_view()),

    path('v1/blog/post/', BlogPostView.as_view()),
    path('v1/public/blog/post/', PublicBlogPostView.as_view()),

    # Comments
    path('v1/comment/', CommentView.as_view()),
    path('v1/public/comment/', PublicCommentView.as_view()),
    path('v1/comment/post/<int:post_id>/', PostCommentsView.as_view()),
    path('v1/comment/user/<str:username>/', UserCommentsView.as_view()),

    # Comment moderation
    path('v1/comment/moderate/', CommentModerationView.as_view()),
    path('v1/comment/moderate/<int:pk>/', CommentModerationView.as_view()),

    # Media / Newsletter / Campaign (unchanged from original)
    path('v1/media/', MediaView.as_view()),
    path('v1/newsletter/', NewsletterView.as_view()),
    path('v1/campaign/', CampaignView.as_view()),
]