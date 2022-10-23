from django.urls import path
from . import views

urlpatterns = [
    path('', views.SnippetListAPIView.as_view()),
    path('create/', views.SnippetCreateAPIView.as_view()),
    path('logout/', views.UserLogoutAPIView.as_view()),
    path('fetchtags/', views.TagListAPIView.as_view()),
    path('modifysnippetlikes/', views.ModifySnippetLikesAPIView.as_view()),
    path('guestlogin/', views.GuestLoginAPIView.as_view()),
    path('delete/', views.SnippetDeleteAPIView.as_view()),
    path('retrievesnippetdata/<int:pk>/', views.SnippetRetrieveAPIView.as_view()),
    path('edit/', views.SnippetEditAPIView.as_view()),
    path('registeruser/', views.UserRegistrationAPIView.as_view())
]
