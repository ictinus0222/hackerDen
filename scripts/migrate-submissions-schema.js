#!/usr/bin/env node

/**
 * Migration Script: Add hackathonId to existing submissions
 * 
 * This script updates the submissions collection schema to include hackathonId
 * and migrates existing submissions to include the hackathonId field.
 * 
 * Usage: node scripts/migrate-submissions-schema.js
 */

import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);

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

async function migrateSubmissionsSchema() {
  try {
    console.log('🔄 Starting submissions schema migration...');

    // Step 1: Add hackathonId attribute to submissions collection
    console.log('📝 Adding hackathonId attribute to submissions collection...');
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        'submissions',
        'hackathonId',
        255,
        true // required
      );
      console.log('✅ Added hackathonId attribute');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  hackathonId attribute already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Create new indexes
    console.log('📝 Creating new indexes...');
    try {
      await databases.createIndex(
        DATABASE_ID,
        'submissions',
        'teamId_hackathonId_idx',
        'unique',
        ['teamId', 'hackathonId']
      );
      console.log('✅ Created teamId_hackathonId unique index');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  teamId_hackathonId index already exists');
      } else {
        throw error;
      }
    }

    try {
      await databases.createIndex(
        DATABASE_ID,
        'submissions',
        'hackathonId_idx',
        'key',
        ['hackathonId']
      );
      console.log('✅ Created hackathonId index');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  hackathonId index already exists');
      } else {
        throw error;
      }
    }

    // Step 3: Migrate existing submissions
    console.log('🔄 Migrating existing submissions...');
    
    // Get all existing submissions
    const submissions = await databases.listDocuments(
      DATABASE_ID,
      'submissions',
      [Query.limit(100)] // Process in batches
    );

    console.log(`📊 Found ${submissions.documents.length} submissions to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const submission of submissions.documents) {
      try {
        // Get the team to find the hackathonId
        const team = await databases.getDocument(DATABASE_ID, 'teams', submission.teamId);
        
        // Update the submission with hackathonId
        await databases.updateDocument(
          DATABASE_ID,
          'submissions',
          submission.$id,
          {
            hackathonId: team.hackathonId
          }
        );
        
        migratedCount++;
        console.log(`✅ Migrated submission ${submission.$id} (team: ${submission.teamId}, hackathon: ${team.hackathonId})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate submission ${submission.$id}:`, error.message);
      }
    }

    // Step 4: Remove old unique index on teamId only
    console.log('🗑️  Removing old teamId unique index...');
    try {
      await databases.deleteIndex(DATABASE_ID, 'submissions', 'teamId_idx');
      console.log('✅ Removed old teamId unique index');
    } catch (error) {
      if (error.code === 404) {
        console.log('ℹ️  Old teamId index not found (may have been removed already)');
      } else {
        console.warn('⚠️  Could not remove old teamId index:', error.message);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} submissions`);
    if (errorCount > 0) {
      console.log(`❌ Failed to migrate: ${errorCount} submissions`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateSubmissionsSchema();
