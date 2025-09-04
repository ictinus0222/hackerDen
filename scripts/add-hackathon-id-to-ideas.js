#!/usr/bin/env node

/**
 * Add hackathonId attribute to existing IDEAS collection
 * 
 * This script adds the missing hackathonId attribute to the IDEAS collection
 * for proper hackathon scoping.
 * 
 * Usage: node scripts/add-hackathon-id-to-ideas.js
 */

import { Client, Databases } from 'node-appwrite';
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

async function addHackathonIdAttribute() {
  try {
    console.log('🔧 Adding hackathonId attribute to IDEAS collection...');
    
    // Add hackathonId attribute
    await databases.createStringAttribute(
      DATABASE_ID,
      'ideas',
      'hackathonId',
      255,
      true // required
    );
    
    console.log('✅ hackathonId attribute added successfully');
    
    // Wait a bit before creating index
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add index for hackathonId
    console.log('🔍 Creating index for hackathonId...');
    await databases.createIndex(
      DATABASE_ID,
      'ideas',
      'hackathonId_idx',
      'key',
      ['hackathonId']
    );
    
    console.log('✅ hackathonId index created successfully');
    console.log('\n🎉 IDEAS collection updated successfully!');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  hackathonId attribute already exists');
    } else {
      console.error('❌ Error adding hackathonId attribute:', error.message);
      throw error;
    }
  }
}

// Run the update
addHackathonIdAttribute();