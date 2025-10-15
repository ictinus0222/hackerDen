# Critical Bug Fixes - Requirements

## Overview
This spec addresses four critical bugs identified in the HackerDen platform that need immediate resolution before final submission.

## Identified Bugs

### 1. File Vault Download Broken (Compression Issues)
**Status**: Critical
**Location**: `src/services/fileService.js`, `src/pages/TeamVaultPage.jsx`
**Description**: File downloads are failing, likely due to compression or encoding issues when retrieving files from Appwrite storage.

**Root Cause Analysis**:
- The `downloadFileWithFallback` method exists but may have issues with:
  - Binary file handling
  - MIME type preservation
  - Appwrite's compression/transformation of files
- The download URL might be serving compressed/transformed versions instead of originals

**Impact**: Users cannot download files they've uploaded to the vault, breaking a core feature.

### 2. Timeline Inconsistencies in User Console
**Status**: Medium
**Location**: `src/services/hackathonService.js` (lines 90-102)
**Description**: Minor issues in time logic sometimes throw off the hackathon timeline display in the user console.

**Root Cause Analysis**:
```javascript
const computeStatus = (startIso, endIso, explicitStatus) => {
  const now = new Date();
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return explicitStatus || 'upcoming';
  }
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
};
```

**Issues**:
- Timezone handling not explicit (uses local timezone)
- No validation of date string formats before parsing
- Edge case: hackathons ending "now" might flicker between states
- The comparison `now > end` should be `now >= end` for inclusive end times

**Impact**: Hackathons may show incorrect status (ongoing vs upcoming vs completed).

### 3. Team Member Display Bug
**Status**: Critical
**Location**: `src/services/teamMemberService.js`, `src/hooks/useTeamMembers.jsx`
**Description**: Every member except the leader shows up as just "Team Member" instead of their actual name.

**Root Cause Analysis**:
- In `teamMemberService.js` (lines 48-56), the name resolution logic has issues:
  ```javascript
  let resolvedName = membership.userName;
  const isGeneric = !resolvedName || resolvedName === 'Team Member' || 
                    resolvedName === 'Team Owner' || resolvedName === membership.userId;
  ```
- The `membership.userName` field may not be populated correctly when users join teams
- The fallback to `userNameService.getUserName()` may not be working properly
- When teams are created/joined, the `userName` field in TEAM_MEMBERS collection isn't being set

**Impact**: Poor UX - users can't identify team members by name, only the leader is visible.

### 4. Submission System Issues
**Status**: Medium
**Location**: `src/services/submissionService.js`
**Description**: Small inconsistencies in the hackathon submission flow.

**Root Cause Analysis**:
- Potential issues identified:
  1. **Hackathon ID handling** (lines 18-22): Falls back to fetching from team if not provided, but this adds unnecessary database calls
  2. **Time validation** (lines 133-148): The `checkHackathonEnded` method doesn't account for timezone differences
  3. **Error handling**: Some methods fail silently (e.g., `getTeamDataForSubmission` returns empty data on error)
  4. **Validation inconsistency**: `validateSubmission` checks for empty arrays but submission creation doesn't enforce this

**Impact**: Users may experience confusing errors or unexpected behavior during submission.

## Success Criteria

### Bug 1: File Download
- [ ] Files download with correct filename
- [ ] Downloaded files are not corrupted
- [ ] Binary files (images, PDFs, zips) download correctly
- [ ] File size matches original upload
- [ ] Works across all supported file types

### Bug 2: Timeline
- [ ] Hackathon status correctly reflects current time
- [ ] No flickering between states
- [ ] Timezone handling is consistent
- [ ] Edge cases (hackathon ending now) handled properly
- [ ] Invalid dates don't crash the UI

### Bug 3: Team Member Names
- [ ] All team members show their actual names
- [ ] Names persist across page refreshes
- [ ] New members immediately show correct names
- [ ] Leader and members both display correctly
- [ ] No "Team Member" fallback for valid users

### Bug 4: Submission System
- [ ] Submission creation works reliably
- [ ] Time validation accounts for timezones
- [ ] Error messages are clear and actionable
- [ ] Validation is consistent throughout
- [ ] No silent failures

## Technical Approach

### Bug 1 Fix: File Download
1. Update `downloadFileWithFallback` to use `getFileDownload` directly without fetch
2. Ensure proper MIME type handling
3. Add integrity verification before download
4. Test with various file types (images, PDFs, text, archives)

### Bug 2 Fix: Timeline
1. Add explicit UTC handling for date comparisons
2. Use `>=` for end date comparison
3. Add date format validation
4. Add buffer time for edge cases
5. Cache status to prevent flickering

### Bug 3 Fix: Team Member Names
1. Ensure `userName` is set when creating team memberships
2. Update `teamService.joinTeam` to accept and store userName
3. Update `teamService.createTeam` to store leader's name
4. Add migration utility to backfill missing names
5. Improve `userNameService` fallback logic

### Bug 4 Fix: Submission System
1. Make hackathonId required parameter (no fallback)
2. Add timezone-aware date comparisons
3. Improve error handling with specific error messages
4. Make validation consistent between create and update
5. Add logging for debugging

## Testing Plan

### Manual Testing
1. **File Download**: Upload and download various file types
2. **Timeline**: Create hackathons with different date ranges and verify status
3. **Team Names**: Create team, add members, verify all names display
4. **Submissions**: Create, update, and finalize submissions

### Edge Cases
1. Files > 5MB
2. Hackathons starting/ending within current hour
3. Team members with special characters in names
4. Submissions after hackathon ends

## Dependencies
- Appwrite SDK (file storage)
- date-fns (date handling)
- User authentication context
- Team context

## Risks
1. File download fix may require Appwrite configuration changes
2. Timeline fix may affect existing hackathon data
3. Name fix may require database migration
4. Submission fix may break existing submissions

## Timeline
- Analysis: 30 minutes ✅
- Implementation: 2-3 hours
- Testing: 1 hour
- Total: 3-4 hours
