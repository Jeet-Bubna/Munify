from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(prefix='muns', viewset=MunViewSet, basename='mun')
router.register(prefix='auth', viewset=UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
