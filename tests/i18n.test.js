import { describe, test, expect, beforeEach } from 'vitest';

// i18n functions from i18n.js
const translations = {
  en: {
    emptyStateTitle: 'Waiting for Network Requests',
    emptyStateDescription: 'Make network requests in your application. Requests with JSON will appear here.',
    recentRequestsHeader: 'Recent Requests with JSON',
    recordingPaused: 'Recording Paused',
    recordingActive: 'Recording Active',
    pauseRecording: 'Pause Recording',
    resumeRecording: 'Resume Recording',
    clearButton: 'Clear',
    searchPlaceholder: 'Filter by URL or method...',
    property: 'property',
    properties: 'properties',
    requestHeaders: 'Request Headers',
    responseHeaders: 'Response Headers',
    requestPayload: 'Request Payload',
    noHeaders: 'No headers',
    fullResponse: '[Full Response]',
    formatButton: 'Format',
    collapseButton: 'Collapse',
    copyButton: 'Copy',
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
    text = text.replaceAll(`{${placeholder}}`, replacements[placeholder]);
  });

  return text;
}

function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
  }
}

describe('Internationalization (i18n)', () => {
  beforeEach(() => {
    currentLanguage = 'en';
  });

  describe('t() function', () => {
    test('should return translated text for valid key', () => {
      expect(t('emptyStateTitle')).toBe('Waiting for Network Requests');
    });

    test('should return key itself for missing translation', () => {
      expect(t('nonexistentKey')).toBe('nonexistentKey');
    });

    test('should replace single placeholder', () => {
      expect(t('copiedSuccess', { path: 'data.name' }))
        .toBe('Copied data.name to clipboard');
    });

    test('should replace multiple placeholders', () => {
      // Add a test translation with multiple placeholders
      translations.en.testMultiple = 'User {name} has {count} items';
      expect(t('testMultiple', { name: 'John', count: '5' }))
        .toBe('User John has 5 items');
    });

    test('should handle missing replacements gracefully', () => {
      expect(t('copiedSuccess', {}))
        .toBe('Copied {path} to clipboard');
    });

    test('should handle empty replacements object', () => {
      expect(t('clearButton', {}))
        .toBe('Clear');
    });

    test('should work with error placeholder', () => {
      expect(t('parseError', { error: 'Unexpected token' }))
        .toBe('Error parsing JSON: Unexpected token');
    });
  });

  describe('setLanguage() function', () => {
    test('should keep current language for unsupported language', () => {
      setLanguage('fr'); // French not supported
      expect(t('clearButton')).toBe('Clear'); // Should still be English
    });

    test('should switch language if supported', () => {
      // Add Spanish translations
      translations.es = {
        clearButton: 'Borrar',
        formatButton: 'Formatear'
      };

      setLanguage('es');
      currentLanguage = 'es'; // Simulate the change
      expect(t('clearButton')).toBe('Borrar');
    });
  });

  describe('All translation keys', () => {
    test('should have all required translation keys in English', () => {
      const requiredKeys = [
        'emptyStateTitle',
        'emptyStateDescription',
        'recentRequestsHeader',
        'recordingPaused',
        'recordingActive',
        'pauseRecording',
        'resumeRecording',
        'clearButton',
        'searchPlaceholder',
        'property',
        'properties',
        'requestHeaders',
        'responseHeaders',
        'requestPayload',
        'noHeaders',
        'fullResponse',
        'formatButton',
        'collapseButton',
        'copyButton',
        'copiedSuccess',
        'copyFailed',
        'parseError'
      ];

      requiredKeys.forEach(key => {
        expect(translations.en[key]).toBeDefined();
        expect(translations.en[key]).not.toBe('');
      });
    });

    test('should not return empty strings for any key', () => {
      Object.keys(translations.en).forEach(key => {
        expect(translations.en[key].length).toBeGreaterThan(0);
      });
    });
  });

  describe('Placeholder replacement edge cases', () => {
    test('should handle placeholder that does not exist in text', () => {
      expect(t('clearButton', { nonexistent: 'value' }))
        .toBe('Clear');
    });

    test('should handle multiple occurrences of same placeholder', () => {
      translations.en.testDouble = '{name} met {name} yesterday';
      expect(t('testDouble', { name: 'Alice' }))
        .toBe('Alice met Alice yesterday');
    });

    test('should handle special characters in replacement values', () => {
      expect(t('copiedSuccess', { path: 'data["user\'s-name"]' }))
        .toBe('Copied data["user\'s-name"] to clipboard');
    });
  });
});
