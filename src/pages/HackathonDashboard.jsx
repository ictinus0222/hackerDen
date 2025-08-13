import { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hackathonService } from '../services/hackathonService';
import HackathonLayout from '../components/HackathonLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Import the individual workspace components
import HackathonDashboardContent from '../components/HackathonDashboardContent';
import TasksPage from './TasksPage';
import ChatPage from './ChatPage';

const HackathonDashboard = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load hackathon details
  useEffect(() => {
    const loadHackathonData = async () => {
      if (!user?.$id || !hackathonId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Load hackathon data from database
        const hackathon = await hackathonService.getHackathonById(hackathonId);
        setHackathon(hackathon);
      } catch (err) {
        console.error('Failed to load hackathon data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHackathonData();
  }, [user?.$id, hackathonId]);

  if (loading) {
    return (
      <HackathonLayout hackathon={hackathon}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading hackathon..." />
        </div>
      </HackathonLayout>
    );
  }

  if (error) {
    return (
      <HackathonLayout hackathon={hackathon}>
        <div className="max-w-2xl mx-auto text-center py-16 px-6">
          <div className="w-16 h-16 mx-auto mb-6 text-red-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Error Loading Hackathon</h3>
          <p className="text-dark-tertiary mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </HackathonLayout>
    );
  }

  if (!hackathon) {
    return (
      <HackathonLayout hackathon={hackathon}>
        <div className="text-center py-16 px-6">
          <h1 className="text-2xl font-bold text-white mb-4">Hackathon Not Found</h1>
          <p className="text-dark-tertiary mb-6">The hackathon you're looking for doesn't exist.</p>
          <Link
            to="/console"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
          >
            Back to Console
          </Link>
        </div>
      </HackathonLayout>
    );
  }

  return (
    <HackathonLayout hackathon={hackathon}>
      <Routes>
        <Route path="dashboard" element={<HackathonDashboardContent hackathon={hackathon} />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </HackathonLayout>
  );
};

export default HackathonDashboard;