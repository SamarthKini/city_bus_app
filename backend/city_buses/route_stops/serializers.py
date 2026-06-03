from rest_framework import serializers
from .models import RouteStopModel


class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStopModel
        fields = '__all__'