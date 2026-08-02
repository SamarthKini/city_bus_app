from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point

from bus_route_number.models import BusRouteNumberModel
from route_stops.models import RouteStopModel
from stops.models import StopModel


class Command(BaseCommand):
    help = "Seed a minimal test route and stops for /api/nearest-stop/ verification."

    def handle(self, *args, **options):
        route, _ = BusRouteNumberModel.objects.get_or_create(
            bus_number="45",
        )

        stops_to_seed = [
            ("Near You Origin", 12.9245, 74.8472),
            ("Near You Stop B", 12.9272, 74.8480),
            ("Near You Stop C", 12.9299, 74.8488),
            ("Near You Stop D", 12.9326, 74.8496),
            ("Near You Stop E", 12.9353, 74.8504),
            ("Near You Destination", 12.9380, 74.8512),
        ]

        for sequence, (name, latitude, longitude) in enumerate(stops_to_seed, start=1):
            point = Point(longitude, latitude, srid=4326)

            stop, created = StopModel.objects.get_or_create(
                name=name,
                defaults={"location": point},
            )

            if stop.location != point:
                stop.location = point
                stop.save(update_fields=["location"])

            route_stop, created_route_stop = RouteStopModel.objects.get_or_create(
                route=route,
                stop=stop,
                defaults={"sequence": sequence},
            )

            if route_stop.sequence != sequence:
                route_stop.sequence = sequence
                route_stop.save(update_fields=["sequence"])

            self.stdout.write(
                self.style.SUCCESS(
                    f"Seeded stop {sequence}: {name} ({'created' if created else 'exists'})"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete. Route 45 now has {RouteStopModel.objects.filter(route=route).count()} linked stops."
            )
        )
