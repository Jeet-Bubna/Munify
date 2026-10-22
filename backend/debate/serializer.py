from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
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

class UserSerializer(serializers.ModelSerializer):
    """
    A Serializer for Users
    ### Respond fields
    [name, email, password]    ROLE: role is just CREATOR role.
    """
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'password']

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'password'] 

    # validating password using django's inbuilt validation tools
    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return Users.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    """
    A custom serializer for login
    ### Respond fields
    [username, password_hash]
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)