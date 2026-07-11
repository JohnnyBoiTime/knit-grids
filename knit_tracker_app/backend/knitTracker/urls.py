from django.urls import path
from .views import KnittingProjectView

urlpatterns = [
    path('knitTracker/', KnittingProjectView.as_view(), name='knitTracker')
]