import { useParams } from 'react-router-dom';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import TeamVault from '../components/TeamVault';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Key, AlertCircle, Users } from 'lucide-react';



const VaultPage = () => {
  const { hackathonId } = useParams();
  const { team, loading, error } = useHackathonTeam(hackathonId);


  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
          <CardContent className="p-16 text-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
          <CardContent className="p-16 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load Vault</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
          <CardContent className="p-16 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Team Found</h2>
            <p className="text-muted-foreground">You need to be part of a team to access the vault.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
                <CardHeader className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Team Vault</h1>
                <p className="text-muted-foreground">
                  Secure storage for your team's sensitive information and credentials
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <TeamVault 
        teamId={team.$id} 
        hackathonId={hackathonId} 
      />
    </div>
  );
};

export default VaultPage;