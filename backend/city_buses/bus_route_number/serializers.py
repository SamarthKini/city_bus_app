from rest_framework import serializers
from .models import BusRouteNumberModel

class BusRouteNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusRouteNumberModel
        fields = '__all__'