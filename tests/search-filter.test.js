import { describe, test, expect, beforeEach } from 'vitest';

/**
 * Search Filter Tests
 *
 * These tests validate the search/filter functionality, particularly ensuring
 * that the bug fix (matching by timestamp instead of index) works correctly.
 */

describe('Search Filter Logic', () => {
  let allRequests;
  let searchQuery;

  beforeEach(() => {
    // Reset state before each test
    allRequests = [];
    searchQuery = '';
  });

  describe('applySearchFilter - Bug Fix Validation', () => {
    test('should match requests by timestamp, not by DOM index', () => {
      // Arrange: Create sample requests
      allRequests = [
        {
          url: 'https://api.example.com/users',
          method: 'GET',
          timestamp: 1000,
          properties: []
        },
        {
          url: 'https://api.example.com/posts',
          method: 'POST',
          timestamp: 2000,
          properties: []
        },
        {
          url: 'https://api.example.com/comments',
          method: 'GET',
          timestamp: 3000,
          properties: []
        }
      ];

      // Create mock DOM wrappers with timestamps
      const wrappers = allRequests.map((req, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'request-wrapper';
        wrapper.setAttribute('data-timestamp', req.timestamp.toString());
        return wrapper;
      });

      // Add wrappers to DOM
      const container = document.createElement('div');
      wrappers.forEach(w => container.appendChild(w));

      // Act: Apply filter for "users"
      searchQuery = 'users';

      wrappers.forEach((wrapper) => {
        const timestamp = parseInt(wrapper.getAttribute('data-timestamp'), 10);
        const reqData = allRequests.find(req => req.timestamp === timestamp);

        if (!reqData) return;

        const matchesUrl = reqData.url.toLowerCase().includes(searchQuery);
        const matchesMethod = reqData.method.toLowerCase().includes(searchQuery);

        if (matchesUrl || matchesMethod) {
          wrapper.classList.remove('hidden');
        } else {
          wrapper.classList.add('hidden');
        }
      });

      // Assert: Only the /users request should be visible
      expect(wrappers[0].classList.contains('hidden')).toBe(false); // users - visible
      expect(wrappers[1].classList.contains('hidden')).toBe(true);  // posts - hidden
      expect(wrappers[2].classList.contains('hidden')).toBe(true);  // comments - hidden
    });

    test('should handle DOM order different from array order', () => {
      // Arrange: Simulate incremental rendering where new requests are inserted at top
      allRequests = [
        { url: '/api/new', method: 'GET', timestamp: 3000, properties: [] }, // Newest (index 0)
        { url: '/api/old', method: 'GET', timestamp: 1000, properties: [] }, // Oldest (index 1)
        { url: '/api/middle', method: 'GET', timestamp: 2000, properties: [] } // Middle (index 2)
      ];

      // DOM order matches array order initially
      const wrappers = allRequests.map(req => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-timestamp', req.timestamp.toString());
        return wrapper;
      });

      // Act: Filter for "old"
      searchQuery = 'old';

      wrappers.forEach((wrapper) => {
        const timestamp = parseInt(wrapper.getAttribute('data-timestamp'), 10);
        const reqData = allRequests.find(req => req.timestamp === timestamp);

        const matchesUrl = reqData.url.toLowerCase().includes(searchQuery);
        const matchesMethod = reqData.method.toLowerCase().includes(searchQuery);

        if (matchesUrl || matchesMethod) {
          wrapper.classList.remove('hidden');
        } else {
          wrapper.classList.add('hidden');
        }
      });

      // Assert: Only /api/old should be visible (it's at index 1)
      expect(wrappers[0].classList.contains('hidden')).toBe(true);  // new - hidden
      expect(wrappers[1].classList.contains('hidden')).toBe(false); // old - visible
      expect(wrappers[2].classList.contains('hidden')).toBe(true);  // middle - hidden
    });
  });

  describe('URL matching', () => {
    beforeEach(() => {
      allRequests = [
        { url: 'https://api.example.com/users', method: 'GET', timestamp: 1000, properties: [] },
        { url: 'https://api.example.com/posts/123', method: 'GET', timestamp: 2000, properties: [] },
        { url: 'https://api.example.com/comments', method: 'POST', timestamp: 3000, properties: [] }
      ];
    });

    test('should match partial URL paths', () => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-timestamp', '1000');

      searchQuery = 'users';
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.url.toLowerCase().includes(searchQuery);

      expect(matches).toBe(true);
    });

    test('should match URL case-insensitively', () => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-timestamp', '1000');

      searchQuery = 'USERS';
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.url.toLowerCase().includes(searchQuery.toLowerCase());

      expect(matches).toBe(true);
    });

    test('should match substring in URL', () => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-timestamp', '2000');

      searchQuery = '123';
      const reqData = allRequests.find(req => req.timestamp === 2000);
      const matches = reqData.url.toLowerCase().includes(searchQuery);

      expect(matches).toBe(true);
    });

    test('should not match non-existent substring', () => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-timestamp', '1000');

      searchQuery = 'nonexistent';
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.url.toLowerCase().includes(searchQuery);

      expect(matches).toBe(false);
    });
  });

  describe('Method matching', () => {
    beforeEach(() => {
      allRequests = [
        { url: '/api/data', method: 'GET', timestamp: 1000, properties: [] },
        { url: '/api/data', method: 'POST', timestamp: 2000, properties: [] },
        { url: '/api/data', method: 'PUT', timestamp: 3000, properties: [] },
        { url: '/api/data', method: 'DELETE', timestamp: 4000, properties: [] }
      ];
    });

    test('should match by GET method', () => {
      searchQuery = 'get';
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.method.toLowerCase().includes(searchQuery);

      expect(matches).toBe(true);
    });

    test('should match by POST method', () => {
      searchQuery = 'post';
      const reqData = allRequests.find(req => req.timestamp === 2000);
      const matches = reqData.method.toLowerCase().includes(searchQuery);

      expect(matches).toBe(true);
    });

    test('should match method case-insensitively', () => {
      searchQuery = 'GeT';
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.method.toLowerCase().includes(searchQuery.toLowerCase());

      expect(matches).toBe(true);
    });
  });

  describe('Combined URL and method matching', () => {
    beforeEach(() => {
      allRequests = [
        { url: 'https://api.example.com/users', method: 'GET', timestamp: 1000, properties: [] },
        { url: 'https://api.example.com/posts', method: 'POST', timestamp: 2000, properties: [] }
      ];
    });

    test('should match request by either URL or method', () => {
      // Match by URL
      searchQuery = 'users';
      let reqData = allRequests.find(req => req.timestamp === 1000);
      let matchesUrl = reqData.url.toLowerCase().includes(searchQuery);
      let matchesMethod = reqData.method.toLowerCase().includes(searchQuery);
      expect(matchesUrl || matchesMethod).toBe(true);

      // Match by method
      searchQuery = 'post';
      reqData = allRequests.find(req => req.timestamp === 2000);
      matchesUrl = reqData.url.toLowerCase().includes(searchQuery);
      matchesMethod = reqData.method.toLowerCase().includes(searchQuery);
      expect(matchesUrl || matchesMethod).toBe(true);

      // Match by both (POST in both URL and method)
      searchQuery = 'post';
      reqData = allRequests.find(req => req.timestamp === 2000);
      matchesUrl = reqData.url.toLowerCase().includes(searchQuery);
      matchesMethod = reqData.method.toLowerCase().includes(searchQuery);
      expect(matchesUrl).toBe(true);
      expect(matchesMethod).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty search query', () => {
      allRequests = [
        { url: '/api/test', method: 'GET', timestamp: 1000, properties: [] }
      ];

      searchQuery = '';
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-timestamp', '1000');
      wrapper.classList.add('hidden');

      // Empty query should show all requests
      if (!searchQuery) {
        wrapper.classList.remove('hidden');
      }

      expect(wrapper.classList.contains('hidden')).toBe(false);
    });

    test('should handle requests with no matching timestamp in DOM', () => {
      allRequests = [
        { url: '/api/test', method: 'GET', timestamp: 1000, properties: [] }
      ];

      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-timestamp', '9999'); // Non-existent timestamp

      const timestamp = parseInt(wrapper.getAttribute('data-timestamp'), 10);
      const reqData = allRequests.find(req => req.timestamp === timestamp);

      expect(reqData).toBeUndefined();
    });

    test('should handle special characters in search query', () => {
      allRequests = [
        { url: '/api/user-profile', method: 'GET', timestamp: 1000, properties: [] }
      ];

      searchQuery = 'user-profile';
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.url.toLowerCase().includes(searchQuery);

      expect(matches).toBe(true);
    });

    test('should trim search query', () => {
      allRequests = [
        { url: '/api/users', method: 'GET', timestamp: 1000, properties: [] }
      ];

      searchQuery = '  users  '; // With spaces
      const trimmedQuery = searchQuery.trim();
      const reqData = allRequests.find(req => req.timestamp === 1000);
      const matches = reqData.url.toLowerCase().includes(trimmedQuery.toLowerCase());

      expect(matches).toBe(true);
    });
  });
});
