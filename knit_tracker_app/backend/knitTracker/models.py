import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

# Table that contains users knitting project(s)
# information
class KnittingProject(models.Model):



    # The user the knitting project belongs to
    # (users id)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="knitting_projects"
    )

    # Unique id for each project to identify them. The project name can change
    # anytime if the user wishes, so this will allow us to keep track of the project
    # itself regardless of the name change
    project_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # The users knitting project info and progress
    name_of_project = models.CharField(max_length=255)
    stitches = models.PositiveIntegerField()
    needles = models.JSONField(default=dict, blank=True)
    yarn = models.JSONField(default=dict, blank=True)
    progress_grid = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True, default="")
    row_notes = models.JSONField(default=list, blank=True)
    autofill = models.TextField(blank=True, default="")
    completed = models.BooleanField(default=False) # Lets user know if they finished their project

    # When the user started the project, and the last time they updated
    # it!
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)