#!/usr/bin/env node

/**
 * Backup Utility Script
 * 
 * This script creates backup copies of files before modifications to enable
 * safe compare-and-merge workflows that preserve styling while applying logic fixes.
 * 
 * Usage:
 *   node scripts/backup-utility.js <file-path>
 *   node scripts/backup-utility.js src/components/TaskCard.jsx
 * 
 * Creates:
 *   - Original file: src/components/TaskCard.jsx
 *   - Backup file: src/components/TaskCard.jsx.backup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createBackup(filePath) {
  try {
    // Validate input file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File '${filePath}' does not exist`);
      process.exit(1);
    }

    // Create backup file path
    const backupPath = `${filePath}.backup`;
    
    // Check if backup already exists
    if (fs.existsSync(backupPath)) {
      console.log(`⚠️  Warning: Backup already exists at '${backupPath}'`);
      console.log(`   Use --force to overwrite existing backup`);
      
      if (!process.argv.includes('--force')) {
        process.exit(1);
      }
    }

    // Read original file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Write backup file
    fs.writeFileSync(backupPath, originalContent, 'utf8');
    
    console.log(`✅ Backup created successfully:`);
    console.log(`   Original: ${filePath}`);
    console.log(`   Backup:   ${backupPath}`);
    
    // Display file stats
    const stats = fs.statSync(filePath);
    console.log(`   Size:     ${stats.size} bytes`);
    console.log(`   Modified: ${stats.mtime.toISOString()}`);
    
  } catch (error) {
    console.error(`❌ Error creating backup: ${error.message}`);
    process.exit(1);
  }
}

function restoreFromBackup(filePath) {
  try {
    const backupPath = `${filePath}.backup`;
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Error: Backup file '${backupPath}' does not exist`);
      process.exit(1);
    }
    
    // Read backup content
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    // Restore original file
    fs.writeFileSync(filePath, backupContent, 'utf8');
    
    console.log(`✅ File restored from backup:`);
    console.log(`   Restored: ${filePath}`);
    console.log(`   From:     ${backupPath}`);
    
  } catch (error) {
    console.error(`❌ Error restoring from backup: ${error.message}`);
    process.exit(1);
  }
}

function cleanupBackups(directory = '.') {
  try {
    const backupFiles = [];
    
    function findBackupFiles(dir) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          findBackupFiles(fullPath);
        } else if (item.endsWith('.backup') || item.endsWith('.autofix')) {
          backupFiles.push(fullPath);
        }
      }
    }
    
    findBackupFiles(directory);
    
    if (backupFiles.length === 0) {
      console.log('✅ No backup files found to clean up');
      return;
    }
    
    console.log(`Found ${backupFiles.length} backup/autofix files:`);
    backupFiles.forEach(file => console.log(`   ${file}`));
    
    if (!process.argv.includes('--confirm')) {
      console.log('\n⚠️  Use --confirm to actually delete these files');
      return;
    }
    
    let deletedCount = 0;
    for (const file of backupFiles) {
      try {
        fs.unlinkSync(file);
        deletedCount++;
        console.log(`   ✅ Deleted: ${file}`);
      } catch (error) {
        console.log(`   ❌ Failed to delete: ${file} (${error.message})`);
      }
    }
    
    console.log(`\n✅ Cleanup complete: ${deletedCount}/${backupFiles.length} files deleted`);
    
  } catch (error) {
    console.error(`❌ Error during cleanup: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Backup Utility for Compare-and-Merge Workflow

Usage:
  node scripts/backup-utility.js <file-path>           Create backup
  node scripts/backup-utility.js --restore <file-path> Restore from backup
  node scripts/backup-utility.js --cleanup [directory] Clean up backup files
  node scripts/backup-utility.js --help               Show this help

Options:
  --force     Overwrite existing backup files
  --confirm   Confirm destructive operations (cleanup)

Examples:
  node scripts/backup-utility.js src/components/TaskCard.jsx
  node scripts/backup-utility.js --restore src/components/TaskCard.jsx
  node scripts/backup-utility.js --cleanup src/
  node scripts/backup-utility.js --cleanup --confirm
`);
    return;
  }
  
  if (args.includes('--cleanup')) {
    const dirIndex = args.indexOf('--cleanup') + 1;
    const directory = args[dirIndex] && !args[dirIndex].startsWith('--') ? args[dirIndex] : '.';
    cleanupBackups(directory);
  } else if (args.includes('--restore')) {
    const fileIndex = args.indexOf('--restore') + 1;
    if (fileIndex >= args.length || args[fileIndex].startsWith('--')) {
      console.error('❌ Error: --restore requires a file path');
      process.exit(1);
    }
    restoreFromBackup(args[fileIndex]);
  } else {
    const filePath = args.find(arg => !arg.startsWith('--'));
    if (!filePath) {
      console.error('❌ Error: File path is required');
      process.exit(1);
    }
    createBackup(filePath);
  }
}

// Run main function if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { createBackup, restoreFromBackup, cleanupBackups };