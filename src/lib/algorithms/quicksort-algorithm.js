/**
 * Quick Sort Algorithm
 *
 * Pure functions — no DOM dependency.
 * Supports Lomuto and Hoare partition schemes with four pivot strategies:
 * 'first', 'last', 'random', 'median-of-3'.
 * Records each step for visualization replay.
 */
var QuickSortAlgorithm = (function () {
  "use strict";

  /**
   * Select pivot index within [low, high] using the given strategy.
   *
   * @param {number[]} arr
   * @param {number} low
   * @param {number} high
   * @param {string} pivotStrategy  'first' | 'last' | 'random' | 'median-of-3'
   * @returns {number} pivot index
   */
  function selectPivotIndex(arr, low, high, pivotStrategy) {
    if (low === high) return low;

    switch (pivotStrategy) {
      case "first":
        return low;

      case "last":
        return high;

      case "random":
        return low + Math.floor(Math.random() * (high - low + 1));

      case "median-of-3": {
        if (high - low < 2) {
          // Fewer than 3 elements: fall back to middle
          return Math.floor((low + high) / 2);
        }
        var mid = Math.floor((low + high) / 2);
        // Sort low, mid, high indices by their values and return the median
        var a = low;
        var b = mid;
        var c = high;
        if (arr[a] > arr[b]) {
          var t = a;
          a = b;
          b = t;
        }
        if (arr[b] > arr[c]) {
          var t = b;
          b = c;
          c = t;
        }
        if (arr[a] > arr[b]) {
          var t = a;
          a = b;
          b = t;
        }
        // b is now the median index
        return b;
      }

      default:
        return high; // default to last
    }
  }

  /**
   * Lomuto partition scheme.
   * Partitions arr[low..high] around a pivot, recording steps.
   *
   * @param {number[]} arr      - Array to partition (mutated in place)
   * @param {number} low        - Left boundary (inclusive)
   * @param {number} high       - Right boundary (inclusive)
   * @param {string} pivotStrategy
   * @param {Object} state      - Shared { comparisons, swaps }
   * @returns {{ pivotIndex: number, steps: Array<Object> }}
   */
  function lomutoPartition(arr, low, high, pivotStrategy, state) {
    var steps = [];
    var sharedState = state || { comparisons: 0, swaps: 0 };

    // Select pivot and move it to the end
    var pivotIdx = selectPivotIndex(arr, low, high, pivotStrategy);
    if (pivotIdx !== high) {
      var tmp = arr[pivotIdx];
      arr[pivotIdx] = arr[high];
      arr[high] = tmp;
      sharedState.swaps++;
      steps.push({
        type: "swap",
        i: pivotIdx,
        j: high,
        array: arr.slice(),
        comparisons: sharedState.comparisons,
        swaps: sharedState.swaps,
        explanation:
          "Move pivot " +
          arr[high] +
          " to end (swap positions " +
          pivotIdx +
          " and " +
          high +
          ")",
      });
    }

    var pivotValue = arr[high];

    steps.push({
      type: "pivot-select",
      pivotIndex: high,
      pivotValue: pivotValue,
      low: low,
      high: high,
      array: arr.slice(),
      comparisons: sharedState.comparisons,
      swaps: sharedState.swaps,
      explanation:
        "Pivot selected: " +
        pivotValue +
        " at index " +
        high +
        " (strategy: " +
        pivotStrategy +
        ", range [" +
        low +
        ".." +
        high +
        "])",
    });

    var i = low - 1;

    for (var j = low; j < high; j++) {
      sharedState.comparisons++;
      steps.push({
        type: "compare",
        i: i,
        j: j,
        pivotIndex: high,
        pivotValue: pivotValue,
        array: arr.slice(),
        comparisons: sharedState.comparisons,
        swaps: sharedState.swaps,
        explanation:
          "Compare arr[" + j + "]=" + arr[j] + " with pivot " + pivotValue,
      });

      if (arr[j] <= pivotValue) {
        i++;
        if (i !== j) {
          var tmp2 = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp2;
          sharedState.swaps++;
          steps.push({
            type: "swap",
            i: i,
            j: j,
            array: arr.slice(),
            comparisons: sharedState.comparisons,
            swaps: sharedState.swaps,
            explanation:
              "Swap arr[" + i + "]=" + arr[i] + " and arr[" + j + "]=" + arr[j],
          });
        }
      }
    }

    // Place pivot in final position
    var finalIdx = i + 1;
    if (finalIdx !== high) {
      var tmp3 = arr[finalIdx];
      arr[finalIdx] = arr[high];
      arr[high] = tmp3;
      sharedState.swaps++;
      steps.push({
        type: "swap",
        i: finalIdx,
        j: high,
        array: arr.slice(),
        comparisons: sharedState.comparisons,
        swaps: sharedState.swaps,
        explanation:
          "Place pivot " + arr[finalIdx] + " in final position " + finalIdx,
      });
    }

    steps.push({
      type: "partition-done",
      pivotFinalIndex: finalIdx,
      low: low,
      high: high,
      array: arr.slice(),
      comparisons: sharedState.comparisons,
      swaps: sharedState.swaps,
      explanation:
        "Partition done: pivot " +
        arr[finalIdx] +
        " is in final position " +
        finalIdx,
    });

    return { pivotIndex: finalIdx, steps: steps };
  }

  /**
   * Hoare partition scheme.
   * Partitions arr[low..high] around a pivot, recording steps.
   * Returns a pivot index such that all elements to the left are <= pivot
   * and all elements to the right are >= pivot.
   *
   * @param {number[]} arr
   * @param {number} low
   * @param {number} high
   * @param {string} pivotStrategy
   * @param {Object} state      - Shared { comparisons, swaps }
   * @returns {{ pivotIndex: number, steps: Array<Object> }}
   */
  function hoarePartition(arr, low, high, pivotStrategy, state) {
    var steps = [];
    var sharedState = state || { comparisons: 0, swaps: 0 };

    var pivotIdx = selectPivotIndex(arr, low, high, pivotStrategy);
    var pivotValue = arr[pivotIdx];

    // Move pivot to beginning for simplicity, then restore
    if (pivotIdx !== low) {
      var tmp = arr[pivotIdx];
      arr[pivotIdx] = arr[low];
      arr[low] = tmp;
      sharedState.swaps++;
      steps.push({
        type: "swap",
        i: pivotIdx,
        j: low,
        array: arr.slice(),
        comparisons: sharedState.comparisons,
        swaps: sharedState.swaps,
        explanation:
          "Move pivot " +
          pivotValue +
          " to front (swap positions " +
          pivotIdx +
          " and " +
          low +
          ")",
      });
    }

    steps.push({
      type: "pivot-select",
      pivotIndex: low,
      pivotValue: pivotValue,
      low: low,
      high: high,
      array: arr.slice(),
      comparisons: sharedState.comparisons,
      swaps: sharedState.swaps,
      explanation:
        "Pivot selected: " +
        pivotValue +
        " (strategy: " +
        pivotStrategy +
        ", range [" +
        low +
        ".." +
        high +
        "])",
    });

    var i = low + 1;
    var j = high;

    while (i <= j) {
      // Advance i while arr[i] <= pivot
      while (i <= high && arr[i] <= pivotValue) {
        sharedState.comparisons++;
        steps.push({
          type: "compare",
          i: i,
          j: j,
          pivotIndex: low,
          pivotValue: pivotValue,
          array: arr.slice(),
          comparisons: sharedState.comparisons,
          swaps: sharedState.swaps,
          explanation:
            "Left scan: arr[" + i + "]=" + arr[i] + " <= pivot " + pivotValue,
        });
        i++;
      }

      // Advance j while arr[j] > pivot
      while (j >= low + 1 && arr[j] > pivotValue) {
        sharedState.comparisons++;
        steps.push({
          type: "compare",
          i: i,
          j: j,
          pivotIndex: low,
          pivotValue: pivotValue,
          array: arr.slice(),
          comparisons: sharedState.comparisons,
          swaps: sharedState.swaps,
          explanation:
            "Right scan: arr[" + j + "]=" + arr[j] + " > pivot " + pivotValue,
        });
        j--;
      }

      if (i < j) {
        var tmp2 = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp2;
        sharedState.swaps++;
        steps.push({
          type: "swap",
          i: i,
          j: j,
          array: arr.slice(),
          comparisons: sharedState.comparisons,
          swaps: sharedState.swaps,
          explanation:
            "Swap arr[" + i + "]=" + arr[i] + " and arr[" + j + "]=" + arr[j],
        });
        i++;
        j--;
      } else {
        break;
      }
    }

    // Place pivot in final position: swap arr[low] with arr[j]
    var finalIdx = j;
    if (finalIdx !== low) {
      var tmp3 = arr[low];
      arr[low] = arr[finalIdx];
      arr[finalIdx] = tmp3;
      sharedState.swaps++;
      steps.push({
        type: "swap",
        i: low,
        j: finalIdx,
        array: arr.slice(),
        comparisons: sharedState.comparisons,
        swaps: sharedState.swaps,
        explanation:
          "Place pivot " + arr[finalIdx] + " in final position " + finalIdx,
      });
    }

    steps.push({
      type: "partition-done",
      pivotFinalIndex: finalIdx,
      low: low,
      high: high,
      array: arr.slice(),
      comparisons: sharedState.comparisons,
      swaps: sharedState.swaps,
      explanation:
        "Partition done: pivot " +
        arr[finalIdx] +
        " is in final position " +
        finalIdx,
    });

    return { pivotIndex: finalIdx, steps: steps };
  }

  /**
   * Sort an array using quicksort, recording each step.
   *
   * @param {number[]} inputArr
   * @param {string} partitionScheme  'lomuto' | 'hoare'
   * @param {string} pivotStrategy    'first' | 'last' | 'random' | 'median-of-3'
   * @returns {{ sortedArray: number[], steps: Array<Object> }}
   */
  function quickSort(inputArr, partitionScheme, pivotStrategy) {
    var arr = inputArr.slice(); // defensive copy — never mutate input
    var steps = [];
    var state = { comparisons: 0, swaps: 0 };

    var scheme = partitionScheme || "lomuto";
    var strategy = pivotStrategy || "last";

    var partitionFn = scheme === "hoare" ? hoarePartition : lomutoPartition;

    if (arr.length <= 1) {
      steps.push({
        type: "complete",
        array: arr.slice(),
        comparisons: 0,
        swaps: 0,
        explanation:
          "Sort complete! Array has " +
          arr.length +
          " element(s) — already sorted.",
      });
      return { sortedArray: arr.slice(), steps: steps };
    }

    function qsort(low, high) {
      if (low >= high) return;

      var result = partitionFn(arr, low, high, strategy, state);
      // Append partition steps to global steps array
      for (var k = 0; k < result.steps.length; k++) {
        steps.push(result.steps[k]);
      }

      var p = result.pivotIndex;

      qsort(low, p - 1);
      qsort(p + 1, high);
    }

    qsort(0, arr.length - 1);

    steps.push({
      type: "complete",
      array: arr.slice(),
      comparisons: state.comparisons,
      swaps: state.swaps,
      explanation:
        "Sort complete! " +
        state.comparisons +
        " comparisons, " +
        state.swaps +
        " swaps.",
    });

    return { sortedArray: arr.slice(), steps: steps };
  }

  return {
    quickSort: quickSort,
    lomutoPartition: function (arr, low, high, pivotStrategy) {
      return lomutoPartition(arr, low, high, pivotStrategy, {
        comparisons: 0,
        swaps: 0,
      });
    },
    hoarePartition: function (arr, low, high, pivotStrategy) {
      return hoarePartition(arr, low, high, pivotStrategy, {
        comparisons: 0,
        swaps: 0,
      });
    },
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = QuickSortAlgorithm;
}

