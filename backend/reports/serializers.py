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
    follow_up_date = serializers.DateField(required=False, allow_null=True)
    class Meta:
        model = PatientReport
        fields = ('doctor_notes', 'doctor_recommendations', 'prescription', 'follow_up_required', 'follow_up_date')
    
    def to_internal_value(self, data):
        # Convert empty string to None just for follow_up_date
        if data.get("follow_up_date") == "":
            data["follow_up_date"] = None
            data["follow_up_required"] = False
        
        if data.get("follow_up_required") == False:
            data["follow_up_date"] = None
        
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        # **FIX: Set the doctor field during serializer update**
        if self.context.get('request') and self.context['request'].user.user_type == 'doctor':
            instance.doctor = self.context['request'].user
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
