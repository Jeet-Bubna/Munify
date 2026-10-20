from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(prefix='muns', viewset=MunViewSet, basename='mun')

urlpatterns = [
    path('get/', include(router.urls)),
]
