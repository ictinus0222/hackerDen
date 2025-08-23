import { useParams } from 'react-router-dom';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import TeamVault from '../components/TeamVault';
import LoadingSpinner from '../components/LoadingSpinner';

// SVG Icon
const KeyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const VaultPage = () => {
  const { hackathonId } = useParams();
  const { team, loading, error } = useHackathonTeam(hackathonId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <KeyIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Vault</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <KeyIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Team Found</h2>
          <p className="text-gray-400">You need to be part of a team to access the vault.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <TeamVault teamId={team.$id} hackathonId={hackathonId} />
      </div>
    </div>
  );
};

export default VaultPage;