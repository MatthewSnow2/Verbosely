# Skool Quality Detector - Testing Guide

## Overview

This document provides comprehensive testing procedures for the Skool Community Quality Detector Chrome Extension. The testing covers functionality, performance, error handling, and user experience.

## Quick Start

### Prerequisites

1. Chrome browser (version 88+)
2. Developer mode enabled in Chrome Extensions
3. Access to a Skool community page for testing

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `skool-quality-detector` folder
5. Verify the extension appears in the extensions list

### Running Automated Tests

1. Navigate to any Skool community page (e.g., `https://www.skool.com/community-name`)
2. Open Chrome DevTools (F12)
3. Go to the Console tab
4. Load the test script:
   ```javascript
   // Copy and paste the contents of test-extension.js into console
   // OR use the Chrome DevTools Sources tab to add the file as a snippet
   ```
5. Run all tests:
   ```javascript
   const tester = new ExtensionTester();
   await tester.runAllTests();
   ```

## Manual Testing Checklist

### 1. Extension Installation ✅

**Test Steps:**
- [ ] Load extension in developer mode
- [ ] Check extension appears in Chrome toolbar
- [ ] Verify extension icon displays correctly
- [ ] Click extension icon to open popup
- [ ] Confirm no console errors during installation

**Expected Results:**
- Extension loads without errors
- Icon visible in toolbar
- Popup opens and displays properly
- Console shows initialization messages

**Troubleshooting:**
- If extension doesn't load: Check manifest.json syntax
- If icon doesn't appear: Verify icon files exist in correct paths
- If popup doesn't open: Check popup.html path and permissions

### 2. Permissions and Manifest ✅

**Test Steps:**
- [ ] Verify all required permissions are granted
- [ ] Check Skool domain access (*.skool.com)
- [ ] Confirm scripting permission is available
- [ ] Test storage permission functionality

**Expected Results:**
- All permissions listed in manifest are granted
- Extension can access Skool pages
- Chrome scripting API is available
- Local storage operations work

**Common Issues:**
- Missing `scripting` permission causes executeScript errors
- Incorrect host permissions prevent content script injection
- Storage permission missing causes settings save failures

### 3. Content Script Injection ✅

**Test Steps:**
- [ ] Navigate to a Skool community page
- [ ] Open DevTools Console
- [ ] Check for content script initialization messages
- [ ] Verify `window.skoolContentAnalyzer` exists
- [ ] Test utility objects (`SKOOL_SELECTORS`, `skoolStorage`, `skoolAnalyzer`)

**Expected Results:**
```javascript
// These should all return objects, not undefined
console.log(window.skoolContentAnalyzer);
console.log(typeof SKOOL_SELECTORS);
console.log(typeof skoolStorage);
console.log(typeof skoolAnalyzer);
```

**Debugging Failed Injection:**
1. Check DevTools Network tab for failed script loads
2. Verify manifest.json content_scripts configuration
3. Check console for permission errors
4. Test manual script injection via background script

### 4. Background Script Communication ✅

**Test Steps:**
- [ ] Test ping message to background script
- [ ] Verify settings retrieval
- [ ] Test member data operations
- [ ] Check error handling for invalid messages

**Manual Test Commands:**
```javascript
// Test background script ping
chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
  console.log('Ping response:', response);
});

// Test settings retrieval
chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
  console.log('Settings:', response);
});

// Test invalid action handling
chrome.runtime.sendMessage({ action: 'invalid' }, (response) => {
  console.log('Invalid action response:', response);
});
```

### 5. Quality Analysis System ✅

**Test Steps:**
- [ ] Create mock member data with various post patterns
- [ ] Test analysis scoring for different user types
- [ ] Verify confidence level calculations
- [ ] Check flag generation for suspicious activity
- [ ] Test analysis summary generation

**Manual Test:**
```javascript
// Test with high-quality member data
const highQualityMember = {
  username: 'QualityUser',
  posts: [
    { id: '1', content: 'This is a detailed analysis of the topic with personal insights. In my experience, this approach works well because it addresses the core issues.', timestamp: '2023-01-01T10:00:00Z' },
    { id: '2', content: 'Great question! Here is how I solved this problem in my project. The key was to understand the underlying patterns.', timestamp: '2023-01-01T12:00:00Z' },
    { id: '3', content: 'I discovered an interesting resource that might help: https://example.com/helpful-guide. What do you think about this methodology?', timestamp: '2023-01-01T14:00:00Z' }
  ],
  engagement: { totalComments: 8, totalLikes: 15 },
  lastSeen: Date.now()
};

const analysis = await skoolAnalyzer.analyzeMember(highQualityMember);
console.log('Analysis result:', analysis);
```

### 6. Storage Operations ✅

**Test Steps:**
- [ ] Test settings save/load functionality
- [ ] Verify member data persistence
- [ ] Check data expiration handling
- [ ] Test cleanup operations
- [ ] Verify storage quota management

**Storage Test Commands:**
```javascript
// Test settings storage
const testSettings = { enableQualityBadges: true, minimumConfidence: 0.7 };
await skoolStorage.saveSettings(testSettings);
const loadedSettings = await skoolStorage.getSettings();
console.log('Settings test:', loadedSettings.minimumConfidence === 0.7);

// Test member data storage
const testMember = { username: 'TestUser', posts: [], lastSeen: Date.now() };
await skoolStorage.saveMemberData('test123', testMember);
const loadedMember = await skoolStorage.getMemberData('test123');
console.log('Member data test:', loadedMember.username === 'TestUser');
```

### 7. Quality Badge Display ✅

**Test Steps:**
- [ ] Navigate to a page with member posts
- [ ] Wait for content analysis to complete
- [ ] Verify quality badges appear next to usernames
- [ ] Test badge hover tooltips
- [ ] Check badge styling and colors
- [ ] Verify badges update when settings change

**Visual Verification:**
- High quality: Green circle (🟢)
- Moderate quality: Yellow circle (🟡)
- Suspicious: Red circle (🔴)
- Unknown: Gray circle (⚪)

### 8. Popup Functionality ✅

**Test Steps:**
- [ ] Click extension icon to open popup
- [ ] Navigate between Dashboard, Members, and Settings tabs
- [ ] Verify statistics display correctly
- [ ] Test settings toggles and sliders
- [ ] Check member list and filtering
- [ ] Test data export functionality

**Popup Features to Test:**
- Status indicator (Active/Disabled)
- Member count and quality distribution
- Settings persistence
- Data cleanup operations
- Export functionality

### 9. Error Handling ✅

**Test Steps:**
- [ ] Test with invalid Skool page URLs
- [ ] Simulate network failures
- [ ] Test with corrupted storage data
- [ ] Verify graceful degradation
- [ ] Check error message clarity

**Error Scenarios:**
```javascript
// Test with invalid data
await skoolAnalyzer.analyzeMember(null); // Should return 'unknown' category
await skoolStorage.saveMemberData(null, null); // Should return false
chrome.runtime.sendMessage({ action: 'invalid' }); // Should return error response
```

### 10. Performance Testing ✅

**Test Steps:**
- [ ] Monitor extension impact on page load time
- [ ] Test with large datasets (50+ posts per member)
- [ ] Check memory usage over time
- [ ] Verify CPU impact during analysis
- [ ] Test concurrent analysis operations

**Performance Benchmarks:**
- Page load impact: <200ms additional
- Single member analysis: <100ms
- Storage operations: <50ms
- Memory usage: <10MB total
- CPU usage: <5% during analysis

## Debugging Common Issues

### Issue: Chrome.scripting is undefined

**Symptoms:**
- Console error: "Cannot read properties of undefined (reading 'executeScript')"
- Content scripts not injecting

**Solution:**
1. Add `"scripting"` permission to manifest.json permissions array
2. Reload extension in chrome://extensions/
3. Refresh the page and test again

### Issue: Content script not loading

**Symptoms:**
- `window.skoolContentAnalyzer` is undefined
- No quality badges appearing
- Console shows no extension messages

**Debug Steps:**
1. Check Network tab for failed script loads
2. Verify current URL matches content_scripts patterns
3. Check console for injection errors
4. Try manual injection via background script

### Issue: Background script communication failing

**Symptoms:**
- "Could not establish connection. Receiving end does not exist."
- Settings not saving
- Popup showing no data

**Debug Steps:**
1. Check if background script is running (chrome://extensions/ → inspect background script)
2. Verify message listener is properly set up
3. Check for background script errors
4. Test with simplified ping message

### Issue: Quality badges not appearing

**Symptoms:**
- Content script loads but no badges show
- Console shows analysis running but no visual results

**Debug Steps:**
1. Check if `enableQualityBadges` setting is true
2. Verify minimum confidence threshold
3. Check if posts are being detected correctly
4. Inspect DOM for badge elements

### Issue: Storage operations failing

**Symptoms:**
- Settings not persisting
- Member data not saving
- Console errors about storage

**Debug Steps:**
1. Verify storage permission in manifest
2. Check chrome.storage API availability
3. Test with smaller data sets
4. Check storage quota usage

## Test Environment Setup

### Development Environment

1. **Chrome Canary** (recommended for latest features)
2. **Chrome DevTools Extensions**
3. **Test Skool Communities** (create test accounts if needed)

### Test Data

Create test scenarios with:
- High-quality members (detailed posts, helpful content)
- Suspicious members (repetitive posts, automation patterns)
- Mixed-quality members (variety of post types)
- Edge cases (no posts, malformed data)

### Automated Testing Integration

For continuous integration:

```javascript
// Add to your test pipeline
const runExtensionTests = async () => {
  const tester = new ExtensionTester();
  const results = await tester.runAllTests();
  
  if (results.failed > 0) {
    throw new Error(`Extension tests failed: ${results.failed}/${results.total}`);
  }
  
  return results;
};
```

## Reporting Issues

When reporting issues, please include:

1. **Browser version** and operating system
2. **Extension version** (from manifest.json)
3. **Specific Skool URL** where issue occurs
4. **Console error messages** (with full stack traces)
5. **Steps to reproduce** the issue
6. **Expected vs actual behavior**
7. **Test results** from automated test suite

## Performance Monitoring

Monitor these metrics:
- **Extension memory usage**: Should remain under 10MB
- **Page load impact**: Should not increase load time by more than 200ms
- **Analysis performance**: Should complete within 100ms per member
- **Storage usage**: Monitor and clean up expired data regularly

## Quality Assurance Checklist

Before release:

- [ ] All automated tests pass
- [ ] Manual testing completed on major Skool communities
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified (Chrome 88+)
- [ ] Privacy and security review completed
- [ ] User acceptance testing conducted
- [ ] Documentation updated
- [ ] Error handling robustness verified
- [ ] Data cleanup and maintenance tested

---

**Last Updated:** January 2025
**Version:** 1.0.0