# Skool Community Quality Detector

A Chrome extension that analyzes Skool community member behavior to detect automation patterns and assess content quality, helping maintain community integrity through intelligent behavioral analysis.

## 🎯 Features

### Core Analysis
- **Automation Detection**: Identifies suspicious posting patterns that suggest bot behavior
- **Content Quality Assessment**: Evaluates the value and authenticity of member contributions
- **Behavioral Pattern Recognition**: Analyzes posting frequency, timing, and engagement patterns
- **Confidence Scoring**: Provides reliability ratings for all analysis results

### Visual Interface
- **Quality Badges**: Unobtrusive colored indicators next to member names
- **Detailed Tooltips**: Comprehensive analysis information on hover
- **Dashboard Analytics**: Community-wide statistics and member insights
- **Real-time Updates**: Live analysis as you browse Skool communities

### Privacy & Ethics
- **Local Storage Only**: All data stays on your device - never transmitted externally
- **Privacy Mode**: Minimal data collection option
- **Member Exclusions**: Ability to exclude specific members from analysis
- **Ethical Guidelines**: Built-in safeguards against misuse

## 🛡️ Privacy First

- ✅ **100% Local Processing** - No data ever leaves your device
- ✅ **No External Servers** - Everything runs in your browser
- ✅ **No Tracking** - We don't collect any personal information
- ✅ **Complete Control** - Export, view, or delete your data anytime
- ✅ **Automatic Cleanup** - Data expires after 30 days

## 🚀 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store page](# "Link will be available after publishing")
2. Click "Add to Chrome"
3. Confirm installation permissions
4. Visit any Skool community to start analyzing

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar

## 📊 How It Works

### Analysis Algorithm

The extension uses a multi-factor algorithm to evaluate member behavior:

**Automation Indicators (Negative Scoring)**
- High-frequency posting (>10 posts/day)
- Rapid response times (<30 seconds)
- Consistent posting schedules
- Repetitive content patterns
- Generic response templates
- Burst posting behavior

**Quality Indicators (Positive Scoring)**
- Valuable external resources shared
- Helpful answers with positive engagement
- Original insights and personal experiences
- Community engagement and reciprocal interactions
- Topic diversity and thoughtful questions
- Long-form, detailed content

**Confidence Factors**
- Number of posts analyzed (minimum 5 required)
- Time span of activity data
- Engagement data availability
- Content diversity metrics

### Quality Categories

- 🟢 **High Quality** (75-100): Genuine contributors with valuable engagement
- 🟡 **Moderate** (50-74): Mixed indicators, generally authentic
- 🔴 **Suspicious** (25-49): Shows potential automation patterns
- ⚪ **Unknown** (0-24): Insufficient data for reliable analysis

## 🎮 Usage

### Basic Usage
1. **Install** the extension
2. **Visit** any Skool community
3. **Look** for colored badges next to member names
4. **Hover** over badges for detailed analysis
5. **Click** the extension icon for dashboard and settings

### Dashboard Features
- **Community Overview**: Statistics about analyzed members
- **Recent Activity**: Latest member analysis results
- **Member Search**: Find and analyze specific members
- **Data Management**: Export, cleanup, or clear stored data

### Settings & Configuration
- **Enable/Disable** quality badges
- **Toggle** detailed tooltips
- **Adjust** confidence thresholds
- **Enable** privacy mode for minimal data collection
- **Exclude** specific members from analysis

## 🛠️ Technical Details

### Architecture
- **Manifest V3** Chrome extension
- **Content Script** for DOM analysis
- **Background Service Worker** for data processing
- **Popup Interface** for settings and analytics
- **Local Storage** using Chrome's secure storage API

### Permissions Required
- `storage` - For local data storage
- `activeTab` - For current tab analysis
- `tabs` - For navigation detection
- `https://*.skool.com/*` - Access to Skool communities only

### Performance
- **Lightweight**: Minimal impact on page load times
- **Efficient**: Intelligent batching and throttling
- **Respectful**: Rate limiting to avoid overwhelming servers
- **Optimized**: Smart caching and data management

## 🔧 Development

### Project Structure
```
skool-quality-detector/
├── manifest.json           # Extension configuration
├── popup/                  # Dashboard interface
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/                # Page integration
│   ├── content.js
│   └── content.css
├── background/             # Service worker
│   └── background.js
├── utils/                  # Shared utilities
│   ├── constants.js
│   ├── storage.js
│   └── analyzer.js
└── icons/                  # Extension icons
```

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/skool-quality-detector.git

# Load unpacked extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the project directory
```

### Testing
- Test on various Skool communities
- Verify privacy compliance
- Check performance impact
- Validate analysis accuracy
- Test edge cases and error handling

## 📋 Contributing

### Reporting Issues
- Use GitHub Issues for bug reports
- Provide detailed reproduction steps
- Include browser version and extension version
- Screenshots or videos are helpful

### Feature Requests
- Check existing issues first
- Provide clear use cases
- Consider privacy implications
- Explain expected benefits

### Pull Requests
- Follow existing code style
- Include tests for new features
- Update documentation
- Ensure privacy compliance
- Test thoroughly before submitting

## ⚖️ Ethics & Guidelines

### Intended Use
- **Community Protection**: Identify potential spam or automation
- **Quality Assessment**: Understand content patterns
- **Personal Awareness**: Make informed engagement decisions

### Prohibited Use
- ❌ Harassment or targeting individuals
- ❌ Public shaming based on scores
- ❌ Discrimination or unfair treatment
- ❌ Commercial exploitation of data

### Best Practices
- Use scores as guidance, not absolute truth
- Consider context and individual circumstances
- Respect community member privacy
- Report issues through proper channels
- Support community health, not division

## 🔒 Security

### Data Protection
- All data encrypted using Chrome's native security
- No external network requests for data
- Regular automatic cleanup of old data
- User-controlled data management

### Security Reporting
If you discover security vulnerabilities:
1. Do NOT create public GitHub issues
2. Email security concerns privately
3. Provide detailed reproduction steps
4. Allow time for patch development

## 🤝 Support

### Getting Help
- **Documentation**: Check this README first
- **GitHub Issues**: For bug reports and feature requests
- **Chrome Web Store Reviews**: For user feedback
- **Community Forums**: For general discussion

### FAQ

**Q: Does this extension work on mobile?**
A: No, this is a Chrome desktop extension only.

**Q: Can I use this on other platforms besides Skool?**
A: No, it's specifically designed for Skool communities only.

**Q: Is my data shared with anyone?**
A: Never. All data stays on your local device.

**Q: How accurate is the analysis?**
A: Accuracy improves with more data. Confidence levels indicate reliability.

**Q: Can I export my analysis data?**
A: Yes, use the export feature in the extension popup.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension documentation and best practices
- Skool community for inspiration
- Privacy-first development principles
- Open source community contributions

## 📈 Roadmap

### Upcoming Features
- [ ] Enhanced automation detection algorithms
- [ ] Community health metrics
- [ ] Batch member analysis
- [ ] Advanced filtering and sorting
- [ ] Export formats (CSV, PDF)
- [ ] Multi-language support

### Long-term Goals
- [ ] Machine learning improvements
- [ ] Community moderator tools
- [ ] Integration with community guidelines
- [ ] Advanced behavioral pattern recognition
- [ ] Real-time threat detection

---

**Made with ❤️ for healthier online communities**

*Remember: This tool is designed to assist, not replace, human judgment in community management. Always consider context, individual circumstances, and community guidelines when making decisions based on analysis results.*