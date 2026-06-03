from rest_framework import serializers
from .models import StopModel

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = StopModel
        fields = '__all__'
    