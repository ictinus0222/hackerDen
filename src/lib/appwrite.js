import { Client, Account, Databases, Query, ID } from 'appwrite';

// Validate environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

if (!APPWRITE_ENDPOINT) {
  console.error('VITE_APPWRITE_ENDPOINT is not defined. Please check your environment variables.');
}

if (!APPWRITE_PROJECT_ID) {
  console.error('VITE_APPWRITE_PROJECT_ID is not defined. Please check your environment variables.');
}

if (!APPWRITE_DATABASE_ID) {
  console.error('VITE_APPWRITE_DATABASE_ID is not defined. Please check your environment variables.');
}

const client = new Client();

// Only set endpoint and project if they exist
if (APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = APPWRITE_DATABASE_ID;

// Collection IDs
export const COLLECTIONS = {
  TEAMS: 'teams',
  TEAM_MEMBERS: 'team_members', 
  TASKS: 'tasks',
  MESSAGES: 'messages'
};

export { Query, ID };
export default client;