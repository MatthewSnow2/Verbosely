/**
 * Comprehensive Test Script for Skool Quality Detector Chrome Extension
 * 
 * This script provides automated testing functions to verify extension functionality
 * Run this script in the console of a Skool community page to test the extension
 */

class ExtensionTester {
  constructor() {
    this.testResults = [];
    this.console = console;
    this.startTime = Date.now();
  }

  // Main test runner
  async runAllTests() {
    this.log('🧪 Starting Skool Quality Detector Extension Tests', 'info');
    this.log('================================================', 'info');

    const tests = [
      'testExtensionLoaded',
      'testManifestPermissions',
      'testContentScriptInjection',
      'testBackgroundScriptCommunication',
      'testStorageOperations',
      'testAnalyzerFunctionality',
      'testQualityBadgeDisplay',
      'testPopupFunctionality',
      'testErrorHandling',
      'testPerformance'
    ];

    for (const testName of tests) {
      try {
        await this[testName]();
      } catch (error) {
        this.addResult(testName, false, `Test failed: ${error.message}`);
        this.log(`❌ ${testName} failed: ${error.message}`, 'error');
      }
    }

    this.generateReport();
  }

  // Test 1: Check if extension is loaded
  async testExtensionLoaded() {
    const testName = 'Extension Loaded';
    this.log('🔍 Testing: Extension Loaded', 'info');

    try {
      // Check if chrome.runtime is available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        throw new Error('Chrome extension API not available');
      }

      // Check if extension ID exists
      const extensionId = chrome.runtime.id;
      if (!extensionId) {
        throw new Error('Extension ID not found');
      }

      // Try to get manifest
      const manifest = chrome.runtime.getManifest();
      if (!manifest) {
        throw new Error('Manifest not accessible');
      }

      this.addResult(testName, true, `Extension loaded with ID: ${extensionId}`);
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 2: Verify manifest permissions
  async testManifestPermissions() {
    const testName = 'Manifest Permissions';
    this.log('🔍 Testing: Manifest Permissions', 'info');

    try {
      const manifest = chrome.runtime.getManifest();
      const requiredPermissions = ['storage', 'activeTab', 'tabs', 'scripting'];
      const missingPermissions = [];

      requiredPermissions.forEach(permission => {
        if (!manifest.permissions.includes(permission)) {
          missingPermissions.push(permission);
        }
      });

      if (missingPermissions.length > 0) {
        throw new Error(`Missing permissions: ${missingPermissions.join(', ')}`);
      }

      // Check host permissions
      if (!manifest.host_permissions || !manifest.host_permissions.includes('https://*.skool.com/*')) {
        throw new Error('Missing Skool host permissions');
      }

      this.addResult(testName, true, 'All required permissions present');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 3: Check content script injection
  async testContentScriptInjection() {
    const testName = 'Content Script Injection';
    this.log('🔍 Testing: Content Script Injection', 'info');

    try {
      // Check if content script is loaded
      if (typeof window.skoolContentAnalyzer === 'undefined') {
        throw new Error('Content script not injected - skoolContentAnalyzer not found');
      }

      // Check if required utilities are loaded
      if (typeof SKOOL_SELECTORS === 'undefined') {
        throw new Error('Constants not loaded - SKOOL_SELECTORS not found');
      }

      if (typeof skoolStorage === 'undefined') {
        throw new Error('Storage utility not loaded - skoolStorage not found');
      }

      if (typeof skoolAnalyzer === 'undefined') {
        throw new Error('Analyzer utility not loaded - skoolAnalyzer not found');
      }

      // Test content analyzer initialization
      const analyzer = window.skoolContentAnalyzer;
      if (!analyzer || !analyzer.isInitialized) {
        throw new Error('Content analyzer not properly initialized');
      }

      this.addResult(testName, true, 'Content script and utilities loaded successfully');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 4: Background script communication
  async testBackgroundScriptCommunication() {
    const testName = 'Background Script Communication';
    this.log('🔍 Testing: Background Script Communication', 'info');

    try {
      // Test ping message
      const pingResponse = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Ping timeout')), 5000);
        
        chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (!pingResponse || !pingResponse.success) {
        throw new Error('Background script ping failed');
      }

      // Test settings retrieval
      const settingsResponse = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Settings timeout')), 5000);
        
        chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (!settingsResponse || !settingsResponse.success) {
        throw new Error('Settings retrieval failed');
      }

      this.addResult(testName, true, 'Background script communication working');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 5: Storage operations
  async testStorageOperations() {
    const testName = 'Storage Operations';
    this.log('🔍 Testing: Storage Operations', 'info');

    try {
      // Test settings storage
      const testSettings = {
        enableQualityBadges: true,
        minimumConfidence: 0.5,
        testFlag: true
      };

      const saveResult = await skoolStorage.saveSettings(testSettings);
      if (!saveResult) {
        throw new Error('Failed to save settings');
      }

      const loadedSettings = await skoolStorage.getSettings();
      if (!loadedSettings || !loadedSettings.testFlag) {
        throw new Error('Failed to load saved settings');
      }

      // Test member data storage
      const testMemberData = {
        username: 'TestUser',
        posts: [
          { id: 'test1', content: 'Test post content', timestamp: new Date().toISOString() }
        ],
        lastSeen: Date.now()
      };

      const saveMemberResult = await skoolStorage.saveMemberData('test-user-123', testMemberData);
      if (!saveMemberResult) {
        throw new Error('Failed to save member data');
      }

      const loadedMemberData = await skoolStorage.getMemberData('test-user-123');
      if (!loadedMemberData || loadedMemberData.username !== 'TestUser') {
        throw new Error('Failed to load saved member data');
      }

      // Cleanup test data
      await skoolStorage.deleteMemberData('test-user-123');

      this.addResult(testName, true, 'Storage operations working correctly');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 6: Analyzer functionality
  async testAnalyzerFunctionality() {
    const testName = 'Analyzer Functionality';
    this.log('🔍 Testing: Analyzer Functionality', 'info');

    try {
      // Test member analysis with sample data
      const sampleMemberData = {
        username: 'SampleUser',
        posts: [
          { id: '1', content: 'This is a detailed post with valuable insights about the topic. I found this approach helpful in my experience.', timestamp: '2023-01-01T10:00:00Z' },
          { id: '2', content: 'Another thoughtful response with good questions. What do you think about this approach?', timestamp: '2023-01-01T12:00:00Z' },
          { id: '3', content: 'Here is my perspective on this matter. Based on my research, I discovered some interesting patterns.', timestamp: '2023-01-01T14:00:00Z' }
        ],
        engagement: { totalComments: 5, totalLikes: 12 },
        lastSeen: Date.now()
      };

      const analysis = await skoolAnalyzer.analyzeMember(sampleMemberData);
      
      if (!analysis || typeof analysis.qualityScore === 'undefined') {
        throw new Error('Analysis returned invalid results');
      }

      if (analysis.qualityScore < 0 || analysis.qualityScore > 100) {
        throw new Error('Quality score out of valid range');
      }

      if (analysis.confidenceLevel < 0 || analysis.confidenceLevel > 100) {
        throw new Error('Confidence level out of valid range');
      }

      if (!['high', 'moderate', 'suspicious', 'unknown'].includes(analysis.category)) {
        throw new Error('Invalid category returned');
      }

      // Test summary generation
      const summary = skoolAnalyzer.generateAnalysisSummary(analysis);
      if (!summary || typeof summary !== 'string') {
        throw new Error('Failed to generate analysis summary');
      }

      this.addResult(testName, true, `Analysis completed: Score=${analysis.qualityScore}, Category=${analysis.category}`);
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 7: Quality badge display
  async testQualityBadgeDisplay() {
    const testName = 'Quality Badge Display';
    this.log('🔍 Testing: Quality Badge Display', 'info');

    try {
      const analyzer = window.skoolContentAnalyzer;
      
      // Check if badge styles are injected
      const styleElement = document.getElementById('skool-quality-detector-styles');
      if (!styleElement) {
        throw new Error('Badge styles not injected');
      }

      // Test badge creation
      const mockAnalysis = {
        qualityScore: 75,
        confidenceLevel: 85,
        category: 'high'
      };

      const badge = analyzer.createQualityBadge(mockAnalysis);
      if (!badge || badge.className !== 'skool-quality-badge') {
        throw new Error('Failed to create quality badge');
      }

      // Check badge attributes
      if (badge.getAttribute('data-category') !== 'high') {
        throw new Error('Badge category attribute incorrect');
      }

      this.addResult(testName, true, 'Quality badge display functionality working');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 8: Popup functionality (if accessible)
  async testPopupFunctionality() {
    const testName = 'Popup Functionality';
    this.log('🔍 Testing: Popup Functionality', 'info');

    try {
      // This test requires popup to be open, so we'll test what we can
      // Check if popup HTML exists
      const popupUrl = chrome.runtime.getURL('popup/popup.html');
      if (!popupUrl) {
        throw new Error('Popup URL not accessible');
      }

      // Test stats retrieval (which popup uses)
      const statsResponse = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Stats timeout')), 5000);
        
        chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (!statsResponse || !statsResponse.success) {
        throw new Error('Stats retrieval failed');
      }

      this.addResult(testName, true, 'Popup functionality accessible');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 9: Error handling
  async testErrorHandling() {
    const testName = 'Error Handling';
    this.log('🔍 Testing: Error Handling', 'info');

    try {
      // Test invalid message to background script
      const invalidResponse = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'invalidAction' }, (response) => {
          resolve(response);
        });
      });

      if (!invalidResponse || invalidResponse.success !== false) {
        throw new Error('Invalid action should return error response');
      }

      // Test analyzer with invalid data
      const invalidAnalysis = await skoolAnalyzer.analyzeMember(null);
      if (!invalidAnalysis || invalidAnalysis.category !== 'unknown') {
        throw new Error('Analyzer should handle invalid data gracefully');
      }

      // Test storage with invalid data
      const invalidSave = await skoolStorage.saveMemberData(null, null);
      if (invalidSave !== false) {
        throw new Error('Storage should reject invalid data');
      }

      this.addResult(testName, true, 'Error handling working correctly');
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Test 10: Performance
  async testPerformance() {
    const testName = 'Performance';
    this.log('🔍 Testing: Performance', 'info');

    try {
      // Test analysis performance
      const startTime = performance.now();
      
      const largeMemberData = {
        username: 'PerfTestUser',
        posts: Array.from({ length: 50 }, (_, i) => ({
          id: `perf-${i}`,
          content: `Performance test post number ${i} with some content to analyze. This post contains various patterns and text to test the analyzer performance.`,
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        })),
        engagement: { totalComments: 25, totalLikes: 75 },
        lastSeen: Date.now()
      };

      const analysis = await skoolAnalyzer.analyzeMember(largeMemberData);
      const endTime = performance.now();
      const analysisTime = endTime - startTime;

      if (analysisTime > 2000) { // 2 seconds threshold
        throw new Error(`Analysis took too long: ${analysisTime.toFixed(2)}ms`);
      }

      // Test storage performance
      const storageStartTime = performance.now();
      await skoolStorage.saveMemberData('perf-test-user', largeMemberData);
      const loadedData = await skoolStorage.getMemberData('perf-test-user');
      const storageEndTime = performance.now();
      const storageTime = storageEndTime - storageStartTime;

      if (storageTime > 1000) { // 1 second threshold
        throw new Error(`Storage operations took too long: ${storageTime.toFixed(2)}ms`);
      }

      // Cleanup
      await skoolStorage.deleteMemberData('perf-test-user');

      this.addResult(testName, true, `Analysis: ${analysisTime.toFixed(2)}ms, Storage: ${storageTime.toFixed(2)}ms`);
      this.log(`✅ ${testName} passed`, 'success');
    } catch (error) {
      this.addResult(testName, false, error.message);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  // Utility methods
  addResult(testName, passed, message) {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: Date.now()
    });
  }

  log(message, level = 'info') {
    const styles = {
      info: 'color: #2563eb; font-weight: bold;',
      success: 'color: #16a34a; font-weight: bold;',
      error: 'color: #dc2626; font-weight: bold;',
      warning: 'color: #d97706; font-weight: bold;'
    };

    console.log(`%c${message}`, styles[level] || styles.info);
  }

  generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => r.passed === false).length;
    const total = this.testResults.length;

    this.log('\n================================================', 'info');
    this.log('🧪 TEST RESULTS SUMMARY', 'info');
    this.log('================================================', 'info');
    this.log(`Total Tests: ${total}`, 'info');
    this.log(`Passed: ${passed}`, 'success');
    this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, 'info');
    this.log(`Total Time: ${totalTime}ms`, 'info');

    if (failed > 0) {
      this.log('\n❌ FAILED TESTS:', 'error');
      this.testResults.filter(r => !r.passed).forEach(result => {
        this.log(`  • ${result.test}: ${result.message}`, 'error');
      });
    }

    this.log('\n✅ PASSED TESTS:', 'success');
    this.testResults.filter(r => r.passed).forEach(result => {
      this.log(`  • ${result.test}: ${result.message}`, 'success');
    });

    // Return results for programmatic access
    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      totalTime,
      results: this.testResults
    };
  }

  // Quick test for specific functionality
  async quickTest(testName) {
    if (this[testName]) {
      await this[testName]();
    } else {
      this.log(`Test '${testName}' not found`, 'error');
    }
  }
}

// Make tester available globally
window.ExtensionTester = ExtensionTester;

// Auto-run tests if this is a Skool page
if (window.location.hostname.includes('skool.com')) {
  console.log('%c🧪 Skool Quality Detector Extension Tester Loaded', 'color: #2563eb; font-weight: bold; font-size: 16px;');
  console.log('%cRun "new ExtensionTester().runAllTests()" to start testing', 'color: #16a34a; font-weight: bold;');
  console.log('%cOr run "new ExtensionTester().quickTest(\'testName\')" for individual tests', 'color: #d97706;');
}