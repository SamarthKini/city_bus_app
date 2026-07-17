from django.shortcuts import render
from rest_framework import status, mixins, generics, viewsets
from bus_route_number.models import BusRouteNumberModel
from bus_route_number.serializers import BusRouteNumberSerializer
from route_stops.models import RouteStopModel
from route_stops.serializers import RouteStopSerializer
from stops.models import StopModel
from stops.serializers import StopSerializer
from .serializers import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.shortcuts import get_object_or_404
# from 

class StopViewset(viewsets.ModelViewSet):
    queryset = StopModel.objects.all()
    serializer_class = StopSerializer


class BusRouteNumberViewset(viewsets.ModelViewSet):
    queryset = BusRouteNumberModel.objects.all()
    serializer_class = BusRouteNumberSerializer

class RouteStopViewset(viewsets.ModelViewSet):
    queryset = RouteStopModel.objects.all()
    serializer_class = RouteStopSerializer

class ConnectionRoutesAPIView(APIView): 
    def get(self, request):# Find connection routes between two stops when no direct route exists, i.e basically to find a connection 
        from_stop_id = request.GET.get('from_stop')
        to_stop_id = request.GET.get('to_stop')
        
        if not from_stop_id or not to_stop_id:
            return Response(
                {"error": "Please provide both from_stop and to_stop parameters"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if from_stop_id.isdigit():
                from_stop = StopModel.objects.get(id=from_stop_id)
            else:
                from_stop = StopModel.objects.get(name=from_stop_id)
                
            if to_stop_id.isdigit():
                to_stop = StopModel.objects.get(id=to_stop_id)
            else:
                to_stop = StopModel.objects.get(name=to_stop_id)
        except StopModel.DoesNotExist:
            return Response(
                {"error": "One or both stops not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # check for direct routes
        from_routes = BusRouteNumberModel.objects.filter(
            routestopmodel__stop=from_stop
        ).distinct()
        to_routes = BusRouteNumberModel.objects.filter(
            routestopmodel__stop=to_stop
        ).distinct()
        
        direct_routes = from_routes.filter(id__in=to_routes.values_list('id', flat=True))
        
        if direct_routes.exists():
            direct_serializer = BusRouteNumberSerializer(direct_routes, many=True)
            return Response({
                'direct_routes_available': True,
                'direct_routes': direct_serializer.data,
                'connection_routes': []
            })
        
        connection_routes = self.find_connection_routes(from_stop, to_stop)
        
        return Response({
            'direct_routes_available': False,
            'direct_routes': [],
            'connection_routes': connection_routes
        })
    
        
    def find_connection_routes(self, from_stop, to_stop): # Find routes that can connect from_stop to to_stop with one transfer
        connection_routes = []
        
        from_routes = BusRouteNumberModel.objects.filter(
            routestopmodel__stop=from_stop
        ).distinct()
        
        to_routes = BusRouteNumberModel.objects.filter(
            routestopmodel__stop=to_stop
        ).distinct()
        
        for from_route in from_routes:
            from_route_stops = StopModel.objects.filter(
                routestopmodel__route=from_route
            ).exclude(id=from_stop.id)
            
            for to_route in to_routes:
                if from_route.id == to_route.id:
                    continue  
                    
                common_stops = from_route_stops.filter(
                    routestopmodel__route=to_route
                ).exclude(id=to_stop.id)
                
                for transfer_stop in common_stops:
                    total_stops = (
                        RouteStopModel.objects.filter(
                            route=from_route, 
                            stop=transfer_stop
                        ).first().sequence -
                        RouteStopModel.objects.filter(
                            route=from_route, 
                            stop=from_stop
                        ).first().sequence +
                        RouteStopModel.objects.filter(
                            route=to_route, 
                            stop=to_stop
                        ).first().sequence -
                        RouteStopModel.objects.filter(
                            route=to_route, 
                            stop=transfer_stop
                        ).first().sequence
                    )
                    
                    connection_routes.append({
                        'from_route': from_route,
                        'to_route': to_route,
                        'transfer_stop': transfer_stop,
                        'total_stops': abs(total_stops)
                    })
        
        connection_routes.sort(key=lambda x: x['total_stops'])
        
        serializer = ConnectionRouteSerializer(connection_routes, many=True)
        return serializer.data
    




@api_view(['GET'])
def nearest_stop_on_route(request):
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    route_number = request.query_params.get('route_number')

    if not all([lat, lng, route_number]):
        return Response(
            {'error': 'Missing parameters. Provide lat, lng, and route_number.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        lat = float(lat)
        lng = float(lng)
    except ValueError:
        return Response(
            {'error': 'Invalid lat/lng values. Must be numbers.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    route = get_object_or_404(BusRouteNumberModel, bus_number=route_number)

    user_location = Point(lng, lat, srid=4326)

    route_stop_ids = RouteStopModel.objects.filter(route=route).values_list('stop_id', flat=True)

    nearest_stop = StopModel.objects.filter(
        id__in=route_stop_ids
    ).annotate(
        distance_meters=Distance('location', user_location)  
    ).order_by('distance_meters').first()

    if not nearest_stop:
        return Response(
            {'error': 'No stops found for this route.'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = StopWithDistanceSerializer(nearest_stop)
    return Response(serializer.data)