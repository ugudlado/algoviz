/**
 * KMP (Knuth-Morris-Pratt) String Search Algorithm
 *
 * Pure functions — no DOM dependency.
 * Implements two phases:
 *   1. buildFailureFunction — constructs the prefix table (failure function)
 *      that tells us how many characters of the pattern we can skip on mismatch.
 *   2. kmpSearch — searches text for pattern using the failure function,
 *      recording each comparison step for visualization.
 *   3. naiveSearch — brute-force O(nm) search for side-by-side comparison.
 *
 * Real-world use: grep, text-editor find, DNA sequence matching.
 */
var KMPAlgorithm = (function () {
  "use strict";

  /**
   * Build the KMP failure function (partial match / prefix table) for a pattern.
   *
   * failure[i] = length of the longest proper prefix of pattern[0..i]
   *              that is also a suffix.
   *
   * @param {string} pattern
   * @returns {number[]} failure function array, same length as pattern
   */
  function buildFailureFunction(pattern) {
    var m = pattern.length;
    if (m === 0) return [];

    var failure = [];
    var i;
    for (i = 0; i < m; i++) {
      failure[i] = 0;
    }

    // failure[0] is always 0 (no proper prefix for single char)
    var len = 0; // length of previous longest prefix suffix
    var k = 1;

    while (k < m) {
      if (pattern[k] === pattern[len]) {
        len++;
        failure[k] = len;
        k++;
      } else {
        if (len !== 0) {
          // Fall back using the failure function itself
          len = failure[len - 1];
          // Do not increment k — retry comparison at new len
        } else {
          failure[k] = 0;
          k++;
        }
      }
    }

    return failure;
  }

  /**
   * Search text for all occurrences of pattern using KMP algorithm.
   * Records each character comparison as a step for visualization.
   *
   * @param {string} text
   * @param {string} pattern
   * @returns {{
   *   matches: number[],         -- starting indices of all matches
   *   steps: Array<{
   *     textIdx: number,          -- current position in text
   *     patternIdx: number,       -- current position in pattern
   *     isMatch: boolean,         -- did this comparison match?
   *     isFound: boolean,         -- did we just complete a full match?
   *     shift: boolean,           -- did we use failure function to shift?
   *     shiftFrom: number,        -- patternIdx before shift (if shift)
   *     shiftTo: number,          -- patternIdx after shift (if shift)
   *     explanation: string
   *   }>,
   *   failureFunction: number[], -- the precomputed failure table
   *   stepCount: number          -- total comparisons made
   * }}
   */
  function kmpSearch(text, pattern) {
    var n = text.length;
    var m = pattern.length;
    var matches = [];
    var steps = [];

    if (m === 0 || n === 0) {
      return {
        matches: matches,
        steps: steps,
        failureFunction: m > 0 ? buildFailureFunction(pattern) : [],
        stepCount: 0,
      };
    }

    var failure = buildFailureFunction(pattern);
    var i = 0; // index into text
    var j = 0; // index into pattern
    var stepCount = 0;

    while (i < n) {
      stepCount++;

      if (text[i] === pattern[j]) {
        // Characters match
        var isFound = j === m - 1;
        var explanation;

        if (isFound) {
          explanation =
            "text[" +
            i +
            "]='" +
            text[i] +
            "' == pattern[" +
            j +
            "]='" +
            pattern[j] +
            "' — MATCH! Pattern found at index " +
            (i - m + 1) +
            ".";
        } else {
          explanation =
            "text[" +
            i +
            "]='" +
            text[i] +
            "' == pattern[" +
            j +
            "]='" +
            pattern[j] +
            "' — match, advance both pointers.";
        }

        steps.push({
          textIdx: i,
          patternIdx: j,
          isMatch: true,
          isFound: isFound,
          shift: false,
          shiftFrom: j,
          shiftTo: j,
          explanation: explanation,
        });

        if (isFound) {
          matches.push(i - m + 1);
          // Use failure function to continue searching (handles overlaps)
          // Also advance i since this character was matched
          j = failure[j];
          i++;
        } else {
          i++;
          j++;
        }
      } else {
        // Mismatch
        if (j === 0) {
          // Pattern index already at 0 — just advance text
          steps.push({
            textIdx: i,
            patternIdx: j,
            isMatch: false,
            isFound: false,
            shift: false,
            shiftFrom: 0,
            shiftTo: 0,
            explanation:
              "text[" +
              i +
              "]='" +
              text[i] +
              "' != pattern[0]='" +
              pattern[0] +
              "' — mismatch at start, advance text pointer.",
          });
          i++;
        } else {
          // Use failure function to shift pattern
          var prevJ = j;
          j = failure[j - 1];
          steps.push({
            textIdx: i,
            patternIdx: prevJ,
            isMatch: false,
            isFound: false,
            shift: true,
            shiftFrom: prevJ,
            shiftTo: j,
            explanation:
              "text[" +
              i +
              "]='" +
              text[i] +
              "' != pattern[" +
              prevJ +
              "]='" +
              pattern[prevJ] +
              "' — mismatch, use failure[" +
              (prevJ - 1) +
              "]=" +
              j +
              " to shift pattern (skip " +
              (prevJ - j) +
              " chars).",
          });
          // Do not advance i — retry at new j
        }
      }
    }

    return {
      matches: matches,
      steps: steps,
      failureFunction: failure,
      stepCount: stepCount,
    };
  }

  /**
   * Naive (brute-force) O(nm) string search for comparison.
   *
   * @param {string} text
   * @param {string} pattern
   * @returns {{
   *   matches: number[],
   *   stepCount: number
   * }}
   */
  function naiveSearch(text, pattern) {
    var n = text.length;
    var m = pattern.length;
    var matches = [];
    var stepCount = 0;

    if (m === 0 || n === 0) {
      return { matches: matches, stepCount: 0 };
    }

    var i, j;
    for (i = 0; i <= n - m; i++) {
      for (j = 0; j < m; j++) {
        stepCount++;
        if (text[i + j] !== pattern[j]) {
          break;
        }
      }
      if (j === m) {
        matches.push(i);
      }
    }

    return { matches: matches, stepCount: stepCount };
  }

  return {
    buildFailureFunction: buildFailureFunction,
    kmpSearch: kmpSearch,
    naiveSearch: naiveSearch,
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = KMPAlgorithm;
}
