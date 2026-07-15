from django.urls import path
from .views import KnittingProjectView, user_projects, csrfTokenView

urlpatterns = [
    path('knitTracker/', KnittingProjectView.as_view(), name='knitTracker'),
    path('userProjects/', user_projects, name="user-projects"),
    path('csrf/', csrfTokenView, name="csrfToken")
]