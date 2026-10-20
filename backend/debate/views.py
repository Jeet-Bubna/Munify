from rest_framework import viewsets
from .models import *
from .serializer import *

class CommitteeViewSet(viewsets.ModelViewSet):
    queryset = Committees.objects.all()
    serializer_name = CommitteeSerializer

class MunViewSet(viewsets.ModelViewSet):
    queryset = MUN.objects.all()
    serializer_class = MunSerializer