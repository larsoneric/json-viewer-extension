# Privacy Policy for JSON Viewer Chrome Extension

**Last Updated:** October 21, 2025

**Developer:** Eric Larson
**Extension:** JSON Viewer
**Version:** 1.0.0

## Overview

JSON Viewer is a Chrome DevTools extension that helps developers view and format JSON data from network responses. We are committed to protecting your privacy and being transparent about our data practices.

**Short Summary:** This extension does NOT collect, store, transmit, or share any user data. All processing happens locally in your browser.

## Data Collection and Usage

### What Data We Access

The JSON Viewer extension accesses the following data **locally within your browser only**:

1. **Network Request Data**: The extension monitors network requests made by websites you visit while DevTools is open. Specifically:
   - URLs of network requests
   - HTTP methods (GET, POST, etc.)
   - Request and response headers
   - Response bodies containing JSON data

2. **Clipboard Access**: When you use the "Copy" button, the extension writes formatted JSON text to your system clipboard.

### What We DO NOT Do

- **No External Transmission**: We do not send, upload, or transmit any of your data to external servers, third parties, or cloud services
- **No Storage**: We do not store your data persistently; all data is held temporarily in browser memory and cleared when you close DevTools or clear the request list
- **No Tracking**: We do not track your browsing history, personal information, or usage patterns
- **No Analytics**: We do not use analytics services or collect usage statistics
- **No Third-Party Services**: We do not integrate with or share data with any third-party services

### How Data is Processed

All data processing happens **entirely within your browser**:

1. Network responses are intercepted via Chrome's DevTools API
2. JSON data is parsed and formatted locally
3. Formatted data is displayed in the extension panel
4. Data is kept in memory for the duration of your DevTools session (up to your configured request limit: 10-100 requests)
5. All data is cleared when you:
   - Click the "Clear" button
   - Close the DevTools panel
   - Close the browser tab
   - Close Chrome

## Permissions Explained

The extension requests the following permissions:

- **`devtools`**: Allows the extension to create a panel within Chrome DevTools
- **`clipboardWrite`**: Allows the extension to copy formatted JSON to your clipboard when you click the "Copy" button

These are the **minimum permissions** required for the extension to function. We do not request access to:
- Your browsing history
- Your bookmarks
- Your downloads
- Websites or tabs outside of DevTools
- Your personal information

## Data Security

- All data remains within your local browser environment
- No data leaves your computer
- The extension does not make any external network requests
- Source code is publicly available and can be audited at: https://github.com/larsoneric/json-viewer-extension

## Children's Privacy

This extension does not knowingly collect any information from anyone, including children under the age of 13. The extension is designed for software developers and processes data locally.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this document. Continued use of the extension after changes constitutes acceptance of the updated policy.

## Contact Us

If you have questions or concerns about this privacy policy or the extension's data practices, please:

- Open an issue on GitHub: https://github.com/larsoneric/json-viewer-extension/issues
- Review the source code: https://github.com/larsoneric/json-viewer-extension

## Open Source

This extension is open source. You can review the complete source code to verify our privacy practices at: https://github.com/larsoneric/json-viewer-extension

## Chrome Web Store Compliance

This extension complies with the [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/), including:

### Limited Use Policy Compliance
- **No data collection**: We do not collect any user data
- **Minimal permissions**: We only request the minimum permissions necessary (clipboardWrite)
- **No remote code**: All code is packaged within the extension; no code is loaded from external sources
- **Transparent practices**: This privacy policy accurately describes all data handling

### User Data Policy Compliance
- **No sale of user data**: We do not sell user data (we don't collect any)
- **No use for advertising**: We do not use data for advertising purposes
- **No third-party sharing**: We do not share data with third parties
- **Not for creditworthiness**: We do not use data to determine creditworthiness or lending purposes

### Single Purpose Policy Compliance
This extension has a single, well-defined purpose: to provide a DevTools panel for viewing, formatting, and copying JSON from network responses with automatic detection of escaped JSON strings.

## Your Consent

By installing and using the JSON Viewer extension, you consent to this privacy policy.

## Summary

**In plain English**: This extension only works locally in your browser. It reads network responses to help you format JSON data, and can copy that data to your clipboard. It never sends your data anywhere, doesn't track you, and doesn't store anything permanently. When you close DevTools, everything is gone.

---

## Privacy Practices Disclosure (Chrome Web Store)

For Chrome Web Store submission requirements:

**Does this extension collect user data?**
No. This extension does not collect, store, transmit, or share any user data.

**Does this extension use remote code?**
No. All code is packaged within the extension.

**Data handling:**
- No user data is collected
- No user data is stored
- No user data is transmitted
- No user data is sold
- No user data is used for purposes unrelated to the extension's core functionality

**Permission usage:**
- `clipboardWrite`: Used only when user clicks the "Copy" button to copy JSON to clipboard
