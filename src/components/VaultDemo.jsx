import { useState } from 'react';

// SVG Icons
const KeyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UserGroupIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VaultDemo = () => {
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      title: "Team Leader Creates Secret",
      description: "Team leaders can securely store API keys, passwords, and other credentials",
      icon: <KeyIcon className="h-8 w-8 text-green-400" />,
      content: (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Secret Name</label>
              <div className="bg-gray-700 rounded px-3 py-2 text-white">OpenAI API Key</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Secret Value</label>
              <div className="bg-gray-700 rounded px-3 py-2 text-green-300 font-mono">sk-1234567890abcdef...</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <div className="bg-gray-700 rounded px-3 py-2 text-white">API key for our AI chatbot feature</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Team Member Requests Access",
      description: "Team members can request access to specific secrets with justification",
      icon: <UserGroupIcon className="h-8 w-8 text-blue-400" />,
      content: (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">OpenAI API Key</h4>
              <span className="text-sm text-gray-400">Created by Team Leader</span>
            </div>
            <div className="bg-gray-900 rounded p-3 border border-gray-600">
              <label className="block text-sm text-gray-400 mb-2">Access Justification</label>
              <div className="text-gray-300 text-sm">
                "I need this API key to implement the natural language processing feature for our project. 
                I'll be working on the chatbot integration this afternoon."
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Leader Reviews Request",
      description: "Team leaders receive notifications and can approve or deny access requests",
      icon: <ClockIcon className="h-8 w-8 text-yellow-400" />,
      content: (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium">Access Request for "OpenAI API Key"</h4>
                <p className="text-gray-400 text-sm">Requested by John Doe</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  Approve
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  Deny
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded p-3 border border-gray-600">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Justification:</h5>
              <p className="text-gray-400 text-sm">
                "I need this API key to implement the natural language processing feature for our project. 
                I'll be working on the chatbot integration this afternoon."
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Requested 5 minutes ago
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Secure Access Granted",
      description: "Approved users can view secret values with automatic expiration and audit tracking",
      icon: <CheckCircleIcon className="h-8 w-8 text-green-400" />,
      content: (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">OpenAI API Key</h4>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm">Access Granted</span>
                </div>
                <button className="p-2 text-green-400 hover:text-green-300">
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded p-3 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Secret Value:</span>
                <button className="text-xs text-green-400 hover:text-green-300">Copy</button>
              </div>
              <code className="text-green-300 font-mono text-sm break-all">
                sk-1234567890abcdefghijklmnopqrstuvwxyz
              </code>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Access expires in 1h 45m</span>
              <span>Accessed 3 times</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const features = [
    {
      icon: <ShieldCheckIcon className="h-6 w-6 text-green-400" />,
      title: "Encrypted Storage",
      description: "All secrets are encrypted before storage with team-specific keys"
    },
    {
      icon: <UserGroupIcon className="h-6 w-6 text-blue-400" />,
      title: "Permission-Based Access",
      description: "Role-based access control with approval workflows"
    },
    {
      icon: <ClockIcon className="h-6 w-6 text-yellow-400" />,
      title: "Temporary Access",
      description: "Approved access automatically expires for enhanced security"
    },
    {
      icon: <EyeIcon className="h-6 w-6 text-purple-400" />,
      title: "Audit Trail",
      description: "Complete tracking of who accessed what and when"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <KeyIcon className="h-12 w-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Team Vault</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Secure credential management for hackathon teams. Store API keys, passwords, and sensitive data 
          with permission-based access control and audit tracking.
        </p>
      </div>

      {/* Interactive Demo */}
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">How It Works</h2>
        
        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {demoSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeStep === index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                }`}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              {demoSteps[activeStep].title}
            </h3>
            <p className="text-gray-400">
              {demoSteps[activeStep].description}
            </p>
          </div>
          
          <div className="mb-6">
            {demoSteps[activeStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(demoSteps.length - 1, activeStep + 1))}
              disabled={activeStep === demoSteps.length - 1}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              {feature.icon}
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            </div>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-2">Security Notice</h3>
            <p className="text-yellow-200 text-sm">
              This demo uses simplified encryption for demonstration purposes. In production environments, 
              the Team Vault should be configured with enterprise-grade encryption, proper key management, 
              and additional security measures as outlined in the documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultDemo;