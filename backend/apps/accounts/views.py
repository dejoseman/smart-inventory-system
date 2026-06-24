"""
Views for authentication and user management.
"""

from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserAdminSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user account."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    tokens = get_tokens_for_user(user)
    return Response({
        'success': True,
        'message': 'Account created successfully.',
        'data': {
            'user': UserSerializer(user).data,
            'tokens': tokens,
        },
    }, status=status.HTTP_201_CREATED)


@extend_schema(request=LoginSerializer, responses={200: UserSerializer})
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login with email and password to receive JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        request,
        username=serializer.validated_data['email'],
        password=serializer.validated_data['password'],
    )

    if user is None:
        return Response({
            'success': False,
            'message': 'Invalid email or password.',
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({
            'success': False,
            'message': 'Account has been deactivated.',
        }, status=status.HTTP_403_FORBIDDEN)

    tokens = get_tokens_for_user(user)
    return Response({
        'success': True,
        'message': 'Login successful.',
        'data': {
            'user': UserSerializer(user).data,
            'tokens': tokens,
        },
    })


@extend_schema(responses={200: None})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout by blacklisting the refresh token."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({
            'success': True,
            'message': 'Logged out successfully.',
        })
    except Exception:
        return Response({
            'success': True,
            'message': 'Logged out successfully.',
        })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get or update the current user's profile."""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data,
        })

    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({
        'success': True,
        'message': 'Profile updated successfully.',
        'data': serializer.data,
    })


@extend_schema(request=ChangePasswordSerializer)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change password for the authenticated user."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    if not request.user.check_password(serializer.validated_data['old_password']):
        return Response({
            'success': False,
            'message': 'Current password is incorrect.',
        }, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()
    return Response({
        'success': True,
        'message': 'Password changed successfully.',
    })


@extend_schema(request=PasswordResetRequestSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """Request a password reset email."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        send_mail(
            subject='Password Reset Request',
            message=f'Click the link to reset your password: {reset_url}',
            from_email=settings.EMAIL_HOST_USER or 'noreply@inventory.com',
            recipient_list=[email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass  # Don't reveal whether email exists

    return Response({
        'success': True,
        'message': 'If an account exists with this email, a reset link has been sent.',
    })


@extend_schema(request=PasswordResetConfirmSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """Confirm password reset with token and new password."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            'success': False,
            'message': 'Invalid reset link.',
        }, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, serializer.validated_data['token']):
        return Response({
            'success': False,
            'message': 'Reset link has expired.',
        }, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({
        'success': True,
        'message': 'Password reset successfully.',
    })


class StaffViewSet(viewsets.ModelViewSet):
    """Admin-only viewset for managing staff users."""
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    search_fields = ['full_name', 'email']
    ordering_fields = ['created_at', 'full_name']
    filterset_fields = ['role', 'is_active']

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activate or deactivate a staff member."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'success': True,
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully.',
            'data': UserAdminSerializer(user).data,
        })
