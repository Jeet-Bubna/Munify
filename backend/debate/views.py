from rest_framework.response import Response
from rest_framework import status, viewsets
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
            return Response({
                "message":"An error occured in validation of data. Please ensure data was correct"
            }, status=status.HTTP_400_BAD_REQUEST)