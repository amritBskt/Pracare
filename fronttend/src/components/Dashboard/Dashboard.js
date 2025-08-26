import { toast } from "react-toastify";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, FileText, Users, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sessionsRes, reportsRes] = await Promise.all([
        api.get('/chat/sessions/'),
        api.get('/reports/'),
      ]);
      setSessions(sessionsRes.data.slice(0, 5)); // Latest 5 sessions
      setReports(reportsRes.data.slice(0, 5)); // Latest 5 reports
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateReportFromDashboard = async (sessionId) => {
    try {
      const response = await api.post(`/reports/generate/${sessionId}/`);
      toast.success('Report generated successfully!');
      fetchDashboardData(); // Refresh the dashboard data
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name || user?.username}
          </h1>
          <p className="text-gray-600">
            {user?.user_type === 'doctor' 
              ? "Review patient reports and provide professional guidance"
              : "Continue your mental health journey with personalized support"
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sessions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sessions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reports Generated
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reports.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {user?.user_type === 'doctor' && (
          <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Patients Reviewed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.filter(r => r.doctor).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user?.user_type === 'patient' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Recent Sessions
                </h3>
                <Link
                  to="/chat"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Link>
              </div>
              <div className="flow-root">
                {sessions.length > 0 ? (
                  <ul className="-mb-8">
                    {sessions.map((session, index) => (
                      <li key={session.id}>
                        <div className="relative pb-8">
                          {index !== sessions.length - 1 && (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <MessageCircle className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Link
                                    to={`/chat/${session.id}`}
                                    className="text-sm text-gray-900 hover:text-indigo-600"
                                  >
                                    {session.title}
                                  </Link>
                                  <p className="text-sm text-gray-500">
                                    {new Date(session.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                {session.message_count > 0 && (
                                  <button
                                    onClick={() => generateReportFromDashboard(session.id)}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    Generate Report
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No sessions yet. Start your first conversation!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`bg-white overflow-hidden shadow rounded-lg ${user?.user_type === 'doctor' ? 'lg:col-span-2' : ''}`}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {user?.user_type === 'doctor' ? 'Recent Patient Reports' : 'Recent Reports'}
              </h3>
              <Link
                to="/reports"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>
            <div className="flow-root">
              {reports.length > 0 ? (
                <ul className="-mb-8">
                  {reports.map((report, index) => (
                    <li key={report.id}>
                      <div className="relative pb-8">
                        {index !== reports.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* <div className="text-sm text-gray-900">
                              Session Report #{report.id}
                            </div> */}
                            <Link
                              to="/reports"
                              className="text-sm text-gray-900 hover:text-indigo-600 cursor-pointer"
                            >
                              Report #{report.id}
                              {user?.user_type === 'doctor' && report.patient && (
                                <span className="text-gray-500 ml-1">
                                  - {report.patient.full_name || report.patient.email}
                                </span>
                              )}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                            {report.doctor && (
                              <p className="text-xs text-green-600">
                                Reviewed by Dr. {report.doctor.full_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No reports generated yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
