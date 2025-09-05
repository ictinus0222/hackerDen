#!/usr/bin/env node

/**
 * Database Operations Test Script
 * 
 * This script tests basic database operations to identify which collection
 * is missing the "status" attribute.
 */

import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);

// Configure Appwrite client
client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;

// Test data for each collection
const TEST_DATA = {
  ideas: {
    teamId: 'test-team',
    hackathonId: 'test-hackathon',
    title: 'Test Idea',
    description: 'Test Description',
    tags: ['test'],
    status: 'submitted',
    createdBy: 'test-user',
    voteCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  tasks: {
    teamId: 'test-team',
    hackathonId: 'test-hackathon',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    assignedTo: 'test-user',
    assigned_to: 'Test User',
    createdBy: 'test-user',
    created_by: 'Test User',
    priority: 'medium',
    labels: ['test']
  },
  
  hackathons: {
    name: 'Test Hackathon',
    description: 'Test Description',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'upcoming',
    rules: ['Test rule'],
    createdBy: 'test-user'
  }
};

async function testCollectionCreate(collectionId) {
  try {
    console.log(`\n🧪 Testing ${collectionId} collection...`);
    
    const testData = TEST_DATA[collectionId];
    if (!testData) {
      console.log(`⚠️  No test data defined for ${collectionId}`);
      return { success: true, skipped: true };
    }
    
    // Try to create a test document
    const document = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      testData
    );
    
    console.log(`✅ Successfully created test document in ${collectionId}`);
    
    // Clean up - delete the test document
    await databases.deleteDocument(DATABASE_ID, collectionId, document.$id);
    console.log(`🧹 Cleaned up test document from ${collectionId}`);
    
    return { success: true, documentId: document.$id };
    
  } catch (error) {
    console.log(`❌ Failed to create document in ${collectionId}:`);
    console.log(`   Error: ${error.message}`);
    
    // Check if it's specifically a status attribute error
    if (error.message.includes('Unknown attribute') && error.message.includes('status')) {
      console.log(`🎯 FOUND THE ISSUE: ${collectionId} collection is missing the "status" attribute`);
      return { success: false, missingStatus: true, error: error.message };
    }
    
    return { success: false, error: error.message };
  }
}

async function testAllCollections() {
  console.log('🔍 HackerDen Database Operations Test');
  console.log('====================================');
  
  if (!DATABASE_ID) {
    console.error('❌ VITE_APPWRITE_DATABASE_ID environment variable not set');
    process.exit(1);
  }
  
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY environment variable not set');
    console.error('   You need a server API key to test database operations');
    process.exit(1);
  }
  
  console.log(`📊 Database ID: ${DATABASE_ID}`);
  
  const collectionsToTest = Object.keys(TEST_DATA);
  const results = {};
  
  for (const collectionId of collectionsToTest) {
    results[collectionId] = await testCollectionCreate(collectionId);
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS');
  console.log('===============');
  
  const successful = Object.entries(results).filter(([_, result]) => result.success);
  const failed = Object.entries(results).filter(([_, result]) => !result.success);
  const missingStatus = Object.entries(results).filter(([_, result]) => result.missingStatus);
  
  console.log(`✅ Successful: ${successful.length}/${collectionsToTest.length}`);
  console.log(`❌ Failed: ${failed.length}/${collectionsToTest.length}`);
  
  if (missingStatus.length > 0) {
    console.log('\n🎯 COLLECTIONS MISSING "status" ATTRIBUTE:');
    missingStatus.forEach(([collectionId, _]) => {
      console.log(`   📋 ${collectionId}`);
    });
    
    console.log('\n🔧 TO FIX THIS ISSUE:');
    console.log('1. Go to your Appwrite Console');
    console.log('2. Navigate to Databases → Your Database → Collections');
    missingStatus.forEach(([collectionId, _]) => {
      console.log(`3. Click on "${collectionId}" collection`);
      console.log('4. Go to Attributes tab');
      console.log('5. Click "Add Attribute" → "String"');
      console.log('6. Set Key: "status", Size: 20, Required: Yes');
      
      // Provide default values based on collection
      const defaults = {
        ideas: 'submitted',
        tasks: 'todo', 
        hackathons: 'upcoming'
      };
      
      if (defaults[collectionId]) {
        console.log(`7. Set Default: "${defaults[collectionId]}"`);
      }
      console.log('');
    });
  }
  
  if (failed.length > 0 && missingStatus.length === 0) {
    console.log('\n❌ OTHER ERRORS FOUND:');
    failed.forEach(([collectionId, result]) => {
      console.log(`   ${collectionId}: ${result.error}`);
    });
  }
  
  if (failed.length === 0) {
    console.log('\n🎉 All database operations successful!');
    console.log('Your database schema appears to be correctly configured.');
  }
  
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run tests
testAllCollections().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});