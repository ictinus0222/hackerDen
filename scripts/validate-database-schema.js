#!/usr/bin/env node

/**
 * Database Schema Validation Script
 * 
 * This script validates that all required attributes exist in the Appwrite database collections.
 * Run this to identify missing attributes that cause "Unknown attribute" errors.
 */

import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);

// Configure Appwrite client
client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // You'll need to set this

const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;

// Define required schema
const REQUIRED_SCHEMA = {
  ideas: {
    required: ['teamId', 'hackathonId', 'title', 'status', 'createdBy', 'voteCount'],
    optional: ['description', 'tags', 'createdAt', 'updatedAt']
  },
  tasks: {
    required: ['teamId', 'hackathonId', 'title', 'status', 'createdBy'],
    optional: ['description', 'assignedTo', 'assigned_to', 'created_by', 'priority', 'labels']
  },
  hackathons: {
    required: ['name', 'startDate', 'endDate', 'status', 'createdBy'],
    optional: ['description', 'rules']
  },
  teams: {
    required: ['name', 'hackathonId', 'joinCode', 'createdBy'],
    optional: ['description', 'maxMembers']
  },
  team_members: {
    required: ['teamId', 'userId', 'role'],
    optional: ['joinedAt']
  },
  messages: {
    required: ['teamId', 'hackathonId', 'userId', 'content', 'type'],
    optional: ['userName', 'systemData']
  },
  idea_votes: {
    required: ['ideaId', 'userId'],
    optional: ['createdAt']
  }
};

async function validateCollection(collectionId) {
  try {
    console.log(`\n📋 Validating collection: ${collectionId}`);
    
    // Get collection details
    const collection = await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`✅ Collection "${collectionId}" exists`);
    
    // Get existing attributes
    const existingAttributes = collection.attributes.map(attr => attr.key);
    console.log(`   Existing attributes: ${existingAttributes.join(', ')}`);
    
    // Check required attributes
    const schema = REQUIRED_SCHEMA[collectionId];
    if (!schema) {
      console.log(`⚠️  No schema defined for collection "${collectionId}"`);
      return { success: true, warnings: [`No schema defined for ${collectionId}`] };
    }
    
    const missing = [];
    const warnings = [];
    
    // Check required attributes
    for (const requiredAttr of schema.required) {
      if (!existingAttributes.includes(requiredAttr)) {
        missing.push(requiredAttr);
      }
    }
    
    // Report results
    if (missing.length === 0) {
      console.log(`✅ All required attributes present`);
    } else {
      console.log(`❌ Missing required attributes: ${missing.join(', ')}`);
    }
    
    // Check for extra attributes (not necessarily bad, just informational)
    const allExpected = [...schema.required, ...schema.optional];
    const extra = existingAttributes.filter(attr => !allExpected.includes(attr) && !attr.startsWith('$'));
    if (extra.length > 0) {
      console.log(`ℹ️  Extra attributes found: ${extra.join(', ')}`);
      warnings.push(`Extra attributes in ${collectionId}: ${extra.join(', ')}`);
    }
    
    return {
      success: missing.length === 0,
      missing,
      warnings,
      existing: existingAttributes
    };
    
  } catch (error) {
    console.log(`❌ Error validating collection "${collectionId}": ${error.message}`);
    return {
      success: false,
      error: error.message,
      missing: [],
      warnings: []
    };
  }
}

async function validateAllCollections() {
  console.log('🔍 HackerDen Database Schema Validation');
  console.log('=====================================');
  
  if (!DATABASE_ID) {
    console.error('❌ VITE_APPWRITE_DATABASE_ID environment variable not set');
    process.exit(1);
  }
  
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY environment variable not set');
    console.error('   You need a server API key to validate the database schema');
    process.exit(1);
  }
  
  console.log(`📊 Database ID: ${DATABASE_ID}`);
  
  const results = {};
  const collectionsToCheck = Object.keys(REQUIRED_SCHEMA);
  
  for (const collectionId of collectionsToCheck) {
    results[collectionId] = await validateCollection(collectionId);
  }
  
  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('====================');
  
  const successful = Object.entries(results).filter(([_, result]) => result.success);
  const failed = Object.entries(results).filter(([_, result]) => !result.success);
  
  console.log(`✅ Successful: ${successful.length}/${collectionsToCheck.length}`);
  console.log(`❌ Failed: ${failed.length}/${collectionsToCheck.length}`);
  
  if (failed.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    failed.forEach(([collectionId, result]) => {
      if (result.error) {
        console.log(`   ${collectionId}: ${result.error}`);
      } else if (result.missing.length > 0) {
        console.log(`   ${collectionId}: Missing attributes - ${result.missing.join(', ')}`);
      }
    });
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    failed.forEach(([collectionId, result]) => {
      if (result.missing.includes('status')) {
        console.log(`   Add "status" attribute to "${collectionId}" collection`);
      }
      if (result.missing.length > 1) {
        console.log(`   Add missing attributes to "${collectionId}": ${result.missing.join(', ')}`);
      }
    });
  }
  
  // Warnings
  const allWarnings = Object.values(results).flatMap(r => r.warnings || []);
  if (allWarnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    allWarnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (failed.length === 0) {
    console.log('\n🎉 All collections have the required attributes!');
  } else {
    console.log('\n📖 See docs/database-schema-setup.md for detailed setup instructions');
  }
  
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run validation
validateAllCollections().catch(error => {
  console.error('💥 Validation script failed:', error);
  process.exit(1);
});