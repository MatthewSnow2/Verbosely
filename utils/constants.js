// Constants for Skool Quality Detector Extension

const SKOOL_SELECTORS = {
  // Core post elements - Updated based on actual Skool DOM structure
  posts: [
    // Primary feed item containers that contain user profile links
    'div:has(a[href*="/@"])', // Any div containing a user profile link
    '[data-testid*="post"]',
    'article', 
    '[role="article"]',
    // Look for containers with both user links and content
    'li:has(a[href*="/@"]):has(p)',
    'div[class*="post"]',
    'div[class*="feed"]',
    'li[class*="feed"]',
    // Fallback: any element with user profile link and substantial text content
    '*:has(a[href*="/@"]):has([text-content-length>20])',
    '.post-item', 
    '.feed-item'
  ],
  
  postContent: [
    '[data-testid*="content"]',
    '.post-content', 
    '.feed-item-content',
    'p:not([class*="meta"]):not([class*="timestamp"])', // Regular paragraphs, not metadata
    'div[class*="content"]:not([class*="meta"])',
    'div:has(> p)',
    'span:not([class*="meta"]):not([class*="timestamp"])'
  ],
  
  postAuthor: [
    'a[href*="/@"]', // Skool user profile links - most reliable
    'a[href^="/user/"]', // Alternative user link format
    '[data-testid*="author"]',
    '[data-testid*="user"]',
    '.post-author', 
    '.author-name',
    '.user-name',
    'div[class*="author"]',
    'span[class*="name"]',
    'span[class*="user"]',
    // Look for clickable text elements that might be usernames
    'a strong',
    'a span',
    'strong a',
    'span a',
    'strong',
    'b',
    'h3',
    'h4'
  ],
  
  postTimestamp: [
    '[data-testid*="time"]',
    '.post-timestamp', 
    '.timestamp',
    'time',
    'span[class*="time"]',
    'div[class*="time"]',
    'small'
  ],
  
  // Profile and member elements
  memberProfile: ['.member-profile', '.user-profile', 'a[href*="/@"]'],
  memberName: ['.member-name', '.user-name', '.display-name', 'strong', 'b'],
  memberAvatar: ['.member-avatar', '.user-avatar', '.profile-image', 'img[alt*="profile"]'],
  
  // Engagement elements
  comments: ['.comment', '.reply', '[data-testid*="comment"]', 'div[class*="reply"]'],
  commentAuthor: ['.comment-author', '.reply-author'],
  commentContent: ['.comment-content', '.reply-content'],
  likes: ['.like-button', '.thumbs-up', '[data-testid*="like"]', 'button[class*="like"]'],
  replies: ['.reply-button', '[data-testid*="reply"]', 'button[class*="reply"]'],
  
  // Navigation and containers
  feedContainer: ['.feed', '.posts-container', '.content-feed', 'main', '[role="main"]'],
  postContainer: ['.post', '.feed-item', '.content-item', 'article', 'li']
};

const QUALITY_METRICS = {
  AUTOMATION_INDICATORS: {
    highFrequency: { threshold: 10, weight: -25 }, // posts per day
    rapidResponse: { threshold: 30, weight: -15 }, // seconds
    consistentTiming: { threshold: 0.8, weight: -20 }, // timing pattern similarity
    contentSimilarity: { threshold: 0.7, weight: -30 }, // duplicate content percentage
    genericResponses: { threshold: 0.6, weight: -15 }, // template-like responses
    shortBurstPosting: { threshold: 5, weight: -20 }, // posts in short time period
    uniformLength: { threshold: 0.9, weight: -10 } // consistent post lengths
  },
  
  QUALITY_INDICATORS: {
    externalResources: { threshold: 1, weight: 15 }, // valuable links shared
    helpfulAnswers: { threshold: 1, weight: 20 }, // answers with positive responses
    originalContent: { threshold: 0.3, weight: 25 }, // unique insights percentage
    communityEngagement: { threshold: 0.4, weight: 15 }, // meaningful interactions
    topicDiversity: { threshold: 3, weight: 10 }, // range of topics discussed
    longFormContent: { threshold: 100, weight: 12 }, // detailed posts
    questionAsking: { threshold: 1, weight: 8 } // asks genuine questions
  },
  
  CONFIDENCE_FACTORS: {
    minPostsForAnalysis: 5,
    maxConfidenceMultiplier: 1.0,
    timeWeightFactor: 0.1, // newer activity weighted more heavily
    engagementWeightFactor: 0.15
  }
};

const QUALITY_THRESHOLDS = {
  HIGH: 75,
  MODERATE: 50,
  SUSPICIOUS: 25,
  UNKNOWN: 0
};

const BADGE_COLORS = {
  HIGH: '#22c55e',      // Green
  MODERATE: '#eab308',   // Yellow  
  SUSPICIOUS: '#ef4444', // Red
  UNKNOWN: '#6b7280'     // Gray
};

const BADGE_ICONS = {
  HIGH: '🟢',
  MODERATE: '🟡', 
  SUSPICIOUS: '🔴',
  UNKNOWN: '⚪'
};

const ANALYSIS_SETTINGS = {
  maxPostsToAnalyze: 50,
  analysisTimeoutMs: 5000,
  storageExpiryDays: 30,
  minConfidenceThreshold: 0.3,
  batchSize: 10,
  throttleDelayMs: 100
};

const CONTENT_ANALYSIS = {
  // Common spam/automation patterns
  SPAM_PATTERNS: [
    /check\s+out\s+my\s+link/i,
    /dm\s+me\s+for/i,
    /click\s+here/i,
    /limited\s+time\s+offer/i,
    /make\s+money\s+fast/i,
    /earn\s+\$\d+/i
  ],
  
  // Generic response patterns
  GENERIC_PATTERNS: [
    /^(great|nice|awesome|cool|thanks?)\s*!*$/i,
    /^(this|that)\s+is\s+(good|great|nice|cool)$/i,
    /^i\s+agree$/i,
    /^exactly$/i,
    /^(yes|yeah|yep)\s*!*$/i
  ],
  
  // Quality indicators
  QUALITY_PATTERNS: [
    /\?/g, // Questions
    /because|since|due to|as a result/i, // Explanations
    /in my experience|i found|i discovered/i, // Personal insights
    /however|although|despite|nevertheless/i, // Nuanced thinking
    /here's how|here's what|let me explain/i // Helpful guidance
  ]
};

const STORAGE_KEYS = {
  MEMBER_DATA: 'skool_member_data',
  ANALYSIS_CACHE: 'skool_analysis_cache',
  SETTINGS: 'skool_detector_settings',
  COMMUNITY_STATS: 'skool_community_stats'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SKOOL_SELECTORS,
    QUALITY_METRICS,
    QUALITY_THRESHOLDS,
    BADGE_COLORS,
    BADGE_ICONS,
    ANALYSIS_SETTINGS,
    CONTENT_ANALYSIS,
    STORAGE_KEYS
  };
}