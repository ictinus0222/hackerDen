import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hackathonService } from '../services/hackathonService';
import { teamService } from '../services/teamService';
import ConsoleLayout from '../components/ConsoleLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateHackathonPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Hackathon Details, 2: Team Creation
  
  // Hackathon form data
  const [hackathonData, setHackathonData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    rules: ['Teams must have 2-5 members', 'All code must be original', 'Submissions due by end date']
  });

  // Team form data
  const [teamData, setTeamData] = useState({
    name: ''
  });

  const [createdHackathon, setCreatedHackathon] = useState(null);

  const handleHackathonSubmit = async (e) => {
    e.preventDefault();
    
    if (!hackathonData.name.trim() || !hackathonData.description.trim() || 
        !hackathonData.startDate || !hackathonData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(hackathonData.startDate) >= new Date(hackathonData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const hackathon = await hackathonService.createHackathon(hackathonData, user.$id, user.name);
      setCreatedHackathon(hackathon);
      setStep(2);
    } catch (err) {
      console.error('Failed to create hackathon:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamData.name.trim()) {
      setError('Please enter a team name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('User object:', user); // Debug: Check what's in the user object
      console.log('User name:', user.name); // Debug: Check the user name specifically
      
      const { team } = await teamService.createTeam(
        teamData.name, 
        user.$id, 
        createdHackathon.$id,
        user.name || user.email || 'Team Owner' // Fallback to email or default
      );

      // Navigate to the hackathon dashboard
      navigate(`/hackathon/${createdHackathon.$id}/dashboard`);
    } catch (err) {
      console.error('Failed to create team:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...hackathonData.rules];
    newRules[index] = value;
    setHackathonData({ ...hackathonData, rules: newRules });
  };

  const addRule = () => {
    setHackathonData({ 
      ...hackathonData, 
      rules: [...hackathonData.rules, ''] 
    });
  };

  const removeRule = (index) => {
    const newRules = hackathonData.rules.filter((_, i) => i !== index);
    setHackathonData({ ...hackathonData, rules: newRules });
  };

  if (loading) {
    return (
      <ConsoleLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message={step === 1 ? "Creating hackathon..." : "Creating team..."} />
        </div>
      </ConsoleLayout>
    );
  }

  return (
    <ConsoleLayout>
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-green-500 text-white' : 'bg-dark-primary text-dark-tertiary'
            }`}>
              {step > 1 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-bold">1</span>
              )}
            </div>
            <div className={`h-1 flex-1 rounded ${step > 1 ? 'bg-green-500' : 'bg-dark-primary'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-green-500 text-white' : 'bg-dark-primary text-dark-tertiary'
            }`}>
              <span className="text-sm font-bold">2</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-white' : 'text-dark-tertiary'}>Hackathon Details</span>
            <span className={step >= 2 ? 'text-white' : 'text-dark-tertiary'}>Create Team</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card-enhanced p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Create New Hackathon</h1>
              <p className="text-dark-tertiary">Set up your hackathon details and rules</p>
            </div>

            <form onSubmit={handleHackathonSubmit} className="space-y-6">
              {/* Hackathon Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Hackathon Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={hackathonData.name}
                  onChange={(e) => setHackathonData({ ...hackathonData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background-sidebar border border-dark-primary/20 rounded-xl text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter hackathon name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={hackathonData.description}
                  onChange={(e) => setHackathonData({ ...hackathonData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-background-sidebar border border-dark-primary/20 rounded-xl text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Describe your hackathon theme and goals"
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-white mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={hackathonData.startDate}
                    onChange={(e) => setHackathonData({ ...hackathonData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-background-sidebar border border-dark-primary/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-white mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={hackathonData.endDate}
                    onChange={(e) => setHackathonData({ ...hackathonData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-background-sidebar border border-dark-primary/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white">
                    Rules & Guidelines
                  </label>
                  <button
                    type="button"
                    onClick={addRule}
                    className="px-3 py-1 text-sm bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200 border border-green-500/30"
                  >
                    Add Rule
                  </button>
                </div>
                <div className="space-y-3">
                  {hackathonData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-background-sidebar border border-dark-primary/20 rounded-lg text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter rule"
                      />
                      {hackathonData.rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/console')}
                  className="px-6 py-3 text-dark-secondary hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  Create Hackathon
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="card-enhanced p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Create Your Team</h1>
              <p className="text-dark-tertiary">
                Great! Your hackathon "{createdHackathon?.name}" has been created. 
                Now let's create your team.
              </p>
            </div>

            <form onSubmit={handleTeamSubmit} className="space-y-6">
              {/* Team Name */}
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-white mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background-sidebar border border-dark-primary/20 rounded-xl text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your team name"
                  required
                />
                <p className="mt-2 text-sm text-dark-tertiary">
                  You will be automatically assigned as the Team Leader
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-300 mb-1">What happens next?</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• Your team will be created with a unique join code</li>
                      <li>• You'll be taken to the hackathon dashboard</li>
                      <li>• You can invite team members using the join code</li>
                      <li>• Start collaborating on tasks and chat</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-dark-secondary hover:text-white transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  Create Team & Continue
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
};

export default CreateHackathonPage;