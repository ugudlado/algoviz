/**
 */

describe("sliding window algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

  const SlidingWindowAlgorithm =
    require("./sliding-window-algorithm.js").default ||
    require("./sliding-window-algorithm.js");
  // ============================================================
  // maxSumFixedWindow tests
  // ============================================================

  // --- Basic case ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow(
      [1, 3, -1, -3, 5, 3, 6, 7],
      3,
    );
    assertEqual(result.maxSum, 16, "maxSum is 16");
    assertEqual(result.windowStart, 5, "windowStart is 5 (values 3,6,7)");
  }, "maxSumFixedWindow: basic case [1,3,-1,-3,5,3,6,7] k=3");

  // --- k=1: max element ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([4, 1, 9, 2, 7], 1);
    assertEqual(result.maxSum, 9, "maxSum is 9 (single element window)");
    assertEqual(result.windowStart, 2, "windowStart is 2");
  }, "maxSumFixedWindow: k=1 returns max element");

  // --- k=array.length: sum of all ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3, 4, 5], 5);
    assertEqual(result.maxSum, 15, "maxSum is 15 (entire array)");
    assertEqual(result.windowStart, 0, "windowStart is 0");
    assertEqual(
      result.steps.length,
      1,
      "exactly 1 step when window covers whole array",
    );
  }, "maxSumFixedWindow: k=array.length returns sum of all");

  // --- all same values ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([5, 5, 5, 5, 5], 3);
    assertEqual(result.maxSum, 15, "maxSum is 15");
    assertEqual(result.steps.length, 3, "3 steps for 5 elements k=3");
    // All steps should be marked isMax since all sums are equal
    assert(
      result.steps.every((s) => s.isMax === true),
      "all steps are isMax when all equal",
    );
  }, "maxSumFixedWindow: all same values");

  // --- negative values ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow(
      [-5, -1, -3, -2, -4],
      2,
    );
    // Windows: [-5,-1]=-6, [-1,-3]=-4, [-3,-2]=-5, [-2,-4]=-6 → max is -4 at index 1
    assertEqual(result.maxSum, -4, "maxSum is -4 (least negative sum)");
    assertEqual(result.windowStart, 1, "windowStart is 1 (values -1,-3)");
  }, "maxSumFixedWindow: negative values");

  // --- single element array (k=1) ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([42], 1);
    assertEqual(result.maxSum, 42, "maxSum is 42");
    assertEqual(result.windowStart, 0, "windowStart is 0");
    assertEqual(result.steps.length, 1, "1 step");
  }, "maxSumFixedWindow: single element array");

  // --- positive and negative mixed ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow(
      [2, 1, 5, 1, 3, 2],
      3,
    );
    assertEqual(result.maxSum, 9, "maxSum is 9 (5+1+3)");
    assertEqual(result.windowStart, 2, "windowStart is 2");
  }, "maxSumFixedWindow: mixed positive and negative k=3");

  // --- step count is correct ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3, 4, 5], 3);
    // 5 elements, k=3 → 3 windows (start=0,1,2)
    assertEqual(result.steps.length, 3, "3 steps for 5 elements k=3");
  }, "maxSumFixedWindow: step count equals (n - k + 1)");

  // --- step fields are correct ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3, 4, 5], 3);
    const step = result.steps[0];
    assert(typeof step.left === "number", "step has left");
    assert(typeof step.right === "number", "step has right");
    assert(typeof step.sum === "number", "step has sum");
    assert(typeof step.isMax === "boolean", "step has isMax");
  }, "maxSumFixedWindow: step object has correct fields");

  // --- step left/right values ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3, 4, 5], 3);
    assertEqual(result.steps[0].left, 0, "first step left=0");
    assertEqual(result.steps[0].right, 2, "first step right=2");
    assertEqual(result.steps[1].left, 1, "second step left=1");
    assertEqual(result.steps[1].right, 3, "second step right=3");
    assertEqual(result.steps[2].left, 2, "third step left=2");
    assertEqual(result.steps[2].right, 4, "third step right=4");
  }, "maxSumFixedWindow: step left/right advance by 1 each time");

  // --- isMax only on max window(s) ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3, 4, 5], 3);
    // Windows: [1,2,3]=6, [2,3,4]=9, [3,4,5]=12 — only last is max
    assertEqual(result.steps[0].isMax, false, "step[0] is not max");
    assertEqual(result.steps[1].isMax, false, "step[1] is not max");
    assertEqual(result.steps[2].isMax, true, "step[2] is max");
  }, "maxSumFixedWindow: isMax correctly marks only max window");

  // --- edge: empty array ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([], 3);
    assertEqual(result.maxSum, 0, "empty array returns 0");
    assertEqual(result.windowStart, -1, "empty array returns windowStart -1");
    assertEqual(result.steps.length, 0, "no steps for empty array");
  }, "maxSumFixedWindow: empty array");

  // --- edge: k > array.length ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3], 5);
    assertEqual(result.maxSum, 0, "k > arr.length returns 0");
    assertEqual(
      result.windowStart,
      -1,
      "k > arr.length returns windowStart -1",
    );
    assertEqual(result.steps.length, 0, "no steps when k > arr.length");
  }, "maxSumFixedWindow: k greater than array length");

  // --- edge: k=0 ---
  it(() => {
    const result = SlidingWindowAlgorithm.maxSumFixedWindow([1, 2, 3], 0);
    assertEqual(result.maxSum, 0, "k=0 returns 0");
    assertEqual(result.windowStart, -1, "k=0 returns windowStart -1");
  }, "maxSumFixedWindow: k=0 edge case");

  // --- input not mutated ---
  it(() => {
    const input = [3, 1, 4, 1, 5, 9, 2, 6];
    const orig = input.slice();
    SlidingWindowAlgorithm.maxSumFixedWindow(input, 3);
    assertEqual(input, orig, "input array not mutated");
  }, "maxSumFixedWindow: input array is not mutated");

  // --- constants exported ---
  it(() => {
    assert(
      typeof SlidingWindowAlgorithm.MAX_ARRAY_SIZE === "number",
      "MAX_ARRAY_SIZE exported",
    );
    assertEqual(
      SlidingWindowAlgorithm.MAX_ARRAY_SIZE,
      20,
      "MAX_ARRAY_SIZE is 20",
    );
  }, "SlidingWindowAlgorithm exports MAX_ARRAY_SIZE constant");

  it(() => {
    assert(
      typeof SlidingWindowAlgorithm.MAX_STRING_LENGTH === "number",
      "MAX_STRING_LENGTH exported",
    );
    assertEqual(
      SlidingWindowAlgorithm.MAX_STRING_LENGTH,
      30,
      "MAX_STRING_LENGTH is 30",
    );
  }, "SlidingWindowAlgorithm exports MAX_STRING_LENGTH constant");

  // ============================================================
  // longestUniqueSubstring tests
  // ============================================================

  // --- all unique characters ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abcde");
    assertEqual(result.maxLen, 5, "maxLen is 5 (all unique)");
    assertEqual(result.substring, "abcde", "substring is full string");
  }, "longestUniqueSubstring: all unique characters");

  // --- all same characters ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("aaaaa");
    assertEqual(result.maxLen, 1, "maxLen is 1 (all same)");
    assertEqual(result.substring, "a", "substring is single char");
  }, "longestUniqueSubstring: all same characters");

  // --- mixed with repeats ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abcabcbb");
    assertEqual(result.maxLen, 3, "maxLen is 3 (abc)");
    assert(result.substring.length === 3, "substring length is 3");
  }, "longestUniqueSubstring: abcabcbb → length 3");

  // --- pwwkew pattern ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("pwwkew");
    assertEqual(result.maxLen, 3, "maxLen is 3 (wke)");
  }, "longestUniqueSubstring: pwwkew → length 3");

  // --- empty string ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("");
    assertEqual(result.maxLen, 0, "maxLen is 0 for empty string");
    assertEqual(result.substring, "", "substring is empty");
    assertEqual(result.steps.length, 0, "no steps for empty string");
  }, "longestUniqueSubstring: empty string");

  // --- single character ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("z");
    assertEqual(result.maxLen, 1, "maxLen is 1");
    assertEqual(result.substring, "z", "substring is 'z'");
  }, "longestUniqueSubstring: single character");

  // --- two different characters ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("ab");
    assertEqual(result.maxLen, 2, "maxLen is 2");
    assertEqual(result.substring, "ab", "substring is 'ab'");
  }, "longestUniqueSubstring: two different characters");

  // --- two same characters ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("aa");
    assertEqual(result.maxLen, 1, "maxLen is 1");
    assertEqual(result.substring, "a", "substring is 'a'");
  }, "longestUniqueSubstring: two same characters");

  // --- long repeating pattern ---
  it(() => {
    const result =
      SlidingWindowAlgorithm.longestUniqueSubstring("abababababab");
    assertEqual(result.maxLen, 2, "maxLen is 2 for alternating ab pattern");
  }, "longestUniqueSubstring: long alternating pattern");

  // --- substring at end ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("aabcde");
    assertEqual(result.maxLen, 5, "maxLen is 5 (bcde starts fresh)");
  }, "longestUniqueSubstring: longest unique substring at end");

  // --- substring in middle ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("aabcdeaa");
    assertEqual(result.maxLen, 5, "maxLen is 5 (abcde middle)");
  }, "longestUniqueSubstring: longest unique substring in middle");

  // --- step fields exist ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abcabc");
    assert(result.steps.length > 0, "steps array is non-empty");
    const step = result.steps[0];
    assert(typeof step.left === "number", "step has left");
    assert(typeof step.right === "number", "step has right");
    assert(typeof step.window === "string", "step has window");
    assert(typeof step.charFreq === "object", "step has charFreq");
    assert(
      step.action === "expand" || step.action === "shrink",
      "step action is expand or shrink",
    );
    assert(typeof step.reason === "string", "step has reason");
  }, "longestUniqueSubstring: step object has correct fields");

  // --- expand steps have action=expand ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abc");
    const expandSteps = result.steps.filter((s) => s.action === "expand");
    assert(expandSteps.length > 0, "has expand steps");
    expandSteps.forEach((s) => {
      assertEqual(s.action, "expand", "action is expand");
    });
  }, "longestUniqueSubstring: expand steps have action=expand");

  // --- shrink steps when duplicate encountered ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abba");
    const shrinkSteps = result.steps.filter((s) => s.action === "shrink");
    assert(shrinkSteps.length > 0, "has shrink steps when duplicate found");
  }, "longestUniqueSubstring: shrink steps present when duplicate encountered");

  // --- step window matches left/right ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abcde");
    result.steps.forEach((step, i) => {
      const expected = "abcde".slice(step.left, step.right + 1);
      assertEqual(
        step.window,
        expected,
        "step " + i + " window matches left/right slice",
      );
    });
  }, "longestUniqueSubstring: step window string matches left/right indices");

  // --- charFreq only includes chars with count > 0 ---
  it(() => {
    const result = SlidingWindowAlgorithm.longestUniqueSubstring("abcabc");
    result.steps.forEach((step, i) => {
      const vals = Object.values(step.charFreq);
      assert(
        vals.every((v) => v > 0),
        "step " + i + " charFreq has no zero values",
      );
    });
  }, "longestUniqueSubstring: charFreq entries are all > 0");
});
