/**
 * Radix Sort Algorithm — Tests
 */
var RadixSortAlgorithm =
  typeof require !== "undefined"
    ? require("./radix-sort-algorithm.js")
    : globalThis.RadixSortAlgorithm;

describe("radix sort algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function referenceSort(arr) {
    return arr.slice().sort(function (a, b) {
      return a - b;
    });
  }

  it("sorts numbers and records expected step metadata", function () {
    // Arrange / Act / Assert (grouped by scenario below)

  // --- Correctness ---
  var r1 = RadixSortAlgorithm.sort([170, 45, 75, 90, 802, 24, 2, 66]);
  assert(
    arraysEqual(r1.sortedArray, [2, 24, 45, 66, 75, 90, 170, 802]),
    "sorts mixed multi-digit values",
  );

  var r2 = RadixSortAlgorithm.sort([]);
  assert(arraysEqual(r2.sortedArray, []), "empty array returns empty");

  var r3 = RadixSortAlgorithm.sort([42]);
  assert(arraysEqual(r3.sortedArray, [42]), "single element returns same");

  var r4 = RadixSortAlgorithm.sort([7, 7, 7, 7]);
  assert(arraysEqual(r4.sortedArray, [7, 7, 7, 7]), "all duplicates unchanged");

  var r5 = RadixSortAlgorithm.sort([1, 2, 3, 4, 5]);
  assert(
    arraysEqual(r5.sortedArray, [1, 2, 3, 4, 5]),
    "already sorted unchanged",
  );

  var r6 = RadixSortAlgorithm.sort([5, 4, 3, 2, 1]);
  assert(
    arraysEqual(r6.sortedArray, [1, 2, 3, 4, 5]),
    "reverse sorted correctly sorted",
  );

  var r7 = RadixSortAlgorithm.sort([0, 100, 0, 50, 0]);
  assert(
    arraysEqual(r7.sortedArray, [0, 0, 0, 50, 100]),
    "handles zero values",
  );

  // Large array (30 elements)
  var big = [];
  for (var i = 0; i < 30; i++) big.push(Math.floor(Math.random() * 1000));
  var r8 = RadixSortAlgorithm.sort(big);
  assert(
    arraysEqual(r8.sortedArray, referenceSort(big)),
    "30-element array matches reference sort",
  );

  // Single-digit values
  var r9 = RadixSortAlgorithm.sort([9, 1, 5, 3, 7]);
  assert(
    arraysEqual(r9.sortedArray, [1, 3, 5, 7, 9]),
    "single-digit values sorted correctly",
  );

  // Multi-digit with varying lengths
  var r10 = RadixSortAlgorithm.sort([1, 10, 100, 1000]);
  assert(
    arraysEqual(r10.sortedArray, [1, 10, 100, 1000]),
    "varying digit lengths sorted correctly",
  );

  // --- Does not mutate input ---
  var orig = [3, 1, 4, 1, 5];
  var copy = orig.slice();
  RadixSortAlgorithm.sort(orig);
  assert(arraysEqual(orig, copy), "does not mutate input array");

  // --- maxDigits correctness ---
  var r11 = RadixSortAlgorithm.sort([999, 1, 50]);
  assert(r11.maxDigits === 3, "maxDigits is 3 for max value 999");

  var r12 = RadixSortAlgorithm.sort([5]);
  assert(r12.maxDigits === 1, "maxDigits is 1 for single-digit values");

  var rEmpty = RadixSortAlgorithm.sort([]);
  assert(rEmpty.maxDigits === 0, "maxDigits is 0 for empty array");

  // --- Step structure ---
  var r13 = RadixSortAlgorithm.sort([170, 45, 2]);
  assert(Array.isArray(r13.steps), "steps is an array");
  assert(r13.steps.length > 0, "steps non-empty for non-empty input");

  // Check phases present
  var phases = {};
  r13.steps.forEach(function (s) {
    phases[s.phase] = true;
  });
  assert(phases.extract === true, "steps include extract phase");
  assert(phases.collect === true, "steps include collect phase");

  // Step metadata
  var s0 = r13.steps[0];
  assert(Array.isArray(s0.arr), "step has arr array");
  assert(Array.isArray(s0.buckets), "step has buckets array");
  assert(
    typeof s0.digitPosition === "number",
    "step has numeric digitPosition",
  );
  assert(typeof s0.highlightIdx === "number", "step has numeric highlightIdx");
  assert(typeof s0.explanation === "string", "step has string explanation");

  // --- Digit positions increase across rounds ---
  var digitPositions = [];
  r13.steps.forEach(function (s) {
    if (digitPositions.indexOf(s.digitPosition) === -1) {
      digitPositions.push(s.digitPosition);
    }
  });
  var positionsSorted = true;
  for (var d = 1; d < digitPositions.length; d++) {
    if (digitPositions[d] < digitPositions[d - 1]) {
      positionsSorted = false;
      break;
    }
  }
  assert(positionsSorted, "digit positions increase across rounds");

  // --- Final step has sorted array ---
  var lastStep = r13.steps[r13.steps.length - 1];
  assert(
    arraysEqual(lastStep.arr, r13.sortedArray),
    "final step arr matches sortedArray",
  );

  // --- Empty array produces zero steps ---
  assert(rEmpty.steps.length === 0, "empty input produces zero steps");

  // --- Two element arrays ---
  var r14 = RadixSortAlgorithm.sort([20, 10]);
  assert(arraysEqual(r14.sortedArray, [10, 20]), "two-element reverse sorted");

    var r15 = RadixSortAlgorithm.sort([10, 20]);
    assert(arraysEqual(r15.sortedArray, [10, 20]), "two-element already sorted");
  });
});
