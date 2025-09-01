import { Client, Account, Databases, Query, ID } from 'appwrite';

// Validate environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '68903612000c89d5889b';

if (!APPWRITE_PROJECT_ID) {
  console.error('VITE_APPWRITE_PROJECT_ID is not defined. Please check your environment variables.');
}

const client = new Client();

// Set endpoint and project with better error handling
try {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
  
  console.log('✅ Appwrite client configured:', {
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID,
    databaseId: APPWRITE_DATABASE_ID
  });
} catch (error) {
  console.error('❌ Error configuring Appwrite client:', error);
}

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = APPWRITE_DATABASE_ID;

// Collection IDs
export const COLLECTIONS = {
  HACKATHONS: 'hackathons',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'team_members', 
  TASKS: 'tasks',
  MESSAGES: 'messages',
  VAULT_SECRETS: 'vault_secrets',
  VAULT_ACCESS_REQUESTS: 'vault_access_requests'
};

export { Query, ID };
export default client;