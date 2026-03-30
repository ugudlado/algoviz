/**
 * Bubble Sort Algorithm
 *
 * Pure functions — no DOM dependency.
 * Runs bubble sort with early termination, records each comparison
 * as a step for visualization with swap/comparison counting.
 */
var BubbleSortAlgorithm = (() => {
  "use strict";

  /**
   * Sort an array using bubble sort, recording each step.
   *
   * @param {number[]} inputArr - Array of numbers to sort
   * @returns {{
   *   steps: Array<{arr: number[], comparing: [number, number], swapped: boolean, sortedBoundary: number, comparisons: number, swaps: number, explanation: string, i: number, j: number, codeLine: number}>,
   *   sortedArray: number[]
   * }}
   */
  function sort(inputArr) {
    var arr = inputArr.slice(); // defensive copy
    var n = arr.length;
    var steps = [];
    var comparisons = 0;
    var swaps = 0;

    for (var i = 0; i < n - 1; i++) {
      var swappedThisPass = false;
      var boundary = n - i; // elements at index >= boundary are sorted

      for (var j = 0; j < n - 1 - i; j++) {
        comparisons++;
        var didSwap = false;
        var explanation;

        if (arr[j] > arr[j + 1]) {
          // Swap
          var temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          didSwap = true;
          swappedThisPass = true;
          explanation =
            "Compare index " +
            j +
            " (" +
            arr[j + 1] +
            ") > index " +
            (j + 1) +
            " (" +
            arr[j] +
            ") — SWAP";
        } else {
          explanation =
            "Compare index " +
            j +
            " (" +
            arr[j] +
            ") <= index " +
            (j + 1) +
            " (" +
            arr[j + 1] +
            ") — no swap";
        }

        steps.push({
          arr: arr.slice(),
          comparing: [j, j + 1],
          swapped: didSwap,
          sortedBoundary: boundary,
          comparisons: comparisons,
          swaps: swaps,
          explanation: explanation,
          i: i,
          j: j,
          codeLine: didSwap ? 4 : 3,
        });
      }

      if (!swappedThisPass) {
        // Early termination: array is sorted
        steps.push({
          arr: arr.slice(),
          comparing: [-1, -1],
          swapped: false,
          sortedBoundary: 0,
          comparisons: comparisons,
          swaps: swaps,
          explanation: "No swaps in pass " + (i + 1) + " — array is sorted!",
          i: i,
          j: -1,
          codeLine: 6,
        });
        break;
      }
    }

    // Add a final "done" step showing the fully sorted array
    if (steps.length === 0 || steps[steps.length - 1].comparing[0] !== -1) {
      steps.push({
        arr: arr.slice(),
        comparing: [-1, -1],
        swapped: false,
        sortedBoundary: 0,
        comparisons: comparisons,
        swaps: swaps,
        explanation:
          "Sort complete! " +
          comparisons +
          " comparisons, " +
          swaps +
          " swaps.",
        i: -1,
        j: -1,
        codeLine: 6,
      });
    }

    return { steps: steps, sortedArray: arr.slice() };
  }

  return { sort: sort };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = BubbleSortAlgorithm;
}

export default BubbleSortAlgorithm;
