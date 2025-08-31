// Background service worker for Skool Quality Detector Extension

class SkoolBackgroundManager {
  constructor() {
    this.isInitialized = false;
    this.analysisQueue = [];
    this.processingQueue = false;
    
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize storage if needed
      await this.initializeStorage();
      
      // Set up periodic cleanup
      this.setupPeriodicCleanup();
      
      this.isInitialized = true;
      console.log('Skool Quality Detector background script initialized');
    } catch (error) {
      console.error('Failed to initialize background script:', error);
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // Extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Message handling from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Indicate async response
    });

    // Tab updates - for cleanup and optimization
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Storage changes - for synchronization
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  // Handle extension installation
  async handleInstallation(details) {
    try {
      if (details.reason === 'install') {
        // First time installation
        await this.setupInitialSettings();
        console.log('Skool Quality Detector installed successfully');
        
        // Show welcome notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Skool Quality Detector',
          message: 'Extension installed! Visit Skool communities to start analyzing member behavior.'
        });
      } else if (details.reason === 'update') {
        // Extension update
        await this.handleExtensionUpdate(details);
        console.log('Skool Quality Detector updated');
      }
    } catch (error) {
      console.error('Error handling installation:', error);
    }
  }

  // Set up initial settings
  async setupInitialSettings() {
    const defaultSettings = {
      enableQualityBadges: true,
      enableTooltips: true,
      showConfidenceLevel: true,
      minimumConfidence: 0.3,
      analysisEnabled: true,
      privacyMode: false,
      excludedMembers: [],
      badgeStyle: 'circle',
      version: '1.0.0',
      installDate: Date.now()
    };

    await chrome.storage.local.set({
      'skool_detector_settings': defaultSettings
    });
  }

  // Handle extension updates
  async handleExtensionUpdate(details) {
    try {
      const settings = await this.getSettings();
      
      // Perform version-specific migrations if needed
      if (details.previousVersion) {
        await this.performMigrations(details.previousVersion, details.version);
      }
      
      // Update version in settings
      settings.version = chrome.runtime.getManifest().version;
      settings.lastUpdate = Date.now();
      
      await chrome.storage.local.set({
        'skool_detector_settings': settings
      });
    } catch (error) {
      console.error('Error handling update:', error);
    }
  }

  // Handle messages from content scripts and popup
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'analyzeMembers':
          await this.processAnalysisRequest(message.data, sender);
          sendResponse({ success: true });
          break;

        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'saveSettings':
          await this.saveSettings(message.data);
          sendResponse({ success: true });
          break;

        case 'getMemberData':
          const memberData = await this.getMemberData(message.userId);
          sendResponse({ success: true, data: memberData });
          break;

        case 'saveMemberData':
          await this.saveMemberData(message.userId, message.data);
          sendResponse({ success: true });
          break;

        case 'cleanupData':
          await this.performDataCleanup();
          sendResponse({ success: true });
          break;

        case 'refreshAnalysis':
          await this.refreshPageAnalysis(sender.tab?.id);
          sendResponse({ success: true });
          break;

        case 'exportData':
          const exportData = await this.exportAllData();
          sendResponse({ success: true, data: exportData });
          break;

        case 'getStats':
          const stats = await this.getStorageStats();
          sendResponse({ success: true, data: stats });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Handle tab updates
  handleTabUpdate(tabId, changeInfo, tab) {
    // Only process complete page loads on Skool domains
    if (changeInfo.status === 'complete' && 
        tab.url && 
        tab.url.includes('skool.com')) {
      
      // Inject content script if needed (fallback)
      this.ensureContentScriptInjected(tabId);
    }
  }

  // Handle storage changes
  handleStorageChange(changes, namespace) {
    if (namespace === 'local') {
      // Broadcast settings changes to all content scripts
      if (changes.skool_detector_settings) {
        this.broadcastSettingsChange(changes.skool_detector_settings.newValue);
      }
    }
  }

  // Initialize storage structure
  async initializeStorage() {
    try {
      const result = await chrome.storage.local.get([
        'skool_detector_settings',
        'skool_member_data',
        'skool_analysis_cache'
      ]);

      // Initialize if empty
      if (!result.skool_detector_settings) {
        await this.setupInitialSettings();
      }

      if (!result.skool_member_data) {
        await chrome.storage.local.set({
          'skool_member_data': {}
        });
      }

      if (!result.skool_analysis_cache) {
        await chrome.storage.local.set({
          'skool_analysis_cache': {}
        });
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // Set up periodic cleanup
  setupPeriodicCleanup() {
    // Clean up every hour
    setInterval(() => {
      this.performDataCleanup();
    }, 60 * 60 * 1000);

    // Clean up analysis cache every 30 minutes
    setInterval(() => {
      this.cleanupAnalysisCache();
    }, 30 * 60 * 1000);
  }

  // Process analysis requests
  async processAnalysisRequest(data, sender) {
    try {
      // Add to processing queue to avoid overwhelming the system
      this.analysisQueue.push({
        data,
        sender,
        timestamp: Date.now()
      });

      // Process queue if not already processing
      if (!this.processingQueue) {
        this.processAnalysisQueue();
      }
    } catch (error) {
      console.error('Error processing analysis request:', error);
    }
  }

  // Process the analysis queue
  async processAnalysisQueue() {
    if (this.processingQueue || this.analysisQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      while (this.analysisQueue.length > 0) {
        const request = this.analysisQueue.shift();
        
        // Skip old requests (older than 5 minutes)
        if (Date.now() - request.timestamp > 5 * 60 * 1000) {
          continue;
        }

        await this.processAnalysisItem(request);
        
        // Add small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error processing analysis queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  // Process individual analysis item
  async processAnalysisItem(request) {
    try {
      // This would contain the actual analysis logic
      // For now, we'll just acknowledge the request
      console.log('Processing analysis for:', request.data);
    } catch (error) {
      console.error('Error processing analysis item:', error);
    }
  }

  // Get settings from storage
  async getSettings() {
    try {
      const result = await chrome.storage.local.get('skool_detector_settings');
      return result.skool_detector_settings || {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  // Save settings to storage
  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({
        'skool_detector_settings': settings
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Get member data
  async getMemberData(userId) {
    try {
      const result = await chrome.storage.local.get('skool_member_data');
      const allMemberData = result.skool_member_data || {};
      return allMemberData[userId] || null;
    } catch (error) {
      console.error('Error getting member data:', error);
      return null;
    }
  }

  // Save member data
  async saveMemberData(userId, data) {
    try {
      const result = await chrome.storage.local.get('skool_member_data');
      const allMemberData = result.skool_member_data || {};
      allMemberData[userId] = data;
      
      await chrome.storage.local.set({
        'skool_member_data': allMemberData
      });
    } catch (error) {
      console.error('Error saving member data:', error);
      throw error;
    }
  }

  // Perform data cleanup
  async performDataCleanup() {
    try {
      const now = Date.now();
      const expiryTime = 30 * 24 * 60 * 60 * 1000; // 30 days

      // Clean up member data
      const memberResult = await chrome.storage.local.get('skool_member_data');
      const memberData = memberResult.skool_member_data || {};
      const cleanedMemberData = {};

      for (const [userId, data] of Object.entries(memberData)) {
        const lastSeen = data.lastSeen || 0;
        if (now - lastSeen < expiryTime) {
          cleanedMemberData[userId] = data;
        }
      }

      await chrome.storage.local.set({
        'skool_member_data': cleanedMemberData
      });

      console.log(`Cleaned up ${Object.keys(memberData).length - Object.keys(cleanedMemberData).length} expired member records`);
    } catch (error) {
      console.error('Error performing data cleanup:', error);
    }
  }

  // Clean up analysis cache
  async cleanupAnalysisCache() {
    try {
      const now = Date.now();
      const cacheExpiryTime = 60 * 60 * 1000; // 1 hour

      const cacheResult = await chrome.storage.local.get('skool_analysis_cache');
      const cache = cacheResult.skool_analysis_cache || {};
      const cleanedCache = {};

      for (const [key, data] of Object.entries(cache)) {
        const timestamp = data.timestamp || 0;
        if (now - timestamp < cacheExpiryTime) {
          cleanedCache[key] = data;
        }
      }

      await chrome.storage.local.set({
        'skool_analysis_cache': cleanedCache
      });

      console.log(`Cleaned up ${Object.keys(cache).length - Object.keys(cleanedCache).length} expired cache entries`);
    } catch (error) {
      console.error('Error cleaning up analysis cache:', error);
    }
  }

  // Refresh page analysis
  async refreshPageAnalysis(tabId) {
    try {
      if (tabId) {
        await chrome.tabs.sendMessage(tabId, {
          action: 'refreshAnalysis'
        });
      }
    } catch (error) {
      console.error('Error refreshing page analysis:', error);
    }
  }

  // Export all data
  async exportAllData() {
    try {
      const result = await chrome.storage.local.get();
      return {
        ...result,
        exportTimestamp: Date.now(),
        version: chrome.runtime.getManifest().version
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const result = await chrome.storage.local.get();
      const dataSize = JSON.stringify(result).length;
      const memberData = result.skool_member_data || {};
      const memberCount = Object.keys(memberData).length;

      return {
        totalSizeKB: Math.round(dataSize / 1024),
        memberCount,
        lastCleanup: Date.now(),
        cacheEntries: Object.keys(result.skool_analysis_cache || {}).length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalSizeKB: 0,
        memberCount: 0,
        lastCleanup: Date.now(),
        cacheEntries: 0
      };
    }
  }

  // Ensure content script is injected
  async ensureContentScriptInjected(tabId) {
    try {
      // Try to ping the content script
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (error) {
      // Content script not present, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: [
            'utils/constants.js',
            'utils/storage.js',
            'utils/analyzer.js',
            'content/content.js'
          ]
        });

        await chrome.scripting.insertCSS({
          target: { tabId },
          files: ['content/content.css']
        });
      } catch (injectionError) {
        console.error('Error injecting content script:', injectionError);
      }
    }
  }

  // Broadcast settings changes to content scripts
  async broadcastSettingsChange(newSettings) {
    try {
      const tabs = await chrome.tabs.query({ url: '*://*.skool.com/*' });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'settingsChanged',
            settings: newSettings
          });
        } catch (error) {
          // Tab might not have content script loaded
        }
      }
    } catch (error) {
      console.error('Error broadcasting settings change:', error);
    }
  }

  // Perform version migrations
  async performMigrations(previousVersion, currentVersion) {
    try {
      // Add migration logic here for future versions
      console.log(`Migrating from ${previousVersion} to ${currentVersion}`);
      
      // Example migration logic:
      // if (previousVersion === '1.0.0' && currentVersion === '1.1.0') {
      //   await this.migrateToV1_1_0();
      // }
    } catch (error) {
      console.error('Error performing migrations:', error);
    }
  }

  // Monitor extension health
  async monitorHealth() {
    try {
      const stats = await this.getStorageStats();
      
      // Check if storage is getting too large
      if (stats.totalSizeKB > 5000) { // 5MB threshold
        console.warn('Storage size is getting large:', stats.totalSizeKB, 'KB');
        await this.performDataCleanup();
      }

      // Check if there are too many queued analysis requests
      if (this.analysisQueue.length > 100) {
        console.warn('Analysis queue is getting large:', this.analysisQueue.length);
        // Clear old requests
        this.analysisQueue = this.analysisQueue.filter(
          request => Date.now() - request.timestamp < 60000 // Keep only last minute
        );
      }
    } catch (error) {
      console.error('Error monitoring health:', error);
    }
  }
}

// Initialize background manager
const backgroundManager = new SkoolBackgroundManager();

// Set up health monitoring
setInterval(() => {
  backgroundManager.monitorHealth();
}, 5 * 60 * 1000); // Every 5 minutes