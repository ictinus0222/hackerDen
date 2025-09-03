import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { hackathonService } from '../services/hackathonService';
import ConsoleLayout from '../components/ConsoleLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import TeamSelector from '../components/TeamSelector';
import { Card, CardContent, CardHeader } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const UserHackathonConsole = () => {
  // TODO: Authentication removed
  // // TODO: Authentication removed
  // const { user, ... } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);

  // Load user hackathons from database
  useEffect(() => {
    const loadUserHackathons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userHackathons = await hackathonService.getUserHackathons(user.$id);
        setHackathons(userHackathons);
      } catch (err) {
        console.error('Failed to load hackathons:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserHackathons();
  }, [user?.$id]);

  const getStatusBadgeVariant = (status) => {
    const variants = {
      upcoming: 'secondary',
      ongoing: 'default',
      completed: 'outline'
    };
    return variants[status] || variants.upcoming;
  };

  const getRoleBadgeVariant = (role) => {
    return role === 'leader' ? 'default' : 'secondary';
  };

  const handleJoinCreateTeam = (hackathon) => {
    setSelectedHackathon(hackathon);
    setShowTeamSelector(true);
  };

  const handleTeamAction = () => {
    setShowTeamSelector(false);
    setSelectedHackathon(null);
    // Refresh hackathons data
    window.location.reload();
  };

  const handleJoinTeamByCode = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoinLoading(true);
      setJoinError(null);
      
      // Join team by code - this will find the hackathon and join the team
      await hackathonService.joinTeamByCode(user.$id, joinCode.trim().toUpperCase());
      
      // Close modal and refresh
      setShowJoinTeamModal(false);
      setJoinCode('');
      window.location.reload();
    } catch (err) {
      console.error('Failed to join team:', err);
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const groupedHackathons = {
    ongoing: hackathons.filter(h => h.status === 'ongoing'),
    upcoming: hackathons.filter(h => h.status === 'upcoming'),
    completed: hackathons.filter(h => h.status === 'completed')
  };

  if (loading) {
    return (
      <ConsoleLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading your hackathons..." />
        </div>
      </ConsoleLayout>
    );
  }

  return (
    <ConsoleLayout>
      <div className="space-y-8">
        {/* Header Card */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg overflow-hidden">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">My Hackathons</h1>
                <p className="text-muted-foreground">
                  Your hackathon journey - past, present, and future
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinTeamModal(true)}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Join Team</span>
                </Button>
                <Button asChild>
                  <Link to="/create-hackathon" className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Hackathon</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>



        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10" role="alert">
            <CardContent className="p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-destructive mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {hackathons.length === 0 ? (
          <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No Hackathons Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't joined any hackathons yet. Create your first hackathon and start your innovation journey!
              </p>
              <Button asChild>
                <Link to="/create-hackathon">
                  Create Your First Hackathon
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Ongoing Hackathons */}
            {groupedHackathons.ongoing.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse mr-3"></div>
                  <h2 className="text-xl font-semibold text-foreground">Ongoing Hackathons</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHackathons.ongoing.map((hackathon) => (
                    <HackathonCard 
                      key={hackathon.hackathonId} 
                      hackathon={hackathon} 
                      onJoinCreateTeam={handleJoinCreateTeam}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getRoleBadgeVariant={getRoleBadgeVariant}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Hackathons */}
            {groupedHackathons.upcoming.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h2 className="text-xl font-semibold text-foreground">Upcoming Hackathons</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHackathons.upcoming.map((hackathon) => (
                    <HackathonCard 
                      key={hackathon.hackathonId} 
                      hackathon={hackathon} 
                      onJoinCreateTeam={handleJoinCreateTeam}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getRoleBadgeVariant={getRoleBadgeVariant}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Hackathons */}
            {groupedHackathons.completed.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full mr-3"></div>
                  <h2 className="text-xl font-semibold text-foreground">Completed Hackathons</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedHackathons.completed.map((hackathon) => (
                    <HackathonCard 
                      key={hackathon.hackathonId} 
                      hackathon={hackathon} 
                      onJoinCreateTeam={handleJoinCreateTeam}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getRoleBadgeVariant={getRoleBadgeVariant}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Team Selector Modal */}
        <Dialog open={showTeamSelector} onOpenChange={setShowTeamSelector}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Join Team</DialogTitle>
              <p className="text-sm text-muted-foreground">{selectedHackathon?.hackathonName}</p>
            </DialogHeader>
            <TeamSelector onTeamCreatedOrJoined={handleTeamAction} />
          </DialogContent>
        </Dialog>

        {/* Join Team by Code Modal */}
        <Dialog open={showJoinTeamModal} onOpenChange={(open) => {
          setShowJoinTeamModal(open);
          if (!open) {
            setJoinCode('');
            setJoinError(null);
          }
        }}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Join Team</DialogTitle>
              <p className="text-sm text-muted-foreground">Enter your team code to join</p>
            </DialogHeader>

            {joinError && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-3">
                  <p className="text-sm text-destructive">{joinError}</p>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleJoinTeamByCode} className="space-y-4">
              <div>
                <label htmlFor="joinCode" className="block text-sm font-medium text-foreground mb-2">
                  Team Code
                </label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-center tracking-wider"
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  disabled={joinLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-character code shared by your team leader
                </p>
              </div>

              <Button
                type="submit"
                disabled={joinLoading || !joinCode.trim()}
                className="w-full"
              >
                {joinLoading ? 'Joining...' : 'Join Team'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ConsoleLayout>
  );
};

// Hackathon Card Component
const HackathonCard = ({ hackathon, onJoinCreateTeam, getStatusBadgeVariant, getRoleBadgeVariant }) => {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
              {hackathon.hackathonName}
            </h3>
            <p className="text-sm text-muted-foreground">{hackathon.dates}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(hackathon.status)}>
            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
          </Badge>
        </div>

        {/* Team Info */}
        {hackathon.team ? (
          <Card className="bg-muted/20 border-border/20">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hackathon.team.role === 'leader' 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}>
                  {hackathon.team.role === 'leader' ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{hackathon.team.name}</p>
                  <Badge variant={getRoleBadgeVariant(hackathon.team.role)} className="text-xs">
                    {hackathon.team.role === 'leader' ? 'Team Leader' : 'Member'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/10 border-dashed border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">No team assigned</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1" size="sm">
            <Link to={`/hackathon/${hackathon.hackathonId}/dashboard`}>
              View Dashboard
            </Link>
          </Button>
          
          {hackathon.status === 'upcoming' && (
            <>
              {hackathon.team ? (
                <Button variant="destructive" size="sm">
                  Leave Team
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onJoinCreateTeam(hackathon)}
                >
                  Join Team
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserHackathonConsole;