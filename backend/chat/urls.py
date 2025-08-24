from django.urls import path
from .views import ChatSessionListView, ChatSessionDetailView, SendMessageView

urlpatterns = [
    path('sessions/', ChatSessionListView.as_view(), name='chat-sessions'),
    path('sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('send/', SendMessageView.as_view(), name='send-message'),
]
