/**
 * @fileoverview Achievement Notification Component
 * Displays celebratory toast notifications when users unlock achievements
 */

import { toast } from 'sonner';
import { Trophy, Star, Zap, Target, Users, FileText, MessageCircle, ThumbsUp } from 'lucide-react';

// Achievement type to icon mapping
const ACHIEVEMENT_ICONS = {
  first_task: Target,
  task_master: Trophy,
  communicator: MessageCircle,
  file_sharer: FileText,
  idea_generator: Zap,
  team_player: ThumbsUp,
  hundred_club: Star,
  five_hundred_club: Trophy
};

/**
 * Show achievement unlock notification
 * @param {Object} achievement - The achievement object
 * @param {string} achievement.achievementName - Display name of the achievement
 * @param {string} achievement.description - Achievement description
 * @param {string} achievement.achievementType - Achievement type for icon selection
 * @param {number} achievement.pointsAwarded - Points awarded for this achievement
 */
export const showAchievementNotification = (achievement) => {
  addAchievementStyles();
  const IconComponent = ACHIEVEMENT_ICONS[achievement.achievementType] || Trophy;
  
  toast.success(
    <div className="flex items-center gap-3 p-2">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm text-foreground truncate">
            🎉 Achievement Unlocked!
          </h4>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
            +{achievement.pointsAwarded} pts
          </span>
        </div>
        <p className="font-medium text-sm text-foreground mb-1">
          {achievement.achievementName}
        </p>
        <p className="text-xs text-muted-foreground">
          {achievement.description}
        </p>
      </div>
    </div>,
    {
      duration: 6000,
      className: 'achievement-toast',
      style: {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    }
  );
};

/**
 * Show celebration effect for major milestones
 * @param {Object} achievement - The achievement object
 */
export const showCelebrationEffect = (achievement) => {
  if (typeof document === 'undefined') return; // SSR safety
  
  addAchievementStyles();
  
  // Major achievements that deserve extra celebration
  const majorAchievements = ['hundred_club', 'five_hundred_club', 'task_master'];
  
  if (majorAchievements.includes(achievement.achievementType)) {
    // Create confetti effect using CSS animations
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
    
    // Create multiple confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-sm animate-bounce';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      
      // Add falling animation
      confetti.style.animation = `
        confetti-fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s forwards,
        confetti-spin ${Math.random() * 2 + 1}s linear infinite
      `;
      
      confettiContainer.appendChild(confetti);
    }
    
    document.body.appendChild(confettiContainer);
    
    // Remove confetti after animation
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 5000);
  }
};

/**
 * Show multiple achievements notification for bulk unlocks
 * @param {Array} achievements - Array of achievement objects
 */
export const showMultipleAchievementsNotification = (achievements) => {
  if (achievements.length === 0) return;
  
  addAchievementStyles();
  
  if (achievements.length === 1) {
    showAchievementNotification(achievements[0]);
    showCelebrationEffect(achievements[0]);
    return;
  }
  
  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.pointsAwarded, 0);
  
  toast.success(
    <div className="flex items-center gap-3 p-2">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
        <Trophy className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm text-foreground">
            🎊 {achievements.length} Achievements Unlocked!
          </h4>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
            +{totalPoints} pts
          </span>
        </div>
        <div className="space-y-1">
          {achievements.slice(0, 3).map((achievement, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              • {achievement.achievementName}
            </p>
          ))}
          {achievements.length > 3 && (
            <p className="text-xs text-muted-foreground font-medium">
              +{achievements.length - 3} more achievements...
            </p>
          )}
        </div>
      </div>
    </div>,
    {
      duration: 8000,
      className: 'multiple-achievements-toast',
      style: {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    }
  );
  
  // Show celebration for multiple achievements
  showCelebrationEffect({ achievementType: 'multiple' });
};

/**
 * Add CSS animations for confetti effect
 */
const addAchievementStyles = () => {
  if (typeof document === 'undefined') return; // SSR safety
  
  if (!document.head.querySelector('#achievement-styles')) {
    const style = document.createElement('style');
    style.id = 'achievement-styles';
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
      
      @keyframes confetti-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      
      .achievement-toast {
        animation: achievement-slide-in 0.3s ease-out;
      }
      
      .multiple-achievements-toast {
        animation: achievement-slide-in 0.3s ease-out;
      }
      
      @keyframes achievement-slide-in {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

export default {
  showAchievementNotification,
  showCelebrationEffect,
  showMultipleAchievementsNotification
};