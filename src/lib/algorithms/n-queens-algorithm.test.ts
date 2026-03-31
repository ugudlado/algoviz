/**
 */

describe("n queens algorithm", () => {
  const assert = (condition, message) => {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  };
  const assertEqual = (actual, expected, message) => {
    expect(actual, message || "assertEqual").toEqual(expected);
  };
  const NQueensAlgorithm =
    require("./n-queens-algorithm.ts").default ||
    require("./n-queens-algorithm.ts");
  // --- solveAll: N=1 ---
  it(() => {
    var result = NQueensAlgorithm.solveAll(1);
    assertEqual(result.count, 1, "N=1 should have 1 solution");
    assert(Array.isArray(result.firstSolution), "firstSolution is array");
    assertEqual(result.firstSolution.length, 1, "firstSolution has 1 element");
  }, "solveAll: N=1 has exactly 1 solution");

  // --- solveAll: N=4 ---
  it(() => {
    var result = NQueensAlgorithm.solveAll(4);
    assertEqual(result.count, 2, "N=4 should have exactly 2 solutions");
    assert(result.firstSolution !== null, "firstSolution is not null");
    assertEqual(result.firstSolution.length, 4, "firstSolution has 4 elements");
  }, "solveAll: N=4 has exactly 2 solutions");

  // --- solveAll: N=8 ---
  it(() => {
    var result = NQueensAlgorithm.solveAll(8);
    assertEqual(result.count, 92, "N=8 should have exactly 92 solutions");
  }, "solveAll: N=8 has exactly 92 solutions");

  // --- isValid: same column conflict ---
  it(() => {
    var board = [0, -1, -1, -1]; // queen at row=0, col=0
    var valid = NQueensAlgorithm.isValid(board, 1, 0, 4);
    assertEqual(valid, false, "col=0 conflict should be invalid");
  }, "isValid: same column conflict returns false");

  // --- isValid: diagonal conflict ---
  it(() => {
    var board = [0, -1, -1, -1]; // queen at row=0, col=0
    var valid = NQueensAlgorithm.isValid(board, 1, 1, 4);
    assertEqual(valid, false, "diagonal conflict should be invalid");
  }, "isValid: diagonal conflict returns false");

  // --- isValid: valid placement ---
  it(() => {
    var board = [0, -1, -1, -1]; // queen at row=0, col=0
    var valid = NQueensAlgorithm.isValid(board, 1, 2, 4);
    assertEqual(valid, true, "col=2 from col=0 at row+1 should be valid");
  }, "isValid: non-conflicting placement returns true");

  // --- isValid: anti-diagonal conflict ---
  it(() => {
    var board = [3, -1, -1, -1]; // queen at row=0, col=3
    var valid = NQueensAlgorithm.isValid(board, 1, 2, 4);
    assertEqual(valid, false, "anti-diagonal conflict should be invalid");
  }, "isValid: anti-diagonal conflict returns false");

  // --- isValid: empty board ---
  it(() => {
    var board = [-1, -1, -1, -1];
    var valid = NQueensAlgorithm.isValid(board, 0, 0, 4);
    assertEqual(valid, true, "first placement always valid");
  }, "isValid: first placement on empty board is always valid");

  // --- generateSteps: N=4 returns steps array ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    assert(Array.isArray(steps), "generateSteps returns array");
    assert(steps.length > 0, "steps array is non-empty");
  }, "generateSteps(4): returns non-empty steps array");

  // --- generateSteps: N=4 includes a solution step ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    var solutionSteps = steps.filter(function (s) {
      return s.type === "solution";
    });
    assert(solutionSteps.length > 0, "should have at least one solution step");
  }, "generateSteps(4): includes at least one solution step");

  // --- generateSteps: N=4 has backtracks ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    var backtrackSteps = steps.filter(function (s) {
      return s.type === "backtrack";
    });
    assert(backtrackSteps.length > 0, "should have backtrack steps");
    // Verify backtracks counter increments
    var lastStep = steps[steps.length - 1];
    assert(lastStep.backtracks > 0, "final backtracks count > 0");
  }, "generateSteps(4): has backtrack steps and non-zero backtrack count");

  // --- generateSteps: step objects have required fields ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    var step = steps[0];
    assert(step.type !== undefined, "step has type");
    assert(step.row !== undefined, "step has row");
    assert(step.col !== undefined, "step has col");
    assert(Array.isArray(step.board), "step has board array");
    assert(step.stepCount !== undefined, "step has stepCount");
    assert(step.backtracks !== undefined, "step has backtracks");
    assert(Array.isArray(step.conflictCells), "step has conflictCells array");
  }, "generateSteps(4): step objects have all required fields");

  // --- generateSteps: conflict steps have conflictCells ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    var conflictSteps = steps.filter(function (s) {
      return s.type === "conflict";
    });
    assert(conflictSteps.length > 0, "should have conflict steps");
    conflictSteps.forEach(function (s) {
      assert(
        s.conflictCells.length > 0,
        "conflict step should have at least one conflict cell",
      );
    });
  }, "generateSteps(4): conflict steps include conflictCells");

  // --- generateSteps: board array length matches N ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    steps.forEach(function (s) {
      assertEqual(s.board.length, 4, "board length equals N");
    });
  }, "generateSteps(4): board array has length N in every step");

  // --- generateSteps: solution step has valid board ---
  it(() => {
    var steps = NQueensAlgorithm.generateSteps(4);
    var solutionStep = steps.filter(function (s) {
      return s.type === "solution";
    })[0];
    var board = solutionStep.board;
    // All rows should have a queen placed (col >= 0)
    for (var i = 0; i < 4; i++) {
      assert(
        board[i] >= 0 && board[i] < 4,
        "solution board row " + i + " has valid queen position",
      );
    }
    // Verify it's actually valid (no conflicts)
    for (var r = 0; r < 4; r++) {
      assert(
        NQueensAlgorithm.isValid(board, r, board[r], 4) || r === 0,
        "solution board row " + r + " is valid placement",
      );
    }
  }, "generateSteps(4): solution step board has all queens placed validly");
});
