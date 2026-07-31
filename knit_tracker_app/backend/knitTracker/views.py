import json

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse
from django.middleware.csrf import get_token, rotate_token
from django.shortcuts import render
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET
from django_ratelimit.decorators import ratelimit
from rest_framework import permissions, viewsets
from rest_framework.views import APIView

from .models import KnittingProject
from .serializers import ProjectSerializer



class KnittingProjectView(APIView):
    serializer = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Get currently logged in users information
    def get_queryset(self):
        return KnittingProject.objects.filter(user=self.request.user)
    
    # Save info for currently logged in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# For the user to view their saved projects, as well as to save their projects
def user_projects(request):
    user = request.user

    # Grab the users projects
    if request.method == 'GET':
        query_database_for_projects = (KnittingProject.objects
                                       .filter(user=user)
                                       )
    
        # Send the users information about their projects to front end
        data = [
            {
                "projectId": str(savedProject.project_id),
                "nameOfProject":  savedProject.name_of_project,
                "stitches": savedProject.stitches,
                "needles": savedProject.needles,
                "yarn": savedProject.yarn,
                "progressGrid": savedProject.progress_grid,
                "notes": savedProject.notes,
                "rowNotes": savedProject.row_notes,
                "autofill": savedProject.autofill,
                "completed": savedProject.completed,
                "createdAt": savedProject.created_at,
                "updatedAt": savedProject.updated_at,
            }
            for savedProject in query_database_for_projects
        ]

        # safe=False due to returning a list of users projects
        return JsonResponse(data, safe=False)

    # Save the users project
    if request.method == 'POST':
        
        data = json.loads(request.body)
        print(data)
        projectId = data.get("projectId")

        defaults = {
            "name_of_project": data.get("nameOfProject"),
            "stitches": data.get("stitches"),
            "needles": data.get("needles"),
            "yarn": data.get("yarn"),
            "progress_grid": data.get("progressGrid"),
            "notes": data.get("notes") or "",
            "row_notes": data.get("rowNotes") or [],
            "autofill": data.get("autofill") or "",
            "completed": data.get("finished"),
        }

        # If statement is here because since it is altered with the project id,
        # creating a new project will have no id, therefore we have to create a new 
        # project using the defaults since django creates the id automatically.
        if projectId != "Blank":
            # Checks if user already has that project in the database based on the 
            # projects name. If it exists, update it with the new user information
            projects, created = KnittingProject.objects.update_or_create(
                user=user,
                project_id=projectId,
                # New entry 
                defaults = defaults
            )
        else:
            # There is no project id, therefore we have a new project to add to the database 
            projects = KnittingProject.objects.create(
                user=user,
                **defaults,
            )
    
        # Get the information from the database back after insertion so 
        # we can use the updated at and created at stuff
        return JsonResponse(
            {
                "projectId": projects.project_id,
                "nameOfProject":  projects.name_of_project,
                "stitches": projects.stitches,
                "needles": projects.needles,
                "yarn": projects.yarn,
                "progressGrid": projects.progress_grid,
                "notes": projects.notes,
                "rowNotes": projects.row_notes,
                "autofill": projects.autofill,
                "completed": projects.completed,
                "updatedAt": projects.updated_at,
                "createdAt": projects.created_at,
            },
            encoder=DjangoJSONEncoder # updatedAt and createdAt are dateTime, so this helps convert them into the json
        )

    # Delete users project
    if request.method == 'DELETE':
        data = json.loads(request.body)

        projectId = data.get("projectId")

        knittingProject = (
                            KnittingProject.objects.get(user=user, project_id=projectId)
                            )
        
        nameOfKnitProject = knittingProject.name_of_project

        knittingProject.delete()

        return JsonResponse({
            "message": f"Project {nameOfKnitProject} was deleted"
        }, status=200 )

#########################################################
# CSRF AND USER AUTHENTICATION/LOGIN/REGISTRATION VIEWS #
#########################################################

# Set the csrf cookie
@ensure_csrf_cookie
@require_GET # For session based CSRF
def csrfTokenView(request):
    print("CSRF TOKEN!!!!")
    token = get_token(request)
    return JsonResponse({'csrfToken': token})
    # return JsonResponse({'detail': 'CSRF cookie set'})

# Login the user and send the users csrf token for verifications
def user_login(request):
    
    data = json.loads(request.body)

    user = authenticate(request, username = data.get("username"), password = data.get("password"))


    # User did not exist, so something happened
    if user is None:
        print(user)
        return JsonResponse({
            "detail": "Invalid username or password", 
            "csrfToken": get_token(request)
            })
        

    login(request, user)

    rotate_token(request)

    return JsonResponse({
        "detail": "Login Sucess",
        "csrfToken": get_token(request)
    })

# Registers the user. front end verifies if user put a username and password,
# so no need to check here.
@ratelimit(key='ip', rate='3/h', block=False)
def register_user(request):

    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email") # email is used only for resetting password
    password = data.get("password")

    print(data)

    # Username already exists
    if User.objects.filter(username=username).exists():
        return JsonResponse({ "detail": "Someone already has that username!"}, status=400)
    
    # Successfully created a new user
    User.objects.create_user(username = username, email = email, password = password)
    return JsonResponse({
            "detail": "Registration Success!"
         }, status=201)


# Just need the username for the user
def currently_logged_in_user(request):
    user = request.user

    return JsonResponse({
        "username": user.username,
    })


User = get_user_model()

# E-mail password recovery request
def reset_password_email(request):

    data = json.loads(request.body)

    # Makes sure all e-mails are the standard username@email.com
    email = str(data.get("email", "")).strip().lower()

    # The official password reset form
    reset_form = PasswordResetForm({
        "email": email
    })

    if not reset_form.is_valid():
        return JsonResponse({
            "detail": "Could not find the e-mail address",
        }, status=400)

    # Password reset form, sends e-mail to specified address
    reset_form.save(
        request=request,
        from_email=settings.DEFAULT_FROM_EMAIL,
        subject_template_name="reset_password_stuff/reset_password_email_subject.txt",
        email_template_name="reset_password_stuff/reset_password_email_body.txt",
        extra_email_context= {
            "frontend_url": settings.FRONTEND_URL
        }
    )

    return JsonResponse({
        "detail": (
            "A password-reset link has been sent to that e-mail address!"
        )
    })

# Logic for actually changing the password
def reset_password(request, uid, token):
    """
    resets the users password.

    param request: The JSON request sent by the client
    uid: The id of the user that is requesting the password change,
    used to identify their password in the database
    token: makes sure it is a valid request
    """

    data = json.loads(request.body)

    # Turn the id into a reguler string in order
    # to find where the user is in the database for
    # password retrieval
    user_id = force_str(
        urlsafe_base64_decode(uid)
    )

    user = User.objects.get(pk=user_id)

    # Sent from the front-end to acquire the new password
    new_password = data.get("newPassword", "")
    confirm_new_password = data.get("confirmNewPassword", "")

    # Change the password in the database
    password_form = SetPasswordForm(
        user=user,
        data={
            "new_password1": new_password,
            "new_password2": confirm_new_password
        }
    )

    password_form.save()

    return JsonResponse({
        "detail": "Password was reset successfully!"
    })


