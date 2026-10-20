from rest_framework import viewsets
from .models import *
from .serializer import *

class MunViewSet(viewsets.ModelViewSet):
    queryset = MUN.objects.all()
    serializer_class = MunSerializer