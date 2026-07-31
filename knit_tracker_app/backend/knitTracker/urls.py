from django.urls import path
from .views import KnittingProjectView, user_projects, csrfTokenView, user_login, register_user, reset_password_email, reset_password

urlpatterns = [
    path('knitTracker/', KnittingProjectView.as_view(), name='knitTracker'),
    path('userProjects/', user_projects, name="userProjects"),
    path('csrf/', csrfTokenView, name="csrfToken"),
    path('register/', register_user, name="userLogin"),
    path('login/', user_login, name="registerUser"),
    path('resetPasswordEmail/', reset_password_email, name="resetPasswordEmail"),
    path('resetPassword/<str:uid>/<str:token>', reset_password, name="")
]