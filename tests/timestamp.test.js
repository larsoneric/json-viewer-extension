import { describe, test, expect, beforeEach, vi } from 'vitest';

// formatTimestamp function from panel.js
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  // Check if timestamp is from today
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;

  if (isToday) {
    return timeString;
  } else {
    // Include date if not today
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day} ${timeString}`;
  }
}

describe('Timestamp Formatting', () => {
  describe('formatTimestamp', () => {
    beforeEach(() => {
      // Reset Date mock before each test
      vi.restoreAllMocks();
    });

    test('should format today\'s timestamp without date', () => {
      // Create a timestamp for today at 14:30:45
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        14,
        30,
        45
      );

      const result = formatTimestamp(today.getTime());
      expect(result).toBe('14:30:45');
    });

    test('should format yesterday\'s timestamp with date', () => {
      const now = new Date();
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        10,
        15,
        30
      );

      const result = formatTimestamp(yesterday.getTime());

      const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
      const day = yesterday.getDate().toString().padStart(2, '0');
      expect(result).toBe(`${month}/${day} 10:15:30`);
    });

    test('should pad single digit hours with zero', () => {
      const now = new Date();
      const timestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        9, // Single digit hour
        5,
        3
      );

      const result = formatTimestamp(timestamp.getTime());
      expect(result).toBe('09:05:03');
    });

    test('should pad single digit minutes with zero', () => {
      const now = new Date();
      const timestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        14,
        5, // Single digit minute
        30
      );

      const result = formatTimestamp(timestamp.getTime());
      expect(result).toBe('14:05:30');
    });

    test('should pad single digit seconds with zero', () => {
      const now = new Date();
      const timestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        14,
        30,
        5 // Single digit second
      );

      const result = formatTimestamp(timestamp.getTime());
      expect(result).toBe('14:30:05');
    });

    test('should handle midnight (00:00:00)', () => {
      const now = new Date();
      const timestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );

      const result = formatTimestamp(timestamp.getTime());
      expect(result).toBe('00:00:00');
    });

    test('should handle end of day (23:59:59)', () => {
      const now = new Date();
      const timestamp = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      const result = formatTimestamp(timestamp.getTime());
      expect(result).toBe('23:59:59');
    });

    test('should include date for timestamps from different year', () => {
      const now = new Date();
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0
      );

      const result = formatTimestamp(lastYear.getTime());
      const month = (lastYear.getMonth() + 1).toString().padStart(2, '0');
      const day = lastYear.getDate().toString().padStart(2, '0');

      expect(result).toBe(`${month}/${day} 12:00:00`);
    });

    test('should include date for timestamps from different month', () => {
      const now = new Date();
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        15,
        18,
        45,
        20
      );

      const result = formatTimestamp(lastMonth.getTime());
      const month = (lastMonth.getMonth() + 1).toString().padStart(2, '0');

      expect(result).toBe(`${month}/15 18:45:20`);
    });

    test('should format January correctly (month padding)', () => {
      const timestamp = new Date(2025, 0, 15, 10, 30, 45); // January = month 0
      const result = formatTimestamp(timestamp.getTime());

      // Will include date since it's not today
      expect(result).toMatch(/^01\/15 10:30:45$/);
    });

    test('should format December correctly', () => {
      const timestamp = new Date(2025, 11, 25, 10, 30, 45); // December = month 11
      const result = formatTimestamp(timestamp.getTime());

      // Will include date since it's not today
      expect(result).toMatch(/^12\/25 10:30:45$/);
    });

    test('should handle timestamp at start of day (from different day)', () => {
      const now = new Date();
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        0,
        0,
        0
      );

      const result = formatTimestamp(yesterday.getTime());

      const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
      const day = yesterday.getDate().toString().padStart(2, '0');
      expect(result).toBe(`${month}/${day} 00:00:00`);
    });

    test('should handle very old timestamps', () => {
      const oldTimestamp = new Date(2020, 0, 1, 12, 0, 0);
      const result = formatTimestamp(oldTimestamp.getTime());

      expect(result).toBe('01/01 12:00:00');
    });

    test('should handle future timestamps (if clock is wrong)', () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        10,
        0,
        0
      );

      const result = formatTimestamp(tomorrow.getTime());

      const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
      const day = tomorrow.getDate().toString().padStart(2, '0');
      expect(result).toBe(`${month}/${day} 10:00:00`);
    });

    test('should consistently format multiple timestamps from same day', () => {
      const now = new Date();
      const timestamp1 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        10,
        0,
        0
      );
      const timestamp2 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        15,
        30,
        45
      );

      const result1 = formatTimestamp(timestamp1.getTime());
      const result2 = formatTimestamp(timestamp2.getTime());

      // Both should be time-only (no date)
      expect(result1).toBe('10:00:00');
      expect(result2).toBe('15:30:45');
      expect(result1).not.toContain('/');
      expect(result2).not.toContain('/');
    });

    test('should handle Date.now() as input', () => {
      const now = Date.now();
      const result = formatTimestamp(now);

      // Should return time-only format since it's "now" (today)
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });
});
