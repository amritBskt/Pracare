from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, SendMessageSerializer
from .ai_service import AIService

class ChatSessionListView(generics.ListCreateAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        session = ChatSession.objects.create(
            user=request.user,
            title=f"Chat Session - {ChatSession.objects.filter(user=request.user).count() + 1}"
        )
        return Response(ChatSessionSerializer(session).data, status=status.HTTP_201_CREATED)

class ChatSessionDetailView(generics.RetrieveAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

class SendMessageView(generics.GenericAPIView):
    serializer_class = SendMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session_id = serializer.validated_data.get('session_id')
        message_content = serializer.validated_data['message']
        
        # Get or create session
        if session_id:
            session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        else:
            session = ChatSession.objects.create(
                user=request.user,
                title=message_content[:50] + "..." if len(message_content) > 50 else message_content
            )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            message_type='user',
            content=message_content
        )
        
        # Get AI response
        ai_service = AIService()
        previous_messages = list(session.messages.values('message_type', 'content'))
        ai_response = ai_service.get_ai_response(previous_messages)
        
        # Save AI response
        assistant_message = ChatMessage.objects.create(
            session=session,
            message_type='assistant',
            content=ai_response
        )
        
        session.updated_at = assistant_message.timestamp
        session.save()
        
        return Response({
            'session_id': session.id,
            'user_message': {
                'id': user_message.id,
                'content': user_message.content,
                'timestamp': user_message.timestamp
            },
            'ai_response': {
                'id': assistant_message.id,
                'content': assistant_message.content,
                'timestamp': assistant_message.timestamp
            }
        })
