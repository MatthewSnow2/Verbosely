// Popup JavaScript for Skool Quality Detector Extension

class SkoolPopupManager {
  constructor() {
    this.currentTab = 'dashboard';
    this.memberData = {};
    this.settings = {};
    this.stats = {};
    
    this.initialize();
  }

  async initialize() {
    try {
      // Load initial data
      await this.loadSettings();
      await this.loadMemberData();
      await this.loadStats();
      
      // Initialize UI
      this.initializeTabs();
      this.initializeEventListeners();
      this.updateUI();
      
      // Update status
      this.updateStatus();
      
      console.log('Popup initialized successfully');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showToast('Failed to load extension data', 'error');
    }
  }

  // Load settings from storage
  async loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('skool_detector_settings');
        this.settings = result.skool_detector_settings || this.getDefaultSettings();
      } else {
        // Fallback for development
        this.settings = this.getDefaultSettings();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  // Load member data from storage
  async loadMemberData() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('skool_member_data');
        this.memberData = result.skool_member_data || {};
      } else {
        // Fallback for development
        this.memberData = {};
      }
    } catch (error) {
      console.error('Failed to load member data:', error);
      this.memberData = {};
    }
  }

  // Load statistics
  async loadStats() {
    try {
      const members = Object.values(this.memberData);
      
      this.stats = {
        totalMembers: members.length,
        highQuality: members.filter(m => this.getQualityCategory(m) === 'high').length,
        moderate: members.filter(m => this.getQualityCategory(m) === 'moderate').length,
        suspicious: members.filter(m => this.getQualityCategory(m) === 'suspicious').length,
        storageSize: Math.round(JSON.stringify(this.memberData).length / 1024),
        lastUpdate: Date.now()
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.stats = {
        totalMembers: 0,
        highQuality: 0,
        moderate: 0,
        suspicious: 0,
        storageSize: 0,
        lastUpdate: Date.now()
      };
    }
  }

  // Get default settings
  getDefaultSettings() {
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

  // Initialize tab switching
  initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });
  }

  // Switch active tab
  switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabId}-tab`);
    });

    this.currentTab = tabId;

    // Load tab-specific data
    switch (tabId) {
      case 'dashboard':
        this.updateDashboard();
        break;
      case 'members':
        this.updateMembersList();
        break;
      case 'settings':
        this.updateSettings();
        break;
    }
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Dashboard actions
    document.getElementById('refresh-analysis')?.addEventListener('click', () => {
      this.refreshAnalysis();
    });

    document.getElementById('cleanup-data')?.addEventListener('click', () => {
      this.cleanupData();
    });

    document.getElementById('export-data')?.addEventListener('click', () => {
      this.exportData();
    });

    // Member search and filtering
    document.getElementById('search-go-button')?.addEventListener('click', () => {
      this.performMemberSearch();
    });

    document.getElementById('member-search')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performMemberSearch();
      }
    });

    document.getElementById('quality-filter')?.addEventListener('change', () => {
      this.updateMembersList();
    });

    document.getElementById('sort-filter')?.addEventListener('change', () => {
      this.updateMembersList();
    });

    document.getElementById('timeframe-filter')?.addEventListener('change', () => {
      this.updateMembersList();
    });

    // Settings
    this.initializeSettingsListeners();

    // Data management
    document.getElementById('clear-all-data')?.addEventListener('click', () => {
      this.clearAllData();
    });

    // Modal
    document.getElementById('close-modal')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Help and support
    document.getElementById('view-help')?.addEventListener('click', () => {
      this.openHelp();
    });

    document.getElementById('report-issue')?.addEventListener('click', () => {
      this.reportIssue();
    });
  }

  // Initialize settings event listeners
  initializeSettingsListeners() {
    const settingsMap = {
      'enable-analysis': 'analysisEnabled',
      'enable-badges': 'enableQualityBadges',
      'enable-tooltips': 'enableTooltips',
      'show-confidence': 'showConfidenceLevel',
      'privacy-mode': 'privacyMode'
    };

    Object.entries(settingsMap).forEach(([elementId, settingKey]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('change', (e) => {
          this.settings[settingKey] = e.target.checked;
          this.saveSettings();
        });
      }
    });

    // Confidence threshold
    const confidenceSlider = document.getElementById('confidence-threshold');
    if (confidenceSlider) {
      confidenceSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.settings.minimumConfidence = value / 100;
        document.getElementById('confidence-value').textContent = `${value}%`;
        this.saveSettings();
      });
    }
  }

  // Update UI with current data
  updateUI() {
    this.updateDashboard();
    this.updateStatus();
  }

  // Update status indicator
  async updateStatus() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusText = statusIndicator?.querySelector('.status-text');

    if (statusDot && statusText) {
      // Check if we have any detected members
      const hasMemberData = this.stats.totalMembers > 0;
      
      // Check for content script messages
      let lastMessage = null;
      try {
        const result = await chrome.storage.local.get('skool_detector_last_message');
        lastMessage = result.skool_detector_last_message;
      } catch (error) {
        console.error('Failed to get last message:', error);
      }
      
      if (!this.settings.analysisEnabled) {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Disabled';
      } else if (hasMemberData) {
        statusDot.className = 'status-dot active';
        statusText.textContent = 'Active - Found Data';
      } else if (lastMessage && (Date.now() - lastMessage.timestamp) < 30000) {
        // Show recent message from content script
        if (lastMessage.type === 'warning') {
          statusDot.className = 'status-dot warning';
          statusText.textContent = 'Needs Login';
        } else if (lastMessage.type === 'info') {
          statusDot.className = 'status-dot warning';
          statusText.textContent = 'Wrong Page Type';
        } else {
          statusDot.className = 'status-dot';
          statusText.textContent = 'Active';
        }
        
        // Show the message as a toast
        this.showToast(lastMessage.message, lastMessage.type);
      } else {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Active';
      }
    }
  }

  // Update dashboard tab
  updateDashboard() {
    // Update stats
    document.getElementById('total-members').textContent = this.stats.totalMembers;
    document.getElementById('high-quality').textContent = this.stats.highQuality;
    document.getElementById('suspicious').textContent = this.stats.suspicious;
    document.getElementById('storage-size').textContent = this.stats.storageSize;

    // Update recent activity
    this.updateRecentActivity();
  }

  // Update recent activity list
  updateRecentActivity() {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;

    const recentMembers = Object.values(this.memberData)
      .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
      .slice(0, 5);

    if (recentMembers.length === 0) {
      activityList.innerHTML = `
        <div class="empty-state">
          <div class="icon">📊</div>
          <h3>No Recent Activity</h3>
          <p>Visit Skool communities to start analyzing member behavior</p>
        </div>
      `;
      return;
    }

    activityList.innerHTML = recentMembers.map(member => {
      const analysis = this.analyzeMemberQuick(member);
      const category = this.getQualityCategory(member);
      
      return `
        <div class="activity-item">
          <div class="activity-info">
            <div class="activity-member">${this.escapeHtml(member.username || 'Unknown')}</div>
            <div class="activity-details">
              ${member.posts?.length || 0} posts • ${this.getTimeAgo(member.lastSeen)}
            </div>
          </div>
          <div class="activity-badge" style="background-color: ${this.getCategoryColor(category)}">
            ${this.getCategoryIcon(category)}
          </div>
        </div>
      `;
    }).join('');
  }

  // Update members list
  updateMembersList() {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;

    const members = Object.values(this.memberData);

    if (members.length === 0) {
      membersList.innerHTML = `
        <div class="empty-state">
          <div class="icon">👥</div>
          <h3>No Members Analyzed</h3>
          <p>Visit Skool communities to start collecting member data</p>
        </div>
      `;
      return;
    }

    membersList.innerHTML = members.map(member => {
      const analysis = this.analyzeMemberQuick(member);
      const category = this.getQualityCategory(member);
      
      return `
        <div class="member-item" data-member-id="${member.userId}">
          <div class="member-header">
            <div class="member-name">
              ${this.escapeHtml(member.username || 'Unknown')}
              <div class="member-quality-badge" style="background-color: ${this.getCategoryColor(category)}">
                ${this.getCategoryIcon(category)}
              </div>
            </div>
          </div>
          <div class="member-stats">
            <div>Posts: ${member.posts?.length || 0}</div>
            <div>Score: ${analysis.qualityScore || 'N/A'}</div>
            <div>Confidence: ${analysis.confidenceLevel || 0}%</div>
          </div>
        </div>
      `;
    }).join('');

    // Add click listeners for member details
    membersList.querySelectorAll('.member-item').forEach(item => {
      item.addEventListener('click', () => {
        const memberId = item.getAttribute('data-member-id');
        this.showMemberDetails(memberId);
      });
    });
  }

  // Update settings tab
  updateSettings() {
    // Update checkboxes
    const settingsMap = {
      'enable-analysis': 'analysisEnabled',
      'enable-badges': 'enableQualityBadges',
      'enable-tooltips': 'enableTooltips',
      'show-confidence': 'showConfidenceLevel',
      'privacy-mode': 'privacyMode'
    };

    Object.entries(settingsMap).forEach(([elementId, settingKey]) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.checked = this.settings[settingKey] || false;
      }
    });

    // Update confidence threshold
    const confidenceSlider = document.getElementById('confidence-threshold');
    const confidenceValue = document.getElementById('confidence-value');
    if (confidenceSlider && confidenceValue) {
      const value = Math.round((this.settings.minimumConfidence || 0.3) * 100);
      confidenceSlider.value = value;
      confidenceValue.textContent = `${value}%`;
    }

    // Update data info
    this.updateDataInfo();
  }

  // Update data management info
  updateDataInfo() {
    document.getElementById('storage-usage').textContent = `${this.stats.storageSize} KB`;
    document.getElementById('members-tracked').textContent = this.stats.totalMembers;
    document.getElementById('last-cleanup').textContent = this.getTimeAgo(this.stats.lastUpdate);
  }

  // Quick member analysis
  analyzeMemberQuick(member) {
    if (!member.posts || member.posts.length === 0) {
      return { qualityScore: 0, confidenceLevel: 0 };
    }

    // Simplified analysis for popup display
    const postCount = member.posts.length;
    const avgLength = member.posts.reduce((sum, post) => sum + (post.content?.length || 0), 0) / postCount;
    
    let qualityScore = 50; // Base score
    
    // Adjust based on post count
    if (postCount > 10) qualityScore += 10;
    if (postCount > 20) qualityScore += 10;
    
    // Adjust based on average length
    if (avgLength > 100) qualityScore += 15;
    if (avgLength > 200) qualityScore += 10;
    
    // Simple automation detection
    if (postCount > 20) {
      const timeIntervals = member.posts
        .map(p => new Date(p.timestamp).getTime())
        .sort((a, b) => a - b)
        .map((time, i, arr) => i > 0 ? time - arr[i-1] : 0)
        .slice(1);
      
      const avgInterval = timeIntervals.reduce((sum, interval) => sum + interval, 0) / timeIntervals.length;
      if (avgInterval < 60000) { // Less than 1 minute average
        qualityScore -= 30;
      }
    }
    
    qualityScore = Math.max(0, Math.min(100, qualityScore));
    const confidenceLevel = Math.min(100, postCount * 5); // 5% per post, max 100%
    
    return {
      qualityScore: Math.round(qualityScore),
      confidenceLevel: Math.round(confidenceLevel)
    };
  }

  // Get quality category from member data
  getQualityCategory(member) {
    const analysis = this.analyzeMemberQuick(member);
    
    if (analysis.qualityScore >= 75) return 'high';
    if (analysis.qualityScore >= 50) return 'moderate';
    if (analysis.qualityScore >= 25) return 'suspicious';
    return 'unknown';
  }

  // Get category color
  getCategoryColor(category) {
    const colors = {
      high: '#22c55e',
      moderate: '#eab308',
      suspicious: '#ef4444',
      unknown: '#6b7280'
    };
    return colors[category] || colors.unknown;
  }

  // Get category icon
  getCategoryIcon(category) {
    const icons = {
      high: '🟢',
      moderate: '🟡',
      suspicious: '🔴',
      unknown: '⚪'
    };
    return icons[category] || icons.unknown;
  }

  // Show member details modal
  showMemberDetails(memberId) {
    const member = this.memberData[memberId];
    if (!member) return;

    const analysis = this.analyzeMemberQuick(member);
    const category = this.getQualityCategory(member);

    const modalName = document.getElementById('modal-member-name');
    const modalBody = document.getElementById('modal-body');
    
    if (modalName) {
      modalName.textContent = member.username || 'Unknown Member';
    }
    
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="member-analysis">
          <div class="analysis-header">
            <div class="quality-score">
              <div class="score-circle" style="background-color: ${this.getCategoryColor(category)}">
                ${analysis.qualityScore}
              </div>
              <div class="score-label">Quality Score</div>
            </div>
            <div class="confidence-level">
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${analysis.confidenceLevel}%"></div>
              </div>
              <div class="confidence-label">${analysis.confidenceLevel}% Confidence</div>
            </div>
          </div>
          
          <div class="member-stats-detailed">
            <h3>Activity Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Posts:</span>
                <span class="stat-value">${member.posts?.length || 0}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Length:</span>
                <span class="stat-value">${this.getAveragePostLength(member)} chars</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Seen:</span>
                <span class="stat-value">${this.getTimeAgo(member.lastSeen)}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Category:</span>
                <span class="stat-value">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </div>
            </div>
          </div>

          ${member.posts && member.posts.length > 0 ? `
            <div class="recent-posts">
              <h3>Recent Posts</h3>
              <div class="posts-list">
                ${member.posts.slice(-3).reverse().map(post => `
                  <div class="post-item">
                    <div class="post-meta">
                      <span class="post-date">${this.formatDate(post.timestamp)}</span>
                      <span class="post-length">${post.content?.length || 0} chars</span>
                    </div>
                    <div class="post-content">
                      ${this.escapeHtml(this.truncateText(post.content || '', 200))}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    this.showModal();
  }

  // Show modal
  showModal() {
    const modal = document.getElementById('member-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('member-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Save settings to storage
  async saveSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          'skool_detector_settings': this.settings
        });
      }
      
      this.updateStatus();
      this.showToast('Settings saved', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  // Refresh analysis
  async refreshAnalysis() {
    this.showToast('Refreshing analysis...', 'info');
    
    try {
      // Send message to content script to refresh
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        // Check if we're on a Skool page
        const url = tabs[0].url;
        if (!url || !url.includes('skool.com')) {
          this.showToast('Please navigate to a Skool community first', 'warning');
          return;
        }
        
        try {
          await chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshAnalysis' });
        } catch (sendError) {
          console.error('Failed to send message to content script:', sendError);
          this.showToast('Please refresh the Skool page and try again', 'error');
          return;
        }
      }
      
      // Reload data
      await this.loadMemberData();
      await this.loadStats();
      this.updateUI();
      
      this.showToast('Analysis refreshed', 'success');
    } catch (error) {
      console.error('Failed to refresh analysis:', error);
      this.showToast('Failed to refresh analysis', 'error');
    }
  }

  // Cleanup expired data
  async cleanupData() {
    this.showToast('Cleaning up data...', 'info');
    
    try {
      // Remove expired data
      const now = Date.now();
      const cleanedData = {};
      
      Object.entries(this.memberData).forEach(([userId, member]) => {
        const expiresAt = member.expiresAt || (member.lastSeen + 30 * 24 * 60 * 60 * 1000);
        if (expiresAt > now) {
          cleanedData[userId] = member;
        }
      });
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          'skool_member_data': cleanedData
        });
      }
      
      this.memberData = cleanedData;
      await this.loadStats();
      this.updateUI();
      
      this.showToast('Data cleanup completed', 'success');
    } catch (error) {
      console.error('Failed to cleanup data:', error);
      this.showToast('Failed to cleanup data', 'error');
    }
  }

  // Export data
  exportData() {
    try {
      const exportData = {
        members: this.memberData,
        settings: this.settings,
        stats: this.stats,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skool-quality-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.showToast('Failed to export data', 'error');
    }
  }

  // Clear all data
  async clearAllData() {
    if (!confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      return;
    }
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.clear();
      }
      
      this.memberData = {};
      this.settings = this.getDefaultSettings();
      this.stats = {
        totalMembers: 0,
        highQuality: 0,
        moderate: 0,
        suspicious: 0,
        storageSize: 0,
        lastUpdate: Date.now()
      };
      
      this.updateUI();
      this.showToast('All data cleared', 'success');
    } catch (error) {
      console.error('Failed to clear data:', error);
      this.showToast('Failed to clear data', 'error');
    }
  }

  // Perform member search with GO button
  async performMemberSearch() {
    const searchInput = document.getElementById('member-search');
    const goButton = document.getElementById('search-go-button');
    
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim();
    
    // Disable button while searching
    if (goButton) {
      goButton.disabled = true;
      goButton.textContent = 'Searching...';
    }
    
    try {
      if (searchTerm) {
        this.showToast(`Searching for "${searchTerm}"...`, 'info');
        await this.searchSpecificMember(searchTerm);
      } else {
        // No search term - use default filters (last 30 days)
        this.showToast('Loading members with default filters...', 'info');
        await this.updateMembersList();
      }
    } catch (error) {
      console.error('Search failed:', error);
      this.showToast('Search failed', 'error');
    } finally {
      // Re-enable button
      if (goButton) {
        goButton.disabled = false;
        goButton.textContent = 'GO';
      }
    }
  }

  // Search for a specific member
  async searchSpecificMember(searchTerm) {
    const members = await this.getFilteredMembers({
      searchTerm: searchTerm.toLowerCase(),
      timeframe: this.getTimeframeFilter()
    });
    
    this.renderMembersList(members);
    
    if (members.length === 0) {
      this.showToast(`No members found matching "${searchTerm}"`, 'warning');
    } else {
      this.showToast(`Found ${members.length} member(s) matching "${searchTerm}"`, 'success');
    }
  }

  // Update members list with current filters
  async updateMembersList() {
    const qualityFilter = document.getElementById('quality-filter')?.value;
    const sortFilter = document.getElementById('sort-filter')?.value;
    const timeframeFilter = document.getElementById('timeframe-filter')?.value;
    const searchTerm = document.getElementById('member-search')?.value?.trim().toLowerCase();
    
    try {
      const members = await this.getFilteredMembers({
        searchTerm,
        quality: qualityFilter,
        sort: sortFilter,
        timeframe: timeframeFilter
      });
      
      this.renderMembersList(members);
      
    } catch (error) {
      console.error('Failed to update members list:', error);
      this.showEmptyMembersList('Failed to load members');
    }
  }

  // Get filtered members based on criteria
  async getFilteredMembers(filters = {}) {
    const members = Object.values(this.memberData);
    let filteredMembers = [...members];
    
    // Apply search term filter
    if (filters.searchTerm && filters.searchTerm.length > 0) {
      filteredMembers = filteredMembers.filter(member => 
        member.username?.toLowerCase().includes(filters.searchTerm) ||
        member.displayName?.toLowerCase().includes(filters.searchTerm)
      );
    }
    
    // Apply quality filter
    if (filters.quality && filters.quality !== 'all') {
      filteredMembers = filteredMembers.filter(member => {
        const quality = this.getQualityLevel(member.qualityScore || 0);
        return quality === filters.quality;
      });
    }
    
    // Apply timeframe filter
    const timeframe = filters.timeframe || '30';
    const now = Date.now();
    filteredMembers = filteredMembers.filter(member => {
      if (!member.lastSeen) return false;
      
      const daysSinceLastSeen = (now - member.lastSeen) / (24 * 60 * 60 * 1000);
      
      switch (timeframe) {
        case '30':
          return daysSinceLastSeen <= 30;
        case '90':
          return daysSinceLastSeen > 30 && daysSinceLastSeen <= 90;
        case 'older':
          return daysSinceLastSeen > 90;
        default:
          return true;
      }
    });
    
    // Apply sorting
    const sortBy = filters.sort || 'score-desc';
    filteredMembers.sort((a, b) => {
      switch (sortBy) {
        case 'score-desc':
          return (b.qualityScore || 0) - (a.qualityScore || 0);
        case 'score-asc':
          return (a.qualityScore || 0) - (b.qualityScore || 0);
        default:
          return (b.lastSeen || 0) - (a.lastSeen || 0);
      }
    });
    
    // Limit results for performance (max 50 members)
    return filteredMembers.slice(0, 50);
  }

  // Render members list in the UI
  renderMembersList(members) {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;
    
    if (!members || members.length === 0) {
      this.showEmptyMembersList();
      return;
    }
    
    const membersHTML = members.map(member => this.createMemberItemHTML(member)).join('');
    membersList.innerHTML = membersHTML;
    
    // Add click handlers for member items
    membersList.querySelectorAll('.member-item').forEach(item => {
      item.addEventListener('click', () => {
        const userId = item.getAttribute('data-user-id');
        if (userId) {
          this.showMemberDetails(userId);
        }
      });
    });
  }

  // Create HTML for a member item
  createMemberItemHTML(member) {
    const quality = this.getQualityLevel(member.qualityScore || 0);
    const qualityIcon = this.getQualityIcon(quality);
    const postCount = member.posts ? member.posts.length : 0;
    const avgPostLength = this.getAveragePostLength(member);
    const lastSeen = this.getTimeAgo(member.lastSeen);
    const confidence = Math.round((member.confidenceLevel || 0) * 100);
    
    return `
      <div class="member-item" data-user-id="${member.userId}">
        <div class="member-info">
          <div class="member-name">${this.escapeHtml(member.username || member.displayName || 'Unknown User')}</div>
          <div class="member-stats">${postCount} posts • Avg ${avgPostLength} chars • Last seen ${lastSeen}</div>
        </div>
        <div class="member-quality">
          <div class="quality-badge ${quality}">${qualityIcon}</div>
          <div class="quality-score">${member.qualityScore || 0} (${confidence}%)</div>
        </div>
      </div>
    `;
  }

  // Show empty state for members list
  showEmptyMembersList(message = null) {
    const membersList = document.getElementById('members-list');
    if (!membersList) return;
    
    const defaultMessage = "No members found matching your criteria. Try adjusting your filters or search term.";
    
    membersList.innerHTML = `
      <div class="empty-state">
        <h3>No Members Found</h3>
        <p>${message || defaultMessage}</p>
      </div>
    `;
  }

  // Get timeframe filter value
  getTimeframeFilter() {
    return document.getElementById('timeframe-filter')?.value || '30';
  }

  // Get quality level from score
  getQualityLevel(score) {
    if (score >= 75) return 'high';
    if (score >= 50) return 'moderate';
    if (score >= 25) return 'suspicious';
    return 'unknown';
  }

  // Get quality icon
  getQualityIcon(quality) {
    const icons = {
      high: '✓',
      moderate: '~',
      suspicious: '!',
      unknown: '?'
    };
    return icons[quality] || '?';
  }

  // Show detailed member information in modal
  showMemberDetails(userId) {
    const member = this.memberData[userId];
    if (!member) return;
    
    const modal = document.getElementById('member-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-member-name');
    
    if (!modal || !modalBody || !modalTitle) return;
    
    modalTitle.textContent = member.username || member.displayName || 'Unknown User';
    
    const quality = this.getQualityLevel(member.qualityScore || 0);
    const qualityIcon = this.getQualityIcon(quality);
    const confidence = Math.round((member.confidenceLevel || 0) * 100);
    
    modalBody.innerHTML = `
      <div class="member-details">
        <div class="detail-section">
          <h3>Quality Assessment</h3>
          <div class="quality-info">
            <span class="quality-badge ${quality}">${qualityIcon}</span>
            <span class="quality-text">${quality.charAt(0).toUpperCase() + quality.slice(1)} Quality</span>
            <span class="quality-score">Score: ${member.qualityScore || 0}/100</span>
            <span class="confidence-level">Confidence: ${confidence}%</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>Activity Summary</h3>
          <div class="activity-stats">
            <div class="stat">
              <span class="stat-label">Total Posts:</span>
              <span class="stat-value">${member.posts ? member.posts.length : 0}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Average Post Length:</span>
              <span class="stat-value">${this.getAveragePostLength(member)} characters</span>
            </div>
            <div class="stat">
              <span class="stat-label">Last Seen:</span>
              <span class="stat-value">${this.getTimeAgo(member.lastSeen)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">First Seen:</span>
              <span class="stat-value">${this.getTimeAgo(member.firstSeen)}</span>
            </div>
          </div>
        </div>
        
        ${member.posts && member.posts.length > 0 ? `
        <div class="detail-section">
          <h3>Recent Posts</h3>
          <div class="recent-posts">
            ${member.posts.slice(0, 3).map(post => `
              <div class="post-preview">
                <div class="post-content">${this.truncateText(post.content || '', 150)}</div>
                <div class="post-meta">
                  <span class="post-time">${this.formatDate(post.timestamp)}</span>
                  <span class="post-length">${post.content?.length || 0} chars</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    `;
    
    modal.classList.add('active');
  }

  // Open help documentation
  openHelp() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/skool-quality-detector#readme'
    });
  }

  // Report an issue
  reportIssue() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/skool-quality-detector/issues/new'
    });
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds (5 seconds for warnings/errors)
    const timeout = (type === 'warning' || type === 'error') ? 5000 : 3000;
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, timeout);
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  }

  getTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getAveragePostLength(member) {
    if (!member.posts || member.posts.length === 0) return 0;
    const total = member.posts.reduce((sum, post) => sum + (post.content?.length || 0), 0);
    return Math.round(total / member.posts.length);
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SkoolPopupManager();
  });
} else {
  new SkoolPopupManager();
}