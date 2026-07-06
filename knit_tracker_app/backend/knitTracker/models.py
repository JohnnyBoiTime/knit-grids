import uuid
from django.db import models
from django.contrib.auth.models import User

# Table that contains users knitting project(s)
# information
class KnittingProjects(models.Model):

    # The user the knitting project belongs to
    # (users id)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="knitting_project"
    )

    # The users knitting project info and progress
    name_of_project = models.CharField(max_length=50)
    stitches = models.IntegerField()
    needles = models.JSONField(default=dict)
    yarn = models.JSONField(default=dict)
    progress_grid = models.JSONField(default=dict)
    notes = models.TextField(blank=True, default="")
    row_notes = models.JSONField(default=list, blank=True)
    completed = models.BooleanField(False) # Lets user know if they finished their project

    # When the user started the project, and the last time they updated
    # it!
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)