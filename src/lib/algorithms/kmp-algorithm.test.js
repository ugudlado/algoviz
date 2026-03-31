/**
 *
 * Tests buildFailureFunction, kmpSearch, naiveSearch
 */

describe("kmp algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

const KMPAlgorithm = require("./kmp-algorithm.js");
  // ============================================================
  // buildFailureFunction tests
  // ============================================================

  // --- Known pattern: "ABCABD" => [0, 0, 0, 1, 2, 0] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("ABCABD");
    assertEqual(f, [0, 0, 0, 1, 2, 0], "Failure table for ABCABD");
  }, "buildFailureFunction: ABCABD");

  // --- Classic: "AABAAA" => [0, 1, 0, 1, 2, 2] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("AABAAA");
    assertEqual(f, [0, 1, 0, 1, 2, 2], "Failure table for AABAAA");
  }, "buildFailureFunction: AABAAA");

  // --- Classic: "ABAB" => [0, 0, 1, 2] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("ABAB");
    assertEqual(f, [0, 0, 1, 2], "Failure table for ABAB");
  }, "buildFailureFunction: ABAB");

  // --- All same chars: "AAAA" => [0, 1, 2, 3] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("AAAA");
    assertEqual(f, [0, 1, 2, 3], "Failure table for AAAA");
  }, "buildFailureFunction: all same chars AAAA");

  // --- No prefix/suffix overlap: "ABCD" => [0, 0, 0, 0] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("ABCD");
    assertEqual(f, [0, 0, 0, 0], "Failure table for ABCD");
  }, "buildFailureFunction: no overlap ABCD");

  // --- Single character: "A" => [0] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("A");
    assertEqual(f, [0], "Failure table for single char");
  }, "buildFailureFunction: single character");

  // --- Two chars same: "AA" => [0, 1] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("AA");
    assertEqual(f, [0, 1], "Failure table for AA");
  }, "buildFailureFunction: two same chars AA");

  // --- Two chars different: "AB" => [0, 0] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("AB");
    assertEqual(f, [0, 0], "Failure table for AB");
  }, "buildFailureFunction: two different chars AB");

  // --- Empty string: [] ---
  it(() => {
    const f = KMPAlgorithm.buildFailureFunction("");
    assertEqual(f, [], "Failure table for empty string");
  }, "buildFailureFunction: empty string");

  // --- Returns array of same length as pattern ---
  it(() => {
    const pattern = "ABCABC";
    const f = KMPAlgorithm.buildFailureFunction(pattern);
    assertEqual(f.length, pattern.length, "Length matches pattern");
  }, "buildFailureFunction: result length equals pattern length");

  // ============================================================
  // kmpSearch tests
  // ============================================================

  // --- Single match ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AABAACAADAABAABA", "AABA");
    assert(r.matches.length >= 1, "At least one match");
    assert(r.matches.indexOf(0) >= 0, "Match at index 0");
  }, "kmpSearch: single match at start");

  // --- Multiple matches ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AABAACAADAABAABA", "AABA");
    assertEqual(
      r.matches.length,
      3,
      "Three matches in AABAACAADAABAABA for AABA",
    );
    assertEqual(r.matches[0], 0, "First match at 0");
    assertEqual(r.matches[1], 9, "Second match at 9");
    assertEqual(r.matches[2], 12, "Third match at 12");
  }, "kmpSearch: multiple matches AABAACAADAABAABA/AABA");

  // --- No match ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("ABCDEF", "XYZ");
    assertEqual(r.matches.length, 0, "No matches found");
  }, "kmpSearch: no match");

  // --- Pattern equals text (single match) ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("ABC", "ABC");
    assertEqual(r.matches.length, 1, "One match");
    assertEqual(r.matches[0], 0, "Match at index 0");
  }, "kmpSearch: pattern equals text");

  // --- Pattern longer than text ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AB", "ABCDE");
    assertEqual(
      r.matches.length,
      0,
      "No matches when pattern longer than text",
    );
  }, "kmpSearch: pattern longer than text");

  // --- Empty pattern ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("ABCDEF", "");
    assertEqual(r.matches.length, 0, "No matches for empty pattern");
  }, "kmpSearch: empty pattern");

  // --- Empty text ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("", "ABC");
    assertEqual(r.matches.length, 0, "No matches for empty text");
  }, "kmpSearch: empty text");

  // --- Both empty ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("", "");
    assertEqual(r.matches.length, 0, "No matches for both empty");
  }, "kmpSearch: both empty");

  // --- Single char match ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("A", "A");
    assertEqual(r.matches.length, 1, "Single char match");
    assertEqual(r.matches[0], 0, "At index 0");
  }, "kmpSearch: single char match");

  // --- All same characters, overlapping ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AAAAA", "AA");
    // Overlapping: matches at 0, 1, 2, 3
    assertEqual(r.matches.length, 4, "4 overlapping matches");
  }, "kmpSearch: overlapping matches all same chars");

  // --- Match at end of text ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("XYZABC", "ABC");
    assertEqual(r.matches.length, 1, "One match at end");
    assertEqual(r.matches[0], 3, "Match at index 3");
  }, "kmpSearch: match at end of text");

  // --- Steps array has required structure ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AABAACAADAABAABA", "AABA");
    assert(Array.isArray(r.steps), "steps is array");
    assert(r.steps.length > 0, "at least one step");
    const step = r.steps[0];
    assert(typeof step.textIdx === "number", "step has textIdx");
    assert(typeof step.patternIdx === "number", "step has patternIdx");
    assert(typeof step.isMatch === "boolean", "step has isMatch");
    assert(typeof step.explanation === "string", "step has explanation");
  }, "kmpSearch: step structure");

  // --- Returns failureFunction in result ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AABAACAADAABAABA", "AABA");
    assert(Array.isArray(r.failureFunction), "result has failureFunction");
    assertEqual(r.failureFunction, [0, 1, 0, 1], "Failure function for AABA");
  }, "kmpSearch: result includes failureFunction");

  // --- Returns stepCount in result ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("AABAACAADAABAABA", "AABA");
    assert(typeof r.stepCount === "number", "result has stepCount");
    assert(r.stepCount > 0, "stepCount is positive");
  }, "kmpSearch: result includes stepCount");

  // ============================================================
  // naiveSearch tests
  // ============================================================

  // --- naiveSearch finds same matches as kmpSearch ---
  it(() => {
    const text = "AABAACAADAABAABA";
    const pattern = "AABA";
    const kmpResult = KMPAlgorithm.kmpSearch(text, pattern);
    const naiveResult = KMPAlgorithm.naiveSearch(text, pattern);
    assertEqual(
      kmpResult.matches,
      naiveResult.matches,
      "KMP and naive find same matches",
    );
  }, "naiveSearch: matches same as kmpSearch");

  // --- naiveSearch no match ---
  it(() => {
    const r = KMPAlgorithm.naiveSearch("ABCDEF", "XYZ");
    assertEqual(r.matches.length, 0, "No matches");
  }, "naiveSearch: no match");

  // --- naiveSearch returns stepCount ---
  it(() => {
    const r = KMPAlgorithm.naiveSearch("AABAACAADAABAABA", "AABA");
    assert(typeof r.stepCount === "number", "has stepCount");
    assert(r.stepCount > 0, "stepCount is positive");
  }, "naiveSearch: has stepCount");

  // --- naiveSearch stepCount >= kmpSearch stepCount (KMP never worse) ---
  it(() => {
    const text = "AABAACAADAABAABA";
    const pattern = "AABA";
    const kmpResult = KMPAlgorithm.kmpSearch(text, pattern);
    const naiveResult = KMPAlgorithm.naiveSearch(text, pattern);
    assert(
      naiveResult.stepCount >= kmpResult.stepCount,
      "Naive steps (" +
        naiveResult.stepCount +
        ") >= KMP steps (" +
        kmpResult.stepCount +
        ")",
    );
  }, "naiveSearch: naive stepCount >= kmpSearch stepCount");

  // --- naiveSearch empty inputs ---
  it(() => {
    const r = KMPAlgorithm.naiveSearch("", "ABC");
    assertEqual(r.matches.length, 0, "No matches for empty text");
  }, "naiveSearch: empty text");

  // --- DNA-like sequence test ---
  it(() => {
    const r = KMPAlgorithm.kmpSearch("ATCGATCGATCG", "ATCG");
    assertEqual(r.matches.length, 3, "Three matches in DNA sequence");
    assertEqual(r.matches[0], 0, "Match at 0");
    assertEqual(r.matches[1], 4, "Match at 4");
    assertEqual(r.matches[2], 8, "Match at 8");
  }, "kmpSearch: DNA-like sequence ATCG in ATCGATCGATCG");
});
