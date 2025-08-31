# User Guide - Skool Community Quality Detector

Learn how to effectively use the Skool Community Quality Detector to identify automation patterns and assess content quality in your communities.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Quality Badges](#understanding-quality-badges)
3. [Using the Dashboard](#using-the-dashboard)
4. [Interpreting Analysis Results](#interpreting-analysis-results)
5. [Privacy and Settings](#privacy-and-settings)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Your First Analysis

1. **Install** the extension following the [Installation Guide](INSTALLATION.md)
2. **Visit** any Skool community you're a member of
3. **Look** for small colored badges next to member names in posts
4. **Hover** over badges to see detailed analysis
5. **Click** the extension icon for dashboard and settings

### What You'll See

- **🟢 Green badges**: High-quality, genuine contributors
- **🟡 Yellow badges**: Moderate quality, mixed indicators  
- **🔴 Red badges**: Suspicious patterns, potential automation
- **⚪ Gray badges**: Insufficient data for analysis

## 🏷️ Understanding Quality Badges

### Badge Colors and Meanings

| Badge | Category | Score Range | Description |
|-------|----------|-------------|-------------|
| 🟢 | High Quality | 75-100 | Genuine contributors with valuable engagement |
| 🟡 | Moderate | 50-74 | Mixed indicators, generally authentic behavior |
| 🔴 | Suspicious | 25-49 | Shows potential automation or spam patterns |
| ⚪ | Unknown | 0-24 | Insufficient data for reliable analysis |

### Badge Placement

- **Next to usernames** in posts and comments
- **Consistent positioning** across different Skool layouts
- **Hover tooltips** provide detailed information
- **Confidence indicators** show analysis reliability

### What Badges Indicate

**🟢 High Quality Members Often:**
- Share valuable external resources and links
- Write detailed, thoughtful responses
- Ask genuine questions and provide helpful answers
- Show consistent, natural posting patterns
- Engage meaningfully with community discussions

**🔴 Suspicious Members Often:**
- Post very frequently (10+ posts per day)
- Respond extremely quickly to posts (<30 seconds)
- Use repetitive or generic content
- Show highly consistent posting schedules
- Post in bursts with minimal engagement

## 📊 Using the Dashboard

### Accessing the Dashboard

1. Click the extension icon in your Chrome toolbar
2. The popup dashboard opens with three main tabs:
   - **Dashboard**: Community overview and statistics
   - **Members**: Detailed member analysis and search
   - **Settings**: Configuration and privacy controls

### Dashboard Tab Features

**Community Overview**
- Total members analyzed
- Distribution by quality category
- Storage usage statistics
- Analysis status indicator

**Recent Activity**
- Latest analyzed members
- Quick quality assessment
- Time since last activity
- One-click member details

**Quick Actions**
- **Refresh Analysis**: Update analysis for current page
- **Cleanup Data**: Remove expired member data
- **Export Data**: Download analysis results

### Members Tab Features

**Search and Filter**
- **Search box**: Find members by username
- **Quality filter**: Show only specific quality categories
- **Sort options**: By score, activity, or post count

**Member List**
- **Quality indicators**: Visual badges with scores
- **Statistics**: Post count, score, confidence level
- **Click for details**: Full analysis breakdown

**Member Details Modal**
- **Quality score** with confidence percentage
- **Activity statistics** and posting patterns
- **Recent posts** with content preview
- **Analysis flags** and behavioral indicators

## 🔍 Interpreting Analysis Results

### Quality Scores

**Understanding Scores (0-100)**
- **90-100**: Exceptional community contributor
- **75-89**: High-quality, valuable member
- **50-74**: Average member, mixed indicators
- **25-49**: Some concerning patterns detected
- **0-24**: Insufficient data or highly suspicious

### Confidence Levels

**Confidence Percentage Meaning**
- **80-100%**: Very reliable analysis, sufficient data
- **60-79%**: Good confidence, likely accurate
- **40-59%**: Moderate confidence, use with caution
- **20-39%**: Low confidence, limited data available
- **0-19%**: Very low confidence, insufficient analysis

### Analysis Flags

**Common Automation Flags:**
- `high_automation_risk`: Multiple automation indicators
- `burst_posting`: Many posts in short time periods
- `generic_responses`: Repetitive, template-like content
- `repetitive_content`: High similarity between posts
- `consistent_timing`: Highly regular posting schedule

**Data Quality Flags:**
- `limited_data`: Less than 5 posts analyzed
- `low_quality_content`: Poor content quality indicators
- `insufficient_data`: Not enough information for analysis

### Statistical Details

**Member Statistics Include:**
- **Posts analyzed**: Number of posts processed
- **Average post length**: Character count per post
- **Posting pattern**: Frequency and timing analysis
- **Engagement ratio**: Comments received per post
- **Content similarity**: Repetition level measurement
- **Topic diversity**: Range of subjects discussed

## ⚙️ Privacy and Settings

### Analysis Settings

**Enable/Disable Features:**
- **Quality analysis**: Turn extension functionality on/off
- **Quality badges**: Show/hide visual indicators
- **Detailed tooltips**: Enable/disable hover information
- **Confidence levels**: Display reliability percentages

### Privacy Controls

**Privacy Mode:**
- Reduces data collection to minimum necessary
- Shorter data retention period (7 days vs 30 days)
- Simplified analysis with fewer data points
- Enhanced user privacy protection

**Confidence Threshold:**
- Set minimum confidence for displaying badges
- Range: 0-100% (recommended: 30-50%)
- Higher threshold = fewer badges, higher accuracy
- Lower threshold = more badges, possible false positives

**Member Exclusions:**
- Exclude specific members from analysis
- Immediately deletes existing data
- Prevents future data collection
- Use for privacy or personal preferences

### Data Management

**Storage Information:**
- View current storage usage in KB
- Monitor number of members tracked
- Check last cleanup date

**Data Control Options:**
- **Export data**: Download complete analysis database
- **Cleanup data**: Remove expired information
- **Clear all data**: Complete reset (cannot be undone)

## ✅ Best Practices

### Effective Usage

**Do:**
- Use badges as guidance, not absolute truth
- Consider context and individual circumstances
- Focus on patterns, not isolated incidents
- Respect member privacy and community guidelines
- Use analysis to support, not replace, human judgment

**Don't:**
- Harass members based on quality scores
- Share analysis results to embarrass others
- Make unfair judgments without context
- Use scores for commercial or discriminatory purposes
- Assume analysis is always 100% accurate

### Community Management

**For Community Leaders:**
- Use analysis to identify potential spam patterns
- Focus on behavior patterns, not individual members
- Consider quality trends over time
- Combine with other moderation tools
- Maintain transparent community guidelines

**For Community Members:**
- Use scores to guide your engagement decisions
- Be aware of automation in communities
- Report suspicious behavior through proper channels
- Support genuine community contributors
- Maintain healthy skepticism of all automated analysis

### Accuracy Considerations

**Factors Affecting Accuracy:**
- Amount of available data (more posts = higher accuracy)
- Time span of activity (longer period = better analysis)
- Community context and norms
- Individual member circumstances
- Recent changes in behavior

**When to Trust Analysis:**
- High confidence levels (60%+)
- Consistent patterns over time
- Multiple supporting indicators
- Large sample of posts analyzed
- Alignment with community observations

## 🔧 Troubleshooting

### Common Issues

**No badges appearing:**
1. Check extension is enabled in `chrome://extensions/`
2. Refresh the Skool community page
3. Verify you're on a `*.skool.com` domain
4. Check confidence threshold isn't too high

**Incorrect analysis:**
1. Allow more time for data collection
2. Check confidence level (low = unreliable)
3. Consider member exclusion if persistently wrong
4. Remember context and individual circumstances

**Performance issues:**
1. Enable privacy mode for lighter analysis
2. Increase confidence threshold to reduce processing
3. Use cleanup data feature regularly
4. Consider excluding very active communities

### Advanced Troubleshooting

**Extension popup won't open:**
1. Right-click extension icon → "Manage extension"
2. Check for Chrome browser updates
3. Disable and re-enable extension
4. Clear Chrome cache and restart browser

**Analysis seems stuck:**
1. Click "Refresh Analysis" in dashboard
2. Clear extension data and restart
3. Check internet connection to Skool
4. Verify Skool page loaded completely

**Data export issues:**
1. Check browser download permissions
2. Ensure sufficient disk space
3. Try exporting smaller data sets
4. Update Chrome to latest version

## 💡 Tips and Tricks

### Maximizing Effectiveness

1. **Regular Reviews**: Check dashboard weekly for community health trends
2. **Confidence Awareness**: Always check confidence levels before acting
3. **Context Consideration**: Remember cultural and individual differences
4. **Pattern Focus**: Look for consistent patterns, not isolated incidents
5. **Community Integration**: Use alongside existing moderation tools

### Privacy Best Practices

1. **Regular Cleanup**: Use cleanup feature monthly
2. **Selective Exclusions**: Exclude members you interact with personally
3. **Privacy Mode**: Enable for sensitive or personal communities
4. **Data Export**: Regularly backup your analysis data
5. **Settings Review**: Periodically review and adjust privacy settings

## 📞 Getting Help

### Self-Service Resources

- **README.md**: General extension information
- **INSTALLATION.md**: Setup and installation help
- **PRIVACY.md**: Data protection details
- **This User Guide**: Comprehensive usage instructions

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Built-in help within extension
- **Community**: Chrome Web Store reviews and discussions
- **Updates**: Automatic notifications for important changes

---

**You're now ready to effectively use the Skool Community Quality Detector!** 

Remember: This tool is designed to assist your judgment, not replace it. Always consider context, individual circumstances, and community guidelines when making decisions based on analysis results.

*Happy community building! 🎉*