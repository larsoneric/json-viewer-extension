import { describe, test, expect } from 'vitest';

// JSON parsing functions from panel.js
function isEscapedJSON(str) {
  if (typeof str !== 'string') return false;

  // Check if string looks like it contains escaped JSON
  try {
    const parsed = JSON.parse(str);
    // If it parses and is an object or array, it's probably escaped JSON
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}

function findEscapedJsonProperties(obj, path = '') {
  const results = [];

  function traverse(value, currentPath) {
    if (value === null || value === undefined) return;

    if (typeof value === 'string') {
      // Check if this string contains escaped JSON
      if (isEscapedJSON(value)) {
        results.push({
          path: currentPath,
          value: value
        });
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        traverse(item, `${currentPath}[${index}]`);
      });
    } else if (typeof value === 'object') {
      Object.keys(value).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(value[key], newPath);
      });
    }
  }

  traverse(obj, path);
  return results;
}

describe('JSON Parser Functions', () => {
  describe('isEscapedJSON', () => {
    test('should return true for escaped JSON object', () => {
      expect(isEscapedJSON('{"name":"John","age":30}')).toBe(true);
    });

    test('should return true for escaped JSON array', () => {
      expect(isEscapedJSON('[1,2,3]')).toBe(true);
    });

    test('should return true for escaped empty object', () => {
      expect(isEscapedJSON('{}')).toBe(true);
    });

    test('should return true for escaped empty array', () => {
      expect(isEscapedJSON('[]')).toBe(true);
    });

    test('should return false for plain string', () => {
      expect(isEscapedJSON('plain text')).toBe(false);
    });

    test('should return false for JSON primitive string', () => {
      expect(isEscapedJSON('"just a string"')).toBe(false);
    });

    test('should return false for JSON primitive number', () => {
      expect(isEscapedJSON('42')).toBe(false);
    });

    test('should return false for JSON primitive boolean', () => {
      expect(isEscapedJSON('true')).toBe(false);
    });

    test('should return false for JSON primitive null', () => {
      expect(isEscapedJSON('null')).toBe(false);
    });

    test('should return false for non-string values', () => {
      expect(isEscapedJSON(123)).toBe(false);
      expect(isEscapedJSON(true)).toBe(false);
      expect(isEscapedJSON(null)).toBe(false);
      expect(isEscapedJSON(undefined)).toBe(false);
      expect(isEscapedJSON({})).toBe(false);
      expect(isEscapedJSON([])).toBe(false);
    });

    test('should return false for invalid JSON', () => {
      expect(isEscapedJSON('{invalid}')).toBe(false);
      expect(isEscapedJSON('[1,2,]')).toBe(false);
    });

    test('should return true for nested escaped JSON', () => {
      expect(isEscapedJSON('{"user":{"name":"Alice","age":25}}')).toBe(true);
    });

    test('should return true for escaped JSON with special characters', () => {
      expect(isEscapedJSON('{"message":"Hello\\nWorld"}')).toBe(true);
    });
  });

  describe('findEscapedJsonProperties', () => {
    test('should find single escaped JSON property', () => {
      const obj = {
        data: '{"name":"John","age":30}'
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('data');
      expect(results[0].value).toBe('{"name":"John","age":30}');
    });

    test('should find multiple escaped JSON properties', () => {
      const obj = {
        user: '{"name":"Alice"}',
        config: '{"theme":"dark"}',
        status: 'active'
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.path)).toContain('user');
      expect(results.map(r => r.path)).toContain('config');
    });

    test('should find nested escaped JSON properties', () => {
      const obj = {
        data: {
          user: '{"id":123}',
          meta: {
            info: '{"version":"1.0"}'
          }
        }
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.path)).toContain('data.user');
      expect(results.map(r => r.path)).toContain('data.meta.info');
    });

    test('should find escaped JSON in arrays', () => {
      const obj = {
        items: [
          '{"id":1}',
          '{"id":2}',
          'plain string'
        ]
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.path)).toContain('items[0]');
      expect(results.map(r => r.path)).toContain('items[1]');
    });

    test('should handle empty object', () => {
      const results = findEscapedJsonProperties({});
      expect(results).toHaveLength(0);
    });

    test('should handle object with no escaped JSON', () => {
      const obj = {
        name: 'John',
        age: 30,
        active: true
      };
      const results = findEscapedJsonProperties(obj);
      expect(results).toHaveLength(0);
    });

    test('should handle null and undefined values', () => {
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        data: '{"valid":"json"}'
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('data');
    });

    test('should handle deeply nested structures', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              deepData: '{"found":"me"}'
            }
          }
        }
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('level1.level2.level3.deepData');
    });

    test('should handle mixed arrays and objects', () => {
      const obj = {
        users: [
          {
            name: 'Alice',
            profile: '{"age":25}'
          },
          {
            name: 'Bob',
            profile: '{"age":30}'
          }
        ]
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.path)).toContain('users[0].profile');
      expect(results.map(r => r.path)).toContain('users[1].profile');
    });

    test('should not include plain JSON strings', () => {
      const obj = {
        string: '"just a string"',
        number: '42',
        boolean: 'true',
        object: '{"name":"John"}'
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('object');
    });

    test('should handle escaped JSON arrays', () => {
      const obj = {
        data: '[1,2,3,4,5]'
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('data');
      expect(results[0].value).toBe('[1,2,3,4,5]');
    });

    test('should handle complex real-world example', () => {
      const obj = {
        status: 'success',
        code: 200,
        data: '{"user":{"id":123,"name":"John"},"preferences":"{\\"theme\\":\\"dark\\"}"}',
        metadata: {
          timestamp: 1234567890,
          config: '{"version":"1.0","features":["search","filter"]}'
        }
      };
      const results = findEscapedJsonProperties(obj);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.path)).toContain('data');
      expect(results.map(r => r.path)).toContain('metadata.config');
    });
  });
});
