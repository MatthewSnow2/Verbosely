// Content script for Skool Quality Detector Extension

class SkoolContentAnalyzer {
  constructor() {
    this.observedMembers = new Map();
    this.processingQueue = new Set();
    this.settings = null;
    this.isInitialized = false;
    this.badgeContainer = null;
    
    this.initialize();
  }

  async initialize() {
    try {
      this.settings = await skoolStorage.getSettings();
      
      if (this.settings.analysisEnabled) {
        this.startObservation();
        this.createBadgeContainer();
        console.log('Skool Quality Detector: Initialized');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Skool Quality Detector: Failed to initialize', error);
    }
  }

  // Start observing DOM changes
  startObservation() {
    // Process existing content
    this.processExistingContent();
    
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-testid']
    });
    
    // Set up periodic cleanup
    setInterval(() => this.cleanupExpiredData(), 5 * 60 * 1000); // 5 minutes
  }

  // Process existing content on page
  processExistingContent() {
    const posts = this.findPosts();
    posts.forEach(post => this.processPost(post));
  }

  // Handle DOM mutations
  handleMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processNewElement(node);
          }
        });
      }
    }
  }

  // Process newly added elements
  processNewElement(element) {
    // Check if element is or contains posts
    const posts = element.matches && element.matches(this.getPostSelector()) 
      ? [element] 
      : element.querySelectorAll ? Array.from(element.querySelectorAll(this.getPostSelector())) : [];
    
    posts.forEach(post => this.processPost(post));
  }

  // Get post selector based on common Skool patterns
  getPostSelector() {
    return SKOOL_SELECTORS.posts;
  }

  // Find all posts on current page
  findPosts() {
    return Array.from(document.querySelectorAll(this.getPostSelector()));
  }

  // Process individual post
  async processPost(postElement) {
    if (!postElement || this.processingQueue.has(postElement)) return;
    
    this.processingQueue.add(postElement);
    
    try {
      const memberData = this.extractMemberDataFromPost(postElement);
      
      if (memberData && memberData.userId && memberData.username) {
        await this.updateMemberData(memberData);
        await this.displayQualityBadge(postElement, memberData.userId);
      }
    } catch (error) {
      console.error('Error processing post:', error);
    } finally {
      this.processingQueue.delete(postElement);
    }
  }

  // Extract member data from post element
  extractMemberDataFromPost(postElement) {
    try {
      // Extract author information
      const authorElement = postElement.querySelector(SKOOL_SELECTORS.postAuthor);
      if (!authorElement) return null;
      
      const username = this.extractUsername(authorElement);
      const userId = this.generateUserId(username, authorElement);
      
      if (!username || !userId) return null;
      
      // Extract post content
      const contentElement = postElement.querySelector(SKOOL_SELECTORS.postContent);
      const content = contentElement ? contentElement.textContent.trim() : '';
      
      // Extract timestamp
      const timestampElement = postElement.querySelector(SKOOL_SELECTORS.postTimestamp);
      const timestamp = this.extractTimestamp(timestampElement);
      
      // Extract engagement data
      const engagement = this.extractEngagementData(postElement);
      
      // Create post data
      const postData = {
        id: this.generatePostId(postElement),
        content,
        timestamp: timestamp || new Date().toISOString(),
        length: content.length,
        hasLinks: this.hasLinks(content),
        hasImages: this.hasImages(postElement),
        engagement
      };
      
      return {
        userId,
        username,
        posts: [postData],
        engagement: {
          totalComments: engagement.comments,
          totalLikes: engagement.likes,
          totalShares: engagement.shares
        },
        lastSeen: Date.now()
      };
    } catch (error) {
      console.error('Error extracting member data:', error);
      return null;
    }
  }

  // Extract username from author element
  extractUsername(authorElement) {
    // Try multiple approaches to find username
    const usernameText = 
      authorElement.textContent?.trim() ||
      authorElement.getAttribute('title') ||
      authorElement.getAttribute('alt') ||
      authorElement.querySelector('.username')?.textContent ||
      authorElement.querySelector('.display-name')?.textContent ||
      authorElement.querySelector('[data-testid*="name"]')?.textContent;
    
    return usernameText ? usernameText.trim() : null;
  }

  // Generate unique user ID
  generateUserId(username, authorElement) {
    // Try to find a data attribute with user ID
    const dataId = authorElement.getAttribute('data-user-id') ||
                   authorElement.getAttribute('data-member-id') ||
                   authorElement.closest('[data-user-id]')?.getAttribute('data-user-id');
    
    if (dataId) return dataId;
    
    // Fallback to hash of username + href if available
    const profileLink = authorElement.href || authorElement.querySelector('a')?.href;
    if (profileLink) {
      return this.hashString(profileLink);
    }
    
    // Final fallback to username hash
    return this.hashString(username);
  }

  // Generate post ID
  generatePostId(postElement) {
    return postElement.getAttribute('data-post-id') ||
           postElement.getAttribute('id') ||
           this.hashString(postElement.outerHTML.substring(0, 200));
  }

  // Extract timestamp from element
  extractTimestamp(timestampElement) {
    if (!timestampElement) return null;
    
    // Try various timestamp formats
    const timeAttr = timestampElement.getAttribute('datetime') ||
                     timestampElement.getAttribute('data-timestamp') ||
                     timestampElement.title;
    
    if (timeAttr) {
      const parsed = new Date(timeAttr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    
    // Try parsing text content
    const timeText = timestampElement.textContent.trim();
    if (timeText) {
      const parsed = this.parseTimeText(timeText);
      if (parsed) return parsed.toISOString();
    }
    
    return null;
  }

  // Parse relative time text like "2h ago", "yesterday", etc.
  parseTimeText(timeText) {
    const now = new Date();
    const lowerText = timeText.toLowerCase();
    
    // Handle "X minutes/hours/days ago"
    const relativeMatch = lowerText.match(/(\d+)\s*(minute|hour|day|week|month)s?\s*ago/);
    if (relativeMatch) {
      const amount = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2];
      
      switch (unit) {
        case 'minute':
          return new Date(now.getTime() - amount * 60 * 1000);
        case 'hour':
          return new Date(now.getTime() - amount * 60 * 60 * 1000);
        case 'day':
          return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
        case 'week':
          return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
      }
    }
    
    // Handle "yesterday", "today", etc.
    if (lowerText.includes('yesterday')) {
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    if (lowerText.includes('today')) {
      return now;
    }
    
    // Try direct date parsing
    const parsed = new Date(timeText);
    return !isNaN(parsed.getTime()) ? parsed : null;
  }

  // Extract engagement data from post
  extractEngagementData(postElement) {
    const engagement = {
      likes: 0,
      comments: 0,
      shares: 0
    };
    
    // Try to find like count
    const likeElements = postElement.querySelectorAll(SKOOL_SELECTORS.likes);
    likeElements.forEach(element => {
      const count = this.extractCount(element);
      if (count !== null) engagement.likes += count;
    });
    
    // Try to find comment count
    const commentElements = postElement.querySelectorAll(SKOOL_SELECTORS.comments);
    engagement.comments = commentElements.length;
    
    return engagement;
  }

  // Extract numeric count from element
  extractCount(element) {
    const text = element.textContent.trim();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Check if content has external links
  hasLinks(content) {
    return /https?:\/\/[^\s]+/.test(content);
  }

  // Check if post has images
  hasImages(postElement) {
    return postElement.querySelector('img') !== null;
  }

  // Update member data in storage
  async updateMemberData(newData) {
    try {
      const existingData = await skoolStorage.getMemberData(newData.userId);
      
      if (existingData) {
        // Merge post data
        const existingPosts = existingData.posts || [];
        const newPost = newData.posts[0];
        
        // Check if post already exists
        if (!existingPosts.find(post => post.id === newPost.id)) {
          existingPosts.push(newPost);
          
          // Keep only recent posts to manage storage
          if (existingPosts.length > ANALYSIS_SETTINGS.maxPostsToAnalyze) {
            existingPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            existingPosts.splice(ANALYSIS_SETTINGS.maxPostsToAnalyze);
          }
        }
        
        // Update merged data
        const mergedData = {
          ...existingData,
          username: newData.username, // Update in case of username change
          posts: existingPosts,
          engagement: {
            totalComments: (existingData.engagement?.totalComments || 0) + newData.engagement.totalComments,
            totalLikes: (existingData.engagement?.totalLikes || 0) + newData.engagement.totalLikes,
            totalShares: (existingData.engagement?.totalShares || 0) + newData.engagement.totalShares
          },
          lastSeen: Date.now()
        };
        
        await skoolStorage.saveMemberData(newData.userId, mergedData);
        this.observedMembers.set(newData.userId, mergedData);
      } else {
        // Save new member data
        await skoolStorage.saveMemberData(newData.userId, newData);
        this.observedMembers.set(newData.userId, newData);
      }
    } catch (error) {
      console.error('Error updating member data:', error);
    }
  }

  // Display quality badge for member
  async displayQualityBadge(postElement, userId) {
    if (!this.settings.enableQualityBadges) return;
    
    try {
      // Check if badge already exists
      if (postElement.querySelector('.skool-quality-badge')) return;
      
      const memberData = this.observedMembers.get(userId) || await skoolStorage.getMemberData(userId);
      if (!memberData) return;
      
      // Analyze member quality
      const analysis = await skoolAnalyzer.analyzeMember(memberData);
      
      if (analysis.confidenceLevel < (this.settings.minimumConfidence * 100)) return;
      
      // Create and insert badge
      const badge = this.createQualityBadge(analysis);
      this.insertBadge(postElement, badge);
      
      // Add tooltip if enabled
      if (this.settings.enableTooltips) {
        this.addTooltip(badge, analysis, memberData);
      }
    } catch (error) {
      console.error('Error displaying quality badge:', error);
    }
  }

  // Create quality badge element
  createQualityBadge(analysis) {
    const badge = document.createElement('span');
    badge.className = 'skool-quality-badge';
    badge.setAttribute('data-category', analysis.category);
    badge.setAttribute('data-score', analysis.qualityScore);
    badge.setAttribute('data-confidence', analysis.confidenceLevel);
    
    // Set badge appearance based on category
    const color = BADGE_COLORS[analysis.category.toUpperCase()];
    const icon = BADGE_ICONS[analysis.category.toUpperCase()];
    
    badge.style.cssText = `
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: ${color};
      margin-left: 4px;
      cursor: pointer;
      position: relative;
      vertical-align: middle;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    `;
    
    badge.textContent = icon;
    badge.title = `Quality Score: ${analysis.qualityScore} (${analysis.confidenceLevel}% confidence)`;
    
    return badge;
  }

  // Insert badge next to username
  insertBadge(postElement, badge) {
    const authorElement = postElement.querySelector(SKOOL_SELECTORS.postAuthor);
    if (authorElement) {
      authorElement.appendChild(badge);
    }
  }

  // Add detailed tooltip to badge
  addTooltip(badge, analysis, memberData) {
    let tooltip = null;
    
    badge.addEventListener('mouseenter', () => {
      tooltip = this.createTooltip(analysis, memberData);
      document.body.appendChild(tooltip);
      this.positionTooltip(badge, tooltip);
    });
    
    badge.addEventListener('mouseleave', () => {
      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
      }
    });
  }

  // Create detailed tooltip
  createTooltip(analysis, memberData) {
    const tooltip = document.createElement('div');
    tooltip.className = 'skool-quality-tooltip';
    
    const summary = skoolAnalyzer.generateAnalysisSummary(analysis);
    
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <strong>${memberData.username}</strong>
        <span class="score">Score: ${analysis.qualityScore}</span>
      </div>
      <div class="tooltip-body">
        <p>${summary}</p>
        <div class="stats">
          <div>Posts analyzed: ${analysis.details.postCount}</div>
          <div>Avg post length: ${analysis.details.avgPostLength} chars</div>
          <div>Confidence: ${analysis.confidenceLevel}%</div>
        </div>
        ${analysis.flags.length > 0 ? `<div class="flags">Flags: ${analysis.flags.join(', ')}</div>` : ''}
      </div>
    `;
    
    tooltip.style.cssText = `
      position: absolute;
      background: #333;
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      max-width: 280px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
    `;
    
    return tooltip;
  }

  // Position tooltip relative to badge
  positionTooltip(badge, tooltip) {
    const badgeRect = badge.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = badgeRect.left - tooltipRect.width / 2 + badgeRect.width / 2;
    let top = badgeRect.top - tooltipRect.height - 8;
    
    // Adjust for viewport boundaries
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    
    if (top < 8) {
      top = badgeRect.bottom + 8;
    }
    
    tooltip.style.left = left + window.scrollX + 'px';
    tooltip.style.top = top + window.scrollY + 'px';
  }

  // Create container for badge styles
  createBadgeContainer() {
    if (document.getElementById('skool-quality-detector-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'skool-quality-detector-styles';
    style.textContent = `
      .skool-quality-badge {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .skool-quality-badge:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      .skool-quality-tooltip .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        border-bottom: 1px solid #555;
        padding-bottom: 6px;
      }
      
      .skool-quality-tooltip .score {
        font-weight: bold;
        color: #4ade80;
      }
      
      .skool-quality-tooltip .stats {
        margin: 8px 0;
        font-size: 11px;
        opacity: 0.9;
      }
      
      .skool-quality-tooltip .flags {
        margin-top: 8px;
        padding: 4px 8px;
        background: rgba(239, 68, 68, 0.2);
        border-radius: 4px;
        font-size: 11px;
        color: #fca5a5;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Utility function to hash strings
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  // Clean up expired data periodically
  async cleanupExpiredData() {
    try {
      await skoolStorage.cleanupExpiredData();
      
      // Clean up in-memory cache
      const now = Date.now();
      const expiredKeys = [];
      
      this.observedMembers.forEach((data, userId) => {
        if (data.lastSeen && (now - data.lastSeen > 24 * 60 * 60 * 1000)) { // 24 hours
          expiredKeys.push(userId);
        }
      });
      
      expiredKeys.forEach(key => this.observedMembers.delete(key));
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Public method to refresh analysis for specific member
  async refreshMemberAnalysis(userId) {
    const memberData = await skoolStorage.getMemberData(userId);
    if (memberData) {
      const posts = document.querySelectorAll(SKOOL_SELECTORS.posts);
      posts.forEach(post => {
        const authorElement = post.querySelector(SKOOL_SELECTORS.postAuthor);
        if (authorElement) {
          const postUserId = this.generateUserId(
            this.extractUsername(authorElement),
            authorElement
          );
          
          if (postUserId === userId) {
            // Remove existing badge
            const existingBadge = post.querySelector('.skool-quality-badge');
            if (existingBadge) {
              existingBadge.remove();
            }
            
            // Add new badge
            this.displayQualityBadge(post, userId);
          }
        }
      });
    }
  }
}

// Message handler for background script communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'ping':
        sendResponse({ success: true, status: 'Content script active' });
        break;
        
      case 'refreshAnalysis':
        if (skoolAnalyzer_instance) {
          // Refresh analysis for current page
          skoolAnalyzer_instance.processExistingContent();
          sendResponse({ success: true, status: 'Analysis refreshed' });
        } else {
          sendResponse({ success: false, error: 'Content analyzer not initialized' });
        }
        break;
        
      case 'settingsChanged':
        if (skoolAnalyzer_instance && message.settings) {
          skoolAnalyzer_instance.settings = message.settings;
          // Re-process existing content with new settings
          skoolAnalyzer_instance.processExistingContent();
          sendResponse({ success: true, status: 'Settings updated' });
        } else {
          sendResponse({ success: false, error: 'Cannot update settings' });
        }
        break;
        
      case 'getStatus':
        sendResponse({ 
          success: true, 
          status: skoolAnalyzer_instance ? 'initialized' : 'not initialized',
          isSkoolPage: window.location.hostname.includes('skool.com')
        });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error in content script message handler:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open for async responses
});

// Initialize when page loads
let skoolAnalyzer_instance = null;

function initializeAnalyzer() {
  try {
    if (typeof SkoolContentAnalyzer !== 'undefined') {
      skoolAnalyzer_instance = new SkoolContentAnalyzer();
      console.log('Skool Quality Detector: Content analyzer initialized');
    } else {
      console.warn('Skool Quality Detector: SkoolContentAnalyzer class not available');
    }
  } catch (error) {
    console.error('Skool Quality Detector: Error initializing content analyzer:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalyzer);
} else {
  initializeAnalyzer();
}

// Make instance available globally for debugging
window.skoolContentAnalyzer = skoolAnalyzer_instance;

// Message listener for background script communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'ping':
        sendResponse({ success: true, status: 'content script active' });
        break;
        
      case 'refreshAnalysis':
        if (skoolAnalyzer_instance) {
          // Re-process existing content
          skoolAnalyzer_instance.processExistingContent();
          sendResponse({ success: true, message: 'Analysis refreshed' });
        } else {
          sendResponse({ success: false, error: 'Content analyzer not initialized' });
        }
        break;
        
      case 'settingsChanged':
        if (skoolAnalyzer_instance) {
          skoolAnalyzer_instance.settings = message.settings;
          // Optionally refresh display based on new settings
          if (message.settings.analysisEnabled) {
            skoolAnalyzer_instance.processExistingContent();
          }
          sendResponse({ success: true, message: 'Settings updated' });
        } else {
          sendResponse({ success: false, error: 'Content analyzer not initialized' });
        }
        break;
        
      case 'getStatus':
        sendResponse({ 
          success: true, 
          initialized: !!skoolAnalyzer_instance,
          observedMembers: skoolAnalyzer_instance?.observedMembers?.size || 0,
          url: window.location.href
        });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action: ' + message.action });
    }
  } catch (error) {
    console.error('Content script message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Indicate async response
});