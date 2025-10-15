# Critical Bug Fixes - Implementation Plan

## Implementation Order
Bugs will be fixed in order of severity and dependency:
1. Team Member Names (affects UX across platform)
2. File Download (critical feature)
3. Timeline Logic (affects user console)
4. Submission System (polish)

## Bug 1: Team Member Display Names

### Files to Modify
1. `src/services/teamService.js` - Update team creation and joining
2. `src/services/teamMemberService.js` - Improve name resolution
3. `src/utils/teamMemberNameFixer.js` - NEW: Migration utility

### Changes

#### 1.1 Update `teamService.js`
**Location**: `createTeam` method
```javascript
// Ensure leader's name is stored in membership
await databases.createDocument(
  DATABASE_ID,
  COLLECTIONS.TEAM_MEMBERS,
  ID.unique(),
  {
    teamId: team.$id,
    userId: userId,
    userName: userName || 'Team Leader', // ADD userName
    role: 'owner',
    hackathonId: hackathonId,
    joinedAt: new Date().toISOString()
  }
);
```

**Location**: `joinTeam` method
```javascript
// Store user's name when joining
await databases.createDocument(
  DATABASE_ID,
  COLLECTIONS.TEAM_MEMBERS,
  ID.unique(),
  {
    teamId: team.$id,
    userId: userId,
    userName: userName || 'Team Member', // ADD userName
    role: 'member',
    hackathonId: team.hackathonId,
    joinedAt: new Date().toISOString()
  }
);
```

#### 1.2 Update `teamMemberService.js`
**Location**: `getTeamMembers` method
```javascript
// Improved name resolution with better fallback
let resolvedName = membership.userName;

// Check if name is generic or missing
const isGeneric = !resolvedName || 
                  resolvedName === 'Team Member' || 
                  resolvedName === 'Team Owner' || 
                  resolvedName === membership.userId ||
                  resolvedName.trim() === '';

if (isGeneric) {
  // Try current user first
  if (currentUser && membership.userId === currentUser.$id && currentUser.name) {
    resolvedName = currentUser.name;
  } else {
    // Try userNameService
    try {
      const lookedUp = await userNameService.getUserName(membership.userId, currentUser);
      if (lookedUp && lookedUp !== 'Team Member') {
        resolvedName = lookedUp;
      }
    } catch (err) {
      console.warn('Name lookup failed for', membership.userId);
    }
  }
}

// Final fallback
if (!resolvedName || resolvedName.trim() === '') {
  resolvedName = 'Team Member';
}
```

#### 1.3 Create Migration Utility
**File**: `src/utils/teamMemberNameFixer.js`
```javascript
// Utility to backfill missing team member names
export const teamMemberNameFixer = {
  async fixTeamMemberNames(teamId, currentUser) {
    // Get all memberships
    // For each membership without proper userName
    // Try to resolve from userNameService or current user
    // Update the membership document
  }
};
```

## Bug 2: File Download

### Files to Modify
1. `src/services/fileService.js` - Fix download method

### Changes

#### 2.1 Simplify Download Method
**Location**: `downloadFileWithFallback` method

Replace complex fetch logic with direct download:
```javascript
async downloadFileWithFallback(storageId, fileName) {
  try {
    // Method 1: Direct download link (simplest, most reliable)
    const downloadUrl = this.getFileDownloadUrl(storageId);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    console.log('File download initiated:', fileName);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file: ' + error.message);
  }
}
```

**Rationale**: 
- Appwrite's `getFileDownload` returns the original file, not compressed
- Browser handles the download natively
- Simpler code = fewer failure points
- The fetch method was over-complicating things

#### 2.2 Remove Unnecessary Verification
The `verifyFileIntegrity` method adds overhead. Remove the verification call from `handleDownloadFile` in `TeamVaultPage.jsx`:

```javascript
const handleDownloadFile = async (file) => {
  try {
    await fileService.downloadFileWithFallback(file.storageId, file.fileName);
    toast.success('Download started');
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Failed to download file');
  }
};
```

## Bug 3: Timeline Logic

### Files to Modify
1. `src/services/hackathonService.js` - Fix status computation

### Changes

#### 3.1 Improve Status Computation
**Location**: `getUserHackathons` method

```javascript
const computeStatus = (startIso, endIso, explicitStatus) => {
  try {
    const now = new Date();
    const start = new Date(startIso);
    const end = new Date(endIso);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date format:', { startIso, endIso });
      return explicitStatus || 'upcoming';
    }
    
    // Add 1 minute buffer to prevent flickering
    const nowWithBuffer = new Date(now.getTime() + 60000); // +1 minute
    
    // Use >= for inclusive end time
    if (nowWithBuffer < start) return 'upcoming';
    if (now >= end) return 'completed';
    return 'ongoing';
  } catch (error) {
    console.error('Error computing status:', error);
    return explicitStatus || 'upcoming';
  }
};
```

**Improvements**:
- Added try-catch for safety
- Added 1-minute buffer to prevent flickering
- Changed `>` to `>=` for end date (inclusive)
- Better error logging
- Validates dates before comparison

## Bug 4: Submission System

### Files to Modify
1. `src/services/submissionService.js` - Improve error handling and validation

### Changes

#### 4.1 Make hackathonId Required
**Location**: `createSubmission` method

```javascript
async createSubmission(teamId, submissionData, hackathonId) {
  if (!hackathonId) {
    throw new Error('hackathonId is required');
  }
  
  try {
    // ... rest of method
  } catch (error) {
    console.error('Error creating submission:', error);
    throw new Error(`Failed to create submission: ${error.message}`);
  }
}
```

#### 4.2 Improve Date Validation
**Location**: `checkHackathonEnded` method

```javascript
async checkHackathonEnded(teamId) {
  try {
    const team = await databases.getDocument(DATABASE_ID, COLLECTIONS.TEAMS, teamId);
    const hackathon = await databases.getDocument(DATABASE_ID, COLLECTIONS.HACKATHONS, team.hackathonId);
    
    const now = new Date();
    const endDate = new Date(hackathon.endDate);
    
    // Validate date
    if (isNaN(endDate.getTime())) {
      console.warn('Invalid end date for hackathon:', hackathon.endDate);
      return false; // Fail open
    }
    
    // Use >= for inclusive end time
    return now >= endDate;
  } catch (error) {
    console.warn('Could not check hackathon end date:', error);
    return false; // Fail open - allow editing if we can't determine
  }
}
```

#### 4.3 Better Error Messages
**Location**: `updateSubmission` method

```javascript
async updateSubmission(submissionId, updates) {
  try {
    const submission = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.SUBMISSIONS,
      submissionId
    );

    if (submission.isFinalized) {
      throw new Error('Cannot update finalized submission. Please contact support if you need to make changes.');
    }

    const hackathonEnded = await this.checkHackathonEnded(submission.teamId);
    if (hackathonEnded) {
      throw new Error('Cannot update submission after hackathon has ended. The deadline has passed.');
    }

    // ... rest of method
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error; // Re-throw with original message
  }
}
```

## Testing Checklist

### Bug 1: Team Member Names
- [ ] Create new team - leader name shows correctly
- [ ] Join team - member name shows correctly
- [ ] Refresh page - names persist
- [ ] Multiple members - all names show
- [ ] Run migration utility on existing teams

### Bug 2: File Download
- [ ] Download image file
- [ ] Download PDF file
- [ ] Download text file
- [ ] Download ZIP file
- [ ] Verify file integrity after download

### Bug 3: Timeline
- [ ] Create hackathon starting tomorrow - shows "upcoming"
- [ ] Create hackathon ending yesterday - shows "completed"
- [ ] Create hackathon active now - shows "ongoing"
- [ ] Hackathon ending in 30 seconds - no flickering
- [ ] Invalid dates - graceful fallback

### Bug 4: Submissions
- [ ] Create submission with valid hackathonId
- [ ] Try to create without hackathonId - clear error
- [ ] Update submission before deadline - works
- [ ] Update after deadline - clear error message
- [ ] Finalize submission - cannot update after

## Rollout Plan

1. **Phase 1**: Fix team member names (highest impact)
   - Deploy service changes
   - Run migration utility
   - Verify in production

2. **Phase 2**: Fix file downloads
   - Deploy simplified download method
   - Test with various file types
   - Monitor error logs

3. **Phase 3**: Fix timeline logic
   - Deploy status computation fix
   - Verify hackathon statuses
   - Monitor for flickering

4. **Phase 4**: Polish submissions
   - Deploy validation improvements
   - Update error messages
   - Test submission flow

## Rollback Plan

Each fix is isolated and can be rolled back independently:
- Team names: Revert service files
- File download: Revert to fetch method
- Timeline: Revert status computation
- Submissions: Revert validation changes

All changes are backward compatible with existing data.
