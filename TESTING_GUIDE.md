# Testing Guide - Skool Community Quality Detector

## 🚀 **Extension Installation & Testing**

### **Step 1: Load the Extension**

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle "Developer mode" ON (top right corner)
   - You should see: Load unpacked | Pack extension | Update buttons

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `C:\Users\matth\Projects\skool-quality-detector\`
   - Select the entire folder (contains manifest.json)
   - Click "Select Folder"

4. **Verify Installation**
   - Extension should appear in the list as "Skool Community Quality Detector"
   - Status should show as "Enabled"
   - Extension icon should appear in Chrome toolbar

### **Step 2: Check for Errors**

1. **Click "Details" on the extension card**
2. **Check for errors in:**
   - Service worker (background script)
   - Content scripts
   - Extension popup

3. **Expected Success Indicators:**
   - ✅ No error messages in red
   - ✅ "Inspect views: service worker" should be clickable
   - ✅ Extension icon visible in toolbar

### **Step 3: Test on Skool Community**

1. **Visit a Skool Community**
   ```
   https://www.skool.com/games (or any Skool community you're a member of)
   ```

2. **Open Developer Tools** (F12)

3. **Check Console for:**
   ```
   ✅ "Skool Quality Detector: Content analyzer initialized"
   ✅ No error messages related to the extension
   ```

4. **Look for Quality Badges**
   - Small colored circles next to member names in posts
   - 🟢 Green = High quality
   - 🟡 Yellow = Moderate quality
   - 🔴 Red = Suspicious patterns
   - ⚪ Gray = Insufficient data

5. **Test Hover Tooltips**
   - Hover over any quality badge
   - Should show detailed analysis popup

### **Step 4: Test Extension Popup**

1. **Click Extension Icon** in Chrome toolbar
2. **Check Dashboard Tab:**
   - Community statistics should load
   - Member count, quality distribution
   - Recent activity list

3. **Check Members Tab:**
   - Search functionality
   - Filter by quality level
   - Sort options work

4. **Check Settings Tab:**
   - Toggle switches respond
   - Confidence slider works
   - Privacy controls function

## 🧪 **Automated Testing Suite**

### **Run Browser Tests**

1. **Navigate to any Skool community page**
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Run the test suite:**

```javascript
// Paste this into the console and press Enter:
fetch('https://raw.githubusercontent.com/MatthewSnow2/Verbosely/main/test/test-extension.js')
  .then(response => response.text())
  .then(script => {
    eval(script);
    // Tests will run automatically
  })
  .catch(error => {
    console.log('Load test from file instead');
    console.log('Manual test available in: test/test-extension.js');
  });
```

### **Expected Test Results**

The test suite checks:
- ✅ Extension scripts loaded (constants, storage, analyzer)
- ✅ DOM selectors working on Skool pages
- ✅ Storage functionality (save/retrieve member data)
- ✅ Analysis algorithm functionality
- ✅ Content script initialization
- ✅ CSS styles loaded
- ✅ Badge creation and display
- ✅ Settings and default values
- ✅ Utility functions working
- ✅ Error handling
- ✅ Performance benchmarks

**Target Success Rate: 90%+ tests passing**

## 🔍 **Manual Verification Checklist**

### **Visual Verification**
- [ ] Extension icon appears in Chrome toolbar
- [ ] Quality badges appear next to member names in Skool posts
- [ ] Badges are colored correctly (green/yellow/red/gray)
- [ ] Hover tooltips work and show analysis details
- [ ] Extension popup opens when icon is clicked

### **Functional Verification**
- [ ] Extension analyzes member posts and assigns quality scores
- [ ] Settings can be changed and persist
- [ ] Member search and filtering works in popup
- [ ] Data export/import functions work
- [ ] Privacy controls function properly

### **Error Verification**
- [ ] No JavaScript errors in console
- [ ] No failed network requests
- [ ] Extension handles missing data gracefully
- [ ] Performance impact is minimal

## 🚨 **Common Issues & Solutions**

### **Issue: Extension Not Loading**
**Symptoms:**
- Extension doesn't appear after "Load unpacked"
- Error: "Manifest file is missing or unreadable"

**Solutions:**
1. Ensure you selected the correct folder containing `manifest.json`
2. Check file permissions - folder should be readable
3. Try reloading the extension page and loading again

### **Issue: "executeScript" Error**
**Symptoms:**
- Console error: "Cannot read properties of undefined (reading 'executeScript')"
- Background script errors

**Solutions:**
1. ✅ **FIXED**: Added `"scripting"` permission to manifest.json
2. ✅ **FIXED**: Enhanced error handling in background script
3. Reload the extension after fixes

### **Issue: Content Script Not Responding**
**Symptoms:**
- No quality badges appearing on Skool pages
- Console error: "Could not establish connection"

**Solutions:**
1. ✅ **FIXED**: Added message handlers to content script
2. Refresh the Skool community page
3. Check if you're on a `*.skool.com` domain

### **Issue: No Quality Analysis**
**Symptoms:**
- Badges appear but show no data
- All members show "Unknown" quality

**Solutions:**
1. Allow time for data collection (visit posts, scroll through content)
2. Check if community has sufficient member activity
3. Verify extension has permission to access page content

## 📊 **Performance Monitoring**

### **Expected Performance Metrics**
- Extension load time: < 500ms
- Content script injection: < 200ms  
- Member analysis: < 100ms per member
- Storage operations: < 50ms
- Memory usage: < 10MB total

### **Monitor Performance**
```javascript
// Check extension memory usage
chrome.system.memory.getInfo(info => {
  console.log('Available memory:', info.availableCapacity);
});

// Check analysis timing
console.time('memberAnalysis');
// ... analysis code ...
console.timeEnd('memberAnalysis');
```

## 🔐 **Privacy Verification**

### **Verify No External Requests**
1. **Open Network tab** in Developer Tools
2. **Filter by extension ID** or look for unexpected requests
3. **Verify**: No data leaves your device
4. **Check**: All storage is local only

### **Data Inspection**
```javascript
// View stored extension data
chrome.storage.local.get(null, (data) => {
  console.log('All extension data:', data);
});
```

## 📋 **Test Results Documentation**

### **Record Your Results**
When testing, document:
- [ ] Chrome version: _________
- [ ] Extension load: SUCCESS / FAILED
- [ ] Console errors: YES / NO (list any)
- [ ] Quality badges: WORKING / NOT WORKING
- [ ] Tooltips: WORKING / NOT WORKING
- [ ] Extension popup: WORKING / NOT WORKING
- [ ] Test suite: ___% passed
- [ ] Performance: GOOD / NEEDS WORK
- [ ] Overall status: READY / NEEDS FIXES

### **Report Issues**
If you encounter issues:
1. **Check console errors** and copy exact error messages
2. **Note browser version** and operating system  
3. **Describe steps** to reproduce the problem
4. **Create GitHub issue** with details

---

## 🎯 **Success Criteria**

**Extension is ready for use when:**
- ✅ Loads without errors
- ✅ Displays quality badges on Skool pages
- ✅ Popup dashboard functions properly
- ✅ Test suite passes 90%+ tests
- ✅ No performance issues detected
- ✅ Privacy requirements met (local-only storage)

**If all criteria are met, your Skool Community Quality Detector is ready for production use!** 🎉