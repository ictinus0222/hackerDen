# Critical Bug Fixes - Testing Guide

## Quick Test Checklist

### 🔧 Bug 1: File Download
**Time**: 5 minutes

1. **Upload Test Files**
   - [ ] Upload a JPG image (< 5MB)
   - [ ] Upload a PDF document
   - [ ] Upload a ZIP archive
   - [ ] Upload a text file

2. **Download Test Files**
   - [ ] Download each uploaded file
   - [ ] Verify filename is correct
   - [ ] Open each file to verify it's not corrupted
   - [ ] Check file size matches original

3. **Edge Cases**
   - [ ] Try downloading a large file (5-10MB)
   - [ ] Try downloading with slow internet
   - [ ] Try downloading multiple files quickly

**Expected Results**:
- All files download successfully
- No corruption or compression artifacts
- Correct filenames preserved
- File sizes match originals

---

### 📅 Bug 2: Timeline Status
**Time**: 5 minutes

1. **Create Test Hackathons**
   - [ ] Create hackathon starting tomorrow
   - [ ] Create hackathon ending yesterday
   - [ ] Create hackathon active now (start: 1 hour ago, end: 1 hour from now)

2. **Verify Status Display**
   - [ ] Tomorrow's hackathon shows "upcoming" badge
   - [ ] Yesterday's hackathon shows "completed" badge
   - [ ] Active hackathon shows "ongoing" badge

3. **Edge Cases**
   - [ ] Create hackathon ending in 2 minutes
   - [ ] Wait and watch - should not flicker
   - [ ] After end time, should show "completed"

4. **Refresh Test**
   - [ ] Refresh page
   - [ ] Statuses should remain consistent
   - [ ] No console errors

**Expected Results**:
- Correct status badges for all hackathons
- No flickering between states
- Smooth transitions at boundaries
- No console errors

---

### 👥 Bug 3: Team Member Names
**Time**: 10 minutes

1. **Create New Team**
   - [ ] Create a new team
   - [ ] Verify your name shows as leader (not "Team Owner")
   - [ ] Check team members list

2. **Join Team**
   - [ ] Have another user join your team
   - [ ] Verify their actual name shows (not "Team Member")
   - [ ] Check from both user perspectives

3. **Existing Teams**
   - [ ] Open an existing team
   - [ ] Check if all member names show correctly
   - [ ] If names are generic, run migration utility

4. **Run Migration Utility** (if needed)
   ```javascript
   // In browser console on any team page
   import { teamMemberNameFixer } from './src/utils/teamMemberNameFixer.js';
   import { useAuth } from './src/hooks/useAuth.jsx';
   
   const { user } = useAuth();
   const results = await teamMemberNameFixer.fixAllUserTeamNames(user);
   console.log('Migration results:', results);
   ```

5. **Verify After Migration**
   - [ ] Refresh page
   - [ ] All names should now be visible
   - [ ] No "Team Member" fallbacks for valid users

**Expected Results**:
- All team members show their actual names
- Leader shows correct name
- Names persist across refreshes
- Migration utility fixes existing data

---

### 📝 Bug 4: Submission System
**Time**: 5 minutes

1. **Create Submission**
   - [ ] Navigate to submission page
   - [ ] Create a new submission
   - [ ] Verify it saves successfully

2. **Update Submission**
   - [ ] Edit the submission
   - [ ] Save changes
   - [ ] Verify updates are saved

3. **Test Validation**
   - [ ] Try to update after hackathon ends (if possible)
   - [ ] Should show clear error message
   - [ ] Finalize submission
   - [ ] Try to update finalized submission
   - [ ] Should show clear error message

4. **Error Messages**
   - [ ] Verify error messages are user-friendly
   - [ ] No technical jargon
   - [ ] Clear next steps

**Expected Results**:
- Submissions create successfully
- Updates work before deadline
- Clear error messages after deadline
- Finalized submissions cannot be edited

---

## Comprehensive Test Scenarios

### Scenario 1: New User Journey
**Time**: 15 minutes

1. Register new account
2. Create a hackathon
3. Create a team
4. Upload files to vault
5. Download files
6. Invite another user
7. Verify both names show correctly
8. Create submission
9. Verify all features work

**Expected**: Smooth experience, no bugs

---

### Scenario 2: Existing User Journey
**Time**: 10 minutes

1. Login with existing account
2. Check hackathon statuses
3. Open existing team
4. Check team member names
5. Run migration if needed
6. Test file downloads
7. Update submission

**Expected**: All fixes work with existing data

---

### Scenario 3: Edge Cases
**Time**: 10 minutes

1. **File Download**
   - Upload file with special characters in name
   - Upload very large file (near 10MB limit)
   - Download multiple files simultaneously

2. **Timeline**
   - Create hackathon with invalid dates
   - Create hackathon ending "now"
   - Refresh rapidly during transition

3. **Team Names**
   - User with no name set
   - User with special characters in name
   - Team with 10+ members

4. **Submissions**
   - Create submission without hackathonId (should fail gracefully)
   - Update submission at exact deadline time
   - Finalize and try to update

**Expected**: Graceful handling of all edge cases

---

## Automated Testing (Optional)

If you have test infrastructure:

```javascript
// File Download Test
describe('File Download', () => {
  it('should download files without corruption', async () => {
    const file = await uploadTestFile();
    const downloaded = await downloadFile(file.storageId, file.fileName);
    expect(downloaded.size).toBe(file.size);
  });
});

// Timeline Test
describe('Hackathon Timeline', () => {
  it('should show correct status', () => {
    const upcoming = createHackathon({ startDate: tomorrow });
    expect(upcoming.status).toBe('upcoming');
    
    const ongoing = createHackathon({ startDate: yesterday, endDate: tomorrow });
    expect(ongoing.status).toBe('ongoing');
    
    const completed = createHackathon({ endDate: yesterday });
    expect(completed.status).toBe('completed');
  });
});

// Team Names Test
describe('Team Member Names', () => {
  it('should display actual names', async () => {
    const team = await createTeam('Test Team', user);
    const members = await getTeamMembers(team.$id);
    expect(members[0].name).toBe(user.name);
    expect(members[0].name).not.toBe('Team Member');
  });
});

// Submission Test
describe('Submission System', () => {
  it('should require hackathonId', async () => {
    await expect(
      createSubmission(teamId, data, null)
    ).rejects.toThrow('hackathonId is required');
  });
});
```

---

## Performance Testing

### File Download Performance
```bash
# Test download speed for various file sizes
- 100KB file: < 1 second
- 1MB file: < 3 seconds
- 5MB file: < 10 seconds
- 10MB file: < 20 seconds
```

### Timeline Computation Performance
```bash
# Test status computation speed
- Single hackathon: < 1ms
- 10 hackathons: < 10ms
- 100 hackathons: < 100ms
```

### Name Resolution Performance
```bash
# Test name lookup speed
- Single member: < 50ms
- 5 members: < 200ms
- 10 members: < 400ms
```

---

## Regression Testing

Ensure these existing features still work:

- [ ] User authentication
- [ ] Team creation
- [ ] Task management
- [ ] Chat messaging
- [ ] Vault secrets
- [ ] File uploads
- [ ] Hackathon dashboard
- [ ] User console

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## Reporting Issues

If you find any issues:

1. **Document the Issue**
   - What were you doing?
   - What did you expect?
   - What actually happened?
   - Can you reproduce it?

2. **Check Console**
   - Any error messages?
   - Any warnings?
   - Network errors?

3. **Gather Information**
   - Browser and version
   - Operating system
   - Network conditions
   - Screenshots/videos

4. **Report**
   - Create detailed bug report
   - Include all gathered information
   - Suggest potential fixes if possible

---

## Success Criteria

All tests pass when:

✅ Files download correctly without corruption
✅ Hackathon statuses display accurately
✅ Team member names show correctly
✅ Submission system works reliably
✅ No console errors
✅ No performance degradation
✅ All edge cases handled gracefully

---

**Testing Status**: Ready for Testing
**Last Updated**: 2025-10-15
