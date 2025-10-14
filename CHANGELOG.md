# Changelog

All notable changes to the JSON Viewer Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-13

### Added
- Initial release of JSON Viewer Chrome Extension
- DevTools panel for viewing JSON network responses
- Automatic detection and display of escaped JSON strings within responses
- Syntax highlighting for formatted JSON (keys, strings, numbers, booleans, null)
- Format/collapse toggle for JSON properties
- One-click copy to clipboard functionality
- Search/filter by URL or HTTP method
- Recording controls (pause/resume)
- Configurable request history limit (10, 20, 50, or 100 requests)
- Full keyboard navigation support
- ARIA labels and accessibility features
- Internationalization system (English)
- Request/response headers viewer
- Timestamp display for each request
- VS Code-inspired dark theme
- Comprehensive test suite (97 tests)
- Content Security Policy for enhanced security
- Rate limiting/debouncing for high-frequency requests
- Error boundary with user-friendly error display
- Memory management with configurable request limits

### Security
- XSS prevention with proper HTML escaping
- Local-only data processing (no external requests)
- Minimal permissions (clipboardWrite only)
- CSP header for extension pages

### Documentation
- Comprehensive README with usage instructions
- Privacy policy (PRIVACY.md)
- MIT License
- Keyboard shortcuts documentation
- Contributing guidelines

### Performance
- Incremental rendering for large request lists
- Debounced request processing
- Optimized memory usage with request limits

## [Unreleased]

### Planned
- Additional language support for i18n
- Export functionality (JSON, CSV)
- Request/response diff viewer
- Custom theme support
- Request filtering by status code
- Request size display

---

## Release Notes

### Version 1.0.0

This is the initial public release of JSON Viewer. The extension is designed to help developers working with JSON APIs by:

1. **Automatically monitoring** all JSON network responses in DevTools
2. **Detecting escaped JSON** strings nested within responses
3. **Providing syntax highlighting** and formatting tools
4. **Enabling quick clipboard access** for copying JSON data

The extension prioritizes privacy (all processing happens locally), performance (optimized rendering), and accessibility (full keyboard support).

**Browser Compatibility**: Chrome 88+ (Manifest V3)

**Feedback**: Report issues at https://github.com/larsoneric/json-viewer-extension/issues
