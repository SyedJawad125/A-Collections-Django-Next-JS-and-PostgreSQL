# from django.urls import path
# from .views import (LoginView, RefreshView, LogoutView, ForgetPasswordView, VerifyLinkView, ResetPasswordView,
#                     PermissionView, EmployeeView, EmployeeToggleView, RoleView, AccountActivateView)

# urlpatterns = [
#     path('v1/login/', LoginView.as_view()),
#     path('v1/refresh/', RefreshView.as_view()),
#     path('v1/logout/', LogoutView.as_view()),

#     path('v1/forget/password/', ForgetPasswordView.as_view()),
#     path('v1/verify/link/', VerifyLinkView.as_view()),
#     path('v1/reset/password/', ResetPasswordView.as_view()),

#     path('v1/employee/', EmployeeView.as_view()),
#     path('v1/toggle/', EmployeeToggleView.as_view()),

#     path('v1/permission/', PermissionView.as_view()),
#     path('v1/role/', RoleView.as_view()),

#     path('v1/account/activate/', AccountActivateView.as_view()),

# ]







from django.urls import path
from .views import (LoginView, RefreshView, LogoutView, ForgetPasswordView, VerifyLinkView, 
                    ResetPasswordView, VerifyOTPView, PermissionView, EmployeeView, 
                    EmployeeToggleView, RoleView, AccountActivateView, ChangePasswordView)

urlpatterns = [
    # Authentication endpoints
    path('v1/login/', LoginView.as_view(), name='login'),
    path('v1/refresh/', RefreshView.as_view(), name='refresh-token'),
    path('v1/logout/', LogoutView.as_view(), name='logout'),

    # Change Password (for logged-in users)
    path('v1/change/password/', ChangePasswordView.as_view(), name='change-password'),  # Add this line

    # OTP-based Password Reset Flow (New - Recommended)
    path('v1/forget/password/', ForgetPasswordView.as_view(), name='forget-password'),  # Step 1: Request OTP
    path('v1/verify/otp/', VerifyOTPView.as_view(), name='verify-otp'),  # Step 2: Verify OTP
    path('v1/reset/password/', ResetPasswordView.as_view(), name='reset-password'),  # Step 3: Reset Password
    
    # Legacy link-based verification (kept for backward compatibility)
    path('v1/verify/link/', VerifyLinkView.as_view(), name='verify-link'),

    # Employee Management
    path('v1/employee/', EmployeeView.as_view(), name='employee'),
    path('v1/toggle/', EmployeeToggleView.as_view(), name='employee-toggle'),

    # Role & Permission Management
    path('v1/permission/', PermissionView.as_view(), name='permission'),
    path('v1/role/', RoleView.as_view(), name='role'),

    # Account Activation
    path('v1/account/activate/', AccountActivateView.as_view(), name='account-activate'),
]