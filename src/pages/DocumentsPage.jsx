import { useParams } from 'react-router-dom';
import { useHackathonTeam } from '../hooks/useHackathonTeam.jsx';
import DocumentList from '../components/DocumentList';
import LoadingSpinner from '../components/LoadingSpinner';

const DocumentsPage = () => {
  const { hackathonId } = useParams();
  const { team, loading, error } = useHackathonTeam(hackathonId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading team information..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 mx-auto mb-6 text-red-400">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Error Loading Team</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-primary to-chart-2 text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 mx-auto mb-6 text-muted-foreground">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">No Team Found</h3>
        <p className="text-muted-foreground mb-6">
          You need to be part of a team to access documents.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <DocumentList 
          teamId={team.$id} 
          hackathonId={hackathonId}
        />
      </div>
    </div>
  );
};

export default DocumentsPage;