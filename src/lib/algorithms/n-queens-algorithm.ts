/**
 * N-Queens Algorithm
 *
 * Pure functions — no DOM dependency.
 * Backtracking solver with step generation for visualization.
 */
var NQueensAlgorithm = (function () {
  "use strict";

  /**
   * Check if placing a queen at (row, col) is valid.
   * @param {number[]} board - array of column positions, -1 for empty
   * @param {number} row - row to place queen
   * @param {number} col - column to place queen
   * @param {number} n - board size
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars
  function isValid(board, row, col, n) {
    for (var r = 0; r < row; r++) {
      var c = board[r];
      if (c === col) return false; // same column
      if (Math.abs(r - row) === Math.abs(c - col)) return false; // diagonal
    }
    return true;
  }

  /**
   * Get all cells attacked by a queen at (row, col) given the current board state.
   * Returns cells in the same col and diagonals that conflict with existing queens.
   * @param {number[]} board
   * @param {number} row
   * @param {number} col
   * @param {number} n
   * @returns {{row: number, col: number}[]}
   */
  // eslint-disable-next-line no-unused-vars
  function getConflictCells(board, row, col, n) {
    var conflicts = [];
    for (var r = 0; r < row; r++) {
      var c = board[r];
      if (c === col || Math.abs(r - row) === Math.abs(c - col)) {
        conflicts.push({ row: r, col: c });
      }
    }
    return conflicts;
  }

  /**
   * Generate all steps for the N-Queens backtracking algorithm.
   * @param {number} n - board size (4..12)
   * @returns {Object[]} array of step objects
   */
  function generateSteps(n) {
    var steps = [];
    var board = [];
    var stepCount = 0;
    var backtracks = 0;
    var nodeIdCounter = 0;
    // treeNodes: map from id -> {id, parentId, row, col, status}
    var treeNodes = {};
    var rootId = null;

    // Stack of node IDs for current path
    var nodePath = [];

    function snapshot(board) {
      var copy = [];
      for (var i = 0; i < n; i++) {
        copy.push(board[i] !== undefined ? board[i] : -1);
      }
      return copy;
    }

    function solve(row) {
      if (row === n) {
        // Found a solution
        stepCount++;
        steps.push({
          type: "solution",
          row: row - 1,
          col: board[row - 1],
          board: snapshot(board),
          stepCount: stepCount,
          backtracks: backtracks,
          conflictCells: [],
          treeNode:
            nodePath.length > 0
              ? Object.assign({}, treeNodes[nodePath[nodePath.length - 1]], {
                  status: "solution",
                })
              : null,
        });
        return true;
      }

      for (var col = 0; col < n; col++) {
        stepCount++;
        var nodeId = ++nodeIdCounter;
        var parentId =
          nodePath.length > 0 ? nodePath[nodePath.length - 1] : null;
        if (rootId === null) rootId = nodeId;

        var treeNode = {
          id: nodeId,
          parentId: parentId,
          row: row,
          col: col,
          status: "active",
        };
        treeNodes[nodeId] = treeNode;

        if (isValid(board, row, col, n)) {
          board[row] = col;
          nodePath.push(nodeId);

          // Place step
          steps.push({
            type: "place",
            row: row,
            col: col,
            board: snapshot(board),
            stepCount: stepCount,
            backtracks: backtracks,
            conflictCells: [],
            treeNode: Object.assign({}, treeNode, { status: "active" }),
          });

          var found = solve(row + 1);
          if (found) return true;

          // Backtrack
          backtracks++;
          stepCount++;
          treeNodes[nodeId].status = "pruned";
          nodePath.pop();
          board[row] = -1;

          steps.push({
            type: "backtrack",
            row: row,
            col: col,
            board: snapshot(board),
            stepCount: stepCount,
            backtracks: backtracks,
            conflictCells: [],
            treeNode: Object.assign({}, treeNode, { status: "pruned" }),
          });
        } else {
          // Conflict step
          var conflicts = getConflictCells(board, row, col, n);
          treeNodes[nodeId].status = "pruned";

          steps.push({
            type: "conflict",
            row: row,
            col: col,
            board: snapshot(board),
            stepCount: stepCount,
            backtracks: backtracks,
            conflictCells: conflicts,
            treeNode: Object.assign({}, treeNode, { status: "pruned" }),
          });
        }
      }

      return false;
    }

    // Initialize board with -1
    for (var i = 0; i < n; i++) {
      board[i] = -1;
    }

    solve(0);
    return steps;
  }

  /**
   * Solve N-Queens and return count of solutions + first solution.
   * @param {number} n - board size
   * @returns {{ count: number, firstSolution: number[]|null }}
   */
  function solveAll(n) {
    var count = 0;
    var firstSolution = null;
    var board = [];

    for (var i = 0; i < n; i++) {
      board[i] = -1;
    }

    function solve(row) {
      if (row === n) {
        count++;
        if (firstSolution === null) {
          firstSolution = board.slice();
        }
        return;
      }
      for (var col = 0; col < n; col++) {
        if (isValid(board, row, col, n)) {
          board[row] = col;
          solve(row + 1);
          board[row] = -1;
        }
      }
    }

    solve(0);
    return { count: count, firstSolution: firstSolution };
  }

  // Node.js compatibility: export for test runner
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      isValid: isValid,
      generateSteps: generateSteps,
      solveAll: solveAll,
      getConflictCells: getConflictCells,
    };
  }

  return {
    isValid: isValid,
    generateSteps: generateSteps,
    solveAll: solveAll,
    getConflictCells: getConflictCells,
  };
})();

// ESM default export for Vite/React wrappers.
export default NQueensAlgorithm;
