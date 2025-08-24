import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorReview, setDoctorReview] = useState({
    doctor_notes: '',
    doctor_recommendations: '',
    prescription: '',
    follow_up_required: false,
    follow_up_date: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (sessionId) => {
    try {
      const response = await api.post(`/reports/generate/${sessionId}/`);
      toast.success('Report generated successfully');
      fetchReports();
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    }
  };

  const submitDoctorReview = async (reportId) => {
    try {
      await api.patch(`/reports/${reportId}/review/`, doctorReview);
      toast.success('Review submitted successfully');
      setModalOpen(false);
      fetchReports();
      setDoctorReview({
        doctor_notes: '',
        doctor_recommendations: '',
        prescription: '',
        follow_up_required: false,
        follow_up_date: '',
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    }
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    if (user.user_type === 'doctor' && report.doctor) {
      setDoctorReview({
        doctor_notes: report.doctor_notes || '',
        doctor_recommendations: report.doctor_recommendations || '',
        prescription: report.prescription || '',
        follow_up_required: report.follow_up_required || false,
        follow_up_date: report.follow_up_date || '',
      });
    }
    setModalOpen(true);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.session_summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'reviewed') return matchesSearch && report.doctor;
    if (filterStatus === 'pending') return matchesSearch && !report.doctor;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.user_type === 'doctor' ? 'Patient Reports' : 'My Reports'}
          </h1>
          <p className="text-gray-600">
            {user.user_type === 'doctor' 
              ? 'Review and provide professional guidance for patient reports'
              : 'View your chat session analysis and professional recommendations'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {user.user_type === 'doctor' && (
              <div className="sm:w-48">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredReports.length === 0 ? (
            <li className="px-6 py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Reports will appear here once generated.'}
              </p>
            </li>
          ) : (
            filteredReports.map((report) => (
              <li key={report.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Report #{report.id}
                          </p>
                          {report.doctor ? (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reviewed
                            </span>
                          ) : (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p className="truncate">
                            {user.user_type === 'doctor' ? report.patient.full_name : 'Your session'}
                          </p>
                          <Calendar className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{format(new Date(report.created_at), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {report.session_summary}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openReportModal(report)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Report Detail Modal */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Report #{selectedReport.id} - {selectedReport.patient.full_name}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* AI Analysis */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">AI Analysis</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Session Summary:</span>
                      <p className="text-sm text-gray-600 mt-1">{selectedReport.session_summary}</p>
                    </div>
                    
                    {selectedReport.mood_indicators.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Mood Indicators:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedReport.mood_indicators.map((mood, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {mood}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.key_concerns.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Key Concerns:</span>
                        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                          {selectedReport.key_concerns.map((concern, index) => (
                            <li key={index}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedReport.ai_recommendations.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">AI Recommendations:</span>
                        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                          {selectedReport.ai_recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Review Section */}
                {user.user_type === 'doctor' ? (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Professional Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
                        <textarea
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Your professional observations..."
                          value={doctorReview.doctor_notes}
                          onChange={(e) => setDoctorReview({...doctorReview, doctor_notes: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                        <textarea
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Your professional recommendations..."
                          value={doctorReview.doctor_recommendations}
                          onChange={(e) => setDoctorReview({...doctorReview, doctor_recommendations: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prescription/Treatment Plan</label>
                        <textarea
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Prescribed treatments, medications, or therapy plans..."
                          value={doctorReview.prescription}
                          onChange={(e) => setDoctorReview({...doctorReview, prescription: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={doctorReview.follow_up_required}
                            onChange={(e) => setDoctorReview({...doctorReview, follow_up_required: e.target.checked})}
                          />
                          <span className="ml-2 text-sm text-gray-700">Follow-up required</span>
                        </label>
                        
                        {doctorReview.follow_up_required && (
                          <input
                            type="date"
                            className="border border-gray-300 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={doctorReview.follow_up_date}
                            onChange={(e) => setDoctorReview({...doctorReview, follow_up_date: e.target.value})}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  selectedReport.doctor && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Professional Review</h4>
                      <div className="bg-green-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Reviewed by Dr. {selectedReport.doctor.full_name}
                          </span>
                        </div>
                        
                        {selectedReport.doctor_notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Clinical Notes:</span>
                            <p className="text-sm text-gray-600 mt-1">{selectedReport.doctor_notes}</p>
                          </div>
                        )}
                        
                        {selectedReport.doctor_recommendations && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Recommendations:</span>
                            <p className="text-sm text-gray-600 mt-1">{selectedReport.doctor_recommendations}</p>
                          </div>
                        )}
                        
                        {selectedReport.prescription && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Prescription:</span>
                            <p className="text-sm text-gray-600 mt-1">{selectedReport.prescription}</p>
                          </div>
                        )}
                        
                        {selectedReport.follow_up_required && (
                          <div className="flex items-center text-sm text-amber-700">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Follow-up required
                            {selectedReport.follow_up_date && (
                              <span className="ml-2">on {format(new Date(selectedReport.follow_up_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                {user.user_type === 'doctor' && (
                  <button
                    onClick={() => submitDoctorReview(selectedReport.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
