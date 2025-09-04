#!/usr/bin/env node

/**
 * HackerDen Enhancement Setup Script
 * 
 * This script sets up the required Appwrite collections and storage buckets
 * for the HackerDen enhancement features.
 * 
 * Usage: node scripts/setup-enhancements.js
 */

import { Client, Databases, Storage, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);
const storage = new Storage(client);

// Configuration
const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Server API key needed for setup
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;

if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY || !DATABASE_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_APPWRITE_PROJECT_ID');
  console.error('   - APPWRITE_API_KEY (server key for setup)');
  console.error('   - VITE_APPWRITE_DATABASE_ID');
  process.exit(1);
}

// Configure client
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

// Collection and bucket definitions
const COLLECTIONS = {
  FILES: {
    id: 'files',
    name: 'Files',
    attributes: [
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'uploadedBy', type: 'string', size: 255, required: true },
      { key: 'fileName', type: 'string', size: 255, required: true },
      { key: 'fileType', type: 'string', size: 100, required: true },
      { key: 'fileSize', type: 'integer', required: true },
      { key: 'storageId', type: 'string', size: 255, required: true },
      { key: 'previewUrl', type: 'string', size: 500, required: false },
      { key: 'annotationCount', type: 'integer', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'teamId_idx', type: 'key', attributes: ['teamId'] },
      { key: 'uploadedBy_idx', type: 'key', attributes: ['uploadedBy'] },
      { key: 'createdAt_idx', type: 'key', attributes: ['createdAt'], orders: ['desc'] }
    ]
  },
  FILE_ANNOTATIONS: {
    id: 'file_annotations',
    name: 'File Annotations',
    attributes: [
      { key: 'fileId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 1000, required: true },
      { key: 'position', type: 'string', size: 500, required: true }, // JSON string
      { key: 'type', type: 'string', size: 50, required: true, default: 'point' },
      { key: 'createdAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'fileId_idx', type: 'key', attributes: ['fileId'] },
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  IDEAS: {
    id: 'ideas',
    name: 'Ideas',
    attributes: [
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'hackathonId', type: 'string', size: 255, required: true },
      { key: 'createdBy', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'tags', type: 'string', size: 1000, required: false, array: true },
      { key: 'status', type: 'string', size: 50, required: true, default: 'submitted' },
      { key: 'voteCount', type: 'integer', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'teamId_idx', type: 'key', attributes: ['teamId'] },
      { key: 'hackathonId_idx', type: 'key', attributes: ['hackathonId'] },
      { key: 'createdBy_idx', type: 'key', attributes: ['createdBy'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'voteCount_idx', type: 'key', attributes: ['voteCount'], orders: ['desc'] }
    ]
  },
  IDEA_VOTES: {
    id: 'idea_votes',
    name: 'Idea Votes',
    attributes: [
      { key: 'ideaId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'createdAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'ideaId_idx', type: 'key', attributes: ['ideaId'] },
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'unique_vote_idx', type: 'unique', attributes: ['ideaId', 'userId'] }
    ]
  },
  USER_POINTS: {
    id: 'user_points',
    name: 'User Points',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'totalPoints', type: 'integer', required: true, default: 0 },
      { key: 'pointsBreakdown', type: 'string', size: 2000, required: true }, // JSON string
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'teamId_idx', type: 'key', attributes: ['teamId'] },
      { key: 'totalPoints_idx', type: 'key', attributes: ['totalPoints'], orders: ['desc'] },
      { key: 'unique_user_team_idx', type: 'unique', attributes: ['userId', 'teamId'] }
    ]
  },
  ACHIEVEMENTS: {
    id: 'achievements',
    name: 'Achievements',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'achievementType', type: 'string', size: 100, required: true },
      { key: 'achievementName', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'iconUrl', type: 'string', size: 500, required: false },
      { key: 'pointsAwarded', type: 'integer', required: true },
      { key: 'unlockedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'achievementType_idx', type: 'key', attributes: ['achievementType'] },
      { key: 'unlockedAt_idx', type: 'key', attributes: ['unlockedAt'], orders: ['desc'] }
    ]
  },
  SUBMISSIONS: {
    id: 'submissions',
    name: 'Submissions',
    attributes: [
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 255, required: false },
      { key: 'description', type: 'string', size: 5000, required: false },
      { key: 'techStack', type: 'string', size: 1000, required: false, array: true },
      { key: 'challenges', type: 'string', size: 2000, required: false },
      { key: 'accomplishments', type: 'string', size: 2000, required: false },
      { key: 'futureWork', type: 'string', size: 2000, required: false },
      { key: 'demoUrl', type: 'string', size: 500, required: false },
      { key: 'repositoryUrl', type: 'string', size: 500, required: false },
      { key: 'isFinalized', type: 'boolean', required: true, default: false },
      { key: 'publicUrl', type: 'string', size: 500, required: true },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'updatedAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'teamId_idx', type: 'unique', attributes: ['teamId'] },
      { key: 'isFinalized_idx', type: 'key', attributes: ['isFinalized'] }
    ]
  },
  POLLS: {
    id: 'polls',
    name: 'Polls',
    attributes: [
      { key: 'teamId', type: 'string', size: 255, required: true },
      { key: 'createdBy', type: 'string', size: 255, required: true },
      { key: 'question', type: 'string', size: 500, required: true },
      { key: 'options', type: 'string', size: 1000, required: true, array: true },
      { key: 'allowMultiple', type: 'boolean', required: true, default: false },
      { key: 'expiresAt', type: 'datetime', required: true },
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'totalVotes', type: 'integer', required: true, default: 0 },
      { key: 'createdAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'teamId_idx', type: 'key', attributes: ['teamId'] },
      { key: 'createdBy_idx', type: 'key', attributes: ['createdBy'] },
      { key: 'isActive_idx', type: 'key', attributes: ['isActive'] },
      { key: 'expiresAt_idx', type: 'key', attributes: ['expiresAt'] }
    ]
  },
  POLL_VOTES: {
    id: 'poll_votes',
    name: 'Poll Votes',
    attributes: [
      { key: 'pollId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'selectedOptions', type: 'string', size: 500, required: true, array: true },
      { key: 'createdAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'pollId_idx', type: 'key', attributes: ['pollId'] },
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'unique_poll_vote_idx', type: 'unique', attributes: ['pollId', 'userId'] }
    ]
  },
  REACTIONS: {
    id: 'reactions',
    name: 'Reactions',
    attributes: [
      { key: 'targetId', type: 'string', size: 255, required: true },
      { key: 'targetType', type: 'string', size: 50, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'emoji', type: 'string', size: 50, required: true },
      { key: 'isCustom', type: 'boolean', required: true, default: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ],
    indexes: [
      { key: 'targetId_idx', type: 'key', attributes: ['targetId'] },
      { key: 'targetType_idx', type: 'key', attributes: ['targetType'] },
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'unique_reaction_idx', type: 'unique', attributes: ['targetId', 'userId', 'emoji'] }
    ]
  }
};

const STORAGE_BUCKETS = {
  TEAM_FILES: {
    id: 'team-files',
    name: 'Team Files',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 10485760, // 10MB
    allowedFileExtensions: [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      'pdf', 'txt', 'md', 'csv', 'json', 'js', 'ts', 'jsx', 'tsx',
      'css', 'html', 'xml', 'zip', 'tar', 'gz'
    ],
    compression: 'gzip',
    encryption: true,
    antivirus: true
  },
  CUSTOM_EMOJI: {
    id: 'custom-emoji',
    name: 'Custom Emoji',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.delete(Role.users())
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 1048576, // 1MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    compression: 'gzip',
    encryption: true,
    antivirus: true
  }
};

async function createCollection(collectionDef) {
  try {
    console.log(`📝 Creating collection: ${collectionDef.name}`);
    
    const collection = await databases.createCollection(
      DATABASE_ID,
      collectionDef.id,
      collectionDef.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Create attributes
    for (const attr of collectionDef.attributes) {
      console.log(`  ➕ Adding attribute: ${attr.key}`);
      
      switch (attr.type) {
        case 'string':
          await databases.createStringAttribute(
            DATABASE_ID,
            collectionDef.id,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array
          );
          break;
        case 'integer':
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collectionDef.id,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default,
            attr.array
          );
          break;
        case 'boolean':
          await databases.createBooleanAttribute(
            DATABASE_ID,
            collectionDef.id,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
          break;
        case 'datetime':
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            collectionDef.id,
            attr.key,
            attr.required,
            attr.default,
            attr.array
          );
          break;
      }
      
      // Wait a bit between attribute creation
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create indexes
    for (const index of collectionDef.indexes) {
      console.log(`  🔍 Creating index: ${index.key}`);
      
      await databases.createIndex(
        DATABASE_ID,
        collectionDef.id,
        index.key,
        index.type,
        index.attributes,
        index.orders
      );
      
      // Wait a bit between index creation
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Collection ${collectionDef.name} created successfully`);
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Collection ${collectionDef.name} already exists`);
    } else {
      console.error(`❌ Error creating collection ${collectionDef.name}:`, error.message);
      throw error;
    }
  }
}

async function createStorageBucket(bucketDef) {
  try {
    console.log(`🗄️  Creating storage bucket: ${bucketDef.name}`);
    
    const bucket = await storage.createBucket(
      bucketDef.id,
      bucketDef.name,
      bucketDef.permissions,
      bucketDef.fileSecurity,
      bucketDef.enabled,
      bucketDef.maximumFileSize,
      bucketDef.allowedFileExtensions,
      bucketDef.compression,
      bucketDef.encryption,
      bucketDef.antivirus
    );

    console.log(`✅ Storage bucket ${bucketDef.name} created successfully`);
    return bucket;
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  Storage bucket ${bucketDef.name} already exists`);
    } else {
      console.error(`❌ Error creating storage bucket ${bucketDef.name}:`, error.message);
      throw error;
    }
  }
}

async function setupEnhancements() {
  console.log('🚀 Setting up HackerDen Enhancement Features...\n');

  try {
    // Create collections
    console.log('📚 Creating database collections...');
    for (const [key, collectionDef] of Object.entries(COLLECTIONS)) {
      await createCollection(collectionDef);
    }

    console.log('\n🗄️  Creating storage buckets...');
    for (const [key, bucketDef] of Object.entries(STORAGE_BUCKETS)) {
      await createStorageBucket(bucketDef);
    }

    console.log('\n🎉 Enhancement setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${Object.keys(COLLECTIONS).length} collections created/verified`);
    console.log(`   • ${Object.keys(STORAGE_BUCKETS).length} storage buckets created/verified`);
    console.log('\n🔧 Next steps:');
    console.log('   1. Update your team permissions in Appwrite Console if needed');
    console.log('   2. Configure file upload limits and security rules');
    console.log('   3. Test the enhancement features in your application');
    console.log('\n✨ Happy hacking!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your environment variables');
    console.error('   2. Verify your Appwrite API key has sufficient permissions');
    console.error('   3. Ensure your database exists in Appwrite Console');
    process.exit(1);
  }
}

// Run setup
setupEnhancements();