from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from .models import KnittingProject
from .serializers import ProjectSerializer
from django_ratelimit.decorators import ratelimit
from django.views.decorators.http import require_GET
from django.middleware.csrf import get_token, rotate_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder
import json


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
        projectID = data.get("projectId")
        nameOfProject = data.get("nameOfProject")
        stitches = data.get("stitches")
        needles = data.get("needles")
        yarn = data.get("yarn")
        progressGrid = data.get("progressGrid")
        notes = data.get("notes") or ""
        rowNotes = data.get("rowNotes") or ""
        completed = data.get("finished")

        # Checks if user already has that project in the database based on the 
        # projects name. If it exists, update it with the new user informations
        projects, created = KnittingProject.objects.update_or_create(
            user=user,
            project_id=projectID,
            # New entry 
            defaults = {
                "name_of_project": nameOfProject,
                "stitches": stitches, 
                "needles": needles, 
                "yarn": yarn, 
                "progress_grid": progressGrid, 
                "notes": notes,
                "row_notes": rowNotes,
                "completed": completed,
            }
        )
    
        # Get the information from the database back after insertion so 
        # we can use the updated at and created at stuff
        return JsonResponse(
            {
                "projectID": projects.project_id,
                "nameOfProject":  projects.name_of_project,
                "stitches": projects.stitches,
                "needles": projects.needles,
                "yarn": projects.yarn,
                "progressGrid": projects.progress_grid,
                "notes": projects.notes,
                "rowNotes": projects.row_notes,
                "completed": projects.completed,
                "updatedAt": projects.updated_at,
                "createdAt": projects.created_at,
                "isCreated": created, # Might be useful to know if the project already exists for parsing
            },
            encoder=DjangoJSONEncoder # updatedAt and createdAt are dateTime, so this helps convert them into the json
        )

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
        return JsonResponse({
            "detail": "Invalid user input or user DNE", 
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