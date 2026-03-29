/**
 * Radix Sort Algorithm (LSD)
 *
 * Pure functions — no DOM dependency.
 * Least-significant-digit radix sort using base-10 digits.
 * Records each step for visualization.
 */
var RadixSortAlgorithm = (() => {
  "use strict";

  /**
   * Get the digit at a given position (0 = ones, 1 = tens, etc.)
   * @param {number} num
   * @param {number} pos
   * @returns {number}
   */
  function getDigit(num, pos) {
    return Math.floor(Math.abs(num) / Math.pow(10, pos)) % 10;
  }

  /**
   * Count the number of digits in the largest number.
   * @param {number[]} arr
   * @returns {number}
   */
  function digitCount(arr) {
    if (arr.length === 0) return 0;
    var maxVal = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] > maxVal) maxVal = arr[i];
    }
    if (maxVal === 0) return 1;
    return Math.floor(Math.log10(maxVal)) + 1;
  }

  /**
   * Create empty buckets (0-9).
   * @returns {Array<number[]>}
   */
  function createBuckets() {
    var buckets = [];
    for (var i = 0; i < 10; i++) {
      buckets.push([]);
    }
    return buckets;
  }

  /**
   * Deep copy buckets for step snapshots.
   * @param {Array<number[]>} buckets
   * @returns {Array<number[]>}
   */
  function copyBuckets(buckets) {
    var copy = [];
    for (var i = 0; i < buckets.length; i++) {
      copy.push(buckets[i].slice());
    }
    return copy;
  }

  /**
   * Sort an array of non-negative integers using LSD radix sort.
   *
   * @param {number[]} inputArr
   * @returns {{
   *   steps: Array<{phase: string, arr: number[], buckets: Array<number[]>, digitPosition: number, highlightIdx: number, highlightBucket: number, explanation: string}>,
   *   sortedArray: number[],
   *   maxDigits: number
   * }}
   */
  function sort(inputArr) {
    var arr = inputArr.slice();
    var n = arr.length;
    var steps = [];

    if (n === 0) {
      return { steps: steps, sortedArray: [], maxDigits: 0 };
    }

    var maxDig = digitCount(arr);

    for (var pos = 0; pos < maxDig; pos++) {
      var buckets = createBuckets();

      // --- Extract phase: distribute elements into buckets ---
      for (var i = 0; i < n; i++) {
        var digit = getDigit(arr[i], pos);
        buckets[digit].push(arr[i]);
        steps.push({
          phase: "extract",
          arr: arr.slice(),
          buckets: copyBuckets(buckets),
          digitPosition: pos,
          highlightIdx: i,
          highlightBucket: digit,
          explanation:
            "Digit " +
            pos +
            " of " +
            arr[i] +
            " is " +
            digit +
            " \u2192 bucket " +
            digit,
        });
      }

      // --- Collect phase: gather from buckets back into array ---
      var idx = 0;
      for (var b = 0; b < 10; b++) {
        for (var j = 0; j < buckets[b].length; j++) {
          arr[idx] = buckets[b][j];
          idx++;
        }
      }

      steps.push({
        phase: "collect",
        arr: arr.slice(),
        buckets: copyBuckets(buckets),
        digitPosition: pos,
        highlightIdx: -1,
        highlightBucket: -1,
        explanation:
          "Collect from buckets after sorting by digit position " +
          pos +
          (pos === 0
            ? " (ones)"
            : pos === 1
              ? " (tens)"
              : pos === 2
                ? " (hundreds)"
                : " (10^" + pos + ")"),
      });
    }

    return { steps: steps, sortedArray: arr.slice(), maxDigits: maxDig };
  }

  return { sort: sort, getDigit: getDigit, digitCount: digitCount };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = RadixSortAlgorithm;
}
