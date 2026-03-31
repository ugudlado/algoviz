/**
 */

describe("quicksort algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

  const QuickSortAlgorithm =
    require("./quicksort-algorithm.js").default ||
    require("./quicksort-algorithm.js");
  // --- Basic correctness: Lomuto partition ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort([3, 1, 2], "lomuto", "last");
    assertEqual(result.sortedArray, [1, 2, 3], "Lomuto sorted output");
  }, "Lomuto/last: basic sort [3,1,2]");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [5, 4, 3, 2, 1],
      "lomuto",
      "last",
    );
    assertEqual(result.sortedArray, [1, 2, 3, 4, 5], "Lomuto reverse sorted");
  }, "Lomuto/last: reverse sorted");

  // --- Basic correctness: Hoare partition ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort([3, 1, 2], "hoare", "first");
    assertEqual(result.sortedArray, [1, 2, 3], "Hoare sorted output");
  }, "Hoare/first: basic sort [3,1,2]");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [5, 4, 3, 2, 1],
      "hoare",
      "first",
    );
    assertEqual(result.sortedArray, [1, 2, 3, 4, 5], "Hoare reverse sorted");
  }, "Hoare/first: reverse sorted");

  // --- All partition schemes × all pivot strategies produce correct results ---
  const testInput = [8, 3, 5, 1, 9, 2, 7, 4, 6];
  const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      testInput.slice(),
      "lomuto",
      "first",
    );
    assertEqual(result.sortedArray, expected, "Lomuto/first");
  }, "Lomuto/first: 9-element array");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      testInput.slice(),
      "lomuto",
      "random",
    );
    assertEqual(result.sortedArray, expected, "Lomuto/random");
  }, "Lomuto/random: 9-element array");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      testInput.slice(),
      "lomuto",
      "median-of-3",
    );
    assertEqual(result.sortedArray, expected, "Lomuto/median-of-3");
  }, "Lomuto/median-of-3: 9-element array");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      testInput.slice(),
      "hoare",
      "last",
    );
    assertEqual(result.sortedArray, expected, "Hoare/last");
  }, "Hoare/last: 9-element array");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      testInput.slice(),
      "hoare",
      "random",
    );
    assertEqual(result.sortedArray, expected, "Hoare/random");
  }, "Hoare/random: 9-element array");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      testInput.slice(),
      "hoare",
      "median-of-3",
    );
    assertEqual(result.sortedArray, expected, "Hoare/median-of-3");
  }, "Hoare/median-of-3: 9-element array");

  // --- Edge case: empty array ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort([], "lomuto", "last");
    assertEqual(result.sortedArray, [], "Empty array sorted");
    assert(result.steps.length >= 1, "Empty array has at least one step");
  }, "Edge: empty array (Lomuto)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort([], "hoare", "first");
    assertEqual(result.sortedArray, [], "Empty array sorted (Hoare)");
  }, "Edge: empty array (Hoare)");

  // --- Edge case: single element ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort([42], "lomuto", "last");
    assertEqual(result.sortedArray, [42], "Single element");
    assert(result.steps.length >= 1, "Single element has at least one step");
  }, "Edge: single element (Lomuto)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort([42], "hoare", "first");
    assertEqual(result.sortedArray, [42], "Single element (Hoare)");
  }, "Edge: single element (Hoare)");

  // --- Edge case: already sorted ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [1, 2, 3, 4, 5],
      "lomuto",
      "last",
    );
    assertEqual(result.sortedArray, [1, 2, 3, 4, 5], "Already sorted");
  }, "Edge: already sorted (Lomuto/last)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [1, 2, 3, 4, 5],
      "hoare",
      "first",
    );
    assertEqual(result.sortedArray, [1, 2, 3, 4, 5], "Already sorted (Hoare)");
  }, "Edge: already sorted (Hoare/first)");

  // --- Edge case: all duplicates ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [5, 5, 5, 5, 5],
      "lomuto",
      "last",
    );
    assertEqual(result.sortedArray, [5, 5, 5, 5, 5], "All duplicates");
  }, "Edge: all duplicates (Lomuto)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [5, 5, 5, 5, 5],
      "hoare",
      "first",
    );
    assertEqual(result.sortedArray, [5, 5, 5, 5, 5], "All duplicates (Hoare)");
  }, "Edge: all duplicates (Hoare)");

  // --- Edge case: two elements ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort([2, 1], "lomuto", "last");
    assertEqual(result.sortedArray, [1, 2], "Two elements swapped");
  }, "Edge: two elements needing swap (Lomuto)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort([1, 2], "hoare", "first");
    assertEqual(result.sortedArray, [1, 2], "Two elements already sorted");
  }, "Edge: two elements already sorted (Hoare)");

  // --- Edge case: max size (25 elements) ---
  it(() => {
    const input = [];
    for (let i = 25; i >= 1; i--) input.push(i);
    const result = QuickSortAlgorithm.quickSort(input, "lomuto", "median-of-3");
    const expectedLarge = [];
    for (let i = 1; i <= 25; i++) expectedLarge.push(i);
    assertEqual(result.sortedArray, expectedLarge, "Max size sorted");
  }, "Edge: max size 25 elements reversed (Lomuto/median-of-3)");

  it(() => {
    const input = [];
    for (let i = 25; i >= 1; i--) input.push(i);
    const result = QuickSortAlgorithm.quickSort(input, "hoare", "median-of-3");
    const expectedLarge = [];
    for (let i = 1; i <= 25; i++) expectedLarge.push(i);
    assertEqual(result.sortedArray, expectedLarge, "Max size sorted (Hoare)");
  }, "Edge: max size 25 elements reversed (Hoare/median-of-3)");

  // --- Lomuto and Hoare produce same sorted result ---
  it(() => {
    const arr = [7, 2, 9, 4, 1, 6, 3, 8, 5];
    const lomuto = QuickSortAlgorithm.quickSort(arr.slice(), "lomuto", "last");
    const hoare = QuickSortAlgorithm.quickSort(arr.slice(), "hoare", "first");
    assertEqual(lomuto.sortedArray, hoare.sortedArray, "Same sorted result");
    assertEqual(
      lomuto.sortedArray,
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "Correct sorted result",
    );
  }, "Lomuto and Hoare produce same sorted result");

  // --- Input not mutated ---
  it(() => {
    const input = [5, 3, 1, 4, 2];
    QuickSortAlgorithm.quickSort(input, "lomuto", "last");
    assertEqual(input, [5, 3, 1, 4, 2], "Input not mutated");
  }, "Input array is not mutated");

  // --- Step trace: has required fields ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [4, 2, 7, 1, 5],
      "lomuto",
      "last",
    );
    assert(result.steps.length > 0, "Has steps");
    const lastStep = result.steps[result.steps.length - 1];
    assertEqual(lastStep.type, "complete", "Last step type is complete");
    assert(typeof lastStep.comparisons === "number", "Has comparisons");
    assert(typeof lastStep.swaps === "number", "Has swaps");
    assert(typeof lastStep.explanation === "string", "Has explanation");
    assert(Array.isArray(lastStep.array), "Has array");
  }, "Step trace: complete step has required fields");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [4, 2, 7, 1, 5],
      "lomuto",
      "last",
    );
    const pivotSteps = result.steps.filter((s) => s.type === "pivot-select");
    assert(pivotSteps.length > 0, "Has pivot-select steps");
    const p = pivotSteps[0];
    assert(typeof p.pivotIndex === "number", "Pivot-select has pivotIndex");
    assert(typeof p.pivotValue === "number", "Pivot-select has pivotValue");
    assert(typeof p.low === "number", "Pivot-select has low");
    assert(typeof p.high === "number", "Pivot-select has high");
    assert(typeof p.explanation === "string", "Pivot-select has explanation");
  }, "Step trace: pivot-select step has required fields");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [4, 2, 7, 1, 5],
      "lomuto",
      "last",
    );
    const compareSteps = result.steps.filter((s) => s.type === "compare");
    assert(compareSteps.length > 0, "Has compare steps");
    const c = compareSteps[0];
    assert(typeof c.i === "number", "Compare step has i");
    assert(typeof c.j === "number", "Compare step has j");
    assert(typeof c.comparisons === "number", "Compare step has comparisons");
    assert(Array.isArray(c.array), "Compare step has array");
    assert(typeof c.explanation === "string", "Compare step has explanation");
  }, "Step trace: compare step has required fields");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [4, 2, 7, 1, 5],
      "lomuto",
      "last",
    );
    const swapSteps = result.steps.filter((s) => s.type === "swap");
    // There may or may not be swaps, but if there are, they should have required fields
    if (swapSteps.length > 0) {
      const s = swapSteps[0];
      assert(typeof s.i === "number", "Swap step has i");
      assert(typeof s.j === "number", "Swap step has j");
      assert(typeof s.swaps === "number", "Swap step has swaps");
      assert(Array.isArray(s.array), "Swap step has array");
    }
    assert(true, "Swap step validation passed");
  }, "Step trace: swap step has required fields (if present)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [4, 2, 7, 1, 5],
      "lomuto",
      "last",
    );
    const partitionSteps = result.steps.filter(
      (s) => s.type === "partition-done",
    );
    assert(partitionSteps.length > 0, "Has partition-done steps");
    const pd = partitionSteps[0];
    assert(
      typeof pd.pivotFinalIndex === "number",
      "Partition-done has pivotFinalIndex",
    );
    assert(typeof pd.low === "number", "Partition-done has low");
    assert(typeof pd.high === "number", "Partition-done has high");
    assert(Array.isArray(pd.array), "Partition-done has array");
  }, "Step trace: partition-done step has required fields");

  // --- Worst-case behavior: sorted array with 'first' pivot (Lomuto) ---
  it(() => {
    // For a sorted array with 'first' pivot in Lomuto, every pivot choice
    // gives a maximally unbalanced partition -> O(n^2) comparisons
    const n = 8;
    const sorted = [];
    for (let i = 1; i <= n; i++) sorted.push(i);
    const result = QuickSortAlgorithm.quickSort(sorted, "lomuto", "first");
    const lastStep = result.steps[result.steps.length - 1];
    // For n=8 sorted with first pivot, comparisons >= n*(n-1)/2
    const minWorstCase = (n * (n - 1)) / 2;
    assert(
      lastStep.comparisons >= minWorstCase,
      "Worst-case comparisons: got " +
        lastStep.comparisons +
        ", expected >= " +
        minWorstCase,
    );
  }, "Worst-case: sorted array with first pivot shows O(n^2) comparisons");

  // --- Median-of-3 pivot handles < 3 elements gracefully ---
  it(() => {
    const result1 = QuickSortAlgorithm.quickSort(
      [2, 1],
      "lomuto",
      "median-of-3",
    );
    assertEqual(result1.sortedArray, [1, 2], "Median-of-3 with 2 elements");

    const result2 = QuickSortAlgorithm.quickSort([1], "lomuto", "median-of-3");
    assertEqual(result2.sortedArray, [1], "Median-of-3 with 1 element");
  }, "Median-of-3 gracefully handles fewer than 3 elements");

  // --- lomutoPartition exported and functional ---
  it(() => {
    assert(
      typeof QuickSortAlgorithm.lomutoPartition === "function",
      "lomutoPartition is exported",
    );
    const arr = [3, 1, 2];
    const result = QuickSortAlgorithm.lomutoPartition(
      arr,
      0,
      arr.length - 1,
      "last",
    );
    assert(typeof result.pivotIndex === "number", "Returns pivotIndex");
    assert(Array.isArray(result.steps), "Returns steps");
  }, "lomutoPartition: exported and returns { pivotIndex, steps }");

  // --- hoarePartition exported and functional ---
  it(() => {
    assert(
      typeof QuickSortAlgorithm.hoarePartition === "function",
      "hoarePartition is exported",
    );
    const arr = [3, 1, 2];
    const result = QuickSortAlgorithm.hoarePartition(
      arr,
      0,
      arr.length - 1,
      "first",
    );
    assert(typeof result.pivotIndex === "number", "Returns pivotIndex");
    assert(Array.isArray(result.steps), "Returns steps");
  }, "hoarePartition: exported and returns { pivotIndex, steps }");

  // --- Comparison counts increase monotonically through steps ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [5, 3, 8, 1, 9, 2],
      "lomuto",
      "last",
    );
    let prevComparisons = 0;
    for (const step of result.steps) {
      if (step.comparisons !== undefined) {
        assert(
          step.comparisons >= prevComparisons,
          "Comparisons must be non-decreasing, got " +
            step.comparisons +
            " after " +
            prevComparisons,
        );
        prevComparisons = step.comparisons;
      }
    }
  }, "Comparison counts are non-decreasing through steps");

  // --- Swap counts increase monotonically through steps ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [5, 3, 8, 1, 9, 2],
      "lomuto",
      "last",
    );
    let prevSwaps = 0;
    for (const step of result.steps) {
      if (step.swaps !== undefined) {
        assert(
          step.swaps >= prevSwaps,
          "Swaps must be non-decreasing, got " +
            step.swaps +
            " after " +
            prevSwaps,
        );
        prevSwaps = step.swaps;
      }
    }
  }, "Swap counts are non-decreasing through steps");

  // --- Negative numbers ---
  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [-3, 5, -1, 0, 2],
      "lomuto",
      "last",
    );
    assertEqual(result.sortedArray, [-3, -1, 0, 2, 5], "Negatives sorted");
  }, "Negative numbers (Lomuto)");

  it(() => {
    const result = QuickSortAlgorithm.quickSort(
      [-3, 5, -1, 0, 2],
      "hoare",
      "first",
    );
    assertEqual(
      result.sortedArray,
      [-3, -1, 0, 2, 5],
      "Negatives sorted (Hoare)",
    );
  }, "Negative numbers (Hoare)");

  // --- Pivot strategy: random still produces sorted output ---
  it(() => {
    const arr = [10, 7, 2, 5, 3, 1, 8, 4, 6, 9];
    const result = QuickSortAlgorithm.quickSort(arr, "lomuto", "random");
    assertEqual(
      result.sortedArray,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "Random pivot sorted",
    );
  }, "Random pivot strategy produces correct sorted output");
});
