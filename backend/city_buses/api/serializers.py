from rest_framework import serializers
from bus_route_number.serializers import BusRouteNumberSerializer
from route_stops.serializers import RouteStopSerializer
from stops.serializers import StopSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

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