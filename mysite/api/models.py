from django.db import models
from django.contrib.auth.models import User

# Tag models - each snippet can be linked with some tags
class Tags(models.Model):
    name = models.CharField(max_length=256)
    active = models.SmallIntegerField(default=1)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'tags'

# Text Snippet model
class Snippet(models.Model):
    text = models.TextField()
    author = models.CharField(max_length=256, null=True)
    book = models.CharField(max_length=256, null=True)
    add_info = models.TextField(null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    active = models.SmallIntegerField(default=1)
    tags = models.ManyToManyField(Tags)
    created = models.IntegerField()
    updated = models.IntegerField()

    def get_likes(self):
        total = SnippetLikes.objects.filter(snippet = self.id).count()
        return total

    class Meta:
        db_table = "snippets"


# Used to store the likes for a snippet
# user is the user id who has liked the post
class SnippetLikes(models.Model):
    snippet = models.ForeignKey(Snippet, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete = models.CASCADE)

    class Meta:
        db_table = "snippet_likes"