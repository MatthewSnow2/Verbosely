# Installation Guide - Skool Community Quality Detector

This guide will walk you through installing and setting up the Skool Community Quality Detector Chrome extension.

## 📋 Prerequisites

### System Requirements
- **Browser**: Google Chrome version 88 or later
- **Operating System**: Windows, macOS, or Linux
- **Internet Connection**: Required for accessing Skool communities
- **Permissions**: Ability to install Chrome extensions

### Before Installation
- Close all Skool community tabs
- Ensure Chrome is updated to the latest version
- Consider backing up browser data (optional)

## 🚀 Installation Methods

### Method 1: Chrome Web Store (Recommended)

**Coming Soon**: Once published to the Chrome Web Store

1. **Visit Chrome Web Store**
   - Go to [Chrome Web Store page](# "Link will be available after publishing")
   - Or search for "Skool Community Quality Detector"

2. **Install Extension**
   - Click the "Add to Chrome" button
   - Review the permissions requested
   - Click "Add extension" to confirm

3. **Verify Installation**
   - Look for the extension icon in your Chrome toolbar
   - The icon should appear as a quality detector badge

### Method 2: Manual Installation (Development)

**For developers and beta testers**

1. **Download Extension Files**
   ```bash
   # Option A: Download ZIP from GitHub
   # Go to repository page and click "Download ZIP"
   
   # Option B: Clone repository
   git clone https://github.com/your-username/skool-quality-detector.git
   cd skool-quality-detector
   ```

2. **Extract Files**
   - If downloaded as ZIP, extract to a permanent location
   - Remember the folder path (e.g., `C:\Extensions\skool-quality-detector\`)

3. **Enable Developer Mode**
   - Open Chrome
   - Navigate to `chrome://extensions/`
   - Toggle "Developer mode" ON (top-right corner)

4. **Load Extension**
   - Click "Load unpacked" button
   - Select the extension folder (containing `manifest.json`)
   - Click "Select Folder"

5. **Verify Installation**
   - Extension should appear in the extensions list
   - Toggle should be enabled (blue)
   - Icon should appear in toolbar

## ⚙️ Initial Setup

### First Launch Configuration

1. **Click Extension Icon**
   - Look for the quality detector icon in your toolbar
   - Click to open the popup dashboard

2. **Review Settings**
   - Navigate to the "Settings" tab
   - Review default configuration:
     - ✅ Enable quality analysis
     - ✅ Show quality badges
     - ✅ Show detailed tooltips
     - ✅ Show confidence levels
     - 30% minimum confidence threshold

3. **Privacy Settings**
   - Choose your privacy preferences:
     - Normal mode (default): Full analysis
     - Privacy mode: Minimal data collection
   - Set confidence threshold (recommended: 30-50%)

4. **Verify Permissions**
   - Extension needs access to `*.skool.com` domains only
   - No access to other websites
   - Local storage permission for data management

### Testing Installation

1. **Visit a Skool Community**
   - Go to any Skool community you're a member of
   - Navigate to posts or discussion areas

2. **Look for Quality Badges**
   - Small colored circles should appear next to member names
   - 🟢 Green = High quality
   - 🟡 Yellow = Moderate quality  
   - 🔴 Red = Suspicious patterns
   - ⚪ Gray = Insufficient data

3. **Test Tooltips**
   - Hover over any quality badge
   - Detailed analysis popup should appear
   - Information includes scores and statistics

4. **Check Dashboard**
   - Click extension icon
   - Navigate to "Dashboard" tab
   - Should show analyzed member statistics

## 🔧 Configuration Options

### Basic Settings

| Setting | Description | Recommended |
|---------|-------------|-------------|
| Enable Analysis | Turn extension on/off | ✅ On |
| Show Badges | Display quality indicators | ✅ On |
| Show Tooltips | Detailed hover information | ✅ On |
| Show Confidence | Display reliability percentage | ✅ On |

### Advanced Settings

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| Minimum Confidence | Only show badges above threshold | 30% | 0-100% |
| Privacy Mode | Reduced data collection | ❌ Off | On/Off |
| Storage Limit | Auto-cleanup threshold | 30 days | 7-90 days |

### Privacy Controls

1. **Data Collection**
   - Public post content only
   - No private messages or personal data
   - Anonymous analysis patterns

2. **Local Storage**
   - All data stays on your device
   - No cloud storage or external transmission
   - Complete user control over data

3. **Member Exclusions**
   - Exclude specific members from analysis
   - Immediately deletes existing data
   - Prevents future data collection

## 🛠️ Troubleshooting

### Common Installation Issues

**Issue**: Extension not visible in toolbar
- **Solution**: Right-click toolbar area → Manage extensions → Pin extension

**Issue**: No quality badges appearing
- **Solutions**:
  1. Refresh the Skool community page
  2. Check if extension is enabled in `chrome://extensions/`
  3. Verify you're on a Skool community page (`*.skool.com`)

**Issue**: Permission denied errors
- **Solutions**:
  1. Grant all requested permissions during installation
  2. Check Chrome security settings
  3. Restart Chrome and try again

**Issue**: Extension popup won't open
- **Solutions**:
  1. Right-click extension icon → "Options" or "Manage"
  2. Disable and re-enable extension
  3. Reload extension (developer mode)

### Performance Issues

**Issue**: Slow page loading
- **Solutions**:
  1. Increase confidence threshold to reduce processing
  2. Enable privacy mode for minimal data collection
  3. Clear extension data in settings

**Issue**: High memory usage
- **Solutions**:
  1. Use "Cleanup Data" feature regularly
  2. Reduce storage retention period
  3. Limit number of analyzed members

### Analysis Issues

**Issue**: Incorrect quality scores
- **Solutions**:
  1. Check confidence levels (low confidence = unreliable)
  2. Allow more data collection time for accuracy
  3. Consider context and individual circumstances

**Issue**: Missing member analysis
- **Solutions**:
  1. Ensure member has sufficient post history (5+ posts)
  2. Check if member is in exclusion list
  3. Verify member posts are public and accessible

## 🔄 Updates

### Automatic Updates
- Chrome automatically updates extensions from the Web Store
- Updates happen silently in the background
- Restart Chrome to apply updates immediately

### Manual Updates (Developer Version)
1. Download new version from repository
2. Go to `chrome://extensions/`
3. Find extension and click "Reload" button
4. Or remove old version and load new unpacked extension

### Update Notifications
- Extension will notify about important updates
- Settings may reset during major updates
- Data migration handled automatically when possible

## 🗑️ Uninstallation

### Complete Removal
1. **Remove Extension**
   - Go to `chrome://extensions/`
   - Find "Skool Community Quality Detector"
   - Click "Remove" button
   - Confirm removal

2. **Clear Data** (Optional)
   - Extension data is automatically removed
   - Chrome may keep some cached files
   - Clear browser data if concerned about remnants

3. **Restore Settings**
   - Skool communities will function normally
   - No permanent changes to Skool interface
   - Quality badges will disappear immediately

### Temporary Disable
- Toggle extension OFF in `chrome://extensions/`
- Preserves data and settings
- Can re-enable without reconfiguration

## 📞 Support

### Getting Help
1. **Check Documentation**
   - README.md for general information
   - This installation guide for setup issues
   - PRIVACY.md for data concerns

2. **Common Solutions**
   - Restart Chrome browser
   - Clear browser cache and cookies
   - Check Chrome version compatibility

3. **Report Issues**
   - GitHub Issues for bug reports
   - Include Chrome version and error details
   - Describe steps to reproduce problem

### Contact Information
- **GitHub**: [Repository Issues](https://github.com/your-username/skool-quality-detector/issues)
- **Documentation**: Available in extension files
- **Community**: Chrome Web Store reviews and discussions

---

**Installation Complete!** 🎉

You're now ready to use the Skool Community Quality Detector. Visit any Skool community to start analyzing member behavior and maintaining community integrity through intelligent automation detection.

*Need help? Check the troubleshooting section above or create a GitHub issue for support.*