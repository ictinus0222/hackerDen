#!/usr/bin/env node

/**
 * Team Vault Setup Script
 * 
 * This script helps set up the required Appwrite collections for the Team Vault feature.
 * Run this script after setting up your basic HackerDen collections.
 */

import { Client, Databases, Permission, Role, ID } from 'appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const client = new Client();
const databases = new Databases(client);

// Configuration
const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Server API key needed for collection creation
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;

// Validate environment variables
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !DATABASE_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_APPWRITE_ENDPOINT:', APPWRITE_ENDPOINT ? '✓' : '❌');
  console.error('   VITE_APPWRITE_PROJECT_ID:', APPWRITE_PROJECT_ID ? '✓' : '❌');
  console.error('   VITE_APPWRITE_DATABASE_ID:', DATABASE_ID ? '✓' : '❌');
  console.error('   APPWRITE_API_KEY:', APPWRITE_API_KEY ? '✓' : '❌ (Server API key required)');
  process.exit(1);
}

// Configure client
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

// Collection configurations
const VAULT_COLLECTIONS = {
  VAULT_SECRETS: {
    id: 'vault_secrets',
    name: 'Vault Secrets',
    attributes: [
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'hackathonId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'encryptedValue', type: 'string', size: 10000, required: true },
      { key: 'createdBy', type: 'string', size: 255, required: true },
      { key: 'createdByName', type: 'string', size: 255, required: true },
      { key: 'accessCount', type: 'integer', required: false, default: 0 },
      { key: 'lastAccessedAt', type: 'datetime', required: false },
      { key: 'lastAccessedBy', type: 'string', size: 255, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'teamId_hackathonId', type: 'key', attributes: ['teamId', 'hackathonId'] },
      { key: 'createdBy', type: 'key', attributes: ['createdBy'] },
      { key: 'createdAt', type: 'key', attributes: ['createdAt'], orders: ['DESC'] }
    ]
  },
  VAULT_ACCESS_REQUESTS: {
    id: 'vault_access_requests',
    name: 'Vault Access Requests',
    attributes: [
      { key: 'secretId', type: 'string', size: 255, required: true },
      { key: 'requestedBy', type: 'string', size: 255, required: true },
      { key: 'requestedByName', type: 'string', size: 255, required: true },
      { key: 'justification', type: 'string', size: 2000, required: true },
      { key: 'status', type: 'string', size: 50, required: true }, // pending, approved, denied
      { key: 'handledBy', type: 'string', size: 255, required: false },
      { key: 'handledByName', type: 'string', size: 255, required: false },
      { key: 'requestedAt', type: 'datetime', required: true },
      { key: 'handledAt', type: 'datetime', required: false },
      { key: 'accessExpiresAt', type: 'datetime', required: false }
    ],
    indexes: [
      { key: 'secretId', type: 'key', attributes: ['secretId'] },
      { key: 'requestedBy', type: 'key', attributes: ['requestedBy'] },
      { key: 'status', type: 'key', attributes: ['status'] },
      { key: 'requestedAt', type: 'key', attributes: ['requestedAt'], orders: ['DESC'] }
    ]
  }
};

async function createCollection(collectionConfig) {
  const { id, name, attributes, indexes } = collectionConfig;
  
  try {
    console.log(`📦 Creating collection: ${name} (${id})`);
    
    // Create collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      id,
      name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );
    
    console.log(`✅ Collection created: ${name}`);
    
    // Create attributes
    for (const attr of attributes) {
      try {
        console.log(`  📝 Creating attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            id,
            attr.key,
            attr.size,
            attr.required,
            attr.default
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            id,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            id,
            attr.key,
            attr.required,
            attr.default
          );
        }
        
        console.log(`    ✅ Attribute created: ${attr.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`    ⚠️  Attribute already exists: ${attr.key}`);
        } else {
          console.error(`    ❌ Failed to create attribute ${attr.key}:`, error.message);
        }
      }
    }
    
    // Wait a bit for attributes to be ready
    console.log('  ⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create indexes
    for (const index of indexes) {
      try {
        console.log(`  🔍 Creating index: ${index.key}`);
        
        await databases.createIndex(
          DATABASE_ID,
          id,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        
        console.log(`    ✅ Index created: ${index.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`    ⚠️  Index already exists: ${index.key}`);
        } else {
          console.error(`    ❌ Failed to create index ${index.key}:`, error.message);
        }
      }
    }
    
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Collection already exists: ${name}`);
      return null;
    } else {
      console.error(`❌ Failed to create collection ${name}:`, error.message);
      throw error;
    }
  }
}

async function setupVaultCollections() {
  console.log('🚀 Setting up Team Vault collections...\n');
  
  try {
    // Create vault secrets collection
    await createCollection(VAULT_COLLECTIONS.VAULT_SECRETS);
    console.log('');
    
    // Create vault access requests collection
    await createCollection(VAULT_COLLECTIONS.VAULT_ACCESS_REQUESTS);
    console.log('');
    
    console.log('🎉 Team Vault setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify collections in your Appwrite console');
    console.log('2. Adjust permissions if needed for your security requirements');
    console.log('3. Test the vault functionality in your application');
    console.log('4. Review the documentation in docs/TEAM_VAULT_FEATURE.md');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupVaultCollections();