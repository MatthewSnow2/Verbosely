// Storage utility for Skool Quality Detector Extension

class SkoolStorage {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage;
  }

  // Save member data with expiry
  async saveMemberData(userId, data) {
    try {
      const memberData = {
        ...data,
        userId,
        lastUpdated: Date.now(),
        expiresAt: Date.now() + (ANALYSIS_SETTINGS.storageExpiryDays * 24 * 60 * 60 * 1000)
      };

      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.MEMBER_DATA);
        const allMemberData = storageData[STORAGE_KEYS.MEMBER_DATA] || {};
        allMemberData[userId] = memberData;
        
        await chrome.storage.local.set({
          [STORAGE_KEYS.MEMBER_DATA]: allMemberData
        });
      } else {
        localStorage.setItem(`${STORAGE_KEYS.MEMBER_DATA}_${userId}`, JSON.stringify(memberData));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save member data:', error);
      return false;
    }
  }

  // Get member data by userId
  async getMemberData(userId) {
    try {
      let memberData = null;

      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.MEMBER_DATA);
        const allMemberData = storageData[STORAGE_KEYS.MEMBER_DATA] || {};
        memberData = allMemberData[userId];
      } else {
        const stored = localStorage.getItem(`${STORAGE_KEYS.MEMBER_DATA}_${userId}`);
        if (stored) {
          memberData = JSON.parse(stored);
        }
      }

      // Check if data has expired
      if (memberData && memberData.expiresAt < Date.now()) {
        await this.deleteMemberData(userId);
        return null;
      }

      return memberData;
    } catch (error) {
      console.error('Failed to get member data:', error);
      return null;
    }
  }

  // Delete expired or specific member data
  async deleteMemberData(userId) {
    try {
      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.MEMBER_DATA);
        const allMemberData = storageData[STORAGE_KEYS.MEMBER_DATA] || {};
        delete allMemberData[userId];
        
        await chrome.storage.local.set({
          [STORAGE_KEYS.MEMBER_DATA]: allMemberData
        });
      } else {
        localStorage.removeItem(`${STORAGE_KEYS.MEMBER_DATA}_${userId}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete member data:', error);
      return false;
    }
  }

  // Clean up expired data
  async cleanupExpiredData() {
    try {
      const now = Date.now();
      
      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.MEMBER_DATA);
        const allMemberData = storageData[STORAGE_KEYS.MEMBER_DATA] || {};
        
        const cleanedData = {};
        for (const [userId, data] of Object.entries(allMemberData)) {
          if (data.expiresAt > now) {
            cleanedData[userId] = data;
          }
        }
        
        await chrome.storage.local.set({
          [STORAGE_KEYS.MEMBER_DATA]: cleanedData
        });
      } else {
        // Cleanup localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(STORAGE_KEYS.MEMBER_DATA)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data.expiresAt < now) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              localStorage.removeItem(key); // Remove corrupted data
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
      return false;
    }
  }

  // Save analysis cache for performance
  async saveAnalysisCache(cacheKey, analysisResult) {
    try {
      const cacheData = {
        result: analysisResult,
        timestamp: Date.now(),
        expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour cache
      };

      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.ANALYSIS_CACHE);
        const cache = storageData[STORAGE_KEYS.ANALYSIS_CACHE] || {};
        cache[cacheKey] = cacheData;
        
        await chrome.storage.local.set({
          [STORAGE_KEYS.ANALYSIS_CACHE]: cache
        });
      } else {
        localStorage.setItem(`${STORAGE_KEYS.ANALYSIS_CACHE}_${cacheKey}`, JSON.stringify(cacheData));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save analysis cache:', error);
      return false;
    }
  }

  // Get cached analysis result
  async getAnalysisCache(cacheKey) {
    try {
      let cacheData = null;

      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.ANALYSIS_CACHE);
        const cache = storageData[STORAGE_KEYS.ANALYSIS_CACHE] || {};
        cacheData = cache[cacheKey];
      } else {
        const stored = localStorage.getItem(`${STORAGE_KEYS.ANALYSIS_CACHE}_${cacheKey}`);
        if (stored) {
          cacheData = JSON.parse(stored);
        }
      }

      // Check if cache has expired
      if (cacheData && cacheData.expiresAt < Date.now()) {
        return null;
      }

      return cacheData ? cacheData.result : null;
    } catch (error) {
      console.error('Failed to get analysis cache:', error);
      return null;
    }
  }

  // Save user settings
  async saveSettings(settings) {
    try {
      if (this.isExtension) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.SETTINGS]: settings
        });
      } else {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  // Get user settings with defaults
  async getSettings() {
    try {
      const defaultSettings = {
        enableQualityBadges: true,
        enableTooltips: true,
        showConfidenceLevel: true,
        minimumConfidence: 0.3,
        analysisEnabled: true,
        privacyMode: false,
        excludedMembers: [],
        badgeStyle: 'circle'
      };

      let settings = defaultSettings;

      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
        if (storageData[STORAGE_KEYS.SETTINGS]) {
          settings = { ...defaultSettings, ...storageData[STORAGE_KEYS.SETTINGS] };
        }
      } else {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) {
          settings = { ...defaultSettings, ...JSON.parse(stored) };
        }
      }

      return settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        enableQualityBadges: true,
        enableTooltips: true,
        showConfidenceLevel: true,
        minimumConfidence: 0.3,
        analysisEnabled: true,
        privacyMode: false,
        excludedMembers: [],
        badgeStyle: 'circle'
      };
    }
  }

  // Get all member data for analytics
  async getAllMemberData() {
    try {
      if (this.isExtension) {
        const storageData = await chrome.storage.local.get(STORAGE_KEYS.MEMBER_DATA);
        return storageData[STORAGE_KEYS.MEMBER_DATA] || {};
      } else {
        const allData = {};
        const keys = Object.keys(localStorage);
        
        for (const key of keys) {
          if (key.startsWith(STORAGE_KEYS.MEMBER_DATA)) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data.expiresAt > Date.now()) {
                allData[data.userId] = data;
              }
            } catch (e) {
              // Skip corrupted data
            }
          }
        }
        
        return allData;
      }
    } catch (error) {
      console.error('Failed to get all member data:', error);
      return {};
    }
  }

  // Clear all stored data
  async clearAllData() {
    try {
      if (this.isExtension) {
        await chrome.storage.local.clear();
      } else {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('skool_')) {
            localStorage.removeItem(key);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  // Get storage usage statistics
  async getStorageStats() {
    try {
      let totalSize = 0;
      let memberCount = 0;

      if (this.isExtension) {
        const storageData = await chrome.storage.local.get();
        totalSize = JSON.stringify(storageData).length;
        
        if (storageData[STORAGE_KEYS.MEMBER_DATA]) {
          memberCount = Object.keys(storageData[STORAGE_KEYS.MEMBER_DATA]).length;
        }
      } else {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('skool_')) {
            const item = localStorage.getItem(key);
            totalSize += item.length;
            
            if (key.startsWith(STORAGE_KEYS.MEMBER_DATA)) {
              memberCount++;
            }
          }
        }
      }

      return {
        totalSizeKB: Math.round(totalSize / 1024),
        memberCount,
        lastCleanup: Date.now()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalSizeKB: 0, memberCount: 0, lastCleanup: Date.now() };
    }
  }
}

// Create global instance
const skoolStorage = new SkoolStorage();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.skoolStorage = skoolStorage;
}