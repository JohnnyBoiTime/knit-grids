from django.urls import path
from .views import KnittingProjectView, user_projects, csrfTokenView, user_login, register_user

urlpatterns = [
    path('knitTracker/', KnittingProjectView.as_view(), name='knitTracker'),
    path('userProjects/', user_projects, name="userProjects"),
    path('csrf/', csrfTokenView, name="csrfToken"),
    path('register/', register_user, name="userLogin"),
    path('login/', user_login, name="registerUser"),
]