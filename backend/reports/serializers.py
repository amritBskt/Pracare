from rest_framework import serializers
from .models import PatientReport
from accounts.serializers import UserProfileSerializer

class PatientReportSerializer(serializers.ModelSerializer):
    patient = UserProfileSerializer(read_only=True)
    doctor = UserProfileSerializer(read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)
    session_date = serializers.DateTimeField(source='session.created_at', read_only=True)
    
    class Meta:
        model = PatientReport
        fields = '__all__'

class DoctorReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientReport
        fields = ('doctor_notes', 'doctor_recommendations', 'prescription', 'follow_up_required', 'follow_up_date')
