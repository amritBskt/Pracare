from django.urls import path
from .views import GenerateReportView, PatientReportsListView, DoctorReviewView

urlpatterns = [
    path('generate/<int:session_id>/', GenerateReportView.as_view(), name='generate-report'),
    path('', PatientReportsListView.as_view(), name='reports-list'),
    path('<int:pk>/review/', DoctorReviewView.as_view(), name='doctor-review'),
]
