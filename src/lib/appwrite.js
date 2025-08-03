import { Client, Account, Databases, Query, ID } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Collection IDs
export const COLLECTIONS = {
  TEAMS: 'teams',
  TEAM_MEMBERS: 'team_members', 
  TASKS: 'tasks',
  MESSAGES: 'messages'
};

export { Query, ID };
export default client;