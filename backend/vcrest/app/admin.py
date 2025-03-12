from django.contrib import admin
from .models import UserProfile, UserSubscription, SubscriptionPlan, Item, Domain, Region, Investor, User
# Register your models here.

admin.site.register(UserProfile)
admin.site.register(UserSubscription)
admin.site.register(SubscriptionPlan)
admin.site.register(Item)
admin.site.register(Domain)
admin.site.register(Region)
admin.site.register(Investor)
admin.site.register(User)
