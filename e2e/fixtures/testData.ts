export const testProject = {
  projectName: 'Test Hackathon Project',
  oneLineIdea: 'A revolutionary app that changes everything',
  teamMembers: [
    { name: 'Alice Johnson', role: 'Frontend Developer' },
    { name: 'Bob Smith', role: 'Backend Developer' },
    { name: 'Carol Davis', role: 'Designer' },
  ],
  deadlines: {
    hackingEnds: '2025-01-30T18:00:00.000Z',
    submissionDeadline: '2025-01-30T20:00:00.000Z',
    presentationTime: '2025-01-31T10:00:00.000Z',
  },
  judgingCriteria: [
    { name: 'Business Potential', description: 'Market viability and scalability' },
    { name: 'User Experience', description: 'Ease of use and design quality' },
    { name: 'Technical Innovation', description: 'Novel technical approach' },
    { name: 'Completion', description: 'How complete is the solution' },
  ],
};

export const testTasks = [
  { title: 'Set up project structure', assignedTo: 'Alice Johnson' },
  { title: 'Design user interface', assignedTo: 'Carol Davis' },
  { title: 'Implement authentication', assignedTo: 'Bob Smith' },
  { title: 'Create database schema', assignedTo: 'Bob Smith' },
  { title: 'Build frontend components', assignedTo: 'Alice Johnson' },
];

export const testPivots = [
  {
    description: 'Changed from mobile app to web application',
    reason: 'Web platform allows for faster development and broader accessibility',
  },
  {
    description: 'Switched from real-time chat to async messaging',
    reason: 'Simpler implementation and better fits user workflow',
  },
];

export const testSubmission = {
  githubUrl: 'https://github.com/testteam/hackathon-project',
  presentationUrl: 'https://docs.google.com/presentation/d/test-presentation',
  demoVideoUrl: 'https://youtube.com/watch?v=test-demo',
};