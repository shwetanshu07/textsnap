from rest_framework import serializers
from .models import Snippet, Tags, SnippetLikes

# serializer for creating snippets
class SnippetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snippet
        exclude = ['created', 'updated', 'owner', 'active']

    def to_internal_value(self, data):
        data['author'] = None if data['author'].strip() == '' else data['author']
        data['book'] = None if data['book'].strip() == '' else data['book']
        data['add_info'] = None if data['add_info'].strip() == '' else data['add_info']
        return super().to_internal_value(data)

# serializer for tags
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = ['name']

# serializer for user's public info
class UserPublicSerializer(serializers.Serializer):
    username = serializers.CharField(read_only = True)
    id = serializers.IntegerField(read_only = True)

# serializer for listing all the snippets
class SnippetListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many = True, read_only = True)
    owner = UserPublicSerializer(read_only = True)
    likes = serializers.ReadOnlyField(source = 'get_likes')
    like_status = serializers.SerializerMethodField('get_like_status')
    is_owner = serializers.SerializerMethodField('check_snippet_owner')

    # Method to get whether a snippet has been liked by the current user or not.
    # Methods defined inside a ModelSerializer have access to their own context, 
    # which always includes the request. Obj is a single model (in this case Snippet) instance.
    def get_like_status(self, obj):
        request = self.context.get('request', None)

        # if context does not have request
        if request is None:
            return False

        # if no user is logged in then return false
        if not request.user.is_authenticated:
            return False

        # now user is autheticated, we try to get a model from snippet likes for 
        # this snippet and user, if we find one then this user has liked this snippet 
        # otherwise he has not liked this snippet.
        try:
            model = SnippetLikes.objects.get(snippet = obj.id, user = request.user.id)
            status = True
        except:
            status = False

        return status

    # Method to check if the logged in user is the owner of the snippet
    def check_snippet_owner(self, obj):
        request = self.context.get('request', None)
        if request is None:
            return False

        if not request.user.is_authenticated:
            return False

        if obj.owner.id == request.user.id:
            return True
        else:
            return False

    class Meta:
        model = Snippet
        fields = '__all__'

