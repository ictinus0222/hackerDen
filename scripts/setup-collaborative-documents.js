#!/usr/bin/env node

import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);

// Configuration
const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || '68903612000c89d5889b';

if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_APPWRITE_PROJECT_ID:', APPWRITE_PROJECT_ID ? '✅' : '❌');
  console.error('   APPWRITE_API_KEY:', APPWRITE_API_KEY ? '✅' : '❌');
  process.exit(1);
}

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

// Collection IDs
const COLLECTIONS = {
  DOCUMENTS: 'documents',
  DOCUMENT_VERSIONS: 'document_versions',
  DOCUMENT_OPERATIONS: 'document_operations',
  USER_PRESENCE: 'user_presence'
};

async function createDocumentsCollection() {
  console.log('📄 Creating documents collection...');
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.DOCUMENTS,
      'Documents',
      [
        // Team-based permissions - any team member can read, create, update
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'teamId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'hackathonId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'title', 500, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'content', 1000000, false, ''); // 1MB max
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'contentVersion', true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'createdBy', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'createdByName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'lastModifiedBy', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'lastModifiedByName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'tags', 2000, false, '[]'); // JSON array
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'permissions', 5000, false, '{}'); // JSON object
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'collaborators', 2000, false, '[]'); // JSON array
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'isArchived', false, false);

    // Create indexes for efficient queries
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'teamId_hackathonId', 'key', ['teamId', 'hackathonId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'teamId_title', 'key', ['teamId', 'title']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'createdBy', 'key', ['createdBy']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'lastModifiedBy', 'key', ['lastModifiedBy']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENTS, 'isArchived', 'key', ['isArchived']);

    console.log('✅ Documents collection created successfully');
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Documents collection already exists');
    } else {
      console.error('❌ Error creating documents collection:', error);
      throw error;
    }
  }
}

async function createDocumentVersionsCollection() {
  console.log('📚 Creating document versions collection...');
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.DOCUMENT_VERSIONS,
      'Document Versions',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'documentId', 255, true);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'versionNumber', true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'content', 1000000, true); // 1MB max
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'contentHash', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'createdBy', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'createdByName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'changesSummary', 1000, false, '');
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'isSnapshot', false, false);

    // Create indexes
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'documentId_version', 'key', ['documentId', 'versionNumber']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'documentId_created', 'key', ['documentId', '$createdAt']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'createdBy', 'key', ['createdBy']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_VERSIONS, 'isSnapshot', 'key', ['isSnapshot']);

    console.log('✅ Document versions collection created successfully');
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Document versions collection already exists');
    } else {
      console.error('❌ Error creating document versions collection:', error);
      throw error;
    }
  }
}

async function createDocumentOperationsCollection() {
  console.log('⚡ Creating document operations collection...');
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.DOCUMENT_OPERATIONS,
      'Document Operations',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'documentId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'userName', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'operationType', 50, true); // insert, delete, retain
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'position', true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'content', 10000, false, '');
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'length', false, 0);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'version', true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'clientId', 255, true);

    // Create indexes for real-time queries
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'documentId_version', 'key', ['documentId', 'version']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'documentId_created', 'key', ['documentId', '$createdAt']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'userId', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.DOCUMENT_OPERATIONS, 'clientId', 'key', ['clientId']);

    console.log('✅ Document operations collection created successfully');
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  Document operations collection already exists');
    } else {
      console.error('❌ Error creating document operations collection:', error);
      throw error;
    }
  }
}

async function createUserPresenceCollection() {
  console.log('👥 Creating user presence collection...');
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.USER_PRESENCE,
      'User Presence',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'documentId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'userId', 255, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'userName', 255, true);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'cursorPosition', false, 0);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'selectionStart', false, 0);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'selectionEnd', false, 0);
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'isTyping', false, false);
    await databases.createDatetimeAttribute(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'lastSeen', true);

    // Create indexes
    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'documentId_userId', 'unique', ['documentId', 'userId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'documentId', 'key', ['documentId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'userId', 'key', ['userId']);
    await databases.createIndex(DATABASE_ID, COLLECTIONS.USER_PRESENCE, 'lastSeen', 'key', ['lastSeen']);

    console.log('✅ User presence collection created successfully');
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  User presence collection already exists');
    } else {
      console.error('❌ Error creating user presence collection:', error);
      throw error;
    }
  }
}

async function setupCollections() {
  console.log('🚀 Setting up collaborative documents collections...\n');
  
  try {
    await createDocumentsCollection();
    await createDocumentVersionsCollection();
    await createDocumentOperationsCollection();
    await createUserPresenceCollection();
    
    console.log('\n✅ All collections created successfully!');
    console.log('\n📋 Collection IDs to add to appwrite.js:');
    console.log('DOCUMENTS:', COLLECTIONS.DOCUMENTS);
    console.log('DOCUMENT_VERSIONS:', COLLECTIONS.DOCUMENT_VERSIONS);
    console.log('DOCUMENT_OPERATIONS:', COLLECTIONS.DOCUMENT_OPERATIONS);
    console.log('USER_PRESENCE:', COLLECTIONS.USER_PRESENCE);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupCollections();