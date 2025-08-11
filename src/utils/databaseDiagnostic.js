import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';

export const databaseDiagnostic = {
  // Check what attributes exist in the tasks collection
  async checkTasksSchema() {
    try {
      // Try to get a sample task to see its structure
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TASKS,
        []
      );
      
      if (response.documents.length > 0) {
        const sampleTask = response.documents[0];
        console.log('=== TASKS COLLECTION SCHEMA DIAGNOSTIC ===');
        console.log('Sample task structure:', sampleTask);
        console.log('Available attributes:', Object.keys(sampleTask));
        
        // Check for the specific fields we need
        const requiredFields = ['assignedTo', 'assigned_to', 'createdBy', 'created_by'];
        const missingFields = requiredFields.filter(field => !(field in sampleTask));
        
        if (missingFields.length > 0) {
          console.warn('Missing fields in tasks collection:', missingFields);
          console.log('You need to add these attributes to your Appwrite tasks collection:');
          missingFields.forEach(field => {
            console.log(`- ${field} (String attribute)`);
          });
        } else {
          console.log('✅ All required fields are present in tasks collection');
        }
        
        return {
          hasData: true,
          sampleTask,
          missingFields,
          availableFields: Object.keys(sampleTask)
        };
      } else {
        console.log('No tasks found in collection - cannot check schema');
        return {
          hasData: false,
          missingFields: [],
          availableFields: []
        };
      }
    } catch (error) {
      console.error('Error checking tasks schema:', error);
      return {
        error: error.message,
        hasData: false,
        missingFields: [],
        availableFields: []
      };
    }
  },

  // Check team members collection
  async checkTeamMembersSchema() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_MEMBERS,
        []
      );
      
      if (response.documents.length > 0) {
        const sampleMember = response.documents[0];
        console.log('=== TEAM_MEMBERS COLLECTION SCHEMA ===');
        console.log('Sample team member structure:', sampleMember);
        console.log('Available attributes:', Object.keys(sampleMember));
        
        return {
          hasData: true,
          sampleMember,
          availableFields: Object.keys(sampleMember)
        };
      } else {
        console.log('No team members found in collection');
        return {
          hasData: false,
          availableFields: []
        };
      }
    } catch (error) {
      console.error('Error checking team members schema:', error);
      return {
        error: error.message,
        hasData: false,
        availableFields: []
      };
    }
  },

  // Run full diagnostic
  async runFullDiagnostic() {
    console.log('🔍 Running database diagnostic...');
    
    const tasksResult = await this.checkTasksSchema();
    const membersResult = await this.checkTeamMembersSchema();
    
    return {
      tasks: tasksResult,
      members: membersResult
    };
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.databaseDiagnostic = databaseDiagnostic;
}