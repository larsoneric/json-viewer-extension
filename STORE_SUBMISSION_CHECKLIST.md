# Chrome Web Store Submission Checklist

This document outlines the remaining steps needed to publish the JSON Viewer extension to the Chrome Web Store.

## ✅ Completed (Ready for Submission)

- [x] Manifest V3 configuration
- [x] Content Security Policy (CSP)
- [x] All required icons (16x16, 48x48, 128x128)
- [x] Privacy policy (PRIVACY.md)
- [x] LICENSE file (MIT)
- [x] Comprehensive README
- [x] Test suite (97 passing tests)
- [x] Code quality improvements (constants, error handling, rate limiting)
- [x] Keyboard accessibility
- [x] Git repository clean (all changes committed)
- [x] CHANGELOG.md

## 📸 Required Before Submission

### 1. Store Listing Screenshots (REQUIRED)

You need to create at least **1 screenshot** (up to 5 recommended):

**Requirements:**
- Size: 1280x800 or 640x400 pixels
- Format: PNG or JPEG
- Show the extension in action

**Recommended Screenshots:**

1. **Main panel with requests list**
   - Open DevTools → JSON Viewer tab
   - Show 3-4 requests with different methods (GET, POST)
   - Highlight the search bar and controls

2. **Formatted JSON view**
   - Expand a request showing formatted JSON
   - Show syntax highlighting in action
   - Display the Format/Copy buttons

3. **Request details expanded**
   - Show request/response headers
   - Display the full request information panel

**How to create:**
```bash
# 1. Open Chrome and navigate to a page with JSON API calls
# 2. Open DevTools (F12)
# 3. Go to JSON Viewer tab
# 4. Make API requests (or reload the page)
# 5. Take screenshots showing the features
# 6. Resize to 1280x800 using any image editor
```

### 2. Store Listing Copy

**Short Description** (132 character limit):
```
View and format JSON from network responses. Auto-detects escaped JSON with syntax highlighting and easy clipboard access.
```

**Detailed Description** (suggested):
```
A DevTools panel that automatically monitors network responses and helps you view, format, and copy data with syntax highlighting.

This extension adds a new tab to Chrome DevTools that watches for network requests and displays them in an easy-to-navigate list. When you click on a request, you can view the full response with color-coded syntax highlighting, making it easier to read and understand API responses.

Features include:
- Automatic detection of escaped strings in responses
- One-click formatting with syntax highlighting
- Copy to clipboard (formatted or raw)
- Search and filter by URL or method
- Recording controls to pause and review
- Full keyboard navigation

Perfect for developers debugging APIs, testing integrations, or working with complex nested data structures. All processing happens locally in your browser - no data is sent to external servers.

Open source at https://github.com/larsoneric/json-viewer-extension
```

**Category:** Developer Tools

**Language:** English

## 🚀 Submission Steps

### Step 1: Developer Account Setup
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Pay one-time $5 developer fee (if not already paid)
3. Complete developer account verification

### Step 2: Prepare Extension Package
```bash
# Create a ZIP file of the extension (excluding unnecessary files)
cd /path/to/json-viewer-extension
zip -r json-viewer-extension.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*tests*" \
  -x "vitest.config.js" \
  -x "package*.json" \
  -x "STORE_SUBMISSION_CHECKLIST.md" \
  -x "*.md"
```

**Include only these files in ZIP:**
- manifest.json
- devtools.html
- devtools.js
- panel.html
- panel.js
- i18n.js
- icon16.png
- icon48.png
- icon128.png
- icon.svg
- generate-icons.html (optional, for users)

### Step 3: Upload to Chrome Web Store
1. Click "New Item" in the Developer Dashboard
2. Upload the ZIP file
3. Fill in store listing details:
   - Upload screenshots (at least 1, up to 5)
   - Add short description (132 chars)
   - Add detailed description
   - Select category: Developer Tools
   - Add privacy policy link: `https://github.com/larsoneric/json-viewer-extension/blob/main/PRIVACY.md`
   - Add homepage: `https://github.com/larsoneric/json-viewer-extension`

### Step 4: Distribution Settings
- **Visibility:** Public
- **Pricing:** Free
- **Distribution:** All regions (or select specific countries)

### Step 5: Privacy Practices
Answer the privacy questionnaire:
- Does NOT collect user data
- Does NOT use remote code
- Complies with limited use policy
- Link to privacy policy: `https://github.com/larsoneric/json-viewer-extension/blob/main/PRIVACY.md`

### Step 6: Submit for Review
1. Review all information
2. Click "Submit for Review"
3. Wait for Chrome Web Store review (typically 1-3 days)

## 📋 Post-Submission

### If Approved:
- Extension will be live on Chrome Web Store
- Share the store link with users
- Monitor reviews and ratings
- Respond to user feedback

### If Rejected:
- Review rejection reasons carefully
- Make necessary changes
- Resubmit (usually faster second review)

## 🔄 Future Updates

To update the extension:
1. Update version in `manifest.json` (follow semantic versioning)
2. Update `CHANGELOG.md` with changes
3. Test thoroughly
4. Commit changes to git
5. Create new ZIP file
6. Upload to Chrome Web Store dashboard
7. Submit for review

## 📞 Support

If you encounter issues during submission:
- [Chrome Web Store Help](https://support.google.com/chrome_webstore/)
- [Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

## ⚠️ Common Rejection Reasons to Avoid

- Unclear privacy policy ✅ (We have one)
- Missing permissions justification ✅ (We use minimal permissions)
- Poor quality screenshots ⚠️ (Need to create)
- Misleading description ✅ (Our description is accurate)
- Excessive permissions ✅ (We only request clipboardWrite)

## 🎯 Current Status

**Extension is 98% ready for publication!**

**Only missing:** Store listing screenshots

**Estimated time to complete:** 30 minutes (create 3 good screenshots)

**Estimated time to approval:** 1-3 business days after submission
