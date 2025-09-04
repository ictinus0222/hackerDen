#!/usr/bin/env node

/**
 * Check existing Appwrite storage buckets
 */

import { Client, Storage } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const storage = new Storage(client);

// Configuration
const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_APPWRITE_PROJECT_ID');
  console.error('   - APPWRITE_API_KEY');
  process.exit(1);
}

// Configure client
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

async function checkStorage() {
  try {
    console.log('🔍 Checking existing storage buckets...\n');
    
    const buckets = await storage.listBuckets();
    
    console.log(`📊 Found ${buckets.total} storage buckets:\n`);
    
    buckets.buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name}`);
      console.log(`   ID: ${bucket.$id}`);
      console.log(`   Max File Size: ${(bucket.maximumFileSize / 1024 / 1024).toFixed(1)}MB`);
      console.log(`   Allowed Extensions: ${bucket.allowedFileExtensions.join(', ') || 'All'}`);
      console.log(`   Enabled: ${bucket.enabled ? '✅' : '❌'}`);
      console.log('');
    });
    
    if (buckets.total > 0) {
      console.log('💡 Recommendation:');
      console.log(`   Use bucket ID "${buckets.buckets[0].$id}" for team files`);
      console.log('   Update STORAGE_BUCKETS.TEAM_FILES in src/lib/appwrite.js');
    } else {
      console.log('⚠️  No storage buckets found. You may need to create one manually.');
    }
    
  } catch (error) {
    console.error('❌ Error checking storage:', error.message);
  }
}

checkStorage();