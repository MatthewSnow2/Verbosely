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
      console.log('✅ Skool Quality Detector - Content Script Loaded!');
      
      // Mark that extension is loaded
      window.SKOOL_EXTENSION_LOADED = true;
      
      // Check if we're on a Skool page
      if (!window.location.hostname.includes('skool.com')) {
        console.log('Skool Quality Detector: Not on a Skool page, skipping initialization');
        return;
      }
      
      // Set up message listener for popup communication
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'refreshAnalysis') {
          this.refreshAnalysis();
          sendResponse({ status: 'success' });
        } else if (request.action === 'ping') {
          sendResponse({ status: 'alive', initialized: this.isInitialized });
        }
        return true;
      });
      
      this.settings = await skoolStorage.getSettings();
      console.log('Skool Quality Detector: Settings loaded:', this.settings);
      
      if (this.settings.analysisEnabled) {
        this.startObservation();
        this.createBadgeContainer();
        console.log('Skool Quality Detector: Analysis started, badges enabled');
      } else {
        console.log('Skool Quality Detector: Analysis disabled in settings');
      }
      
      this.isInitialized = true;
      console.log('Skool Quality Detector: Initialized successfully');
    } catch (error) {
      console.error('Skool Quality Detector: Failed to initialize', error);
      console.error('Error details:', error.stack);
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
    console.log('Skool Quality Detector: Processing existing content...');
    const posts = this.findPosts();
    console.log(`Skool Quality Detector: Found ${posts.length} posts to process`);
    
    if (posts.length === 0) {
      console.log('Skool Quality Detector: No posts found. Checking DOM structure...');
      this.debugDOMStructure();
    }
    
    posts.forEach((post, index) => {
      console.log(`Processing post ${index + 1}/${posts.length}`);
      this.processPost(post);
    });
  }
  
  // Debug DOM structure to understand Skool's layout
  debugDOMStructure() {
    console.log('DOM Structure Debug:');
    console.log('- Current URL:', window.location.href);
    console.log('- Page title:', document.title);
    
    // Check for common post-like elements
    const potentialPosts = [
      'article',
      '[class*="post"]',
      '[class*="feed"]', 
      '[class*="item"]',
      '[data-testid]',
      '[role="article"]'
    ];
    
    potentialPosts.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`- Found ${elements.length} elements matching "${selector}"`);
        Array.from(elements).slice(0, 2).forEach((el, i) => {
          console.log(`  Example ${i + 1}:`, el.className, el.outerHTML.substring(0, 150));
        });
      }
    });
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
    let posts = [];
    
    // First check if the element itself is a post
    for (const selector of SKOOL_SELECTORS.posts) {
      try {
        if (element.matches && element.matches(selector)) {
          posts = [element];
          break;
        }
      } catch (error) {
        // Selector not supported, continue
      }
    }
    
    // If element is not a post itself, look for posts inside it
    if (posts.length === 0 && element.querySelectorAll) {
      for (const selector of SKOOL_SELECTORS.posts) {
        try {
          const foundPosts = element.querySelectorAll(selector);
          if (foundPosts.length > 0) {
            posts = Array.from(foundPosts);
            break;
          }
        } catch (error) {
          // Selector not supported, continue
        }
      }
    }
    
    posts.forEach(post => this.processPost(post));
  }

  // Find posts using progressive selector strategy
  findPosts() {
    console.log('Skool Quality Detector: Starting post detection...');
    
    // First try simple selectors
    const simpleStrategies = [
      '[data-testid*="post"]',
      'article', 
      '[role="article"]',
      'div[class*="post"]',
      'div[class*="feed"]',
      'li[class*="feed"]',
      '.post-item', 
      '.feed-item'
    ];
    
    let foundPosts = [];
    
    // Try simple selectors first
    for (const selector of simpleStrategies) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundPosts = Array.from(elements);
          console.log(`✅ Found ${foundPosts.length} posts using selector: "${selector}"`);
          this.lastSuccessfulPostSelector = selector;
          break;
        }
      } catch (error) {
        console.warn(`⚠️ Simple selector failed: "${selector}"`, error);
      }
    }
    
    // If no posts found with simple selectors, try complex approach
    if (foundPosts.length === 0) {
      console.log('🔍 No posts with simple selectors, trying advanced detection...');
      foundPosts = this.findPostsAdvanced();
    }
    
    if (foundPosts.length === 0) {
      console.warn('❌ No posts found with any selector. Analyzing page structure...');
      this.debugNoPostsFound();
    }
    
    return foundPosts;
  }
  
  // Advanced post detection that manually searches for containers with user links
  findPostsAdvanced() {
    console.log('🔍 Advanced post detection starting...');
    const candidatePosts = [];
    
    // Look for any div/li that contains user profile links (/@username)
    const userLinks = document.querySelectorAll('a[href*="/@"]');
    console.log(`Found ${userLinks.length} user profile links`);
    
    userLinks.forEach(link => {
      // Walk up the DOM to find a reasonable container
      let container = link.parentElement;
      let depth = 0;
      
      while (container && depth < 5) {
        // Check if this container looks like a post
        if (this.isPostContainer(container)) {
          // Avoid duplicates
          if (!candidatePosts.includes(container)) {
            candidatePosts.push(container);
            console.log(`📝 Found post container via user link: ${link.textContent.trim()}`);
          }
          break;
        }
        container = container.parentElement;
        depth++;
      }
    });
    
    console.log(`✅ Advanced detection found ${candidatePosts.length} potential posts`);
    return candidatePosts;
  }
  
  // Check if an element looks like a post container
  isPostContainer(element) {
    if (!element || element === document.body || element === document.html) return false;
    
    // Must have some text content
    const textContent = element.textContent?.trim() || '';
    if (textContent.length < 20) return false;
    
    // Should contain a user link
    const hasUserLink = element.querySelector('a[href*="/@"]') !== null;
    if (!hasUserLink) return false;
    
    // Should have reasonable size (not tiny UI elements)
    const rect = element.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 50) return false;
    
    // Common post indicators
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    
    // Prefer elements that look post-like
    const postIndicators = [
      tagName === 'article',
      tagName === 'li',
      className.includes('post'),
      className.includes('feed'),
      className.includes('item'),
      element.querySelector('button'), // Posts often have interaction buttons
      element.querySelector('time'), // Posts often have timestamps
    ];
    
    const hasPostIndicators = postIndicators.filter(Boolean).length > 0;
    
    console.log(`🔍 Container analysis: ${tagName}.${className} - text:${textContent.length}ch, hasUserLink:${hasUserLink}, indicators:${hasPostIndicators}`);
    
    return hasPostIndicators;
  }
  
  // Advanced author detection when selectors fail
  findAuthorAdvanced(postElement) {
    console.log('🔍 Advanced author detection starting...');
    
    // Look for user profile links first (most reliable)
    const userLinks = postElement.querySelectorAll('a[href*="/@"]');
    if (userLinks.length > 0) {
      // Find the most likely author link (usually first one or one with name-like text)
      for (const link of userLinks) {
        const text = link.textContent.trim();
        if (text && text.length > 0 && text.length < 50) {
          console.log(`📝 Found author via profile link: ${text}`);
          return link;
        }
      }
      // Fallback to first user link even if no good text
      console.log('📝 Using first profile link as author');
      return userLinks[0];
    }
    
    // Look for any clickable text that could be an author
    const clickableElements = postElement.querySelectorAll('a, button, span[onclick], div[onclick]');
    for (const element of clickableElements) {
      const text = element.textContent.trim();
      if (text && text.length > 2 && text.length < 30) {
        // Check if it looks like a username (no spaces, or reasonable name)
        if (!text.includes('\n') && (text.split(' ').length <= 2)) {
          console.log(`📝 Found potential author via clickable element: ${text}`);
          return element;
        }
      }
    }
    
    // Look for strong/bold text that might be usernames
    const strongElements = postElement.querySelectorAll('strong, b, h1, h2, h3, h4, h5, h6');
    for (const element of strongElements) {
      const text = element.textContent.trim();
      if (text && text.length > 2 && text.length < 30 && !text.includes('\n')) {
        console.log(`📝 Found potential author via strong text: ${text}`);
        return element;
      }
    }
    
    console.log('❌ Advanced author detection failed');
    return null;
  }

  // Debug when no posts are found
  debugNoPostsFound() {
    const debugInfo = {
      url: window.location.href,
      totalElements: document.querySelectorAll('*').length,
      articles: document.querySelectorAll('article').length,
      divs: document.querySelectorAll('div').length,
      lists: document.querySelectorAll('li').length,
      profileLinks: document.querySelectorAll('a[href*="/@"]').length,
      hasReactRoot: !!document.querySelector('#__next, [data-reactroot]'),
      pageType: this.detectPageType()
    };
    
    console.log('🔍 Debug Info for Empty Posts:', debugInfo);
    
    // Show user-friendly message based on page type
    if (debugInfo.pageType === 'about') {
      this.showUserMessage('info', 'Navigate to the community feed to analyze posts');
    } else if (debugInfo.pageType === 'login') {
      this.showUserMessage('warning', 'Please log in to access community content');  
    } else if (debugInfo.profileLinks > 0) {
      this.showUserMessage('info', `Found ${debugInfo.profileLinks} members, but no posts detected. This might be a member-only area.`);
    }
  }

  // Detect what type of Skool page we're on
  detectPageType() {
    const url = window.location.href;
    if (url.includes('/about')) return 'about';
    if (url.includes('/members')) return 'members';
    if (url.includes('/calendar')) return 'calendar';
    if (document.querySelector('input[type="password"]')) return 'login';
    if (document.querySelector('form[action*="login"]')) return 'login';
    return 'community';
  }

  // Show message to user (will be displayed in popup)
  showUserMessage(type, message) {
    // Store message for popup to display
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        'skool_detector_last_message': {
          type,
          message,
          timestamp: Date.now(),
          url: window.location.href
        }
      });
    }
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

  // Helper method to find element using array of selectors
  findElementWithSelectors(parentElement, selectorArray) {
    for (const selector of selectorArray) {
      try {
        const element = parentElement.querySelector(selector);
        if (element) return element;
      } catch (error) {
        console.warn(`Selector failed: "${selector}"`, error);
      }
    }
    return null;
  }

  // Extract member data from post element
  extractMemberDataFromPost(postElement) {
    try {
      // First, try to find author using progressive selectors
      let authorElement = this.findElementWithSelectors(postElement, SKOOL_SELECTORS.postAuthor);
      
      // If no author found with selectors, try advanced detection
      if (!authorElement) {
        console.log('🔍 No author found with selectors, trying advanced detection...');
        authorElement = this.findAuthorAdvanced(postElement);
      }
      
      if (!authorElement) {
        console.warn('❌ No author element found in post after all attempts');
        console.log('Post element:', postElement);
        console.log('Post HTML sample:', postElement.outerHTML.substring(0, 200) + '...');
        return null;
      }
      
      const username = this.extractUsername(authorElement);
      const userId = this.generateUserId(username, authorElement);
      
      if (!username || !userId) {
        console.warn('Failed to extract username/userId:', { username, userId, authorElement });
        return null;
      }
      
      console.log(`✅ Found member: ${username} (${userId})`);
      
      // Extract post content using progressive selectors
      const contentElement = this.findElementWithSelectors(postElement, SKOOL_SELECTORS.postContent);
      const content = contentElement ? contentElement.textContent.trim() : postElement.textContent.trim();
      
      // Extract timestamp using progressive selectors
      const timestampElement = this.findElementWithSelectors(postElement, SKOOL_SELECTORS.postTimestamp);
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
    console.log('🔍 Extracting username from element:', authorElement);
    
    // Try multiple approaches to find username
    let usernameText = null;
    
    // First try text content
    if (authorElement.textContent && authorElement.textContent.trim()) {
      usernameText = authorElement.textContent.trim();
      console.log('📝 Username from textContent:', usernameText);
    }
    
    // Try attributes if no text content
    if (!usernameText) {
      usernameText = authorElement.getAttribute('title') ||
                     authorElement.getAttribute('alt') ||
                     authorElement.getAttribute('aria-label');
      if (usernameText) {
        console.log('📝 Username from attributes:', usernameText);
      }
    }
    
    // Try child elements
    if (!usernameText) {
      const childSelectors = [
        '.username',
        '.display-name',
        '.user-name',
        '[data-testid*="name"]',
        'span',
        'strong',
        'b'
      ];
      
      for (const selector of childSelectors) {
        const child = authorElement.querySelector(selector);
        if (child && child.textContent && child.textContent.trim()) {
          usernameText = child.textContent.trim();
          console.log(`📝 Username from child ${selector}:`, usernameText);
          break;
        }
      }
    }
    
    // Extract username from href if it's a user profile link
    if (!usernameText && authorElement.href && authorElement.href.includes('/@')) {
      const match = authorElement.href.match(/@([^/?#]+)/);
      if (match) {
        usernameText = match[1];
        console.log('📝 Username from href:', usernameText);
      }
    }
    
    // Clean up the username
    if (usernameText) {
      // Remove extra whitespace and newlines
      usernameText = usernameText.replace(/\s+/g, ' ').trim();
      
      // If it's too long or has weird characters, it's probably not a username
      if (usernameText.length > 50 || usernameText.includes('\n')) {
        console.warn('❌ Username too long or contains newlines, rejecting:', usernameText);
        return null;
      }
      
      console.log('✅ Final username:', usernameText);
      return usernameText;
    }
    
    console.warn('❌ No username found in element');
    return null;
  }

  // Generate unique user ID
  generateUserId(username, authorElement) {
    console.log('🔍 Generating userId for:', username, authorElement);
    
    if (!username && !authorElement) {
      console.warn('❌ No username or author element provided');
      return null;
    }
    
    // Try to find a data attribute with user ID
    const dataId = authorElement.getAttribute('data-user-id') ||
                   authorElement.getAttribute('data-member-id') ||
                   authorElement.closest('[data-user-id]')?.getAttribute('data-user-id');
    
    if (dataId) {
      console.log('✅ Found data ID:', dataId);
      return dataId;
    }
    
    // Fallback to hash of username + href if available
    const profileLink = authorElement.href || authorElement.querySelector('a')?.href;
    if (profileLink) {
      const userId = this.hashString(profileLink);
      console.log('✅ Generated userId from profile link:', userId);
      return userId;
    }
    
    // Final fallback to username hash (if we have a username)
    if (username) {
      const userId = this.hashString(username);
      console.log('✅ Generated userId from username hash:', userId);
      return userId;
    }
    
    // Last resort: generate from element HTML
    const elementSignature = authorElement.outerHTML.substring(0, 100);
    const userId = this.hashString(elementSignature);
    console.log('✅ Generated userId from element signature:', userId);
    return userId;
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
  
  // Refresh analysis method for popup communication
  refreshAnalysis() {
    console.log('Skool Quality Detector: Refreshing analysis...');
    // Clear existing badges
    const existingBadges = document.querySelectorAll('.skool-quality-badge');
    existingBadges.forEach(badge => badge.remove());
    
    // Re-process existing content
    this.processExistingContent();
    console.log('Skool Quality Detector: Analysis refreshed');
  }
}


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

// Debugging functions
window.debugSkoolExtension = {
  checkInit: () => {
    console.log('Extension Initialization Check:');
    console.log('- skoolAnalyzer_instance:', !!skoolAnalyzer_instance);
    console.log('- Settings loaded:', skoolAnalyzer_instance?.settings);
    console.log('- Analysis enabled:', skoolAnalyzer_instance?.settings?.analysisEnabled);
    console.log('- Is initialized:', skoolAnalyzer_instance?.isInitialized);
    console.log('- Observed members:', skoolAnalyzer_instance?.observedMembers?.size || 0);
  },
  
  checkSelectors: () => {
    console.log('DOM Selector Check:');
    console.log('- Posts found:', document.querySelectorAll(SKOOL_SELECTORS.posts).length);
    console.log('- Post authors found:', document.querySelectorAll(SKOOL_SELECTORS.postAuthor).length);
    console.log('- Post content found:', document.querySelectorAll(SKOOL_SELECTORS.postContent).length);
    
    // Show actual DOM structure
    console.log('- Sample post elements:');
    const posts = document.querySelectorAll('[class*="post"], [class*="feed"], [data-testid*="post"]');
    Array.from(posts).slice(0, 3).forEach((post, index) => {
      console.log(`  Post ${index + 1}:`, post.className, post.outerHTML.slice(0, 200));
    });
  },
  
  testPostProcessing: () => {
    console.log('Testing Post Processing:');
    if (skoolAnalyzer_instance) {
      const posts = skoolAnalyzer_instance.findPosts();
      console.log('- Posts found by analyzer:', posts.length);
      
      if (posts.length > 0) {
        console.log('- Testing first post extraction...');
        const memberData = skoolAnalyzer_instance.extractMemberDataFromPost(posts[0]);
        console.log('- Extracted member data:', memberData);
      }
    } else {
      console.log('- Analyzer not initialized');
    }
  },
  
  checkStorage: async () => {
    console.log('Storage Check:');
    try {
      const allData = await skoolStorage.getAllMemberData();
      console.log('- All member data count:', Object.keys(allData).length);
      console.log('- Storage stats:', await skoolStorage.getStorageStats());
      console.log('- Settings:', await skoolStorage.getSettings());
    } catch (error) {
      console.error('- Storage error:', error);
    }
  },
  
  simulatePost: () => {
    console.log('Creating test post for debugging...');
    const testPost = {
      userId: 'test-user-123',
      username: 'TestUser',
      posts: [{
        id: 'test-post-1',
        content: 'This is a test post to check if the analyzer is working properly. What do you think about this approach?',
        timestamp: new Date().toISOString(),
        length: 95,
        hasLinks: false,
        hasImages: false,
        engagement: { likes: 5, comments: 2, shares: 0 }
      }],
      engagement: { totalComments: 2, totalLikes: 5, totalShares: 0 },
      lastSeen: Date.now()
    };
    
    if (skoolAnalyzer_instance) {
      skoolAnalyzer_instance.updateMemberData(testPost);
      console.log('- Test post created and stored');
    }
  }
};

// Global message listener for debugging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStatus') {
    sendResponse({ 
      success: true, 
      initialized: !!skoolAnalyzer_instance,
      observedMembers: skoolAnalyzer_instance?.observedMembers?.size || 0,
      url: window.location.href
    });
  }
  return true;
});