import React from 'react';
import SimpleCollaborativeDocument from '../components/SimpleCollaborativeDocument';

const SimpleDocumentPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <SimpleCollaborativeDocument />
      </div>
    </div>
  );
};

export default SimpleDocumentPage;