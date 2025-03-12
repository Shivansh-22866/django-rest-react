# urls.py
from django.urls import path
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    InvestorFilterView,
    SubscriptionPlanListView,
    UserSubscriptionCreateView,
    SubscriptionStatusView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('investors/', InvestorFilterView.as_view(), name='investor-filter'),
    path('subscription/plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('subscription/subscribe/', UserSubscriptionCreateView.as_view(), name='subscribe'),
    path('subscription/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
]