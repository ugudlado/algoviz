/**
 * Sliding Window Algorithm
 *
 * Pure functions — no DOM dependency.
 * Provides two classic sliding window algorithms:
 *   1. maxSumFixedWindow — maximum sum of any subarray of size k
 *   2. longestUniqueSubstring — longest substring with all unique characters
 */
var SlidingWindowAlgorithm = (() => {
  "use strict";

  var MAX_ARRAY_SIZE = 20;
  var MAX_STRING_LENGTH = 30;

  /**
   * Find the maximum sum subarray of fixed size k using sliding window.
   *
   * @param {number[]} arr - Input array of numbers
   * @param {number} k - Window size
   * @returns {{
   *   maxSum: number,
   *   windowStart: number,
   *   steps: Array<{left: number, right: number, sum: number, isMax: boolean}>
   * }}
   */
  function maxSumFixedWindow(arr, k) {
    var steps = [];

    if (!arr || arr.length === 0 || k <= 0 || k > arr.length) {
      return { maxSum: 0, windowStart: -1, steps: steps };
    }

    // Build initial window sum
    var windowSum = 0;
    for (var i = 0; i < k; i++) {
      windowSum += arr[i];
    }

    var maxSum = windowSum;
    var maxWindowStart = 0;

    steps.push({
      left: 0,
      right: k - 1,
      sum: windowSum,
      isMax: true,
    });

    // Slide the window
    for (var start = 1; start <= arr.length - k; start++) {
      windowSum = windowSum - arr[start - 1] + arr[start + k - 1];
      var isNewMax = windowSum > maxSum;
      if (isNewMax) {
        maxSum = windowSum;
        maxWindowStart = start;
      }
      // Update isMax on previous steps that are no longer max
      if (isNewMax) {
        for (var s = 0; s < steps.length; s++) {
          steps[s].isMax = false;
        }
      }
      steps.push({
        left: start,
        right: start + k - 1,
        sum: windowSum,
        isMax: windowSum === maxSum,
      });
    }

    // Final pass: mark only the max window(s)
    for (var j = 0; j < steps.length; j++) {
      steps[j].isMax = steps[j].sum === maxSum;
    }

    return { maxSum: maxSum, windowStart: maxWindowStart, steps: steps };
  }

  /**
   * Find the longest substring with all unique characters using sliding window.
   *
   * @param {string} str - Input string
   * @returns {{
   *   maxLen: number,
   *   substring: string,
   *   steps: Array<{
   *     left: number,
   *     right: number,
   *     window: string,
   *     charFreq: Object,
   *     action: string,
   *     reason: string
   *   }>
   * }}
   */
  function longestUniqueSubstring(str) {
    var steps = [];

    if (!str || str.length === 0) {
      return { maxLen: 0, substring: "", steps: steps };
    }

    var left = 0;
    var right = 0;
    var charFreq = {};
    var maxLen = 0;
    var maxStart = 0;

    while (right < str.length) {
      var ch = str[right];

      if (!charFreq[ch]) {
        charFreq[ch] = 0;
      }
      charFreq[ch]++;

      var action;
      var reason;

      if (charFreq[ch] === 1) {
        // Character is unique in window — expand
        action = "expand";
        reason = "'" + ch + "' is new in window";
      } else {
        // Duplicate found — shrink from left until duplicate is removed
        action = "shrink";
        reason = "'" + ch + "' already in window, shrink from left";

        steps.push({
          left: left,
          right: right,
          window: str.slice(left, right + 1),
          charFreq: copyFreq(charFreq),
          action: action,
          reason: reason,
        });

        while (charFreq[ch] > 1) {
          charFreq[str[left]]--;
          left++;
        }

        // Add shrink-done step
        steps.push({
          left: left,
          right: right,
          window: str.slice(left, right + 1),
          charFreq: copyFreq(charFreq),
          action: "shrink",
          reason: "removed duplicate, window is now unique",
        });

        var currentLen = right - left + 1;
        if (currentLen > maxLen) {
          maxLen = currentLen;
          maxStart = left;
        }

        right++;
        continue;
      }

      var winLen = right - left + 1;
      if (winLen > maxLen) {
        maxLen = winLen;
        maxStart = left;
      }

      steps.push({
        left: left,
        right: right,
        window: str.slice(left, right + 1),
        charFreq: copyFreq(charFreq),
        action: action,
        reason: reason,
      });

      right++;
    }

    return {
      maxLen: maxLen,
      substring: str.slice(maxStart, maxStart + maxLen),
      steps: steps,
    };
  }

  function copyFreq(freq) {
    var copy = {};
    var keys = Object.keys(freq);
    for (var i = 0; i < keys.length; i++) {
      if (freq[keys[i]] > 0) {
        copy[keys[i]] = freq[keys[i]];
      }
    }
    return copy;
  }

  return {
    maxSumFixedWindow: maxSumFixedWindow,
    longestUniqueSubstring: longestUniqueSubstring,
    MAX_ARRAY_SIZE: MAX_ARRAY_SIZE,
    MAX_STRING_LENGTH: MAX_STRING_LENGTH,
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = SlidingWindowAlgorithm;
}
