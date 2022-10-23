# Imports related to rest framework
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication

# Imports of Models and Serializers
from .models import Snippet, SnippetLikes, Tags, Snippet
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .serializers import SnippetCreateSerializer, SnippetListSerializer, TagSerializer

# Other utility based imports
import calendar
import datetime

# Pagination Class. This can also be done globally by specifying in the views.py
class StandardPagination(PageNumberPagination):
    page_size = 5

# Endpoint for listing snippets with their details
class SnippetListAPIView(generics.ListAPIView):
    serializer_class = SnippetListSerializer
    pagination_class = StandardPagination
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('q')
        query_type = self.request.query_params.get('t')
        order_type = self.request.query_params.get('o')
        my_snippets = self.request.query_params.get('my')

        queryset = Snippet.objects.filter(active = 1)
        where_conditions = []

        # for my snippets list
        if my_snippets == "1" and self.request.user.is_authenticated:
            queryset = queryset.filter(owner = self.request.user)
            where_conditions.append("s.owner_id = {owner_id}".format(owner_id = self.request.user.id))

        # TO DO - need to find better approach eg use params as format 
        # is susceptible to sql injection
        if query and query_type == 'tag':
            queryset = queryset.filter(tags__name__icontains = query)
            where_conditions.append(
                '''
                s.id IN (
                    SELECT st.snippet_id FROM tags t
					LEFT JOIN snippets_tags st on st.tags_id = t.id
					WHERE t.name LIKE '%%{tag_name}%%'
                )'''.format(tag_name = query)
            )
        elif query and query_type == 'book':
            queryset = queryset.filter(book__icontains = query)
            where_conditions.append("s.book LIKE '%%{book}%%'".format(book = query))
        elif query and query_type == 'author':
            queryset = queryset.filter(author__icontains = query)
            where_conditions.append("s.author LIKE '%%{author}%%'".format(author = query))
        elif query and query_type == 'snippet':
            queryset = queryset.filter(text__icontains = query)
            where_conditions.append("s.text LIKE '%%{text}%%'".format(text = query))

        # default ordering is by latest date of creation
        if order_type == "2":
            sql = '''
                SELECT s.*, tbl.likes_count
                FROM snippets s
                LEFT JOIN (
                    SELECT COUNT(id) as likes_count, snippet_id
                    FROM snippet_likes
                    GROUP BY snippet_id
                ) tbl on tbl.snippet_id = s.id
                WHERE s.active = 1
            '''

            if where_conditions:
                for condition in where_conditions:
                    sql = sql + " AND " + condition

            sql = sql + " ORDER BY tbl.likes_count DESC"

            raw_queryset = Snippet.objects.raw(sql)
            return raw_queryset
        else:
            queryset = queryset.order_by('-created')
            return queryset

# Endpoint for getting a list of all the tags
class TagListAPIView(generics.ListAPIView):
    serializer_class = TagSerializer
    queryset = Tags.objects.all().filter(active = 1)

# Common functionalities for creation and updation of snippets
class CreateEditCommonMethods():
    @staticmethod
    def getTagIds(tag_list, user):
        tag_ids = []
        for tag in tag_list:
            obj, created = Tags.objects.get_or_create(
                name = tag,
                owner = user
            )
            tag_ids.append(obj.id)
        return tag_ids

# Endpoint for creating a snippet
class SnippetCreateAPIView(generics.CreateAPIView, CreateEditCommonMethods):
    serializer_class = SnippetCreateSerializer
    queryset = Snippet.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):      
        # For each tag name in request body get the corresponding id. 
        # If tag is not there then create the tag
        request.data['tags'] = CreateEditCommonMethods.getTagIds(
            request.data['tags'], self.request.user)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        date = datetime.datetime.utcnow()
        utc_time = calendar.timegm(date.utctimetuple())
        serializer.save(owner=self.request.user, created=utc_time, updated=utc_time)

# Endpoint for updating a snippet
class SnippetEditAPIView(views.APIView, CreateEditCommonMethods):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        snippet_id = request.data.get('snippet_id', None)
        if not snippet_id:
            return Response({'error' : True, 'message' : 'No snippet id passed'})

        try:
            snippet = Snippet.objects.get(id = snippet_id)
            if snippet.owner.id != request.user.id:
                return Response({'error' : True, 'message' : 'Not snippet owner'})

            if not snippet.active:
                return Response({'error' : True, 'message' : 'Deactivated snippet cannot be edited'})
            
            # convert the tag names to their ids
            request.data['tags'] = CreateEditCommonMethods.getTagIds(
                request.data['tags'],  self.request.user)

            # some validations
            if not request.data['tags']:
                return Response({'error' : True, 'message' : 'Tags are mandatory'})
            if not request.data['text'].strip():
                return Response({'error' : True, 'message' : 'Snippet text is mandatory'})

            request.data['author'] = None if request.data['author'].strip() == '' else request.data['author']
            request.data['book'] = None if request.data['book'].strip() == '' else request.data['book']
            request.data['add_info'] = None if request.data['add_info'].strip() == '' else request.data['add_info']

            # TO DO - wrap this in a single transaction
            # save the data now that validation has been done
            snippet.text = request.data['text']
            snippet.author = request.data['author']
            snippet.book = request.data['book']
            snippet.add_info = request.data['add_info']
            
            date = datetime.datetime.utcnow()
            utc_time = calendar.timegm(date.utctimetuple())
            snippet.updated = utc_time

            snippet.save()
            
            # save the tags
            snippet.tags.clear()
            for tag in request.data['tags']:
                snippet.tags.add(tag)

            return Response({'error' : False, 'message' : 'Snippet edited successfully'})
        except:
             return Response({'error' : True, 'message' : 'Invalid snippet id'}, 
             status = status.HTTP_404_NOT_FOUND)

# Endpoint for logging out a user
class UserLogoutAPIView(views.APIView):
    # only authenticated users can log out
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        request.user.auth_token.delete()
        return Response({'message' : 'Token deleted successfully'})

# Endpoint for adding / removing a like from a snippet
class ModifySnippetLikesAPIView(views.APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action', None)
        if action is None:
            return Response({'error' : True, 'message' : 'No action specified'})

        snippet_id = request.data.get('snippet_id', None)
        if snippet_id is None:
            return Response({'error' : True, 'message' : 'No snippet id specified'})
        
        # check snippet id is valid or not
        try:
            snippet_model = Snippet.objects.get(id=snippet_id)
        except:
            return Response({'error' : True, 'message' : 'Invalid Snippet Id'})
        
        user_like_model = SnippetLikes.objects.filter(
            snippet = snippet_id, 
            user = request.user.id
        )

        # user is trying to like the snippet
        if action == 1: 
            # in case user has already liked the snippet
            if user_like_model:
                return Response({'error' : True, 'message' : 'User has already liked the snippet'})
            
            new_model = SnippetLikes(snippet = snippet_model, user = request.user)
            new_model.save()

            return Response({'error' : False, 'message' : 'Snippet has been liked successfully'})

        # user is trying to remove his like from snippet
        elif action == 0:
            if not user_like_model:
                return Response({'error' : True, 'message' : 'No like from user is there'})

            user_like_model.delete()
            return Response({'error' : False, 'message' : 'Like from snippet has been removed successfully'})

        else:
            return Response({'error' : True, 'message' : 'Invalid action performed'})

# Guest login endpoint
class GuestLoginAPIView(views.APIView):
    def get(self, request):
        user = User.objects.filter(username = 'user2')[0]
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "error" : False, 
            "message" : "Token generated successfully", 
            "token" : token.key, 
            "user" : user.username
        })

# User registration endpoint
class UserRegistrationAPIView(views.APIView):
    def post(self, request):
        username = request.data.get('username', None)
        password = request.data.get('password', None)

        # basic validations
        if username is None or password is None:
            return Response({'error' : True, 'message' : 'Username and Password are mandatory fields'})

        if len(username.strip()) < 4:
            return Response({'error' : True, 'message' : 'Username must be 4 characters long.'})

        if len(password.strip()) < 6:
            return Response({'error' : True, 'message' : 'Password must be 6 characters long.'})
        
        user = User.objects.filter(username = username).first()
        if user is not None:
            return Response({'error' : True, 'message' : 'Username taken. Please choose another username.'})
        
        # username is fine and password is fine, lets create a user
        user = User.objects.create_user(username=username, password=password)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "error" : False, 
            "message" : "User registered successfully. Token generated successfully", 
            "token" : token.key, 
        })


# Delete a snippet endpoint
class SnippetDeleteAPIView(views.APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        snippet_id = request.data.get('id', None)
        if not snippet_id:
            return Response({'error' : True, 'message' : 'No snippet id passed'})

        try:
            snippet = Snippet.objects.get(id = snippet_id)

            if snippet.owner.id != request.user.id:
                return Response({'error' : True, 'message' : 'Not snippet owner'})

            # get the time of updation
            date = datetime.datetime.utcnow()
            utc_time = calendar.timegm(date.utctimetuple())
            snippet.active = 0
            snippet.updated = utc_time
            snippet.save()
            return Response({'error' : False, 'message' : 'Snippet deleted successfully'})
        except:
             return Response({'error' : True, 'message' : 'Invalid snippet id'}, 
             status = status.HTTP_404_NOT_FOUND)

# Endpoint to get the data for a single snippet
class SnippetRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = SnippetListSerializer
    queryset = Snippet.objects.all()