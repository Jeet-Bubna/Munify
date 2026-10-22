from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import *
from .serializer import *

class MunViewSet(viewsets.ModelViewSet):
    queryset = MUN.objects.all()
    serializer_class = MunSerializer

    def create(self, request, format=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer=serializer)
            return Response(
                serializer.data
            , status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'], permission_classes=[])
    def signup(self, request):
        serializer = SignupSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            # Generate a token immediately upon registration
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                "token": token.key,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes = [])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data['username'] # type: ignore
            password = serializer.validated_data['password'] # type: ignore

            # authenticate 
            user = authenticate(request, username=username, password = password)

            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    "token":token.key,
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
