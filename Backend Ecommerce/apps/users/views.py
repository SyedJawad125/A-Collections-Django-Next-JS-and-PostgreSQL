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



import random
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from utils.reusable_functions import (create_response, get_first_error, get_tokens_for_user)
from rest_framework import status
from utils.response_messages import *
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (
    ChangePasswordSerializer, LoginSerializer, LoginUserSerializer, EmptySerializer,
    LogoutSerializer, SetPasswordSerializer, PermissionSerializer, EmployeeSerializer,
    UserSerializer, RoleSerializer, RoleListingSerializer, VerifyOTPSerializer,
    ResetPasswordSimpleSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from config.settings import (SIMPLE_JWT, FRONTEND_BASE_URL, PASSWORD_RESET_VALIDITY, FRONTEND_EMAIL_LINK)
from .models import UserToken, User
from django.utils import timezone
from utils.helpers import generate_token
from apps.notification.tasks import send_email
from utils.enums import *
from django.db import transaction
from utils.base_api import BaseView
from collections import defaultdict
from utils.decorator import permission_required
from utils.permission_enums import *
from .filters import EmployeeFilter, RoleFilter


# ─────────────────────────────────────────────
# Auth Views
# ─────────────────────────────────────────────

class LoginView(APIView):
    authentication_classes = ()
    permission_classes     = (AllowAny,)
    serializer_class       = LoginSerializer

    def post(self, request):
        try:
            serialized_data = self.serializer_class(data=request.data, context={'request': request})
            if serialized_data.is_valid():
                user   = serialized_data.validated_data['user']
                tokens = get_tokens_for_user(user)
                resp_data = LoginUserSerializer(user, context={'tokens': tokens}).data
                return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)
            return Response(
                create_response(get_first_error(serialized_data.errors)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RefreshView(APIView):
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(create_response(REFRESH_TOKEN_NOT_FOUND), status=status.HTTP_401_UNAUTHORIZED)
            try:
                refresh = RefreshToken(refresh_token)
            except Exception as e:
                return Response(create_response(SESSION_EXPIRED), status=status.HTTP_401_UNAUTHORIZED)

            new_access_token = AccessToken()
            new_access_token['user_id'] = refresh['user_id']
            new_access_token.set_exp(lifetime=SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
            resp_data = {
                "refresh_token": refresh_token,
                "access_token":  str(new_access_token),
            }
            return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            serialized_data = LogoutSerializer(data=request.data, context={'request': request})
            if serialized_data.is_valid():
                request.user.last_login = timezone.now()
                request.user.save()
                UserToken.objects.filter(user=request.user).update(device_token=None)
                return Response(create_response(SUCCESSFUL), status=status.HTTP_200_OK)
            return Response(
                create_response(get_first_error(serialized_data.errors)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# OTP-Based Password Reset Flow
# ─────────────────────────────────────────────

class ForgetPasswordView(APIView):
    """
    Step 1 — Request a 6-digit OTP sent to the user's email.
    POST /v1/forget/password/
    Body: { "email": "user@example.com" }
    """
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def post(self, request):
        try:
            email = request.data.get('email')
            if not email:
                return Response(create_response(EMAIL_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email=email, deleted=False).first()
            if not user:
                # Return generic message to avoid user enumeration
                return Response(create_response(
                    "If this email is registered, a reset code has been sent."
                ), status=status.HTTP_200_OK)

            reset_code = self._generate_and_send_otp(user)

            # ⚠️  Remove `code` from response in production
            return Response({
                "status":  "SUCCESSFUL",
                "message": "Password reset code sent to your email.",
                "email":   email,
                "code":    reset_code,   # TODO: remove in production
                "hint":    "Check your email for the 6-digit verification code.",
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _generate_and_send_otp(user):
        reset_code = ''.join(random.choices(string.digits, k=6))
        user.password_reset_code            = reset_code
        user.password_reset_code_created_at = timezone.now()
        user.password_reset_verified        = False
        user.password_link_token            = None
        user.password_link_token_created_at = None
        user.save(update_fields=[
            'password_reset_code', 'password_reset_code_created_at',
            'password_reset_verified', 'password_link_token', 'password_link_token_created_at',
        ])
        try:
            send_email.delay(
                FORGET_PASSWORD_EMAIL_TEMP,
                [user.email],
                {"full_name": user.full_name, "code": reset_code, "validity": PASSWORD_RESET_VALIDITY},
            )
        except Exception as e:
            print(f"OTP email failed: {e}")
        return reset_code


class VerifyOTPView(APIView):
    """
    Step 2 — Verify the OTP code; receive a reset_token for step 3.
    POST /v1/verify/otp/
    Body: { "email": "user@example.com", "code": "123456" }
    """
    authentication_classes = ()
    permission_classes     = (AllowAny,)
    serializer_class       = VerifyOTPSerializer

    def post(self, request):
        try:
            serialized_data = self.serializer_class(data=request.data)
            if not serialized_data.is_valid():
                return Response(
                    create_response(get_first_error(serialized_data.errors)),
                    status=status.HTTP_400_BAD_REQUEST,
                )

            email = serialized_data.validated_data['email']
            code  = serialized_data.validated_data['code']

            user = User.objects.filter(email=email, deleted=False).first()
            if not user:
                return Response(create_response("Invalid email address."), status=status.HTTP_400_BAD_REQUEST)

            if not user.password_reset_code or not user.password_reset_code_created_at:
                return Response(create_response("No OTP found. Please request a new one."),
                                status=status.HTTP_400_BAD_REQUEST)

            # Check expiry
            elapsed = (timezone.now() - user.password_reset_code_created_at).total_seconds()
            if elapsed > PASSWORD_RESET_VALIDITY * 60:
                user.password_reset_code            = None
                user.password_reset_code_created_at = None
                user.save(update_fields=['password_reset_code', 'password_reset_code_created_at'])
                return Response(create_response("OTP has expired. Please request a new one."),
                                status=status.HTTP_400_BAD_REQUEST)

            if user.password_reset_code != code:
                return Response(create_response("Invalid OTP code."), status=status.HTTP_400_BAD_REQUEST)

            # Issue a short-lived reset token
            reset_token = generate_token(f"{user.id}_{user.email}_{timezone.now().timestamp()}")
            user.password_reset_verified        = True
            user.password_link_token            = reset_token
            user.password_link_token_created_at = timezone.now()
            user.save(update_fields=[
                'password_reset_verified', 'password_link_token', 'password_link_token_created_at',
            ])

            return Response({
                "status":           "SUCCESSFUL",
                "message":          "OTP verified. You can now reset your password.",
                "reset_token":      reset_token,
                "expires_in_minutes": PASSWORD_RESET_VALIDITY,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """
    Step 3 — Set a new password using the reset_token from step 2.
    POST /v1/reset/password/
    Body: { "reset_token": "...", "new_password": "...", "confirm_password": "..." }
    """
    authentication_classes = ()
    permission_classes     = (AllowAny,)
    serializer_class       = ResetPasswordSimpleSerializer

    def post(self, request):
        try:
            serialized_data = self.serializer_class(data=request.data)
            if not serialized_data.is_valid():
                return Response(
                    create_response(get_first_error(serialized_data.errors)),
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reset_token  = serialized_data.validated_data['reset_token']
            new_password = serialized_data.validated_data['new_password']

            user = User.objects.filter(password_link_token=reset_token, deleted=False).first()
            if not user:
                return Response(create_response("Invalid or expired reset token."),
                                status=status.HTTP_400_BAD_REQUEST)

            if not user.password_reset_verified:
                return Response(create_response("Please verify OTP first."),
                                status=status.HTTP_400_BAD_REQUEST)

            elapsed = (timezone.now() - user.password_link_token_created_at).total_seconds()
            if elapsed > PASSWORD_RESET_VALIDITY * 60:
                self._clear_reset_fields(user)
                return Response(create_response("Reset token has expired. Please request a new OTP."),
                                status=status.HTTP_400_BAD_REQUEST)

            if user.check_password(new_password):
                return Response(create_response(NEW_PASSWORD_IS_SAME_AS_OLD),
                                status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            self._clear_reset_fields(user)
            user.is_active             = True
            user.is_blocked            = False
            user.login_attempts        = 0
            user.last_password_changed = timezone.now()
            user.save()

            self._send_password_changed_email(user, reset_type="Password Reset")

            return Response({
                "status":        "SUCCESSFUL",
                "message":       "Password reset successfully. You can now log in.",
                "redirect_login": True,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _clear_reset_fields(user):
        user.password_reset_code            = None
        user.password_reset_code_created_at = None
        user.password_reset_verified        = False
        user.password_link_token            = None
        user.password_link_token_created_at = None

    @staticmethod
    def _send_password_changed_email(user, reset_type="Password Reset"):
        try:
            send_email.delay(
                PASSWORD_CHANGED_EMAIL_TEMP,
                [user.email],
                {
                    "full_name":  user.full_name,
                    "email":      user.email,
                    "timestamp":  timezone.now().strftime("%B %d, %Y at %I:%M %p"),
                    "reset_type": reset_type,
                },
            )
        except Exception as e:
            print(f"Password-changed email failed: {e}")


# ─────────────────────────────────────────────
# Change Password (authenticated)
# ─────────────────────────────────────────────

class ChangePasswordView(APIView):
    """
    Change password for a logged-in user.
    POST /v1/change/password/
    Body: { "old_password": "...", "new_password": "...", "confirm_password": "..." }
    """
    permission_classes = (IsAuthenticated,)
    serializer_class   = ChangePasswordSerializer

    def post(self, request):
        try:
            user = request.user
            serialized_data = self.serializer_class(data=request.data, context={'request': request})
            if not serialized_data.is_valid():
                return Response(
                    create_response(get_first_error(serialized_data.errors)),
                    status=status.HTTP_400_BAD_REQUEST,
                )

            new_password = serialized_data.validated_data['new_password']
            if user.check_password(new_password):
                return Response(create_response(NEW_PASSWORD_IS_SAME_AS_OLD),
                                status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.last_password_changed        = timezone.now()
            user.login_attempts               = 0
            user.is_blocked                   = False
            user.is_active                    = True
            user.password_reset_code          = None
            user.password_reset_code_created_at = None
            user.password_reset_verified      = False
            user.password_link_token          = None
            user.password_link_token_created_at = None
            user.save()

            self._send_password_changed_email(user)

            return Response({
                "status":           "SUCCESSFUL",
                "message":          "Password changed successfully.",
                "redirect_login":   True,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _send_password_changed_email(user):
        try:
            send_email.delay(
                PASSWORD_CHANGED_EMAIL_TEMP,
                [user.email],
                {
                    "full_name":  user.full_name,
                    "email":      user.email,
                    "timestamp":  timezone.now().strftime("%B %d, %Y at %I:%M %p"),
                    "reset_type": "Password Change",
                },
            )
        except Exception as e:
            print(f"Password-changed email failed: {e}")


# ─────────────────────────────────────────────
# Account Activation (OTP-based)
# ─────────────────────────────────────────────

class AccountActivateView(BaseView):
    """
    Activate employee account using the OTP sent in the invitation email.
    POST /v1/account/activate/
    Body: { "email": "...", "otp": "123456", "new_password": "...", "confirm_password": "..." }
    """
    permission_classes     = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            email    = request.data.get('email')
            otp      = request.data.get('otp')
            password = request.data.get('new_password')
            confirm  = request.data.get('confirm_password')

            if not all([email, otp, password, confirm]):
                return Response(create_response("email, otp, new_password and confirm_password are required."),
                                status=status.HTTP_400_BAD_REQUEST)

            if password != confirm:
                return Response(create_response(PASSWORD_DOES_NOT_MATCH),
                                status=status.HTTP_400_BAD_REQUEST)

            from .utils import validate_password
            from config.settings import PASSWORD_MIN_LENGTH
            if len(password) < PASSWORD_MIN_LENGTH:
                return Response(create_response(PasswordMustBeEightChar),
                                status=status.HTTP_400_BAD_REQUEST)
            if not validate_password(password):
                return Response(create_response(FOLLOW_PASSWORD_PATTERN),
                                status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email=email, deleted=False).first()
            if not user:
                return Response(create_response("Invalid email."), status=status.HTTP_400_BAD_REQUEST)

            if not user.activation_otp or not user.activation_otp_created_at:
                return Response(create_response("No activation OTP found. Please contact support."),
                                status=status.HTTP_400_BAD_REQUEST)

            elapsed = (timezone.now() - user.activation_otp_created_at).total_seconds()
            if elapsed > PASSWORD_RESET_VALIDITY * 60:
                return Response(create_response("Activation OTP has expired. Please contact support."),
                                status=status.HTTP_400_BAD_REQUEST)

            if user.activation_otp != otp:
                return Response(create_response("Invalid activation OTP."),
                                status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                user.set_password(password)
                user.activation_otp            = None
                user.activation_otp_created_at = None
                user.is_active                 = True
                user.is_blocked                = False
                user.is_verified               = True
                user.last_password_changed     = timezone.now()
                user.save()

                if hasattr(user, 'user_employee'):
                    user.user_employee.status = ACTIVE
                    user.user_employee.save()

            return Response(create_response(SUCCESSFUL, {"redirect_login": True}),
                            status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# Legacy Link Verification (backward compat)
# ─────────────────────────────────────────────

class VerifyLinkView(APIView):
    """Kept for backward compatibility with old email-link flow."""
    authentication_classes = ()
    permission_classes     = (AllowAny,)

    def post(self, request):
        try:
            token = request.data.get('token')
            if not token:
                return Response(create_response(TOKEN_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            resp = {"token": token, "redirect_password": False, "redirect_activate_account": False}
            user = User.objects.filter(password_link_token=token, deleted=False).first()
            if user:
                validate_till = user.password_link_token_created_at + timezone.timedelta(hours=PASSWORD_RESET_VALIDITY)
                if timezone.now() > validate_till:
                    user.password_link_token            = None
                    user.password_link_token_created_at = None
                    user.save(update_fields=['password_link_token', 'password_link_token_created_at'])
                    return Response(create_response(LINK_EXPIRED), status=status.HTTP_400_BAD_REQUEST)
                resp['redirect_password'] = True
            else:
                # Check activation OTP token (if old token-based flow used)
                if not user:
                    return Response(create_response(LINK_EXPIRED), status=status.HTTP_400_BAD_REQUEST)
                resp['redirect_activate_account'] = True

            return Response(create_response(SUCCESSFUL, resp), status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────
# Employee Management
# ─────────────────────────────────────────────

class EmployeeView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = EmployeeSerializer
    filterset_class    = EmployeeFilter

    @permission_required([CREATE_USER])
    def post(self, request):
        try:
            resp = super().post_(request)
            if resp.status_code == status.HTTP_201_CREATED:
                self._invitation_email(request, resp.data.get('data'))
            return resp
        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _invitation_email(request, resp_data):
        otp = resp_data.pop('activation_otp', None)
        context = {
            "full_name":   resp_data.get('full_name'),
            "otp":         otp,                        # OTP in email instead of link
            "sender_name": request.user.full_name,
            "validity":    PASSWORD_RESET_VALIDITY,
        }
        send_email.delay(USER_INVITATION, [resp_data.get('email')], context)

    @permission_required([READ_USER])
    def get(self, request):
        return super().get_(request)

    @permission_required([DELETE_USER])
    def delete(self, request):
        try:
            emp_id = request.query_params.get('id')
            if not emp_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            instance = self.serializer_class.Meta.model.objects.filter(deleted=False, id=emp_id).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                instance.deleted    = True
                instance.updated_by = request.user
                instance.save()
                instance.user.delete()
                serialized_resp = self.serializer_class(instance, context={'request': request}).data
                self._delete_email(request.user, serialized_resp)
            return Response(create_response(SUCCESSFUL, serialized_resp), status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _delete_email(request_user, resp_data):
        context = {
            "full_name":   resp_data.get('full_name'),
            "sender_name": request_user.full_name,
        }
        send_email.delay(USER_DELETE_EMAIL_TEMP, [resp_data.get('email')], context)


class EmployeeToggleView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = EmployeeSerializer

    @permission_required([TOGGLE_USER])
    def delete(self, request):
        try:
            emp_id = request.query_params.get('id')
            if not emp_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            instance = self.serializer_class.Meta.model.objects.filter(deleted=False, id=emp_id).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                template = USER_RE_ACTIVATED_EMAIL_TEMP
                if instance.status == DEACTIVATED and instance.user.password:
                    instance.status        = ACTIVE
                    instance.user.is_active = True
                elif instance.status == DEACTIVATED and not instance.user.password:
                    instance.status        = INVITED
                    instance.user.is_active = True
                else:
                    template               = USER_DEACTIVATED_EMAIL_TEMP
                    instance.status        = DEACTIVATED
                    instance.user.is_active = False   # ✅ Use is_active, not deactivated flag

                instance.updated_by = request.user
                instance.user.save()
                instance.save()

            self._notification_email(request.user, instance.user, template)
            resp_data = self.serializer_class(instance, context={'request': request}).data
            return Response(create_response(SUCCESSFUL, resp_data), status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def _notification_email(request_user, user_instance, template):
        context = {
            "full_name":   user_instance.full_name,
            "sender_name": request_user.full_name,
        }
        send_email.delay(template, [user_instance.email], context)


# ─────────────────────────────────────────────
# Role & Permission Views
# ─────────────────────────────────────────────

class PermissionView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = PermissionSerializer

    @permission_required([CREATE_ROLE])
    def get(self, request):
        try:
            permissions   = self.serializer_class.Meta.model.objects.all()
            serialized    = PermissionSerializer(permissions, many=True).data
            grouped_data  = defaultdict(list)
            for item in serialized:
                grouped_data[item.get("module_label", "Uncategorized")].append(item)
            return Response(create_response(SUCCESSFUL, grouped_data, permissions.count()),
                            status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RoleView(BaseView):
    permission_classes = (IsAuthenticated,)
    serializer_class   = RoleSerializer
    filterset_class    = RoleFilter
    list_serializer    = RoleListingSerializer

    @permission_required([CREATE_ROLE])
    def post(self, request):
        return super().post_(request)

    @permission_required([READ_ROLE])
    def get(self, request):
        return super().get_(request)

    @permission_required([UPDATE_ROLE])
    def patch(self, request):
        return super().patch_(request)

    @permission_required([DELETE_ROLE])
    def delete(self, request):
        try:
            role_id = request.query_params.get('id')
            if not role_id:
                return Response(create_response(ID_NOT_PROVIDED), status=status.HTTP_400_BAD_REQUEST)

            instance = self.serializer_class.Meta.model.objects.filter(deleted=False, id=role_id).first()
            if not instance:
                return Response(create_response(NOT_FOUND), status=status.HTTP_404_NOT_FOUND)

            if instance.role_users.filter(deleted=False).exists():
                return Response(create_response(USERS_ASSOCIATED_WITH_THIS_ROLE),
                                status=status.HTTP_400_BAD_REQUEST)

            instance.deleted    = True
            instance.updated_by = request.user
            instance.save()
            return Response(create_response(SUCCESSFUL, self.serializer_class(instance).data),
                            status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return Response(create_response(str(e)), status=status.HTTP_500_INTERNAL_SERVER_ERROR)