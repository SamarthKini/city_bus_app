# from django.db import models
from django.contrib.gis.db import models

class StopModel(models.Model):
    name = models.CharField(max_length=255, unique=True)
    location = models.PointField(srid=4326, null=True, blank=True)

    def __str__(self):
        return self.name