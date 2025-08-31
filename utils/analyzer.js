// Quality analysis engine for Skool Quality Detector

class SkoolQualityAnalyzer {
  constructor() {
    this.settings = null;
    this.initializeSettings();
  }

  async initializeSettings() {
    this.settings = await skoolStorage.getSettings();
  }

  // Main analysis function for a member
  async analyzeMember(memberData) {
    if (!memberData || !memberData.posts || memberData.posts.length < QUALITY_METRICS.CONFIDENCE_FACTORS.minPostsForAnalysis) {
      return {
        qualityScore: QUALITY_THRESHOLDS.UNKNOWN,
        confidenceLevel: 0,
        flags: ['insufficient_data'],
        category: 'unknown',
        details: {
          automationScore: 0,
          qualityScore: 0,
          postCount: memberData?.posts?.length || 0
        }
      };
    }

    const automationScore = this.calculateAutomationScore(memberData);
    const qualityScore = this.calculateQualityScore(memberData);
    const confidenceLevel = this.calculateConfidenceLevel(memberData);
    
    const finalScore = Math.max(0, Math.min(100, qualityScore - automationScore));
    const category = this.categorizeScore(finalScore);
    const flags = this.generateFlags(memberData, automationScore, qualityScore);

    return {
      qualityScore: Math.round(finalScore),
      confidenceLevel: Math.round(confidenceLevel * 100),
      flags,
      category,
      details: {
        automationScore: Math.round(automationScore),
        qualityScore: Math.round(qualityScore),
        postCount: memberData.posts.length,
        avgPostLength: this.calculateAveragePostLength(memberData.posts),
        engagementRatio: this.calculateEngagementRatio(memberData),
        postingPattern: this.analyzePostingPattern(memberData.posts),
        contentSimilarity: this.calculateContentSimilarity(memberData.posts)
      }
    };
  }

  // Calculate automation indicators (negative score)
  calculateAutomationScore(memberData) {
    let automationScore = 0;
    const posts = memberData.posts;
    const metrics = QUALITY_METRICS.AUTOMATION_INDICATORS;

    // High frequency posting
    const postsPerDay = this.calculatePostingFrequency(posts);
    if (postsPerDay >= metrics.highFrequency.threshold) {
      automationScore += metrics.highFrequency.weight * (postsPerDay / metrics.highFrequency.threshold);
    }

    // Rapid response patterns
    const avgResponseTime = this.calculateAverageResponseTime(posts);
    if (avgResponseTime <= metrics.rapidResponse.threshold) {
      automationScore += metrics.rapidResponse.weight;
    }

    // Consistent timing patterns
    const timingConsistency = this.calculateTimingConsistency(posts);
    if (timingConsistency >= metrics.consistentTiming.threshold) {
      automationScore += metrics.consistentTiming.weight * timingConsistency;
    }

    // Content similarity
    const contentSimilarity = this.calculateContentSimilarity(posts);
    if (contentSimilarity >= metrics.contentSimilarity.threshold) {
      automationScore += metrics.contentSimilarity.weight * contentSimilarity;
    }

    // Generic response patterns
    const genericRatio = this.calculateGenericResponseRatio(posts);
    if (genericRatio >= metrics.genericResponses.threshold) {
      automationScore += metrics.genericResponses.weight * genericRatio;
    }

    // Short burst posting
    const burstPosting = this.detectBurstPosting(posts);
    if (burstPosting >= metrics.shortBurstPosting.threshold) {
      automationScore += metrics.shortBurstPosting.weight;
    }

    // Uniform post lengths
    const lengthUniformity = this.calculateLengthUniformity(posts);
    if (lengthUniformity >= metrics.uniformLength.threshold) {
      automationScore += metrics.uniformLength.weight * lengthUniformity;
    }

    return Math.abs(automationScore); // Return positive value for clarity
  }

  // Calculate quality indicators (positive score)
  calculateQualityScore(memberData) {
    let qualityScore = 0;
    const posts = memberData.posts;
    const metrics = QUALITY_METRICS.QUALITY_INDICATORS;

    // External resources shared
    const externalLinks = this.countExternalResources(posts);
    if (externalLinks >= metrics.externalResources.threshold) {
      qualityScore += metrics.externalResources.weight * Math.min(3, externalLinks);
    }

    // Helpful answers (based on engagement)
    const helpfulAnswers = this.countHelpfulAnswers(memberData);
    if (helpfulAnswers >= metrics.helpfulAnswers.threshold) {
      qualityScore += metrics.helpfulAnswers.weight * Math.min(5, helpfulAnswers);
    }

    // Original content ratio
    const originalContentRatio = this.calculateOriginalContentRatio(posts);
    if (originalContentRatio >= metrics.originalContent.threshold) {
      qualityScore += metrics.originalContent.weight * originalContentRatio;
    }

    // Community engagement
    const engagementRatio = this.calculateEngagementRatio(memberData);
    if (engagementRatio >= metrics.communityEngagement.threshold) {
      qualityScore += metrics.communityEngagement.weight * Math.min(2, engagementRatio);
    }

    // Topic diversity
    const topicCount = this.calculateTopicDiversity(posts);
    if (topicCount >= metrics.topicDiversity.threshold) {
      qualityScore += metrics.topicDiversity.weight * Math.min(2, topicCount / metrics.topicDiversity.threshold);
    }

    // Long-form content
    const longFormPosts = this.countLongFormContent(posts);
    if (longFormPosts >= 1) {
      qualityScore += metrics.longFormContent.weight * Math.min(3, longFormPosts);
    }

    // Question asking behavior
    const questionsAsked = this.countQuestionsAsked(posts);
    if (questionsAsked >= metrics.questionAsking.threshold) {
      qualityScore += metrics.questionAsking.weight * Math.min(3, questionsAsked);
    }

    return qualityScore;
  }

  // Calculate confidence level based on data quality and quantity
  calculateConfidenceLevel(memberData) {
    const posts = memberData.posts;
    let confidence = 0;

    // Base confidence from post count
    const postCountFactor = Math.min(1, posts.length / 20); // Max confidence at 20 posts
    confidence += postCountFactor * 0.4;

    // Time span factor (more historical data = higher confidence)
    const timeSpanFactor = this.calculateTimeSpanFactor(posts);
    confidence += timeSpanFactor * 0.3;

    // Engagement data availability
    const engagementFactor = this.calculateEngagementDataFactor(memberData);
    confidence += engagementFactor * 0.2;

    // Content diversity factor
    const diversityFactor = Math.min(1, this.calculateTopicDiversity(posts) / 5);
    confidence += diversityFactor * 0.1;

    return Math.min(1, confidence);
  }

  // Helper functions for specific calculations
  calculatePostingFrequency(posts) {
    if (posts.length < 2) return 0;
    
    const sortedPosts = posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstPost = new Date(sortedPosts[0].timestamp);
    const lastPost = new Date(sortedPosts[sortedPosts.length - 1].timestamp);
    const daysDiff = Math.max(1, (lastPost - firstPost) / (1000 * 60 * 60 * 24));
    
    return posts.length / daysDiff;
  }

  calculateAverageResponseTime(posts) {
    // This would need comment data to calculate properly
    // For now, return a placeholder based on posting patterns
    return 60; // seconds
  }

  calculateTimingConsistency(posts) {
    if (posts.length < 3) return 0;
    
    const hours = posts.map(post => new Date(post.timestamp).getHours());
    const hourCounts = {};
    
    hours.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(hourCounts));
    return maxCount / posts.length;
  }

  calculateContentSimilarity(posts) {
    if (posts.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < posts.length - 1; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const similarity = this.calculateTextSimilarity(posts[i].content, posts[j].content);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  calculateGenericResponseRatio(posts) {
    if (posts.length === 0) return 0;
    
    let genericCount = 0;
    
    posts.forEach(post => {
      if (CONTENT_ANALYSIS.GENERIC_PATTERNS.some(pattern => pattern.test(post.content))) {
        genericCount++;
      }
    });
    
    return genericCount / posts.length;
  }

  detectBurstPosting(posts) {
    if (posts.length < 3) return 0;
    
    const sortedPosts = posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let maxBurst = 0;
    
    for (let i = 0; i < sortedPosts.length - 2; i++) {
      let burstCount = 1;
      const startTime = new Date(sortedPosts[i].timestamp);
      
      for (let j = i + 1; j < sortedPosts.length; j++) {
        const currentTime = new Date(sortedPosts[j].timestamp);
        const timeDiff = (currentTime - startTime) / (1000 * 60); // minutes
        
        if (timeDiff <= 60) { // Within 1 hour
          burstCount++;
        } else {
          break;
        }
      }
      
      maxBurst = Math.max(maxBurst, burstCount);
    }
    
    return maxBurst;
  }

  calculateLengthUniformity(posts) {
    if (posts.length < 3) return 0;
    
    const lengths = posts.map(post => post.content.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Low standard deviation relative to mean indicates uniformity
    return avgLength > 0 ? 1 - Math.min(1, stdDev / avgLength) : 0;
  }

  countExternalResources(posts) {
    let linkCount = 0;
    const urlRegex = /https?:\/\/[^\s]+/g;
    
    posts.forEach(post => {
      const matches = post.content.match(urlRegex);
      if (matches) {
        linkCount += matches.length;
      }
    });
    
    return linkCount;
  }

  countHelpfulAnswers(memberData) {
    // This would require engagement data (likes, replies to member's posts)
    // For now, estimate based on post characteristics
    let helpfulCount = 0;
    
    memberData.posts.forEach(post => {
      if (post.content.length > 100 && 
          CONTENT_ANALYSIS.QUALITY_PATTERNS.some(pattern => pattern.test(post.content))) {
        helpfulCount++;
      }
    });
    
    return helpfulCount;
  }

  calculateOriginalContentRatio(posts) {
    if (posts.length === 0) return 0;
    
    let originalCount = 0;
    
    posts.forEach(post => {
      // Check for signs of original thinking
      const hasOriginalMarkers = CONTENT_ANALYSIS.QUALITY_PATTERNS.some(pattern => 
        pattern.test(post.content)
      );
      
      // Check for personal experience indicators
      const hasPersonalExperience = /in my|i found|i discovered|my experience|i learned/i.test(post.content);
      
      if (hasOriginalMarkers || hasPersonalExperience) {
        originalCount++;
      }
    });
    
    return originalCount / posts.length;
  }

  calculateEngagementRatio(memberData) {
    if (!memberData.engagement) return 0;
    
    const postCount = memberData.posts.length;
    const commentCount = memberData.engagement.totalComments || 0;
    
    return postCount > 0 ? commentCount / postCount : 0;
  }

  calculateTopicDiversity(posts) {
    const topics = new Set();
    
    posts.forEach(post => {
      // Extract potential topics using simple keyword extraction
      const words = post.content.toLowerCase().split(/\s+/);
      const significantWords = words.filter(word => 
        word.length > 4 && 
        !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said'].includes(word)
      );
      
      significantWords.forEach(word => topics.add(word));
    });
    
    return topics.size;
  }

  countLongFormContent(posts) {
    return posts.filter(post => post.content.length >= QUALITY_METRICS.QUALITY_INDICATORS.longFormContent.threshold).length;
  }

  countQuestionsAsked(posts) {
    return posts.filter(post => post.content.includes('?')).length;
  }

  calculateAveragePostLength(posts) {
    if (posts.length === 0) return 0;
    const totalLength = posts.reduce((sum, post) => sum + post.content.length, 0);
    return Math.round(totalLength / posts.length);
  }

  analyzePostingPattern(posts) {
    const sortedPosts = posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const intervals = [];
    
    for (let i = 1; i < sortedPosts.length; i++) {
      const interval = new Date(sortedPosts[i].timestamp) - new Date(sortedPosts[i-1].timestamp);
      intervals.push(interval / (1000 * 60 * 60)); // Convert to hours
    }
    
    if (intervals.length === 0) return 'insufficient_data';
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval < 1) return 'very_frequent';
    if (avgInterval < 4) return 'frequent';
    if (avgInterval < 24) return 'regular';
    return 'occasional';
  }

  calculateTimeSpanFactor(posts) {
    if (posts.length < 2) return 0.1;
    
    const sortedPosts = posts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstPost = new Date(sortedPosts[0].timestamp);
    const lastPost = new Date(sortedPosts[sortedPosts.length - 1].timestamp);
    const daysDiff = (lastPost - firstPost) / (1000 * 60 * 60 * 24);
    
    return Math.min(1, daysDiff / 30); // Max factor at 30+ days
  }

  calculateEngagementDataFactor(memberData) {
    return memberData.engagement && memberData.engagement.totalComments > 0 ? 1 : 0.5;
  }

  categorizeScore(score) {
    if (score >= QUALITY_THRESHOLDS.HIGH) return 'high';
    if (score >= QUALITY_THRESHOLDS.MODERATE) return 'moderate';
    if (score >= QUALITY_THRESHOLDS.SUSPICIOUS) return 'suspicious';
    return 'unknown';
  }

  generateFlags(memberData, automationScore, qualityScore) {
    const flags = [];
    
    if (automationScore > 50) flags.push('high_automation_risk');
    if (qualityScore < 20) flags.push('low_quality_content');
    if (memberData.posts.length < 5) flags.push('limited_data');
    
    const genericRatio = this.calculateGenericResponseRatio(memberData.posts);
    if (genericRatio > 0.7) flags.push('generic_responses');
    
    const burstPosting = this.detectBurstPosting(memberData.posts);
    if (burstPosting >= 5) flags.push('burst_posting');
    
    const contentSimilarity = this.calculateContentSimilarity(memberData.posts);
    if (contentSimilarity > 0.8) flags.push('repetitive_content');
    
    return flags;
  }

  // Generate human-readable analysis summary
  generateAnalysisSummary(analysis) {
    const { qualityScore, confidenceLevel, category, details, flags } = analysis;
    
    let summary = '';
    
    switch (category) {
      case 'high':
        summary = 'High-quality contributor with genuine engagement';
        break;
      case 'moderate':
        summary = 'Moderate quality with mixed indicators';
        break;
      case 'suspicious':
        summary = 'Shows potential automation patterns';
        break;
      default:
        summary = 'Insufficient data for reliable analysis';
    }
    
    if (confidenceLevel < 50) {
      summary += ' (Low confidence due to limited data)';
    }
    
    return summary;
  }
}

// Create global instance
const skoolAnalyzer = new SkoolQualityAnalyzer();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.skoolAnalyzer = skoolAnalyzer;
}