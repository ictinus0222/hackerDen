/**
 * @fileoverview Appwrite client configuration and initialization
 * Provides configured Appwrite services for authentication, database, and storage operations
 */

import { Client, Account, Databases, Storage, Query, ID } from 'appwrite';

// Validate environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Validate required environment variables
const validateConfig = () => {
  const missingVars = [];
  
  if (!APPWRITE_PROJECT_ID) {
    missingVars.push('VITE_APPWRITE_PROJECT_ID');
  }
  
  if (!APPWRITE_DATABASE_ID) {
    missingVars.push('VITE_APPWRITE_DATABASE_ID');
  }
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`;
    console.error('❌', errorMessage);
    throw new Error(errorMessage);
  }
};

// Initialize client with validation
const initializeClient = () => {
  try {
    validateConfig();
    
    const client = new Client();
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    console.log('✅ Appwrite client configured:', {
      endpoint: APPWRITE_ENDPOINT,
      projectId: APPWRITE_PROJECT_ID,
      databaseId: APPWRITE_DATABASE_ID
    });
    
    return client;
  } catch (error) {
    console.error('❌ Error configuring Appwrite client:', error);
    throw error;
  }
};

const client = initializeClient();

/** @type {import('appwrite').Account} */
export const account = new Account(client);

/** @type {import('appwrite').Databases} */
export const databases = new Databases(client);

/** @type {import('appwrite').Storage} */
export const storage = new Storage(client);

/** @type {string} */
export const DATABASE_ID = APPWRITE_DATABASE_ID;

// Storage Bucket IDs
export const STORAGE_BUCKETS = {
  TEAM_FILES: 'team-files',
  CUSTOM_EMOJI: 'custom-emoji'
};

/**
 * Get storage bucket ID with fallback to TEAM_FILES
 * @param {string} bucketType - The bucket type key from STORAGE_BUCKETS
 * @returns {string} The bucket ID
 */
export const getBucketId = (bucketType) => {
  return STORAGE_BUCKETS[bucketType] || STORAGE_BUCKETS.TEAM_FILES;
};

/**
 * Check if Appwrite is properly configured with required environment variables
 * @returns {boolean} True if all required config is present
 */
export const isAppwriteConfigured = () => {
  return !!(APPWRITE_PROJECT_ID && APPWRITE_DATABASE_ID);
};

// Collection IDs
export const COLLECTIONS = {
  HACKATHONS: 'hackathons',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'team_members',
  TASKS: 'tasks',
  MESSAGES: 'messages',
  VAULT_SECRETS: 'vault_secrets',
  VAULT_ACCESS_REQUESTS: 'vault_access_requests',
  // Collaborative Documents collections
  DOCUMENTS: 'documents',
  DOCUMENT_VERSIONS: 'document_versions',
  DOCUMENT_OPERATIONS: 'document_operations',
  USER_PRESENCE: 'user_presence',
  // Enhancement collections
  FILES: 'files',
  FILE_ANNOTATIONS: 'file_annotations',
  IDEAS: 'ideas',
  IDEA_VOTES: 'idea_votes',
  USER_POINTS: 'user_points',
  ACHIEVEMENTS: 'achievements',
  SUBMISSIONS: 'submissions',
  POLLS: 'polls',
  POLL_VOTES: 'poll_votes',
  REACTIONS: 'reactions',
  // Whiteboard collection
  WHITEBOARD_OBJECTS: 'whiteboard_objects'
};

export { Query, ID };
export default client;