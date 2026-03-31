/**
 *
 * Tests checkWinner, getAvailableMoves, minimax, getBestMove
 */

describe("minimax algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

var MinimaxAlgorithm = require("./minimax-algorithm.js");
  // ============================================================
  // checkWinner tests
  // ============================================================

  it(function () {
    var board = ["X", "X", "X", null, null, null, null, null, null];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "X", "X wins top row");
  }, "checkWinner: X wins top row");

  it(function () {
    var board = ["O", "O", "O", null, null, null, null, null, null];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "O", "O wins top row");
  }, "checkWinner: O wins top row");

  it(function () {
    var board = ["X", null, null, "X", null, null, "X", null, null];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "X", "X wins left column");
  }, "checkWinner: X wins left column");

  it(function () {
    var board = ["X", null, null, null, "X", null, null, null, "X"];
    assertEqual(
      MinimaxAlgorithm.checkWinner(board),
      "X",
      "X wins diagonal TL-BR",
    );
  }, "checkWinner: X wins diagonal");

  it(function () {
    var board = [null, null, "X", null, "X", null, "X", null, null];
    assertEqual(
      MinimaxAlgorithm.checkWinner(board),
      "X",
      "X wins anti-diagonal",
    );
  }, "checkWinner: X wins anti-diagonal");

  it(function () {
    var board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "draw", "Full board draw");
  }, "checkWinner: draw on full board");

  it(function () {
    var board = [null, null, null, null, null, null, null, null, null];
    assertEqual(
      MinimaxAlgorithm.checkWinner(board),
      null,
      "Empty board returns null",
    );
  }, "checkWinner: empty board is null");

  it(function () {
    var board = ["X", "O", null, null, null, null, null, null, null];
    assertEqual(
      MinimaxAlgorithm.checkWinner(board),
      null,
      "In-progress game returns null",
    );
  }, "checkWinner: in-progress game");

  it(function () {
    var board = ["O", null, null, "O", null, null, "O", null, null];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "O", "O wins left column");
  }, "checkWinner: O wins left column");

  it(function () {
    var board = [null, null, null, "X", "X", "X", null, null, null];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "X", "X wins middle row");
  }, "checkWinner: X wins middle row");

  it(function () {
    var board = [null, null, null, null, null, null, "O", "O", "O"];
    assertEqual(MinimaxAlgorithm.checkWinner(board), "O", "O wins bottom row");
  }, "checkWinner: O wins bottom row");

  // ============================================================
  // getAvailableMoves tests
  // ============================================================

  it(function () {
    var board = [null, null, null, null, null, null, null, null, null];
    var moves = MinimaxAlgorithm.getAvailableMoves(board);
    assertEqual(moves.length, 9, "Empty board has 9 moves");
  }, "getAvailableMoves: empty board returns 9 moves");

  it(function () {
    var board = ["X", "O", "X", "O", "X", "O", "O", "X", "O"];
    var moves = MinimaxAlgorithm.getAvailableMoves(board);
    assertEqual(moves.length, 0, "Full board has 0 moves");
  }, "getAvailableMoves: full board returns 0 moves");

  it(function () {
    var board = ["X", null, null, null, null, null, null, null, null];
    var moves = MinimaxAlgorithm.getAvailableMoves(board);
    assertEqual(moves.length, 8, "One occupied cell leaves 8 moves");
    assertEqual(moves.indexOf(0), -1, "Index 0 not in moves");
    assert(moves.indexOf(1) >= 0, "Index 1 is in moves");
  }, "getAvailableMoves: one occupied cell");

  it(function () {
    var board = [null, null, null, null, "X", null, null, null, null];
    var moves = MinimaxAlgorithm.getAvailableMoves(board);
    assertEqual(moves.indexOf(4), -1, "Center occupied not in moves");
    assertEqual(moves.length, 8, "8 remaining moves");
  }, "getAvailableMoves: center occupied");

  // ============================================================
  // minimax tests (correctness of best move)
  // ============================================================

  it(function () {
    // X can win immediately by playing index 2
    var board = ["X", "X", null, "O", "O", null, null, null, null];
    var result = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      false,
      0,
    );
    assertEqual(result.move, 2, "X plays winning move at index 2");
  }, "minimax: X takes immediate win");

  it(function () {
    // O can win immediately by playing index 5
    var board = ["X", "X", null, "O", "O", null, null, null, null];
    var result = MinimaxAlgorithm.minimax(
      board,
      false,
      -Infinity,
      Infinity,
      false,
      0,
    );
    assertEqual(result.move, 5, "O takes immediate win at index 5");
  }, "minimax: O takes immediate win");

  it(function () {
    // X must block O from winning: O threatens index 2 (0,1,2 row)
    var board = [null, "O", "O", null, null, null, "X", null, null];
    var result = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      false,
      0,
    );
    assertEqual(result.move, 0, "X blocks O at index 0");
  }, "minimax: X blocks O win");

  it(function () {
    // Terminal state — board already won by X
    var board = ["X", "X", "X", null, null, null, null, null, null];
    var result = MinimaxAlgorithm.minimax(
      board,
      false,
      -Infinity,
      Infinity,
      false,
      0,
    );
    assert(result.score > 0, "X win yields positive score");
    assertEqual(result.move, null, "No move in terminal state");
  }, "minimax: terminal state X win");

  it(function () {
    // Terminal state — draw
    var board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    var result = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      false,
      0,
    );
    assertEqual(result.score, 0, "Draw yields score 0");
  }, "minimax: terminal state draw");

  it(function () {
    // nodesEvaluated is a positive integer
    var board = [null, null, null, null, null, null, null, null, null];
    var result = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      false,
      0,
    );
    assert(
      typeof result.nodesEvaluated === "number",
      "nodesEvaluated is a number",
    );
    assert(
      result.nodesEvaluated > 1,
      "nodesEvaluated > 1 for non-terminal board",
    );
  }, "minimax: nodesEvaluated is positive");

  it(function () {
    // tree structure has required fields
    var board = ["X", null, null, null, null, null, null, null, null];
    var result = MinimaxAlgorithm.minimax(
      board,
      false,
      -Infinity,
      Infinity,
      false,
      0,
    );
    var tree = result.tree;
    assert(Array.isArray(tree.board), "tree has board");
    assert(Array.isArray(tree.children), "tree has children");
    assert(typeof tree.pruned === "boolean", "tree has pruned flag");
    assert(typeof tree.alpha === "number", "tree has alpha");
    assert(typeof tree.beta === "number", "tree has beta");
  }, "minimax: tree structure has required fields");

  it(function () {
    // Alpha-beta pruning reduces node count
    var board = [null, null, null, null, null, null, null, null, null];
    var withoutPruning = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      false,
      0,
    );
    var withPruning = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      true,
      0,
    );
    assert(
      withPruning.nodesEvaluated <= withoutPruning.nodesEvaluated,
      "Pruning evaluates <= nodes (" +
        withPruning.nodesEvaluated +
        " <= " +
        withoutPruning.nodesEvaluated +
        ")",
    );
  }, "minimax: alpha-beta pruning reduces node count");

  it(function () {
    // Alpha-beta pruning finds same move as without pruning
    var board = ["X", null, null, null, "O", null, null, null, null];
    var withoutPruning = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      false,
      0,
    );
    var withPruning = MinimaxAlgorithm.minimax(
      board,
      true,
      -Infinity,
      Infinity,
      true,
      0,
    );
    assertEqual(
      withPruning.move,
      withoutPruning.move,
      "Same best move with and without pruning",
    );
  }, "minimax: alpha-beta finds same best move");

  // ============================================================
  // getBestMove tests
  // ============================================================

  it(function () {
    var board = ["X", "X", null, "O", "O", null, null, null, null];
    var result = MinimaxAlgorithm.getBestMove(board, "X", false);
    assertEqual(result.move, 2, "getBestMove: X takes win at index 2");
  }, "getBestMove: X takes immediate win (no pruning)");

  it(function () {
    var board = ["X", "X", null, "O", "O", null, null, null, null];
    var result = MinimaxAlgorithm.getBestMove(board, "X", true);
    assertEqual(result.move, 2, "getBestMove: X takes win with pruning");
  }, "getBestMove: X takes immediate win (with pruning)");

  it(function () {
    var board = [null, null, null, null, null, null, null, null, null];
    var result = MinimaxAlgorithm.getBestMove(board, "X", false);
    assert(typeof result.move === "number", "move is a number");
    assert(result.move >= 0 && result.move <= 8, "move in valid range");
    assert(
      typeof result.nodesWithPruning === "number",
      "nodesWithPruning is a number",
    );
    assert(
      typeof result.nodesWithoutPruning === "number",
      "nodesWithoutPruning is a number",
    );
    assert(
      result.tree !== null && typeof result.tree === "object",
      "tree is an object",
    );
  }, "getBestMove: result has required fields");

  it(function () {
    var board = [null, null, null, null, null, null, null, null, null];
    var result = MinimaxAlgorithm.getBestMove(board, "X", true);
    assert(
      result.nodesWithPruning <= result.nodesWithoutPruning,
      "nodesWithPruning <= nodesWithoutPruning",
    );
  }, "getBestMove: pruning count <= no-pruning count");

  it(function () {
    // O's best move: block X diagonal or take center
    var board = ["X", null, null, null, "O", null, null, null, "X"];
    var result = MinimaxAlgorithm.getBestMove(board, "O", false);
    assert(typeof result.move === "number", "O has a move");
    assert(board[result.move] === null, "O plays on empty cell");
  }, "getBestMove: O plays valid move");

  it(function () {
    // Near-terminal: one move left
    var board = ["X", "O", "X", "O", "X", "O", "O", "X", null];
    var result = MinimaxAlgorithm.getBestMove(board, "O", false);
    assertEqual(result.move, 8, "Only one move available — play index 8");
  }, "getBestMove: single available move");
});
