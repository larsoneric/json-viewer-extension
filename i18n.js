// Internationalization
const translations = {
  en: {
    // Empty state
    emptyStateTitle: 'Waiting for Network Requests',
    emptyStateDescription: 'Make network requests in your application. Requests with JSON will appear here.',

    // Header bar
    recentRequestsHeader: 'Recent Requests with JSON',
    recordingPaused: 'Recording Paused',
    recordingActive: 'Recording Active',
    pauseRecording: 'Pause Recording',
    resumeRecording: 'Resume Recording',
    clearButton: 'Clear',

    // Request list
    property: 'property',
    properties: 'properties',

    // Request details
    requestHeaders: 'Request Headers',
    responseHeaders: 'Response Headers',
    requestPayload: 'Request Payload',
    noHeaders: 'No headers',

    // Property actions
    fullResponse: '[Full Response]',
    formatButton: 'Format',
    collapseButton: 'Collapse',
    copyButton: 'Copy',

    // Notifications
    copiedSuccess: 'Copied {path} to clipboard',
    copyFailed: 'Failed to copy to clipboard',
    parseError: 'Error parsing JSON: {error}'
  }
};

let currentLanguage = 'en';

function t(key, replacements = {}) {
  let text = translations[currentLanguage][key] || key;

  // Replace placeholders like {path}, {error}, etc.
  Object.keys(replacements).forEach(placeholder => {
    text = text.replace(`{${placeholder}}`, replacements[placeholder]);
  });

  return text;
}

function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
  }
}
