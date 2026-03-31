/**
 * Minimax with Alpha-Beta Pruning — Tic-Tac-Toe
 *
 * Pure functions — no DOM dependency.
 * Implements:
 *   1. checkWinner — determine game result from board state
 *   2. getAvailableMoves — list empty board cells
 *   3. minimax — recursive search with optional alpha-beta pruning
 *   4. getBestMove — entry point returning best move + tree for visualization
 *
 * Alpha-beta pruning reduces nodes evaluated from O(b^d) to O(b^(d/2))
 * by cutting branches that cannot affect the final decision.
 */
var MinimaxAlgorithm = (function () {
  "use strict";

  // Win condition lines: rows, columns, diagonals
  var WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  /**
   * Determine the winner of a tic-tac-toe board.
   *
   * @param {Array<string|null>} board - 9-element array, each 'X', 'O', or null
   * @returns {'X'|'O'|'draw'|null} winner, 'draw' if full and no winner, null if ongoing
   */
  function checkWinner(board) {
    var i, line, a, b, c;
    for (i = 0; i < WIN_LINES.length; i++) {
      line = WIN_LINES[i];
      a = line[0];
      b = line[1];
      c = line[2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    // Check for draw (no nulls, no winner)
    var isFull = true;
    for (i = 0; i < board.length; i++) {
      if (board[i] === null) {
        isFull = false;
        break;
      }
    }
    if (isFull) return "draw";
    return null;
  }

  /**
   * Get all empty cell indices.
   *
   * @param {Array<string|null>} board
   * @returns {number[]}
   */
  function getAvailableMoves(board) {
    var moves = [];
    var i;
    for (i = 0; i < board.length; i++) {
      if (board[i] === null) moves.push(i);
    }
    return moves;
  }

  /**
   * Minimax algorithm with optional alpha-beta pruning.
   * Maximizer plays 'X', minimizer plays 'O'.
   *
   * @param {Array<string|null>} board - current board state (will not be mutated)
   * @param {boolean} isMaximizing - true if current player is X (maximizer)
   * @param {number} alpha - best score maximizer can guarantee (default -Infinity)
   * @param {number} beta - best score minimizer can guarantee (default +Infinity)
   * @param {boolean} usePruning - whether to apply alpha-beta cutoffs
   * @param {number} depth - current recursion depth (used for scoring)
   * @returns {{
   *   score: number,
   *   move: number|null,
   *   nodesEvaluated: number,
   *   tree: {
   *     board: Array<string|null>,
   *     move: number|null,
   *     player: string,
   *     score: number|null,
   *     alpha: number,
   *     beta: number,
   *     pruned: boolean,
   *     children: Array
   *   }
   * }}
   */
  function minimax(board, isMaximizing, alpha, beta, usePruning, depth) {
    var d = typeof depth === "number" ? depth : 0;
    var winner = checkWinner(board);
    var player = isMaximizing ? "X" : "O";

    // Terminal states — score relative to depth (prefer faster wins)
    if (winner === "X") {
      return {
        score: 10 - d,
        move: null,
        nodesEvaluated: 1,
        tree: {
          board: board.slice(),
          move: null,
          player: player,
          score: 10 - d,
          alpha: alpha,
          beta: beta,
          pruned: false,
          children: [],
        },
      };
    }
    if (winner === "O") {
      return {
        score: d - 10,
        move: null,
        nodesEvaluated: 1,
        tree: {
          board: board.slice(),
          move: null,
          player: player,
          score: d - 10,
          alpha: alpha,
          beta: beta,
          pruned: false,
          children: [],
        },
      };
    }
    if (winner === "draw") {
      return {
        score: 0,
        move: null,
        nodesEvaluated: 1,
        tree: {
          board: board.slice(),
          move: null,
          player: player,
          score: 0,
          alpha: alpha,
          beta: beta,
          pruned: false,
          children: [],
        },
      };
    }

    var moves = getAvailableMoves(board);
    var bestMove = null;
    var totalNodes = 1; // count this node
    var children = [];
    var currentAlpha = alpha;
    var currentBeta = beta;

    if (isMaximizing) {
      var bestScore = -Infinity;
      var i, move, newBoard, result;
      for (i = 0; i < moves.length; i++) {
        move = moves[i];
        newBoard = board.slice();
        newBoard[move] = "X";
        result = minimax(
          newBoard,
          false,
          currentAlpha,
          currentBeta,
          usePruning,
          d + 1,
        );
        result.tree.move = move;
        totalNodes += result.nodesEvaluated;

        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }

        children.push(result.tree);

        if (usePruning) {
          if (result.score > currentAlpha) currentAlpha = result.score;
          if (currentBeta <= currentAlpha) {
            // Mark remaining moves as pruned
            var j;
            for (j = i + 1; j < moves.length; j++) {
              var prunedBoard = board.slice();
              prunedBoard[moves[j]] = "X";
              children.push({
                board: prunedBoard,
                move: moves[j],
                player: "O",
                score: null,
                alpha: currentAlpha,
                beta: currentBeta,
                pruned: true,
                children: [],
              });
            }
            break; // beta cut-off
          }
        }
      }
      return {
        score: bestScore,
        move: bestMove,
        nodesEvaluated: totalNodes,
        tree: {
          board: board.slice(),
          move: null,
          player: player,
          score: bestScore,
          alpha: currentAlpha,
          beta: currentBeta,
          pruned: false,
          children: children,
        },
      };
    } else {
      // Minimizing (O)
      var bestScoreMin = Infinity;
      var iMin, moveMin, newBoardMin, resultMin;
      for (iMin = 0; iMin < moves.length; iMin++) {
        moveMin = moves[iMin];
        newBoardMin = board.slice();
        newBoardMin[moveMin] = "O";
        resultMin = minimax(
          newBoardMin,
          true,
          currentAlpha,
          currentBeta,
          usePruning,
          d + 1,
        );
        resultMin.tree.move = moveMin;
        totalNodes += resultMin.nodesEvaluated;

        if (resultMin.score < bestScoreMin) {
          bestScoreMin = resultMin.score;
          bestMove = moveMin;
        }

        children.push(resultMin.tree);

        if (usePruning) {
          if (resultMin.score < currentBeta) currentBeta = resultMin.score;
          if (currentBeta <= currentAlpha) {
            // Mark remaining moves as pruned
            var jMin;
            for (jMin = iMin + 1; jMin < moves.length; jMin++) {
              var prunedBoardMin = board.slice();
              prunedBoardMin[moves[jMin]] = "O";
              children.push({
                board: prunedBoardMin,
                move: moves[jMin],
                player: "X",
                score: null,
                alpha: currentAlpha,
                beta: currentBeta,
                pruned: true,
                children: [],
              });
            }
            break; // alpha cut-off
          }
        }
      }
      return {
        score: bestScoreMin,
        move: bestMove,
        nodesEvaluated: totalNodes,
        tree: {
          board: board.slice(),
          move: null,
          player: player,
          score: bestScoreMin,
          alpha: currentAlpha,
          beta: currentBeta,
          pruned: false,
          children: children,
        },
      };
    }
  }

  /**
   * Get the best move for a player given the current board.
   * Returns both the result with and without pruning for comparison.
   *
   * @param {Array<string|null>} board
   * @param {'X'|'O'} player - the AI player
   * @param {boolean} usePruning
   * @returns {{
   *   move: number,
   *   tree: object,
   *   nodesWithPruning: number,
   *   nodesWithoutPruning: number
   * }}
   */
  function getBestMove(board, player, usePruning) {
    var isMaximizing = player === "X";

    // Always compute without pruning for comparison count
    var resultNoPruning = minimax(
      board,
      isMaximizing,
      -Infinity,
      Infinity,
      false,
      0,
    );
    var nodesWithoutPruning = resultNoPruning.nodesEvaluated;

    if (usePruning) {
      var resultWithPruning = minimax(
        board,
        isMaximizing,
        -Infinity,
        Infinity,
        true,
        0,
      );
      return {
        move: resultWithPruning.move,
        tree: resultWithPruning.tree,
        nodesWithPruning: resultWithPruning.nodesEvaluated,
        nodesWithoutPruning: nodesWithoutPruning,
      };
    }

    return {
      move: resultNoPruning.move,
      tree: resultNoPruning.tree,
      nodesWithPruning: resultNoPruning.nodesEvaluated,
      nodesWithoutPruning: nodesWithoutPruning,
    };
  }

  function findWinLine(board, winner) {
    if (!winner || winner === "draw") return null;
    for (var i = 0; i < WIN_LINES.length; i++) {
      var line = WIN_LINES[i];
      if (
        board[line[0]] &&
        board[line[0]] === board[line[1]] &&
        board[line[0]] === board[line[2]]
      ) {
        if (board[line[0]] === winner) return line;
      }
    }
    return null;
  }

  return {
    WIN_LINES: WIN_LINES,
    checkWinner: checkWinner,
    getAvailableMoves: getAvailableMoves,
    minimax: minimax,
    getBestMove: getBestMove,
    findWinLine: findWinLine,
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = MinimaxAlgorithm;
}

export default MinimaxAlgorithm;
