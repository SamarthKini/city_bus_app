from django.db import models
from stops.models import StopModel

class BusRouteNumberModel(models.Model):
    bus_number = models.CharField(max_length=5, unique=True)
    stops = models.ManyToManyField(StopModel, through='route_stops.RouteStopModel')

    def __str__(self):
        return self.bus_number
