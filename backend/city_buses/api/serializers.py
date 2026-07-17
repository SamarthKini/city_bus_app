from rest_framework import serializers
from bus_route_number.serializers import BusRouteNumberSerializer
from route_stops.serializers import RouteStopSerializer
from stops.serializers import StopSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from stops.models import StopModel

class ConnectionRouteSerializer(serializers.Serializer):
    from_route = BusRouteNumberSerializer()
    to_route = BusRouteNumberSerializer()
    transfer_stop = StopSerializer()
    total_stops = serializers.IntegerField()
    
    def to_representation(self, instance):
        return {
            'from_route': BusRouteNumberSerializer(instance['from_route']).data,
            'to_route': BusRouteNumberSerializer(instance['to_route']).data,
            'transfer_stop': StopSerializer(instance['transfer_stop']).data,
            'total_stops': instance['total_stops']
        }
    

class StopWithDistanceSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    distance_meters = serializers.SerializerMethodField()

    class Meta:
        model = StopModel
        fields = ['id', 'name', 'latitude', 'longitude', 'distance_meters']

    def get_latitude(self, obj):
        return obj.location.y if obj.location else None

    def get_longitude(self, obj):
        return obj.location.x if obj.location else None

    def get_distance_meters(self, obj):
        if hasattr(obj, 'distance_meters') and obj.distance_meters is not None:
            return round(obj.distance_meters.m, 2)
        return None