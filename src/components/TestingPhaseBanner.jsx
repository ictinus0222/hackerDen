import { useState } from 'react';
import { Construction, X, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import ContactForm from './ContactForm';

const TestingPhaseBanner = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      <div className={`bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Construction className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Testing Phase
                </p>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  HackerDen is currently in limited testing
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContactForm(true)}
                className="text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Developer
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-2xl max-w-md w-full">
            <ContactForm onClose={() => setShowContactForm(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default TestingPhaseBanner;
