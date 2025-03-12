from rest_framework import generics, permissions, status
from django.db.models import Q, F
from django.db import transaction
from .models import Investor, Domain, Region, Item, UserSubscription, SubscriptionPlan, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied, ValidationError
from .serializers import UserRegistrationSerializer, CustomTokenObtainPairSerializer, ItemSerializer, InvestorSerializer, SubscriptionPlanSerializer, UserSubscriptionSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from .pagination import CustomPagination
import logging


logger = logging.getLogger(__name__)

class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class ItemRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class InvestorFilterView(generics.ListAPIView):
    serializer_class = InvestorSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination  # For consistent pagination
    allowed_query_params = ['domain', 'region', 'search', 'stage', 'page']

    def get_queryset(self):
        user = self.request.user
        self._validate_access(user)
        self._validate_query_params()
        
        queryset = Investor.objects.all()
        queryset = self._apply_filters(queryset)
        self._update_usage_count(user)
        
        return queryset

    def _validate_access(self, user):
        """Check if user has valid access rights"""
        # Check subscription expiry first
        if user.profile.subscription_active:
            # Handle None subscription_expiry
            if user.profile.subscription_expiry is None:
                logger.warning(f"User {user.id} has active subscription but no expiry date.")
                user.profile.subscription_active = False
                user.profile.save()
            elif user.profile.subscription_expiry < timezone.now():
                user.profile.subscription_active = False
                user.profile.save()
                logger.info(f"Subscription expired for user {user.id}")

        # Check access eligibility
        if not user.profile.subscription_active:
            if user.free_uses_left <= 0:
                logger.warning(f"Unauthorized access attempt by user {user.id}")
                raise PermissionDenied({
                    'code': 'access_denied',
                    'message': 'Free uses exhausted. Please subscribe to continue.',
                    'upgrade_url': '/api/subscription/plans/'
                })

    def _validate_query_params(self):
        """Validate and sanitize query parameters"""
        invalid_params = set(self.request.query_params) - set(self.allowed_query_params)
        if invalid_params:
            logger.warning(f"Invalid query parameters: {invalid_params}")
            raise ValidationError({
                'code': 'invalid_parameters',
                'message': f"Invalid parameters: {', '.join(invalid_params)}",
                'allowed_parameters': self.allowed_query_params
            })

    def _apply_filters(self, queryset):
        """Apply AND-based filters with input sanitization"""
        params = self.request.query_params
        
        # Multi-value filters (domain and region can have multiple values)
        domains = params.getlist('domain', [])
        regions = params.getlist('region', [])
        
        # Single-value filters
        search_query = params.get('search', '').strip()
        stage = params.get('stage', '').strip().upper()

        # Domain filtering
        if domains:
            queryset = queryset.filter(
                domains__name__iexact=domains[0]
            )
            for domain in domains[1:]:
                queryset = queryset | Investor.objects.filter(domains__name__iexact=domain)

        # Region filtering
        if regions:
            queryset = queryset.filter(
                regions__name__iexact=regions[0]
            )
            for region in regions[1:]:
                queryset = queryset | Investor.objects.filter(regions__name__iexact=region)


        # Investment stage filtering
        if stage:
            valid_stages = [choice[0] for choice in Investor.InvestmentStage.choices]
            if stage not in valid_stages:
                logger.warning(f"Invalid investment stage: {stage}")
                raise ValidationError({
                    'code': 'invalid_stage',
                    'message': f"Invalid investment stage. Valid choices: {', '.join(valid_stages)}"
                })
            queryset = queryset.filter(investment_stage=stage)

        # Search across multiple fields (case-insensitive)
        if search_query:
            search_query = search_query.strip()[:100]  # Limit search length
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(company__icontains=search_query) |
                Q(tags__icontains=search_query)
            ).distinct()

        return queryset

    def _update_usage_count(self, user):
        """Atomically update usage count with race condition protection"""
        if not user.profile.subscription_active:
            updated = User.objects.filter(
                pk=user.pk, free_uses_left__gt=0
            ).update(free_uses_left=F('free_uses_left') - 1)

            if updated:
                logger.info(f"Decremented free uses for user {user.id}")
                user.refresh_from_db()  # Only refresh if the update was successful
            else:
                logger.warning(f"User {user.id} tried to use free query but has none left.")


class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserSubscriptionCreateView(generics.CreateAPIView):
    queryset = UserSubscription.objects.all()
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        with transaction.atomic():
            user = self.request.user
            plan = serializer.validated_data['plan']

            # Deactivate any existing active subscriptions
            UserSubscription.objects.filter(
                user=user,
                is_active=True
            ).update(is_active=False)

            # Calculate end date
            end_date = timezone.now() + timezone.timedelta(days=plan.duration_days)

            # Create new subscription
            subscription = serializer.save(
                user=user,
                end_date=end_date,
                is_active=True
            )

            # Update user profile
            user.profile.subscription_active = True
            user.profile.subscription_expiry = end_date
            user.profile.save()

# views.py
class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        subscription = UserSubscription.objects.filter(
            user=user,
            is_active=True
        ).first()

        return Response({
            "subscription_active": user.profile.subscription_active,
            "subscription_expiry": user.profile.subscription_expiry,
            "free_uses_left": user.free_uses_left,
            "current_subscription": {
                "plan": subscription.plan.id if subscription else None,
                "end_date": subscription.end_date if subscription else None
            } if subscription else None
        })

class UserSubscriptionDetailView(generics.RetrieveAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Get active subscription or return 404
        subscription = UserSubscription.objects.filter(
            user=self.request.user,
            is_active=True
        ).first()
        
        if not subscription:
            raise ValidationError("No active subscription found")
        return subscription