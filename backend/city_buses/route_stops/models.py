from django.db import models
from stops.models import StopModel
from bus_route_number.models import BusRouteNumberModel

class RouteStopModel(models.Model):
    route = models.ForeignKey(BusRouteNumberModel, on_delete=models.CASCADE)
    stop = models.ForeignKey(StopModel, on_delete=models.CASCADE)
    sequence = models.PositiveIntegerField()

    class Meta:
        ordering = ['sequence']
        unique_together = ('route', 'stop')
        unique_together = ('route', 'sequence')    

    def __str__(self):
        return f"{self.route.bus_number} - {self.stop.name} (Seq: {self.sequence})"