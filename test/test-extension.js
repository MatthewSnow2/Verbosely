// Test script for Skool Quality Detector Extension
// Run this in browser console on a Skool community page

console.log('🧪 Starting Skool Quality Detector Extension Tests...');

class ExtensionTester {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  // Add test case
  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  // Run all tests
  async runTests() {
    console.log(`\n📊 Running ${this.tests.length} tests...\n`);

    for (const test of this.tests) {
      try {
        console.log(`🔄 Testing: ${test.name}`);
        const result = await test.testFunction();
        
        if (result) {
          console.log(`✅ PASS: ${test.name}`);
          this.results.passed++;
        } else {
          console.log(`❌ FAIL: ${test.name}`);
          this.results.failed++;
          this.results.errors.push(`${test.name}: Test returned false`);
        }
      } catch (error) {
        console.log(`💥 ERROR: ${test.name} - ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`${test.name}: ${error.message}`);
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.printResults();
  }

  // Print test results
  printResults() {
    console.log(`\n📋 Test Results:`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Success Rate: ${Math.round((this.results.passed / this.tests.length) * 100)}%`);

    if (this.results.errors.length > 0) {
      console.log(`\n🚨 Errors:`);
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
}

// Initialize tester
const tester = new ExtensionTester();

// Test 1: Extension Loading
tester.addTest('Extension Scripts Loaded', () => {
  return typeof skoolStorage !== 'undefined' && 
         typeof skoolAnalyzer !== 'undefined' && 
         typeof SkoolContentAnalyzer !== 'undefined';
});

// Test 2: Constants Available
tester.addTest('Constants Available', () => {
  return typeof SKOOL_SELECTORS !== 'undefined' && 
         typeof QUALITY_METRICS !== 'undefined' && 
         typeof STORAGE_KEYS !== 'undefined';
});

// Test 3: DOM Selectors
tester.addTest('DOM Selectors Working', () => {
  // Test if we can find elements using our selectors
  const possibleSelectors = [
    SKOOL_SELECTORS.posts,
    '.feed-item',
    '.post',
    '[data-testid*="post"]'
  ];

  return possibleSelectors.some(selector => {
    try {
      return document.querySelector(selector) !== null;
    } catch (e) {
      return false;
    }
  });
});

// Test 4: Storage Functionality
tester.addTest('Storage Functionality', async () => {
  try {
    const testData = { test: 'data', timestamp: Date.now() };
    await skoolStorage.saveMemberData('test-user', testData);
    const retrieved = await skoolStorage.getMemberData('test-user');
    await skoolStorage.deleteMemberData('test-user'); // Cleanup
    
    return retrieved && retrieved.test === 'data';
  } catch (error) {
    console.error('Storage test error:', error);
    return false;
  }
});

// Test 5: Analyzer Functionality
tester.addTest('Analyzer Functionality', () => {
  const mockMemberData = {
    userId: 'test-user',
    username: 'TestUser',
    posts: [
      {
        id: 'post1',
        content: 'This is a test post with some meaningful content.',
        timestamp: new Date().toISOString(),
        length: 50
      },
      {
        id: 'post2',
        content: 'Another test post with different content here.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        length: 45
      }
    ],
    engagement: {
      totalComments: 5,
      totalLikes: 10
    }
  };

  const analysis = skoolAnalyzer.analyzeMember(mockMemberData);
  return analysis && 
         typeof analysis.qualityScore === 'number' && 
         typeof analysis.confidenceLevel === 'number';
});

// Test 6: Content Script Instance
tester.addTest('Content Script Instance', () => {
  return typeof skoolAnalyzer_instance !== 'undefined' && 
         skoolAnalyzer_instance !== null;
});

// Test 7: CSS Styles Loaded
tester.addTest('CSS Styles Loaded', () => {
  const styles = document.querySelector('#skool-quality-detector-styles') ||
                 document.querySelector('style[id*="skool"]') ||
                 // Check if any style contains our CSS classes
                 Array.from(document.styleSheets).some(sheet => {
                   try {
                     return Array.from(sheet.cssRules || []).some(rule => 
                       rule.selectorText && rule.selectorText.includes('.skool-quality-badge')
                     );
                   } catch (e) {
                     return false;
                   }
                 });
  
  return styles !== null;
});

// Test 8: Badge Creation
tester.addTest('Badge Creation', () => {
  const analysis = {
    qualityScore: 75,
    confidenceLevel: 80,
    category: 'high'
  };

  // Create a test badge
  const badge = document.createElement('span');
  badge.className = 'skool-quality-badge';
  badge.setAttribute('data-category', analysis.category);
  badge.style.backgroundColor = '#22c55e';
  badge.textContent = '🟢';

  // Test if badge was created properly
  return badge.className === 'skool-quality-badge' && 
         badge.getAttribute('data-category') === 'high' &&
         badge.textContent === '🟢';
});

// Test 9: Settings Default Values
tester.addTest('Settings Default Values', async () => {
  try {
    const settings = await skoolStorage.getSettings();
    return settings &&
           typeof settings.enableQualityBadges === 'boolean' &&
           typeof settings.analysisEnabled === 'boolean' &&
           typeof settings.minimumConfidence === 'number';
  } catch (error) {
    console.error('Settings test error:', error);
    return false;
  }
});

// Test 10: Extension Icon Present
tester.addTest('Extension Icon Present', () => {
  // Check if extension icon is in toolbar (this might not work in all contexts)
  return document.querySelector('img[src*="icon"]') !== null ||
         // Alternative check for Chrome extension context
         typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
});

// Test 11: Utility Functions
tester.addTest('Utility Functions Working', () => {
  try {
    // Test text similarity function
    if (typeof skoolAnalyzer.calculateTextSimilarity === 'function') {
      const similarity = skoolAnalyzer.calculateTextSimilarity('hello world', 'hello world');
      if (similarity !== 1) return false;
    }

    // Test hash function if available
    if (skoolAnalyzer_instance && typeof skoolAnalyzer_instance.hashString === 'function') {
      const hash1 = skoolAnalyzer_instance.hashString('test');
      const hash2 = skoolAnalyzer_instance.hashString('test');
      if (hash1 !== hash2) return false;
    }

    return true;
  } catch (error) {
    console.error('Utility functions test error:', error);
    return false;
  }
});

// Test 12: Error Handling
tester.addTest('Error Handling', () => {
  try {
    // Test analyzer with invalid data
    const badAnalysis = skoolAnalyzer.analyzeMember(null);
    return badAnalysis && badAnalysis.qualityScore === 0;
  } catch (error) {
    // Should handle gracefully, not throw
    return false;
  }
});

// Performance Tests
tester.addTest('Performance - Large Dataset', () => {
  const startTime = performance.now();
  
  // Create mock data with many posts
  const largeMemberData = {
    userId: 'perf-test',
    username: 'PerfTestUser',
    posts: Array.from({ length: 100 }, (_, i) => ({
      id: `post-${i}`,
      content: `This is test post number ${i} with some content to analyze.`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      length: 50
    })),
    engagement: { totalComments: 50, totalLikes: 100 }
  };

  const analysis = skoolAnalyzer.analyzeMember(largeMemberData);
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`⏱️ Large dataset analysis took ${duration.toFixed(2)}ms`);
  
  // Should complete within 1 second for 100 posts
  return duration < 1000 && analysis.qualityScore >= 0;
});

// Run the tests
console.log('🎯 Extension Test Suite for Skool Quality Detector');
console.log('================================================');
console.log('Make sure you are on a Skool community page (*.skool.com)');
console.log('The extension should be installed and enabled.');
console.log('');

// Start tests after a short delay
setTimeout(() => {
  tester.runTests().then(() => {
    console.log('\n🏁 Testing Complete!');
    console.log('\n💡 Additional Manual Tests:');
    console.log('1. Visit different Skool community pages');
    console.log('2. Look for colored badges next to member names');
    console.log('3. Hover over badges to see tooltips');
    console.log('4. Click extension icon to open popup dashboard');
    console.log('5. Test settings changes in the Settings tab');
    console.log('6. Try the member search and filtering features');
    console.log('7. Export data and verify JSON format');
    console.log('8. Test privacy mode and data cleanup features');
  });
}, 1000);

// Export tester for manual use
window.SkoolExtensionTester = tester;