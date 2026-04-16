# import random
# import string
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from utils.reusable_functions import (create_response, get_first_error, get_tokens_for_user)
# from rest_framework import status
# from utils.response_messages import *
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from .serializers import (ChangePasswordSerializer, LoginSerializer, LoginUserSerializer, EmptySerializer, LogoutSerializer,
#                           SetPasswordSerializer, PermissionSerializer, EmployeeSerializer,
#                           UserSerializer, RoleSerializer, RoleListingSerializer, VerifyOTPSerializer,
#                           ResetPasswordSimpleSerializer)
# from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
# from config.settings import (SIMPLE_JWT, FRONTEND_BASE_URL, PASSWORD_RESET_VALIDITY, FRONTEND_EMAIL_LINK)
# from .models import UserToken, User
# from django.utils import timezone
# from utils.helpers import generate_token
# from apps.notification.tasks import send_email
# from utils.enums import *
# from django.db import transaction
# from utils.base_api import BaseView
# from collections import defaultdict
# from utils.decorator import permission_required
# from utils.permission_enums import *
# from .filters import (EmployeeFilter, RoleFilter)


# class LoginView(APIView):
#     authentication_classes = ()
#     permission_classes = (AllowAny,)
#     serializer_class = LoginSerializer

#     def post(self, request):
#         try:
#             serialized_data = self.serializer_class(data=request.data, context={'request': request})
#             if serialized_data.is_valid():
#                 user = serialized_data.validated_data['user']
#                 tokens = get_tokens_for_user(user)
#                 resp_data = LoginUserSerializer(user, context={'tokens': tokens}).data
#                 return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)
#             else:
#                 return Response(create_response(get_first_error(serialized_data.errors)),
#                                 status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class RefreshView(APIView):
#     authentication_classes = ()
#     permission_classes = (AllowAny,)
#     serializer_class = EmptySerializer

#     def post(self, request):
#         try:
#             refresh_token = request.data.get('refresh_token')
#             if not refresh_token:
#                 return Response(create_response(REFRESH_TOKEN_NOT_FOUND), status=status.HTTP_401_UNAUTHORIZED)
#             try:
#                 refresh = RefreshToken(refresh_token)
#             except Exception as e:
#                 print(str(e))
#                 return Response(create_response(SESSION_EXPIRED), status=status.HTTP_401_UNAUTHORIZED)
#             new_access_token = AccessToken()
#             new_access_token['user_id'] = refresh['user_id']
#             new_access_token.set_exp(lifetime=SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
#             token_payload = new_access_token.payload
#             resp_data = {
#                 "refresh_token": refresh_token,
#                 "access_token": str(new_access_token)
#             }
#             return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)

#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class LogoutView(APIView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = LogoutSerializer

#     def post(self, request):
#         try:
#             serialized_data = LogoutSerializer(data=request.data, context={'request': request})
#             if serialized_data.is_valid():
#                 request.user.last_login = timezone.now()
#                 request.user.save()
#                 UserToken.objects.filter(user=request.user).update(device_token=None)
#                 return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
#             else:
#                 return Response(create_response(get_first_error(serialized_data.errors)),
#                                 status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ForgetPasswordView(APIView):
#     """
#     Step 1: Request OTP for password reset
#     Endpoint: POST /v1/forget/password/
#     Payload: {"email": "user@example.com"}
#     """
#     authentication_classes = ()
#     permission_classes = (AllowAny,)
#     serializer_class = EmptySerializer

#     def post(self, request):
#         try:
#             email = request.data.get('email')
#             if not email:
#                 return Response(create_response(EMAIL_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            
#             user = User.objects.filter(email=email, deleted=False).first()
#             if not user:
#                 return Response(create_response(INVALID_EMAIL), status=status.HTTP_400_BAD_REQUEST)
            
#             # Generate and send OTP
#             reset_code = self.generate_and_send_otp(user)
            
#             # Return response with OTP (for development/testing only)
#             return Response({
#                 "status": "SUCCESSFUL",
#                 "message": "Password reset code sent to your email",
#                 "email": email,
#                 "code": reset_code,  # Remove this in production
#                 "hint": "Check your email for the 6-digit verification code"
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @staticmethod
#     def generate_and_send_otp(user):
#         """Generate 6-digit OTP and send via email"""
#         # Generate 6-digit numeric code
#         reset_code = ''.join(random.choices(string.digits, k=6))
        
#         # Store code with timestamp
#         user.password_reset_code = reset_code
#         user.password_reset_code_created_at = timezone.now()
#         user.password_reset_verified = False
#         user.password_link_token = None  # Clear any existing reset token
        
#         user.save()
        
#         # Send email with 6-digit code
#         try:
#             send_email.delay(
#                 FORGET_PASSWORD_EMAIL_TEMP,  # Use your existing template constant
#                 [user.email], 
#                 {
#                     "full_name": user.full_name, 
#                     "code": reset_code,
#                     "validity": PASSWORD_RESET_VALIDITY
#                 }
#             )
#         except Exception as e:
#             print(f"Email sending failed: {e}")
#             # Optionally: Send email directly as fallback
#             from django.core.mail import send_mail
#             from django.conf import settings
#             try:
#                 send_mail(
#                     'Password Reset Code',
#                     f'Your password reset code is: {reset_code}\n\nThis code will expire in {PASSWORD_RESET_VALIDITY} minutes.',
#                     settings.DEFAULT_FROM_EMAIL,
#                     [user.email],
#                     fail_silently=False,
#                 )
#             except Exception as email_error:
#                 print(f"Direct email also failed: {email_error}")
        
#         return reset_code


# class VerifyOTPView(APIView):
#     """
#     Step 2: Verify OTP code and get reset token
#     Endpoint: POST /v1/verify/otp/
#     Payload: {"email": "user@example.com", "code": "123456"}
#     Response includes reset_token for use in step 3
#     """
#     authentication_classes = ()
#     permission_classes = (AllowAny,)
#     serializer_class = VerifyOTPSerializer
    
#     def post(self, request):
#         try:
#             serialized_data = self.serializer_class(data=request.data)
#             if not serialized_data.is_valid():
#                 return Response(create_response(get_first_error(serialized_data.errors)),
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             email = serialized_data.validated_data['email']
#             code = serialized_data.validated_data['code']
            
#             user = User.objects.filter(email=email, deleted=False).first()
#             if not user:
#                 return Response(create_response("Invalid email address"), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Check if OTP exists
#             if not user.password_reset_code or not user.password_reset_code_created_at:
#                 return Response(create_response("No OTP found. Please request a new one."), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Check expiration (convert minutes to seconds)
#             expiry_seconds = PASSWORD_RESET_VALIDITY * 60
#             time_diff = timezone.now() - user.password_reset_code_created_at
            
#             if time_diff.total_seconds() > expiry_seconds:
#                 # Clear expired OTP
#                 user.password_reset_code = None
#                 user.password_reset_code_created_at = None
#                 user.save()
#                 return Response(create_response("OTP has expired. Please request a new one."), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Verify OTP code
#             if user.password_reset_code != code:
#                 return Response(create_response("Invalid OTP code"), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Generate temporary reset token
#             token_string = f"{user.id}_{user.email}_{timezone.now().timestamp()}"
#             reset_token = generate_token(token_string)
            
#             # Mark OTP as verified and store reset token
#             user.password_reset_verified = True
#             user.password_link_token = reset_token
#             user.password_link_token_created_at = timezone.now()
#             user.save()
            
#             return Response({
#                 "status": "SUCCESSFUL",
#                 "message": "OTP verified successfully. You can now reset your password.",
#                 "reset_token": reset_token,  # Token to use in step 3
#                 "expires_in_minutes": PASSWORD_RESET_VALIDITY
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), 
#                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # class ResetPasswordView(APIView):
# #     """
# #     Step 3: Reset password using token from OTP verification
# #     Endpoint: POST /v1/reset/password/
# #     Payload: {
# #         "reset_token": "token-from-verify-otp",
# #         "new_password": "NewPassword123!",
# #         "confirm_password": "NewPassword123!"
# #     }
# #     No need to send email or code again!
# #     """
# #     authentication_classes = ()
# #     permission_classes = (AllowAny,)
# #     serializer_class = ResetPasswordSimpleSerializer
    
# #     def post(self, request):
# #         try:
# #             serialized_data = self.serializer_class(data=request.data)
# #             if not serialized_data.is_valid():
# #                 return Response(create_response(get_first_error(serialized_data.errors)),
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             reset_token = serialized_data.validated_data['reset_token']
# #             new_password = serialized_data.validated_data['new_password']
            
# #             # Find user by reset token
# #             user = User.objects.filter(password_link_token=reset_token, deleted=False).first()
            
# #             if not user:
# #                 return Response(create_response("Invalid or expired reset token"), 
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             # Check if OTP was verified
# #             if not user.password_reset_verified:
# #                 return Response(create_response("Please verify OTP first"), 
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             # Check token expiration (same as OTP expiration)
# #             expiry_seconds = PASSWORD_RESET_VALIDITY * 60
# #             time_diff = timezone.now() - user.password_link_token_created_at
            
# #             if time_diff.total_seconds() > expiry_seconds:
# #                 # Clear expired token
# #                 user.password_link_token = None
# #                 user.password_link_token_created_at = None
# #                 user.password_reset_code = None
# #                 user.password_reset_code_created_at = None
# #                 user.password_reset_verified = False
# #                 user.save()
# #                 return Response(create_response("Reset token has expired. Please request a new OTP."), 
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             # Check if new password is same as old password
# #             if user.check_password(new_password):
# #                 return Response(create_response(NEW_PASSWORD_IS_SAME_AS_OLD),
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             # Set new password
# #             user.set_password(new_password)
            
# #             # Clear all reset fields
# #             user.password_reset_code = None
# #             user.password_reset_code_created_at = None
# #             user.password_reset_verified = False
# #             user.password_link_token = None
# #             user.password_link_token_created_at = None
            
# #             # Ensure user is active and unblocked
# #             user.is_active = True
# #             user.is_blocked = False
# #             user.login_attempts = 0
# #             user.last_password_changed = timezone.now()
            
# #             user.save()
            
# #             return Response({
# #                 "status": "SUCCESSFUL",
# #                 "message": "Password reset successfully. You can now login with your new password.",
# #                 "redirect_login": True
# #             }, status=status.HTTP_200_OK)
            
# #         except Exception as e:
# #             print(str(e))
# #             return Response(create_response(str(e)), 
# #                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ResetPasswordView(APIView):
#     """
#     Step 3: Reset password using token from OTP verification
#     Endpoint: POST /v1/reset/password/
#     Payload: {
#         "reset_token": "token-from-verify-otp",
#         "new_password": "NewPassword123!",
#         "confirm_password": "NewPassword123!"
#     }
#     No need to send email or code again!
#     After successful reset, sends confirmation email automatically.
#     """
#     authentication_classes = ()
#     permission_classes = (AllowAny,)
#     serializer_class = ResetPasswordSimpleSerializer
    
#     def post(self, request):
#         try:
#             serialized_data = self.serializer_class(data=request.data)
#             if not serialized_data.is_valid():
#                 return Response(create_response(get_first_error(serialized_data.errors)),
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             reset_token = serialized_data.validated_data['reset_token']
#             new_password = serialized_data.validated_data['new_password']
            
#             # Find user by reset token
#             user = User.objects.filter(password_link_token=reset_token, deleted=False).first()
            
#             if not user:
#                 return Response(create_response("Invalid or expired reset token"), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Check if OTP was verified
#             if not user.password_reset_verified:
#                 return Response(create_response("Please verify OTP first"), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Check token expiration (same as OTP expiration)
#             expiry_seconds = PASSWORD_RESET_VALIDITY * 60
#             time_diff = timezone.now() - user.password_link_token_created_at
            
#             if time_diff.total_seconds() > expiry_seconds:
#                 # Clear expired token
#                 user.password_link_token = None
#                 user.password_link_token_created_at = None
#                 user.password_reset_code = None
#                 user.password_reset_code_created_at = None
#                 user.password_reset_verified = False
#                 user.save()
#                 return Response(create_response("Reset token has expired. Please request a new OTP."), 
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Check if new password is same as old password
#             if user.check_password(new_password):
#                 return Response(create_response(NEW_PASSWORD_IS_SAME_AS_OLD),
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Set new password
#             user.set_password(new_password)
            
#             # Clear all reset fields
#             user.password_reset_code = None
#             user.password_reset_code_created_at = None
#             user.password_reset_verified = False
#             user.password_link_token = None
#             user.password_link_token_created_at = None
            
#             # Ensure user is active and unblocked
#             user.is_active = True
#             user.is_blocked = False
#             user.login_attempts = 0
#             user.last_password_changed = timezone.now()
            
#             user.save()
            
#             # ⭐ Send password changed confirmation email (automatic - user email from backend)
#             self.send_password_changed_email(user, reset_type="Password Reset")
            
#             return Response({
#                 "status": "SUCCESSFUL",
#                 "message": "Password reset successfully. You can now login with your new password.",
#                 "redirect_login": True
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), 
#                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @staticmethod
#     def send_password_changed_email(user, reset_type="Password Reset"):
#         """
#         Send password changed confirmation email
#         Email is automatically sent to user's email from backend - no user input needed
#         """
#         try:
#             send_email.delay(
#                 PASSWORD_CHANGED_EMAIL_TEMP,  # Email template constant
#                 [user.email],  # ⭐ Email automatically taken from user object
#                 {
#                     "full_name": user.full_name,
#                     "email": user.email,
#                     "timestamp": timezone.now().strftime("%B %d, %Y at %I:%M %p"),
#                     "reset_type": reset_type,
#                     "action_type": "password reset via OTP"
#                 }
#             )
#         except Exception as e:
#             print(f"Password changed email sending failed: {e}")
#             # Fallback: Send simple email directly
#             from django.core.mail import send_mail
#             from django.conf import settings
#             try:
#                 send_mail(
#                     'Password Changed Successfully',
#                     f'Hello {user.full_name},\n\nYour password was successfully changed via {reset_type} on {timezone.now().strftime("%B %d, %Y at %I:%M %p")}.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nThe Team',
#                     settings.DEFAULT_FROM_EMAIL,
#                     [user.email],  # ⭐ Email automatically from backend
#                     fail_silently=False,
#                 )
#             except Exception as email_error:
#                 print(f"Direct email also failed: {email_error}")


# class ChangePasswordView(APIView):
#     """
#     Change password for logged-in users
#     Endpoint: POST /v1/change-password/
#     Payload: {
#         "old_password": "CurrentPassword123!",
#         "new_password": "NewPassword123!",
#         "confirm_password": "NewPassword123!"
#     }
#     Authentication required - user must be logged in
#     After successful change, sends confirmation email automatically.
#     """
#     permission_classes = (IsAuthenticated,)
#     serializer_class = ChangePasswordSerializer
    
#     def post(self, request):
#         try:
#             # ⭐ Get user from request (authenticated user - email automatically from backend)
#             user = request.user
            
#             # Serialize and validate data
#             serialized_data = self.serializer_class(data=request.data, context={'request': request})
#             if not serialized_data.is_valid():
#                 return Response(create_response(get_first_error(serialized_data.errors)),
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Get validated data
#             new_password = serialized_data.validated_data['new_password']
            
#             # Check if new password is same as old password (additional check)
#             if user.check_password(new_password):
#                 return Response(create_response(NEW_PASSWORD_IS_SAME_AS_OLD),
#                               status=status.HTTP_400_BAD_REQUEST)
            
#             # Set new password
#             user.set_password(new_password)
            
#             # Update user fields
#             user.last_password_changed = timezone.now()
#             user.login_attempts = 0  # Reset login attempts
#             user.is_blocked = False  # Unblock if blocked
#             user.is_active = True    # Ensure active
            
#             # Clear any reset tokens (security measure)
#             user.password_reset_code = None
#             user.password_reset_code_created_at = None
#             user.password_reset_verified = False
#             user.password_link_token = None
#             user.password_link_token_created_at = None
            
#             user.save()
            
#             # ⭐ Send password changed confirmation email (automatic - user email from backend)
#             self.send_password_changed_email(user, reset_type="Password Change")
            
#             # Return success response
#             return Response({
#                 "status": "SUCCESSFUL",
#                 "message": "Password changed successfully. You can now login with your new password.",
#                 "redirect_login": True
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), 
#                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @staticmethod
#     def send_password_changed_email(user, reset_type="Password Change"):
#         """
#         Send password changed confirmation email
#         Email is automatically sent to user's email from backend - no user input needed
#         """
#         try:
#             send_email.delay(
#                 PASSWORD_CHANGED_EMAIL_TEMP,  # Email template constant
#                 [user.email],  # ⭐ Email automatically taken from user object
#                 {
#                     "full_name": user.full_name,
#                     "email": user.email,
#                     "timestamp": timezone.now().strftime("%B %d, %Y at %I:%M %p"),
#                     "reset_type": reset_type,
#                     "action_type": "manual password change"
#                 }
#             )
#         except Exception as e:
#             print(f"Password changed email sending failed: {e}")
#             # Fallback: Send simple email directly
#             from django.core.mail import send_mail
#             from django.conf import settings
#             try:
#                 send_mail(
#                     'Password Changed Successfully',
#                     f'Hello {user.full_name},\n\nYour password was successfully changed on {timezone.now().strftime("%B %d, %Y at %I:%M %p")}.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nThe Team',
#                     settings.DEFAULT_FROM_EMAIL,
#                     [user.email],  # ⭐ Email automatically from backend
#                     fail_silently=False,
#                 )
#             except Exception as email_error:
#                 print(f"Direct email also failed: {email_error}")



# class VerifyLinkView(APIView):
#     """Legacy link verification - kept for backward compatibility"""
#     authentication_classes = ()
#     permission_classes = (AllowAny,)
#     serializer_class = EmptySerializer

#     def post(self, request):
#         try:
#             if request.data.get('token'):
#                 resp = {
#                     "token": request.data.get('token'),
#                     "redirect_password": False,
#                     "redirect_activate_account": False,
#                 }
#                 user = User.objects.filter(password_link_token=request.data.get('token'), deleted=False).first()
#                 if user:
#                     validate_till = user.password_link_token_created_at + timezone.timedelta(
#                         hours=PASSWORD_RESET_VALIDITY)
#                     if timezone.now() > validate_till:
#                         user.password_link_token = None
#                         user.password_link_token_created_at = None
#                         user.save()
#                         return Response(create_response(LINK_EXPIRED), status=status.HTTP_400_BAD_REQUEST)
#                     else:
#                         resp['redirect_password'] = True
#                 elif not user:
#                     user = User.objects.filter(activation_link_token=request.data.get('token'), deleted=False).first()
#                     if not user:
#                         return Response(create_response(LINK_EXPIRED), status=status.HTTP_400_BAD_REQUEST)
#                     resp['redirect_activate_account'] = True
#                 return Response(create_response(SUCCESSFUL, resp), status=status.HTTP_200_OK)
#             else:
#                 return Response(create_response(TOKEN_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # class ChangePasswordView(APIView):
# #     """
# #     Change password for logged-in users
# #     Endpoint: POST /v1/change-password/
# #     Payload: {
# #         "old_password": "CurrentPassword123!",
# #         "new_password": "NewPassword123!",
# #         "confirm_password": "NewPassword123!"
# #     }
# #     Authentication required
# #     """
# #     permission_classes = (IsAuthenticated,)
# #     serializer_class = ChangePasswordSerializer
    
# #     def post(self, request):
# #         try:
# #             # Get user from request
# #             user = request.user
            
# #             # Serialize and validate data
# #             serialized_data = self.serializer_class(data=request.data, context={'request': request})
# #             if not serialized_data.is_valid():
# #                 return Response(create_response(get_first_error(serialized_data.errors)),
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             # Get validated data
# #             new_password = serialized_data.validated_data['new_password']
            
# #             # Check if new password is same as old password (additional check)
# #             if user.check_password(new_password):
# #                 return Response(create_response(NEW_PASSWORD_IS_SAME_AS_OLD),
# #                               status=status.HTTP_400_BAD_REQUEST)
            
# #             # Set new password
# #             user.set_password(new_password)
            
# #             # Update user fields
# #             user.last_password_changed = timezone.now()
# #             user.login_attempts = 0  # Reset login attempts
# #             user.is_blocked = False  # Unblock if blocked
# #             user.is_active = True    # Ensure active
            
# #             # Clear any reset tokens (security measure)
# #             user.password_reset_code = None
# #             user.password_reset_code_created_at = None
# #             user.password_reset_verified = False
# #             user.password_link_token = None
# #             user.password_link_token_created_at = None
            
# #             user.save()
            
# #             # Send password changed email (same pattern as ForgetPasswordView)
# #             self.send_password_changed_email(user)
            
# #             # Return success response (same pattern as other views)
# #             return Response({
# #                 "status": "SUCCESSFUL",
# #                 "message": "Password changed successfully. You can now login with your new password.",
# #                 "redirect_dashboard": True
# #             }, status=status.HTTP_200_OK)
            
# #         except Exception as e:
# #             print(str(e))
# #             return Response(create_response(str(e)), 
# #                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# #     @staticmethod
# #     def send_password_changed_email(user):
# #         """Send password changed email notification - same pattern as generate_and_send_otp"""
# #         try:
# #             # Send email with password changed notification
# #             send_email.delay(
# #                 PASSWORD_CHANGED_EMAIL_TEMP,  # Use your email template constant
# #                 [user.email], 
# #                 {
# #                     "full_name": user.full_name, 
# #                     "timestamp": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
# #                     "email": user.email,
# #                 }
# #             )
# #         except Exception as e:
# #             print(f"Email sending failed: {e}")
# #             # Optionally: Send email directly as fallback (same as in ForgetPasswordView)
# #             from django.core.mail import send_mail
# #             from django.conf import settings
# #             try:
# #                 send_mail(
# #                     'Password Changed Successfully',
# #                     f'Hello {user.full_name},\n\nYour password was successfully changed on {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nThe Team',
# #                     settings.DEFAULT_FROM_EMAIL,
# #                     [user.email],
# #                     fail_silently=False,
# #                 )
# #             except Exception as email_error:
# #                 print(f"Direct email also failed: {email_error}")

# class EmployeeView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = EmployeeSerializer
#     filterset_class = EmployeeFilter

#     @permission_required([CREATE_USER])
#     def post(self, request):
#         try:
#             resp = super().post_(request)
#             if resp.status_code == status.HTTP_201_CREATED:
#                 self.invitation_email(request, resp.data.get('data'))
#             return resp
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @staticmethod
#     def invitation_email(request, resp_data):
#         token = resp_data.pop('activation_link_token')
#         context = {
#             "full_name": resp_data.get('full_name'),
#             "url": f"{FRONTEND_EMAIL_LINK}/{token}",
#             "sender_name": request.user.full_name,
#         }
#         send_email.delay(USER_INVITATION, [resp_data.get('email')], context)

#     @permission_required([READ_USER])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([DELETE_USER])
#     def delete(self, request):
#         try:
#             if request.query_params.get('id'):
#                 instance = self.serializer_class.Meta.model.objects.filter(deleted=False,
#                                                                            id=request.query_params.get('id',
#                                                                                                        None)).first()
#                 if instance:
#                     with transaction.atomic():
#                         instance.deleted = True
#                         instance.updated_by = request.user
#                         instance.save()
#                         instance.user.delete()
#                         serialized_resp = self.serializer_class(instance, context={'request': request}).data
#                         self.delete_email(request.user, serialized_resp)
#                     return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_200_OK)
#                 else:
#                     return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
#             else:
#                 return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @staticmethod
#     def delete_email(request_user, resp_data):
#         context = {
#             "full_name": resp_data.get('full_name'),
#             "sender_name": request_user.full_name,
#         }
#         send_email.delay(USER_DELETE_EMAIL_TEMP, [resp_data.get('email')], context)


# class EmployeeToggleView(APIView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = EmployeeSerializer
#     filterset_class = None

#     @permission_required([TOGGLE_USER])
#     def delete(self, request):
#         try:
#             if request.query_params.get('id'):
#                 instance = self.serializer_class.Meta.model.objects.filter(deleted=False,
#                                                                            id=request.query_params.get('id',
#                                                                                                        None)).first()
#                 if instance:
#                     with transaction.atomic():
#                         template = USER_RE_ACTIVATED_EMAIL_TEMP
#                         if instance.status == DEACTIVATED and instance.user.password:
#                             instance.status = ACTIVE
#                             instance.user.deactivated = False
#                         elif instance.status == DEACTIVATED and not instance.user.password:
#                             instance.status = INVITED
#                             instance.user.deactivated = False
#                         else:
#                             template = USER_DEACTIVATED_EMAIL_TEMP
#                             instance.status = DEACTIVATED
#                             instance.user.deactivated = True
#                         instance.updated_by = request.user
#                         instance.user.save()
#                         instance.save()
#                     self.notification_email(request.user, instance.user, template)
#                     resp_data = self.serializer_class(instance, context={'request': request}).data
#                     return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)
#                 else:
#                     return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
#             else:
#                 return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @staticmethod
#     def notification_email(request_user, user_instance, template):
#         context = {
#             "full_name": user_instance.full_name,
#             "sender_name": request_user.full_name,
#         }
#         send_email.delay(template, [user_instance.email], context)


# class PermissionView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = PermissionSerializer

#     @permission_required([CREATE_ROLE])
#     def get(self, request):
#         try:
#             permissions = self.serializer_class.Meta.model.objects.all()
#             serialized_data = PermissionSerializer(permissions, many=True).data
#             grouped_data = defaultdict(list)
#             for item in serialized_data:
#                 module_label = item.get("module_label", "Uncategorized")
#                 grouped_data[module_label].append(item)
#             return Response(create_response(SUCCESSFUL, grouped_data, permissions.count()), status=status.HTTP_200_OK)

#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class RoleView(BaseView):
#     permission_classes = (IsAuthenticated,)
#     serializer_class = RoleSerializer
#     filterset_class = RoleFilter
#     list_serializer = RoleListingSerializer

#     @permission_required([CREATE_ROLE])
#     def post(self, request):
#         return super().post_(request)

#     @permission_required([READ_ROLE])
#     def get(self, request):
#         return super().get_(request)

#     @permission_required([UPDATE_ROLE])
#     def patch(self, request):
#         return super().patch_(request)

#     @permission_required([DELETE_ROLE])
#     def delete(self, request):
#         try:
#             if request.query_params.get('id'):
#                 instance = self.serializer_class.Meta.model.objects.filter(deleted=False,
#                                                                            id=request.query_params.get('id',
#                                                                                                        None)).first()
#                 if instance:
#                     if instance.role_users.filter(deleted=False).exists():
#                         return Response(create_response(USERS_ASSOCIATED_WITH_THIS_ROLE), status=status.HTTP_400_BAD_REQUEST)
#                     instance.deleted = True
#                     instance.updated_by = request.user
#                     instance.save()
#                     serialized_resp = self.serializer_class(instance).data
#                     return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_200_OK)
#                 else:
#                     return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
#             else:
#                 return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AccountActivateView(BaseView):
#     permission_classes = (AllowAny,)
#     authentication_classes = ()
#     serializer_class = SetPasswordSerializer

#     def post(self, request):
#         try:
#             serialized_data = self.serializer_class(data=request.data)
#             if serialized_data.is_valid():
#                 instance = User.objects.filter(activation_link_token=request.data.get('token'), deleted=False).first()
#                 if instance:
#                     with transaction.atomic():
#                         instance.set_password(serialized_data.validated_data.get('new_password'))
#                         instance.activation_link_token = None
#                         instance.activation_link_token_created_at = None
#                         instance.is_active = True
#                         instance.is_blocked = False
#                         instance.is_verified = True
#                         instance.user_employee.status = ACTIVE
#                         instance.user_employee.save()
#                         instance.last_password_changed = timezone.now()
#                         instance.save()
#                     return Response(create_response(SUCCESSFUL, {"redirect_login": True}), status=status.HTTP_200_OK)
#                 else:
#                     return Response(create_response(LINK_EXPIRED), status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 return Response(create_response(get_first_error(serialized_data.errors)),
#                                 status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(str(e))
#             return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)



"""
E-commerce Views
Follows the same patterns as apps/users/views.py:
- BaseView for standard CRUD
- permission_required decorator for access control
- create_response / get_first_error for consistent responses
- transaction.atomic() for multi-step operations
- try/except with 500 fallback on every endpoint
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.utils import timezone

from utils.reusable_functions import create_response, get_first_error
from utils.response_messages import SUCCESSFUL, NOT_FOUND, ID_NOT_PROVIDED
from utils.base_api import BaseView
from utils.decorator import permission_required
from utils.permission_enums import *
from apps.notification.tasks import send_email

from .models import (
    Category, ProductTag, Product, ProductImage, Color, ProductVariant,
    Inventory, SalesProduct, ShippingMethod, Coupon,
    Cart, CartItem, Wishlist, WishlistItem, Address,
    Order, OrderDetail, Payment, ReturnRequest,
    Contact, Review,
)
from .serializers import (
    CategorySerializer, CategoryListingSerializer,
    ProductTagSerializer, ColorSerializer,
    ProductSerializer, ProductListingSerializer, ProductImageSerializer,
    ProductVariantSerializer,
    InventorySerializer,
    SalesProductSerializer, SalesProductListingSerializer,
    ShippingMethodSerializer,
    CouponSerializer, ValidateCouponSerializer,
    CartSerializer, CartItemSerializer,
    WishlistSerializer, WishlistItemSerializer,
    AddressSerializer,
    OrderSerializer, OrderListingSerializer, OrderDetailSerializer, CreateOrderFromCartSerializer,
    PaymentSerializer,
    ReturnRequestSerializer,
    ContactSerializer, ReviewSerializer,
)
from .filters import (
    ProductFilter, SalesProductFilter, OrderFilter, ReviewFilter,
    CouponFilter, InventoryFilter, ReturnRequestFilter, CategoryFilter,
)
from apps.notification.tasks import (
    send_order_confirmation_email,
    send_order_status_update_email,
    send_low_stock_alert_email,
    send_return_request_email,
)


# ============================================================================
# CATEGORY
# ============================================================================

class CategoryView(BaseView):
    permission_classes  = (IsAuthenticated,)
    serializer_class    = CategorySerializer
    filterset_class     = CategoryFilter

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


class PublicCategoryView(APIView):
    """Public endpoint - no auth required"""
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def get(self, request):
        try:
            categories = Category.objects.filter(deleted=False)
            data       = CategoryListingSerializer(categories, many=True).data
            return Response(create_response(SUCCESSFUL, data, categories.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# PRODUCT TAG
# ============================================================================

class ProductTagView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductTagSerializer

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# COLOR
# ============================================================================

class ColorView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ColorSerializer

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# PRODUCT
# ============================================================================

class ProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductSerializer
    filterset_class    = ProductFilter
    list_serializer    = ProductListingSerializer

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


class PublicProductView(APIView):
    """Public product listing — no auth required"""
    authentication_classes = ()
    permission_classes     = (AllowAny,)
    filterset_class        = ProductFilter

    def get(self, request):
        try:
            products = Product.objects.filter(deleted=False, is_active=True).order_by('-created_at')
            # Apply filters
            f        = ProductFilter(request.query_params, queryset=products)
            products = f.qs
            data     = ProductListingSerializer(products, many=True).data
            return Response(create_response(SUCCESSFUL, data, products.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductDetailView(APIView):
    """Single product detail — no auth required"""
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def get(self, request):
        try:
            product_id = request.query_params.get('id')
            if not product_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            product = Product.objects.filter(id=product_id, deleted=False, is_active=True).first()
            if not product:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            data = ProductSerializer(product).data
            return Response(create_response(SUCCESSFUL, data), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductImageView(APIView):
    """Manage images for a product"""
    permission_classes = (IsAuthenticated,)

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        try:
            product_id = request.query_params.get('product_id')
            if not product_id:
                return Response(create_response("product_id is required"), status=status.HTTP_400_BAD_REQUEST)
            product = Product.objects.filter(id=product_id, deleted=False).first()
            if not product:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            serializer = ProductImageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(product=product)
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        try:
            image_id = request.query_params.get('id')
            if not image_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            from .models import ProductImage
            image = ProductImage.objects.filter(id=image_id).first()
            if not image:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            image.delete()
            return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# PRODUCT VARIANT
# ============================================================================

class ProductVariantView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ProductVariantSerializer

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


# ============================================================================
# INVENTORY
# ============================================================================

class InventoryView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = InventorySerializer
    filterset_class    = InventoryFilter

    @permission_required([READ_INVENTORY])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_INVENTORY])
    def patch(self, request):
        return super().patch_(request)


class LowStockAlertView(APIView):
    """Returns all inventory items that are low on stock"""
    permission_classes = (IsAuthenticated,)

    @permission_required([READ_INVENTORY])
    def get(self, request):
        try:
            from django.db.models import F
            low_stock = Inventory.objects.filter(
                deleted=False,
                current_stock__lte=F('minimum_stock_level')
            ).select_related('product_variant__product')
            data = InventorySerializer(low_stock, many=True).data
            return Response(create_response(SUCCESSFUL, data, low_stock.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# SALES PRODUCT
# ============================================================================

class SalesProductView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = SalesProductSerializer
    filterset_class    = SalesProductFilter
    list_serializer    = SalesProductListingSerializer

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


class PublicSalesProductView(APIView):
    """Public sales products — no auth required"""
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def get(self, request):
        try:
            products = SalesProduct.objects.filter(deleted=False).order_by('-created_at')
            f        = SalesProductFilter(request.query_params, queryset=products)
            products = f.qs
            data     = SalesProductListingSerializer(products, many=True).data
            return Response(create_response(SUCCESSFUL, data, products.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# SHIPPING METHOD
# ============================================================================

class ShippingMethodView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ShippingMethodSerializer

    @permission_required([CREATE_PRODUCT])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_PRODUCT])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


class PublicShippingMethodView(APIView):
    """Public shipping methods — no auth required"""
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def get(self, request):
        try:
            methods = ShippingMethod.objects.filter(deleted=False, is_active=True)
            data    = ShippingMethodSerializer(methods, many=True).data
            return Response(create_response(SUCCESSFUL, data, methods.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# COUPON
# ============================================================================

class CouponView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = CouponSerializer
    filterset_class    = CouponFilter

    @permission_required([CREATE_COUPON])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_COUPON])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_COUPON])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_COUPON])
    def delete(self, request):
        return super().delete_(request)


class ValidateCouponView(APIView):
    """
    Validates a coupon code against an order amount and returns discount info.
    Public endpoint — customers use this at checkout.
    """
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def post(self, request):
        try:
            serializer = ValidateCouponSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)

            code         = serializer.validated_data['code']
            order_amount = serializer.validated_data['order_amount']

            coupon = Coupon.objects.filter(code__iexact=code, deleted=False, is_active=True).first()
            if not coupon:
                return Response(create_response("Invalid or inactive coupon code"), status=status.HTTP_400_BAD_REQUEST)

            if timezone.now() < coupon.valid_from or timezone.now() > coupon.valid_to:
                return Response(create_response("Coupon is not valid at this time"), status=status.HTTP_400_BAD_REQUEST)

            if coupon.is_exhausted:
                return Response(create_response("Coupon usage limit has been reached"), status=status.HTTP_400_BAD_REQUEST)

            if order_amount < coupon.min_order_amount:
                return Response(
                    create_response(f"Minimum order amount for this coupon is Rs.{coupon.min_order_amount}"),
                    status=status.HTTP_400_BAD_REQUEST
                )

            discount = coupon.calculate_discount(order_amount)
            resp_data = {
                "coupon_code":      coupon.code,
                "discount_type":    coupon.discount_type,
                "discount_value":   str(coupon.discount_value),
                "discount_amount":  str(discount),
                "final_amount":     str(order_amount - discount),
            }
            return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)

        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# ADDRESS
# ============================================================================

class AddressView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            addresses = Address.objects.filter(user=request.user, deleted=False)
            data      = AddressSerializer(addresses, many=True).data
            return Response(create_response(SUCCESSFUL, data, addresses.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = AddressSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        try:
            address_id = request.query_params.get('id')
            if not address_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            address = Address.objects.filter(id=address_id, user=request.user, deleted=False).first()
            if not address:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            serializer = AddressSerializer(address, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_200_OK)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        try:
            address_id = request.query_params.get('id')
            if not address_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            address = Address.objects.filter(id=address_id, user=request.user, deleted=False).first()
            if not address:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            address.deleted = True
            address.save()
            return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# CART
# ============================================================================

class CartView(APIView):
    """
    Get or create the current user's cart.
    GET  → returns cart with all items
    DELETE → clears all items from cart
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            data    = CartSerializer(cart).data
            return Response(create_response(SUCCESSFUL, data), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        """Clear all items from cart"""
        try:
            cart = Cart.objects.filter(user=request.user).first()
            if cart:
                cart.items.all().delete()
            return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CartItemView(APIView):
    """
    Add, update quantity, or remove items from the cart.
    POST   → add item to cart
    PATCH  → update item quantity
    DELETE → remove item from cart
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            data    = request.data.copy()
            data['cart'] = cart.id
            serializer = CartItemSerializer(data=data)
            if serializer.is_valid():
                # Check if same item already exists in cart → increment quantity instead
                existing = cart.items.filter(
                    product_variant=data.get('product_variant'),
                    sales_product=data.get('sales_product'),
                    deleted=False
                ).first()
                if existing:
                    existing.quantity += int(data.get('quantity', 1))
                    existing.save()
                    return Response(create_response(SUCCESSFUL, CartItemSerializer(existing).data), status=status.HTTP_200_OK)
                serializer.save()
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        try:
            item_id = request.query_params.get('id')
            if not item_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            cart = Cart.objects.filter(user=request.user).first()
            if not cart:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            item = cart.items.filter(id=item_id, deleted=False).first()
            if not item:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            new_quantity = request.data.get('quantity')
            if new_quantity is not None:
                if int(new_quantity) <= 0:
                    item.deleted = True
                    item.save()
                    return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
                item.quantity = int(new_quantity)
                item.save()
            return Response(create_response(SUCCESSFUL, CartItemSerializer(item).data), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        try:
            item_id = request.query_params.get('id')
            if not item_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            cart = Cart.objects.filter(user=request.user).first()
            if not cart:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            item = cart.items.filter(id=item_id, deleted=False).first()
            if not item:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            item.deleted = True
            item.save()
            return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# WISHLIST
# ============================================================================

class WishlistView(APIView):
    """Get the current user's wishlist"""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            data        = WishlistSerializer(wishlist).data
            return Response(create_response(SUCCESSFUL, data), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WishlistItemView(APIView):
    """
    Add or remove items from the wishlist.
    POST   → add item to wishlist
    DELETE → remove item from wishlist
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            data        = request.data.copy()
            data['wishlist'] = wishlist.id
            # Prevent duplicates
            existing = wishlist.items.filter(
                product=data.get('product'),
                sales_product=data.get('sales_product'),
                deleted=False
            ).first()
            if existing:
                return Response(create_response("Item already in wishlist"), status=status.HTTP_400_BAD_REQUEST)
            serializer = WishlistItemSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        try:
            item_id = request.query_params.get('id')
            if not item_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            wishlist = Wishlist.objects.filter(user=request.user).first()
            if not wishlist:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            item = wishlist.items.filter(id=item_id, deleted=False).first()
            if not item:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)
            item.deleted = True
            item.save()
            return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# ORDER
# ============================================================================

class OrderView(BaseView):
    """Admin order management"""
    permission_classes = (IsAuthenticated,)
    serializer_class   = OrderSerializer
    filterset_class    = OrderFilter
    list_serializer    = OrderListingSerializer

    @permission_required([READ_ORDER])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_ORDER])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_ORDER])
    def delete(self, request):
        return super().delete_(request)


class PlaceOrderView(APIView):
    """
    Converts the current user's cart into a confirmed order.
    POST → creates Order + OrderDetails + decrements inventory + sends confirmation email.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            serializer = CreateOrderFromCartSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)

            cart = Cart.objects.filter(user=request.user).first()
            if not cart or not cart.items.filter(deleted=False).exists():
                return Response(create_response("Your cart is empty"), status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data

            with transaction.atomic():
                # Resolve delivery address
                delivery_address_text = data.get('delivery_address', '')
                if data.get('address_id'):
                    saved_address = Address.objects.filter(id=data['address_id'], user=request.user, deleted=False).first()
                    if saved_address:
                        delivery_address_text = f"{saved_address.street}, {saved_address.city}, {saved_address.province}"

                # Resolve shipping
                shipping_method = None
                shipping_cost   = 0
                if data.get('shipping_method'):
                    shipping_method = ShippingMethod.objects.filter(id=data['shipping_method'], is_active=True).first()
                    if shipping_method:
                        shipping_cost = shipping_method.cost

                # Resolve coupon
                coupon          = None
                discount_amount = 0
                if data.get('coupon_code'):
                    coupon = Coupon.objects.filter(code__iexact=data['coupon_code'], is_active=True, deleted=False).first()

                # Create order
                order = Order.objects.create(
                    customer        = request.user,
                    customer_name   = data['customer_name'],
                    customer_email  = data['customer_email'],
                    customer_phone  = data['customer_phone'],
                    delivery_address= delivery_address_text,
                    city            = data.get('city', ''),
                    shipping_method = shipping_method,
                    shipping_cost   = shipping_cost,
                    payment_method  = data['payment_method'],
                    coupon          = coupon,
                    status          = 'pending',
                )

                # Create order details from cart items
                subtotal = 0
                for cart_item in cart.items.filter(deleted=False):
                    if cart_item.product_variant:
                        product      = cart_item.product_variant.product
                        unit_price   = cart_item.unit_price
                        sales_product = None
                        # Decrement stock
                        inventory = getattr(cart_item.product_variant, 'inventory', None)
                        if inventory:
                            if inventory.current_stock < cart_item.quantity:
                                raise Exception(f"Insufficient stock for {product.name}")
                            inventory.current_stock -= cart_item.quantity
                            inventory.save()
                            # Send low stock alert if needed
                            if inventory.is_low_stock:
                                try:
                                    send_low_stock_alert_email.delay(inventory.id)
                                except Exception:
                                    pass
                    else:
                        product       = None
                        sales_product = cart_item.sales_product
                        unit_price    = cart_item.unit_price

                    order_detail = OrderDetail.objects.create(
                        order         = order,
                        product       = cart_item.product_variant.product if cart_item.product_variant else None,
                        sales_product = cart_item.sales_product,
                        unit_price    = unit_price,
                        quantity      = cart_item.quantity,
                    )
                    subtotal += order_detail.total_price

                # Apply coupon discount
                if coupon:
                    discount_amount = coupon.calculate_discount(subtotal)
                    coupon.used_count += 1
                    coupon.save()

                # Finalize bill
                order.subtotal        = subtotal
                order.discount_amount = discount_amount
                order.bill            = subtotal + shipping_cost - discount_amount
                order.save()

                # Clear cart
                cart.items.all().delete()

                # Send order confirmation email
                try:
                    send_order_confirmation_email.delay(order.id)
                except Exception:
                    pass

            resp_data = OrderSerializer(order).data
            return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_201_CREATED)

        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomerOrderView(APIView):
    """Customer views their own orders"""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            orders = Order.objects.filter(customer=request.user, deleted=False).order_by('-created_at')
            data   = OrderListingSerializer(orders, many=True).data
            return Response(create_response(SUCCESSFUL, data, orders.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderStatusUpdateView(APIView):
    """Admin updates order status"""
    permission_classes = (IsAuthenticated,)

    @permission_required([UPDATE_ORDER])
    def patch(self, request):
        try:
            order_id = request.query_params.get('id')
            if not order_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)
            order = Order.objects.filter(id=order_id, deleted=False).first()
            if not order:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

            new_status = request.data.get('status')
            if not new_status:
                return Response(create_response("status is required"), status=status.HTTP_400_BAD_REQUEST)

            valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return Response(create_response(f"Invalid status. Choose from: {valid_statuses}"), status=status.HTTP_400_BAD_REQUEST)

            order.status = new_status
            order.save()

            # Send status update email to customer
            try:
                send_order_status_update_email.delay(order.id, new_status)
            except Exception:
                pass

            return Response(create_response(SUCCESSFUL, OrderSerializer(order).data), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# PAYMENT
# ============================================================================

class PaymentView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = PaymentSerializer

    @permission_required([READ_ORDER])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_ORDER])
    def patch(self, request):
        return super().patch_(request)


# ============================================================================
# RETURN REQUEST
# ============================================================================

class ReturnRequestView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ReturnRequestSerializer
    filterset_class    = ReturnRequestFilter

    def post(self, request):
        """Any authenticated customer can create a return request"""
        try:
            serializer = ReturnRequestSerializer(data=request.data)
            if serializer.is_valid():
                instance = serializer.save()
                try:
                    send_return_request_email.delay(instance.id)
                except Exception:
                    pass
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @permission_required([READ_ORDER])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_ORDER])
    def patch(self, request):
        """Admin approves/rejects return requests"""
        return super().patch_(request)


# ============================================================================
# CONTACT
# ============================================================================

class ContactView(APIView):
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def post(self, request):
        try:
            serializer = ContactSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContactListView(APIView):
    """Admin views all contact submissions"""
    permission_classes = (IsAuthenticated,)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        try:
            contacts = Contact.objects.filter(deleted=False).order_by('-created_at')
            data     = ContactSerializer(contacts, many=True).data
            return Response(create_response(SUCCESSFUL, data, contacts.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# REVIEW
# ============================================================================

class ReviewView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = ReviewSerializer
    filterset_class    = ReviewFilter

    def post(self, request):
        """Authenticated user submits a review"""
        try:
            data = request.data.copy()
            data['user'] = request.user.id
            serializer = ReviewSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(create_response(SUCCESSFUL, serializer.data), status=status.HTTP_201_CREATED)
            return Response(create_response(get_first_error(serializer.errors)), status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @permission_required([READ_PRODUCT])
    def get(self, request):
        return super().get_(request)

    @permission_required([DELETE_PRODUCT])
    def delete(self, request):
        return super().delete_(request)


class PublicReviewView(APIView):
    """Public product reviews — no auth required"""
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def get(self, request):
        try:
            product_id       = request.query_params.get('product_id')
            sales_product_id = request.query_params.get('sales_product_id')
            reviews          = Review.objects.filter(deleted=False)
            if product_id:
                reviews = reviews.filter(product__id=product_id)
            elif sales_product_id:
                reviews = reviews.filter(sales_product__id=sales_product_id)
            else:
                return Response(create_response("product_id or sales_product_id is required"), status=status.HTTP_400_BAD_REQUEST)
            data = ReviewSerializer(reviews, many=True).data
            return Response(create_response(SUCCESSFUL, data, reviews.count()), status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)