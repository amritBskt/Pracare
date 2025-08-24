from django.db import models
from django.conf import settings
from chat.models import ChatSession

class PatientReport(models.Model):
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reports', on_delete=models.CASCADE)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviewed_reports', on_delete=models.SET_NULL, null=True, blank=True)
    
    # AI Analysis Results
    mood_indicators = models.JSONField(default=list)
    key_concerns = models.JSONField(default=list)
    coping_mechanisms = models.JSONField(default=list)
    risk_factors = models.JSONField(default=list)
    ai_recommendations = models.JSONField(default=list)
    session_summary = models.TextField()
    
    # Doctor's Input
    doctor_notes = models.TextField(blank=True)
    doctor_recommendations = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report for {self.patient.email} - Session {self.session.id}"
