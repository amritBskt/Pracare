from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from chat.models import ChatSession
from chat.ai_service import AIService
from .models import PatientReport
from .serializers import PatientReportSerializer, DoctorReviewSerializer

class GenerateReportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        # Check if session has messages
        if not session.messages.exists():
            return Response(
                {'error': 'Session has no messages to analyze'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if report already exists
        existing_report = PatientReport.objects.filter(session=session).first()
        if existing_report:
            return Response(PatientReportSerializer(existing_report).data)
        
        # Generate AI analysis
        ai_service = AIService()
        messages = list(session.messages.values('message_type', 'content'))
        analysis = ai_service.analyze_chat_patterns(messages)
        # print(analysis)
        
        if 'error' in analysis:
            return Response({'error': analysis['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create report
        report = PatientReport.objects.create(
            patient=request.user,
            session=session,
            mood_indicators=analysis.get('mood_indicators', []),
            key_concerns=analysis.get('key_concerns', []),
            coping_mechanisms=analysis.get('coping_mechanisms', []),
            risk_factors=analysis.get('risk_factors', []),
            ai_recommendations=analysis.get('recommendations', []),
            session_summary=analysis.get('session_summary', '')
        )
        
        return Response(PatientReportSerializer(report).data, status=status.HTTP_201_CREATED)

class PatientReportsListView(generics.ListAPIView):
    serializer_class = PatientReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'doctor':
            return PatientReport.objects.all()
        return PatientReport.objects.filter(patient=self.request.user)

class DoctorReviewView(generics.UpdateAPIView):
    serializer_class = DoctorReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PatientReport.objects.all()
    
    def update(self, request, *args, **kwargs):
        if request.user.user_type != 'doctor':
            return Response({'error': 'Only doctors can review reports'}, status=status.HTTP_403_FORBIDDEN)
        
        report = self.get_object()
        report.doctor = request.user
        
        return super().update(request, *args, **kwargs)
