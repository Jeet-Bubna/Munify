from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer
from .models import *

class CommitteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Committees
        fields = ['name', 'agenda']

class MunSerializer(WritableNestedModelSerializer):
    committees = CommitteeSerializer(source='committees_set', many=True)

    class Meta:
        model = MUN
        fields = ['name','location','date', 'description', 'committees']
