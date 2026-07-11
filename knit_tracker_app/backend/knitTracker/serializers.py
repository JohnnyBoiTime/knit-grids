from rest_framework import serializers
from .models import KnittingProjects

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnittingProjects
        fields = [
            "id",
            "name_of_project",
            "stitches",
            "needles",
            "yarn",
            "progress_grid",
            "row_info",
            "notes",
            "completed",
            "created_at",
            "updated_at"
        ]