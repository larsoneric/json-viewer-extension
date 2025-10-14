import { describe, test, expect } from 'vitest';

// Import utility functions from panel.js
// Note: Since panel.js uses global scope, we'll need to load it in a way that exposes functions
// For now, we'll test by copying the functions or refactoring panel.js to export them

// Utility functions to test (extracted from panel.js)
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

function getDisplayUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch (e) {
    return url;
  }
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

describe('Utility Functions', () => {
  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should escape single quotes', () => {
      expect(escapeHtml("It's working")).toBe('It&#039;s working');
    });

    test('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    test('should handle string with no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    test('should escape multiple special characters', () => {
      expect(escapeHtml('<div class="test" data-value=\'123\' & more>'))
        .toBe('&lt;div class=&quot;test&quot; data-value=&#039;123&#039; &amp; more&gt;');
    });
  });

  describe('truncate', () => {
    test('should truncate string longer than maxLength', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    test('should not truncate string equal to maxLength', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    test('should not truncate string shorter than maxLength', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });

    test('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });

    test('should truncate at exact boundary', () => {
      expect(truncate('12345678901', 10)).toBe('1234567890...');
    });

    test('should handle maxLength of 0', () => {
      expect(truncate('test', 0)).toBe('...');
    });
  });

  describe('getDisplayUrl', () => {
    test('should extract pathname and search from valid URL', () => {
      expect(getDisplayUrl('https://api.example.com/users?page=1'))
        .toBe('/users?page=1');
    });

    test('should handle URL without search params', () => {
      expect(getDisplayUrl('https://api.example.com/users'))
        .toBe('/users');
    });

    test('should handle URL with only domain', () => {
      expect(getDisplayUrl('https://api.example.com/'))
        .toBe('/');
    });

    test('should return original string for invalid URL', () => {
      expect(getDisplayUrl('not-a-url'))
        .toBe('not-a-url');
    });

    test('should handle URL with hash', () => {
      // Note: hash is not included in pathname + search
      expect(getDisplayUrl('https://example.com/page?q=test#section'))
        .toBe('/page?q=test');
    });

    test('should handle URL with port', () => {
      expect(getDisplayUrl('http://localhost:3000/api/data'))
        .toBe('/api/data');
    });
  });

  describe('syntaxHighlight', () => {
    test('should highlight JSON string values', () => {
      const result = syntaxHighlight('"test"');
      expect(result).toContain('<span class="json-string">"test"</span>');
    });

    test('should highlight JSON keys', () => {
      const result = syntaxHighlight('"name":');
      expect(result).toContain('<span class="json-key">"name":</span>');
    });

    test('should highlight JSON numbers', () => {
      const result = syntaxHighlight('42');
      expect(result).toContain('<span class="json-number">42</span>');
    });

    test('should highlight JSON booleans', () => {
      const result = syntaxHighlight('true');
      expect(result).toContain('<span class="json-boolean">true</span>');

      const result2 = syntaxHighlight('false');
      expect(result2).toContain('<span class="json-boolean">false</span>');
    });

    test('should highlight JSON null', () => {
      const result = syntaxHighlight('null');
      expect(result).toContain('<span class="json-null">null</span>');
    });

    test('should escape HTML before highlighting', () => {
      const result = syntaxHighlight('<script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    test('should handle negative numbers', () => {
      const result = syntaxHighlight('-42');
      expect(result).toContain('<span class="json-number">-42</span>');
    });

    test('should handle decimal numbers', () => {
      const result = syntaxHighlight('3.14');
      expect(result).toContain('<span class="json-number">3.14</span>');
    });

    test('should handle scientific notation', () => {
      const result = syntaxHighlight('1.5e10');
      expect(result).toContain('<span class="json-number">1.5e10</span>');
    });

    test('should handle complex JSON', () => {
      const json = '{"name": "John", "age": 30, "active": true, "data": null}';
      const result = syntaxHighlight(json);

      expect(result).toContain('json-key');
      expect(result).toContain('json-string');
      expect(result).toContain('json-number');
      expect(result).toContain('json-boolean');
      expect(result).toContain('json-null');
    });
  });
});
