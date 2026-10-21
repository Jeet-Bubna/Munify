from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer
from .models import *

class CommitteeSerializer(serializers.ModelSerializer):
    """
    A Serializer for getting information from the Committees table
    ### Respond fields
    [name, agenda] 
    """
    class Meta:
        model = Committees
        fields = ['id','name', 'agenda']

class MunSerializer(WritableNestedModelSerializer):
    """
    A Nested Serialiser for displaying MUN information and committees
    ### Respond fields
    [name, location, date, description, committees]
    """
    committees = CommitteeSerializer(source='committees_set', many=True)

    class Meta:
        model = MUN
        fields = ['id', 'name','location','date', 'description', 'committees']
