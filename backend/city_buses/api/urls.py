from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.response import Response
from rest_framework.views import APIView


router = DefaultRouter()
router.register('stops', views.StopViewset, basename='stop')
router.register('bus_routes', views.BusRouteNumberViewset, basename='bus_route')
router.register('route_stops', views.RouteStopViewset, basename='route_stop')
# those above 3 apis are for crud operations in regards to the stops, individaul stops, and bus routes


urlpatterns = [
    path('', include(router.urls)),
    path('connections/', views.ConnectionRoutesAPIView.as_view(), name='connection-routes'),#will give you the connections

]
