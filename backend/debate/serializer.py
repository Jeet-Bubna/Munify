from rest_framework import serializers
from .models import *

class CommitteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Committees
        fields = '__all__' 

class MunSerializer(serializers.ModelSerializer):
    class Meta:
        model = MUN
        fields = '__all__'
