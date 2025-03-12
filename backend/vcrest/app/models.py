from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    free_uses_left = models.PositiveIntegerField(default=3)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    subscription_active = models.BooleanField(default=False)
    subscription_expiry = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.subscription_active and self.subscription_expiry is None:
            raise ValidationError("Active subscriptions must have an expiry date.")

class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Investor(models.Model):
    class InvestmentStage(models.TextChoices):
        SEED = 'SEED', _('Seed')
        PRE_SEED = 'PRE_SEED', _('Pre-Seed')
        SERIES_A = 'SERIES_A', _('Series A')
        SERIES_B_PLUS = 'SERIES_B_PLUS', _('Series B+')

    name = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    domains = models.ManyToManyField(Domain, related_name='investors')
    regions = models.ManyToManyField(Region, related_name='investors')
    investment_stage = models.CharField(max_length=20, choices=InvestmentStage.choices)
    website = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    tags = models.TextField(blank=True)  # Comma-separated tags (e.g., "AI, Fintech")
    created_at = models.DateTimeField(auto_now_add=True)

# models.py
class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Basic", "Pro"
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration_days = models.PositiveIntegerField()  # e.g., 30 days
    features = models.TextField()  # Comma-separated features

class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(is_active=True),
                name='unique_active_subscription'
            )
        ]