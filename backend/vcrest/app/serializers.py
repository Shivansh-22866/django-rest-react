from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Item, User, Domain, Region, Investor, UserProfile, SubscriptionPlan, UserSubscription

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.get_or_create(user=user)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['free_uses_left'] = user.free_uses_left
        token['subscription_active'] = user.profile.subscription_active
        return token

# serializers.py
class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ('id', 'name')

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('id', 'name')

class InvestorSerializer(serializers.ModelSerializer):
    domains = DomainSerializer(many=True)
    regions = RegionSerializer(many=True)

    class Meta:
        model = Investor
        fields = '__all__'

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class UserSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSubscription
        fields = ('plan',)
