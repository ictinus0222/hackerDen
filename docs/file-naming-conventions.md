# File Naming Conventions for Compare-and-Merge Workflow

## Overview

This document defines the standardized file naming conventions used in the compare-and-merge workflow to ensure consistency and prevent conflicts during the development process.

## File Extension Conventions

### .backup Files

**Purpose**: Preserve original file state before any modifications

**Format**: `{original-filename}.backup`

**Examples**:
- `TaskCard.jsx.backup`
- `useAuth.jsx.backup`
- `authService.js.backup`
- `Dashboard.jsx.backup`

**Characteristics**:
- Contains exact copy of original file before modifications
- Created automatically by backup utility script
- Should be identical to the original file at time of backup
- Temporary file - deleted after successful merge verification

**Usage**:
```bash
# Create backup
node scripts/backup-utility.js src/components/TaskCard.jsx
# Creates: src/components/TaskCard.jsx.backup

# Restore from backup if needed
node scripts/backup-utility.js --restore src/components/TaskCard.jsx
```

### .autofix Files

**Purpose**: Contain automated fixes or proposed changes for comparison

**Format**: `{original-filename}.autofix`

**Examples**:
- `TaskCard.jsx.autofix`
- `useAuth.jsx.autofix`
- `authService.js.autofix`
- `Dashboard.jsx.autofix`

**Characteristics**:
- Contains proposed changes from automated tools or manual fixes
- Used for side-by-side comparison with original
- May contain both logic improvements and styling changes
- Temporary file - deleted after manual merge is complete

**Usage**:
```bash
# Compare original with autofix
code --diff src/components/TaskCard.jsx.backup src/components/TaskCard.jsx.autofix
```

### .diff Files (Optional)

**Purpose**: Store diff output for complex merge reviews

**Format**: `{original-filename}.diff`

**Examples**:
- `TaskCard.jsx.diff`
- `useAuth.jsx.diff`
- `authService.js.diff`

**Characteristics**:
- Contains unified diff output between versions
- Useful for documenting what changes were considered
- Optional - only created for complex merges
- Temporary file - deleted after merge completion

**Usage**:
```bash
# Generate diff file
diff -u src/components/TaskCard.jsx.backup src/components/TaskCard.jsx.autofix > src/components/TaskCard.jsx.diff
```

## Directory Structure Examples

### Before Workflow
```
src/
├── components/
│   ├── TaskCard.jsx
│   ├── Chat.jsx
│   └── Dashboard.jsx
├── hooks/
│   ├── useAuth.jsx
│   └── useTasks.jsx
└── services/
    ├── authService.js
    └── taskService.js
```

### During Workflow
```
src/
├── components/
│   ├── TaskCard.jsx           # Original file
│   ├── TaskCard.jsx.backup    # Backup before changes
│   ├── TaskCard.jsx.autofix   # Proposed changes
│   ├── Chat.jsx
│   └── Dashboard.jsx
├── hooks/
│   ├── useAuth.jsx
│   ├── useAuth.jsx.backup
│   ├── useAuth.jsx.autofix
│   └── useTasks.jsx
└── services/
    ├── authService.js
    └── taskService.js
```

### After Workflow (Cleaned Up)
```
src/
├── components/
│   ├── TaskCard.jsx           # Updated with merged changes
│   ├── Chat.jsx
│   └── Dashboard.jsx
├── hooks/
│   ├── useAuth.jsx            # Updated with merged changes
│   └── useTasks.jsx
└── services/
    ├── authService.js
    └── taskService.js
```

## Naming Rules and Constraints

### File Name Requirements

1. **Base Name Preservation**: Always preserve the original filename exactly
   - ✅ `TaskCard.jsx.backup`
   - ❌ `TaskCard-backup.jsx`
   - ❌ `TaskCard_backup.jsx`

2. **Extension Ordering**: Workflow extensions come after the original extension
   - ✅ `authService.js.backup`
   - ❌ `authService.backup.js`

3. **Case Sensitivity**: Maintain exact case of original filename
   - ✅ `TaskCard.jsx.backup` (if original is `TaskCard.jsx`)
   - ❌ `taskcard.jsx.backup`

4. **Special Characters**: Avoid special characters in workflow extensions
   - ✅ `.backup`, `.autofix`, `.diff`
   - ❌ `.backup-v1`, `.autofix_temp`, `.diff-final`

### Path Handling

1. **Relative Paths**: Workflow files stay in same directory as original
   ```
   src/components/TaskCard.jsx
   src/components/TaskCard.jsx.backup    # Same directory
   ```

2. **Nested Directories**: Preserve full directory structure
   ```
   src/components/forms/LoginForm.jsx
   src/components/forms/LoginForm.jsx.backup
   ```

3. **Absolute Paths**: Avoid absolute paths in scripts and documentation
   - ✅ `src/components/TaskCard.jsx`
   - ❌ `/Users/dev/project/src/components/TaskCard.jsx`

## File Lifecycle Management

### Creation Order
1. Original file exists
2. `.backup` created first (preserves current state)
3. `.autofix` created second (contains proposed changes)
4. `.diff` created optionally (for complex reviews)

### Cleanup Order
1. `.diff` deleted first (optional file)
2. `.autofix` deleted second (after merge complete)
3. `.backup` deleted last (after verification)

### Retention Policies

**During Development**:
- Keep all workflow files until merge is verified
- Maximum retention: 24 hours for active development
- Clean up before committing to version control

**Before Commits**:
- All workflow files must be cleaned up
- Pre-commit hooks should prevent accidental commits
- Only original files with merged changes should remain

## Integration with Tools

### Git Integration

Add to `.gitignore`:
```gitignore
# Compare-and-merge workflow files
*.backup
*.autofix
*.diff

# Temporary workflow directories
.workflow-temp/
```

### VS Code Integration

Add to `.vscode/settings.json`:
```json
{
  "files.exclude": {
    "**/*.backup": true,
    "**/*.autofix": false,
    "**/*.diff": false
  },
  "files.associations": {
    "*.backup": "javascript",
    "*.autofix": "javascript",
    "*.diff": "diff"
  }
}
```

### Script Integration

The backup utility script automatically follows these conventions:
```bash
# Follows naming conventions automatically
node scripts/backup-utility.js src/components/TaskCard.jsx
# Creates: src/components/TaskCard.jsx.backup

# Cleanup follows conventions
node scripts/backup-utility.js --cleanup --confirm
# Removes: *.backup, *.autofix, *.diff files
```

## Validation and Enforcement

### Automated Checks

The backup utility includes validation:
- Verifies original file exists before creating backup
- Prevents overwriting backups without `--force` flag
- Validates file paths and extensions
- Ensures proper cleanup of temporary files

### Manual Verification

Before committing changes:
1. Verify no workflow files remain: `find . -name "*.backup" -o -name "*.autofix" -o -name "*.diff"`
2. Check git status excludes workflow files: `git status --ignored`
3. Confirm original files contain merged changes

### Error Prevention

Common mistakes and prevention:
- **Wrong extension order**: Script enforces correct `.jsx.backup` format
- **Missing cleanup**: Pre-commit hooks catch leftover files
- **Overwriting backups**: Script requires `--force` flag for overwrites
- **Path confusion**: Script uses relative paths consistently

This naming convention system ensures consistency, prevents conflicts, and enables reliable automation of the compare-and-merge workflow.