# Compare-and-Merge Workflow Quick Reference

## Quick Commands

### Create Backup
```bash
# Using script directly
node scripts/backup-utility.js src/components/TaskCard.jsx

# Using npm script
npm run backup src/components/TaskCard.jsx
```

### Restore from Backup
```bash
# Using script directly
node scripts/backup-utility.js --restore src/components/TaskCard.jsx

# Using npm script
npm run backup:restore src/components/TaskCard.jsx
```

### Cleanup Workflow Files
```bash
# Preview what will be deleted
npm run backup:cleanup

# Actually delete the files
npm run backup:cleanup-confirm
```

## Quick Workflow Steps

1. **Backup** → `npm run backup src/components/TaskCard.jsx`
2. **Generate Fix** → Create `TaskCard.jsx.autofix` with proposed changes
3. **Compare** → `code --diff TaskCard.jsx.backup TaskCard.jsx.autofix`
4. **Merge Safely** → Apply only logic fixes, preserve styling
5. **Verify** → Test UI and functionality
6. **Cleanup** → `npm run backup:cleanup-confirm`

## What to Merge vs. What to Preserve

### ✅ MERGE (Logic Fixes)
- Function corrections (async/await, error handling)
- Variable name fixes and type corrections
- Import statement updates
- Event handler logic improvements
- Performance optimizations (non-structural)

### ❌ PRESERVE (Styling Critical)
- Wrapper divs with CSS classes
- JSX hierarchy and component nesting
- className attributes and Tailwind classes
- Component props affecting styling
- Layout containers and responsive classes

## File Extensions

- `.backup` - Original file before changes
- `.autofix` - Proposed changes for review
- `.diff` - Optional diff output for complex merges

## Emergency Recovery

If something goes wrong:
```bash
# Restore original file
npm run backup:restore src/components/TaskCard.jsx

# Clean up all workflow files
npm run backup:cleanup-confirm
```

## Pre-commit Checklist

- [ ] All workflow files cleaned up
- [ ] UI looks identical to original
- [ ] Logic improvements work correctly
- [ ] No `.backup`, `.autofix`, or `.diff` files remain
- [ ] Git status shows only intended changes