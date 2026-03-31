// levenshtein-algorithm.test.js — Tests for Levenshtein algorithm + traceback info

const levenshteinModule = require("./levenshtein-algorithm.js");
const { levenshteinCompute, tracebackDescription } =
  levenshteinModule.default || levenshteinModule;

describe("levenshtein algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }
  // --- Algorithm correctness tests ---

  it("kitten -> sitting distance is 3", () => {
    const result = levenshteinCompute("kitten", "sitting");
    assertEqual(result.distance, 3, "distance");
  });

  it("empty -> abc distance is 3", () => {
    const result = levenshteinCompute("", "abc");
    assertEqual(result.distance, 3, "distance");
  });

  it("abc -> empty distance is 3", () => {
    const result = levenshteinCompute("abc", "");
    assertEqual(result.distance, 3, "distance");
  });

  it("same strings distance is 0", () => {
    const result = levenshteinCompute("hello", "hello");
    assertEqual(result.distance, 0, "distance");
  });

  it("traceback starts at (0,0) and ends at (m,n)", () => {
    const result = levenshteinCompute("kitten", "sitting");
    const tb = result.traceback;
    assertEqual(tb[0], { i: 0, j: 0 }, "traceback start");
    assertEqual(tb[tb.length - 1], { i: 6, j: 7 }, "traceback end");
  });

  // --- REGRESSION TEST: traceback description must not be empty ---

  it("tracebackDescription returns non-empty string for kitten->sitting", () => {
    const result = levenshteinCompute("kitten", "sitting");
    const desc = tracebackDescription(
      "kitten",
      "sitting",
      result.traceback,
      result.ops,
    );
    assert(typeof desc === "string", "description should be a string");
    assert(
      desc.length > 0,
      "traceback description must not be empty — this is the bug",
    );
  });

  it("tracebackDescription mentions operations for each traceback step", () => {
    const result = levenshteinCompute("kitten", "sitting");
    const desc = tracebackDescription(
      "kitten",
      "sitting",
      result.traceback,
      result.ops,
    );
    // The description should mention at least one operation type
    const hasOp = /match|substitute|insert|delete/i.test(desc);
    assert(
      hasOp,
      "traceback description should mention at least one operation (match/substitute/insert/delete)",
    );
  });

  it("tracebackDescription works for identical strings", () => {
    const result = levenshteinCompute("abc", "abc");
    const desc = tracebackDescription(
      "abc",
      "abc",
      result.traceback,
      result.ops,
    );
    assert(
      desc.length > 0,
      "description should not be empty even for identical strings",
    );
    assert(
      /match/i.test(desc),
      "identical strings should produce match operations",
    );
  });
});
