from django.contrib import admin
from .models import Snippet, Tags

# Register your models here.
admin.site.register(Snippet)
admin.site.register(Tags)