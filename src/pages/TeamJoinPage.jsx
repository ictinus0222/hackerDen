import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTeam } from '../hooks/useTeam.jsx';

const TeamJoinPage = () => {
  const [formData, setFormData] = useState({
    joinCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { joinTeam } = useTeam();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.joinCode.trim()) {
      newErrors.joinCode = 'Join code is required';
    } else if (formData.joinCode.trim().length !== 6) {
      newErrors.joinCode = 'Join code must be exactly 6 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.joinCode.trim().toUpperCase())) {
      newErrors.joinCode = 'Join code can only contain letters and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert to uppercase and limit to 6 characters
    const formattedValue = value.toUpperCase().slice(0, 6);
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await joinTeam(formData.joinCode);
      // Redirect to dashboard after successful join
      navigate('/dashboard');
    } catch (error) {
      console.error('Team join error:', error);
      setErrors({ 
        submit: error.message || 'Failed to join team. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join a Team
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the join code shared by your team
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}
          
          <div>
            <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700">
              Join Code
            </label>
            <input
              id="joinCode"
              name="joinCode"
              type="text"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                errors.joinCode ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm font-mono text-center text-lg tracking-wider`}
              placeholder="ABC123"
              value={formData.joinCode}
              onChange={handleChange}
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.joinCode && (
              <p className="mt-1 text-sm text-red-600">{errors.joinCode}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-character code provided by your team
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining Team...' : 'Join Team'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamJoinPage;