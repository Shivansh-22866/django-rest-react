from django.core.management.base import BaseCommand
from faker import Faker
from app.models import Investor, Domain, Region

class Command(BaseCommand):
    help = 'Seed the database with fake investors'

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Create some domains and regions
        domains = ["Tech", "Finance", "Healthcare", "E-commerce", "Education"]
        regions = ["US", "EU", "Asia", "Africa", "Australia"]

        for domain_name in domains:
            Domain.objects.get_or_create(name=domain_name)

        for region_name in regions:
            Region.objects.get_or_create(name=region_name)

        # Generate fake investors
        for _ in range(20):  # Generate 20 investors
            name = fake.company()
            company = fake.company()
            investment_stage = fake.random_element(elements=("SEED", "PRE_SEED", "SERIES_A", "SERIES_B_PLUS"))
            website = fake.url()
            contact_email = fake.email()
            tags = ", ".join(fake.words(nb=3))

            # Create the investor
            investor = Investor.objects.create(
                name=name,
                company=company,
                investment_stage=investment_stage,
                website=website,
                contact_email=contact_email,
                tags=tags
            )

            # Assign random domains and regions
            random_domains = Domain.objects.order_by('?')[:2]  # Assign 2 random domains
            random_regions = Region.objects.order_by('?')[:1]  # Assign 1 random region
            investor.domains.set(random_domains)
            investor.regions.set(random_regions)

            self.stdout.write(self.style.SUCCESS(f"Created investor: {name} ({company})"))