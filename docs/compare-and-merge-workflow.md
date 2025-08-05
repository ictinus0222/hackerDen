# Compare-and-Merge Workflow Guide

## Overview

This workflow enables safe application of logic fixes while preserving UI styling and layout integrity. It separates automated code improvements from styling preservation through a systematic backup-and-merge process.

## Core Principles

1. **Styling Preservation First**: Always prioritize maintaining Tailwind classes, wrapper divs, and layout structure
2. **Logic Improvements Second**: Apply functional fixes only after ensuring styling integrity
3. **Manual Review Required**: Never blindly apply automated fixes without human review
4. **Backup Everything**: Create backups before any automated modifications

## Workflow Steps

### Step 1: Pre-Modification Backup

Before applying any automated fixes or modifications:

```bash
# Create backup of the file you're about to modify
node scripts/backup-utility.js src/components/TaskCard.jsx

# This creates: src/components/TaskCard.jsx.backup
```

### Step 2: Generate Isolated Fix

Apply automated fixes to a separate file for comparison:

```bash
# Example: If using an automated tool, output to .autofix file
# automated-tool --input src/components/TaskCard.jsx --output src/components/TaskCard.jsx.autofix
```

Or manually create the `.autofix` file with your proposed changes.

### Step 3: Side-by-Side Comparison

Use a diff tool to compare the original, backup, and autofix versions:

```bash
# Using VS Code diff
code --diff src/components/TaskCard.jsx.backup src/components/TaskCard.jsx.autofix

# Using command line diff
diff -u src/components/TaskCard.jsx.backup src/components/TaskCard.jsx.autofix
```

### Step 4: Manual Merge Process

**DO Merge (Logic Improvements):**
- ✅ Function corrections (async/await, error handling)
- ✅ Variable name fixes and type corrections  
- ✅ Import statement updates and dependency fixes
- ✅ Event handler logic improvements
- ✅ Performance optimizations that don't affect structure
- ✅ Bug fixes in conditional logic

**DON'T Merge (Styling-Critical Changes):**
- ❌ Removed wrapper divs with CSS classes
- ❌ Altered JSX hierarchy or component nesting
- ❌ Changed className attributes or Tailwind classes
- ❌ Modified component props that affect styling
- ❌ Restructured layout containers
- ❌ Changed responsive breakpoint classes

### Step 5: Apply Safe Changes

Manually apply only the logic improvements to the original file:

```javascript
// GOOD: Merge this logic fix
- const handleClick = () => {
+ const handleClick = async () => {
    try {
-     updateTask(taskId, newStatus);
+     await updateTask(taskId, newStatus);
    } catch (error) {
      console.error('Task update failed:', error);
    }
  };

// BAD: Don't merge this structural change
- <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg shadow">
+ <div className="task-container">
    <h3>{task.title}</h3>
  </div>
```

### Step 6: Verification

After merging changes:

1. **Visual Verification**: Check that the UI looks identical to the original
2. **Responsive Testing**: Verify mobile and desktop layouts are preserved
3. **Functional Testing**: Ensure the logic improvements work correctly
4. **Code Review**: Have another developer verify the merge

### Step 7: Cleanup

Once satisfied with the merge:

```bash
# Clean up temporary files
node scripts/backup-utility.js --cleanup src/components/ --confirm
```

## File Naming Conventions

### Backup Files (.backup)
- **Purpose**: Preserve original file state before modifications
- **Format**: `{original-filename}.backup`
- **Example**: `TaskCard.jsx.backup`
- **Lifecycle**: Created before modifications, kept until merge is verified

### Autofix Files (.autofix)
- **Purpose**: Contain automated fixes for comparison
- **Format**: `{original-filename}.autofix`
- **Example**: `TaskCard.jsx.autofix`
- **Lifecycle**: Created during fix generation, deleted after merge

### Temporary Diff Files (.diff)
- **Purpose**: Store diff output for review
- **Format**: `{original-filename}.diff`
- **Example**: `TaskCard.jsx.diff`
- **Lifecycle**: Optional, created for complex merges

## Common Merge Scenarios

### Scenario 1: Simple Logic Fix

```javascript
// Original (with styling preserved)
<button 
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  onClick={handleSubmit}
>
  Submit
</button>

// Autofix (logic improvement)
<button 
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  onClick={async () => await handleSubmit()}
>
  Submit
</button>

// Merge Decision: ✅ SAFE - Only logic changed, styling preserved
```

### Scenario 2: Structural Change (Dangerous)

```javascript
// Original (with important wrapper)
<div className="flex items-center justify-between p-4 border-b">
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{title}</h3>
  </div>
  <button className="ml-4 px-3 py-1 text-sm">Edit</button>
</div>

// Autofix (removes wrapper)
<h3 className="text-lg font-semibold">{title}</h3>
<button className="px-3 py-1 text-sm">Edit</button>

// Merge Decision: ❌ DANGEROUS - Layout structure changed
```

### Scenario 3: Mixed Changes

```javascript
// Original
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {tasks.map(task => (
    <TaskCard key={task.id} task={task} onClick={handleClick} />
  ))}
</div>

// Autofix
<div className="task-grid">
  {tasks.map(task => (
    <TaskCard key={task.$id} task={task} onClick={handleTaskClick} />
  ))}
</div>

// Merge Decision: 
// ✅ MERGE: key={task.$id} and onClick={handleTaskClick} (logic fixes)
// ❌ DON'T MERGE: className change (styling change)
```

## Troubleshooting

### Problem: Backup Already Exists
```bash
⚠️  Warning: Backup already exists at 'src/components/TaskCard.jsx.backup'
```
**Solution**: Use `--force` flag or manually verify the existing backup is correct

### Problem: Complex Merge Conflicts
**Solution**: 
1. Break down changes into smaller chunks
2. Apply one logical change at a time
3. Test after each change
4. Use multiple backup points if needed

### Problem: Styling Accidentally Broken
**Solution**:
```bash
# Restore from backup
node scripts/backup-utility.js --restore src/components/TaskCard.jsx
```

## Best Practices

1. **Always Backup First**: Never modify files without creating backups
2. **Small Incremental Changes**: Apply one logical fix at a time
3. **Visual Verification**: Always check the UI after merging
4. **Team Communication**: Document what changes were merged and why
5. **Regular Cleanup**: Remove temporary files after successful merges
6. **Version Control**: Commit working state before starting merge process

## Integration with Development Workflow

### Pre-commit Hook Integration
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
# Check for leftover backup files
if find . -name "*.backup" -o -name "*.autofix" | grep -q .; then
  echo "Warning: Temporary workflow files found. Clean up before committing."
  find . -name "*.backup" -o -name "*.autofix"
  exit 1
fi
```

### IDE Integration
- Configure VS Code to highlight .backup and .autofix files
- Set up diff shortcuts for quick comparison
- Add file watchers to prevent accidental commits of temporary files

This workflow ensures that styling integrity is maintained while allowing safe application of logic improvements and bug fixes.