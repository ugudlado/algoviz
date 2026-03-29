(function () {
  "use strict";

  // ============================================================
  // State
  // ============================================================

  // board: 9-element array of 'X', 'O', or null
  let board = Array(9).fill(null);
  let humanPlayer = "X"; // human always plays first by default
  let aiPlayer = "O";
  let usePruning = true;
  let gameOver = false;
  let aiFirst = false;
  let treeData = null;
  let stepTimers = [];

  // Step-through state
  let stepNodes = []; // flattened tree nodes in traversal order
  let stepIndex = -1;
  let stepPlayInterval = null;
  let stepSpeed = 5; // 1-10

  // ============================================================
  // DOM references
  // ============================================================

  const cells = Array.from(document.querySelectorAll(".mm-cell"));
  const statusEl = document.getElementById("mmStatus");
  const btnNewGame = document.getElementById("mmBtnNewGame");
  const btnAiFirst = document.getElementById("mmBtnAiFirst");
  const btnPruning = document.getElementById("mmBtnPruning");
  const speedSlider = document.getElementById("mmSpeed");
  const speedLabel = document.getElementById("mmSpeedLabel");
  const treeContainer = document.getElementById("mmTreeContainer");
  const statWithPruning = document.getElementById("mmStatWithPruning");
  const statWithoutPruning = document.getElementById("mmStatWithoutPruning");
  const statSaved = document.getElementById("mmStatSaved");
  const btnStepBack = document.getElementById("mmBtnStepBack");
  const btnStepPlay = document.getElementById("mmBtnStepPlay");
  const btnStepPause = document.getElementById("mmBtnStepPause");
  const btnStepNext = document.getElementById("mmBtnStepNext");
  const stepInfo = document.getElementById("mmStepInfo");

  // ============================================================
  // Game Logic (calls MinimaxAlgorithm module — DRY)
  // ============================================================

  function checkWinner(b) {
    return MinimaxAlgorithm.checkWinner(b);
  }

  function getAvailableMoves(b) {
    return MinimaxAlgorithm.getAvailableMoves(b);
  }

  function computeAiMove() {
    return MinimaxAlgorithm.getBestMove(board, aiPlayer, usePruning);
  }

  // ============================================================
  // Board Rendering
  // ============================================================

  function renderBoard(winLine) {
    cells.forEach(function (cell, idx) {
      const val = board[idx];
      cell.textContent = val || "";
      cell.className = "mm-cell";
      if (val === "X") cell.classList.add("mm-cell-x");
      if (val === "O") cell.classList.add("mm-cell-o");
      if (val !== null) cell.classList.add("mm-cell-filled");
      if (gameOver || val !== null) cell.classList.add("mm-cell-disabled");
      if (winLine && winLine.indexOf(idx) >= 0)
        cell.classList.add("mm-cell-win");
    });
  }

  function findWinLine(b, winner) {
    return MinimaxAlgorithm.findWinLine(b, winner);
  }

  // ============================================================
  // Status Display
  // ============================================================

  function setStatus(msg, cls) {
    statusEl.textContent = msg;
    statusEl.className = "mm-status" + (cls ? " " + cls : "");
  }

  // ============================================================
  // Stats Display
  // ============================================================

  function updateStats(withPruning, withoutPruning) {
    const saved = withoutPruning - withPruning;
    statWithPruning.textContent = withPruning;
    statWithoutPruning.textContent = withoutPruning;
    statSaved.textContent = saved >= 0 ? saved : 0;
  }

  function clearStats() {
    statWithPruning.textContent = "—";
    statWithoutPruning.textContent = "—";
    statSaved.textContent = "—";
  }

  // ============================================================
  // Tree Visualization
  // ============================================================

  function clearTree() {
    treeContainer.textContent = "";
    const empty = document.createElement("p");
    empty.className = "mm-tree-empty";
    empty.textContent = "Make a move to see the game tree.";
    treeContainer.appendChild(empty);
  }

  function scoreClass(score) {
    if (score === null) return "mm-tree-score-pruned";
    if (score > 0) return "mm-tree-score-pos";
    if (score < 0) return "mm-tree-score-neg";
    return "mm-tree-score-zero";
  }

  function scoreLabel(score) {
    if (score === null) return "pruned";
    if (score === 0) return "0 (draw)";
    return (score > 0 ? "+" : "") + score;
  }

  function buildMiniBoard(b, movedIdx) {
    const grid = document.createElement("div");
    grid.className = "mm-mini-board";
    b.forEach(function (val, idx) {
      const cell = document.createElement("div");
      cell.className = "mm-mini-cell";
      if (val === "X") cell.classList.add("mm-mini-cell-x");
      if (val === "O") cell.classList.add("mm-mini-cell-o");
      if (idx === movedIdx) cell.classList.add("mm-mini-cell-highlight");
      cell.textContent = val || "";
      grid.appendChild(cell);
    });
    return grid;
  }

  // Flatten tree into an ordered array for step-through
  function flattenTree(node, out) {
    out.push(node);
    if (node.children) {
      node.children.forEach(function (child) {
        flattenTree(child, out);
      });
    }
  }

  // Build a DOM tree node element
  function buildTreeNodeEl(node, depth) {
    const wrapper = document.createElement("div");
    wrapper.className = "mm-tree-node";
    wrapper.dataset.nodeId = node._id || "";

    // Box
    const box = document.createElement("div");
    box.className = "mm-tree-box";
    if (node.pruned) {
      box.classList.add("mm-tree-box-pruned");
    } else {
      // Determine if maximizer or minimizer based on player
      if (node.player === "X") {
        box.classList.add("mm-tree-box-maximizer");
      } else {
        box.classList.add("mm-tree-box-minimizer");
      }
      // Terminal state styling
      if (!node.children || node.children.length === 0) {
        if (node.score !== null) {
          if (node.score > 0) box.classList.add("mm-tree-box-terminal-win");
          else if (node.score < 0)
            box.classList.add("mm-tree-box-terminal-lose");
          else box.classList.add("mm-tree-box-terminal-draw");
        }
      }
    }

    // Player label
    const playerLabel = document.createElement("div");
    playerLabel.className =
      "mm-tree-player " +
      (node.player === "X" ? "mm-tree-player-max" : "mm-tree-player-min");
    playerLabel.textContent = node.player === "X" ? "MAX (X)" : "MIN (O)";
    box.appendChild(playerLabel);

    // Mini board
    box.appendChild(buildMiniBoard(node.board, node.move));

    // Move label
    if (node.move !== null && node.move !== undefined) {
      const moveEl = document.createElement("div");
      moveEl.className = "mm-tree-move";
      moveEl.textContent = "move: " + node.move;
      box.appendChild(moveEl);
    }

    // Score
    const scoreEl = document.createElement("div");
    scoreEl.className = "mm-tree-score " + scoreClass(node.score);
    scoreEl.textContent = scoreLabel(node.score);
    box.appendChild(scoreEl);

    // Alpha-beta values (only when pruning is on)
    if (usePruning && !node.pruned) {
      const abEl = document.createElement("div");
      abEl.className = "mm-tree-ab";
      const alphaStr = isFinite(node.alpha)
        ? node.alpha
        : node.alpha > 0
          ? "+inf"
          : "-inf";
      const betaStr = isFinite(node.beta)
        ? node.beta
        : node.beta > 0
          ? "+inf"
          : "-inf";
      abEl.textContent = "α:" + alphaStr + " β:" + betaStr;
      box.appendChild(abEl);
    }

    wrapper.appendChild(box);

    // Children
    const visibleChildren = (node.children || []).filter(function (c) {
      return !c.pruned || usePruning;
    });

    if (visibleChildren.length > 0 && depth < 3) {
      const childRow = document.createElement("div");
      childRow.className = "mm-tree-children";
      visibleChildren.forEach(function (child) {
        childRow.appendChild(buildTreeNodeEl(child, depth + 1));
      });
      wrapper.appendChild(childRow);
    } else if (visibleChildren.length > 0) {
      // Collapsed — show toggle
      const toggle = document.createElement("div");
      toggle.className = "mm-tree-toggle";
      toggle.textContent = "+" + visibleChildren.length + " more";
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        const childRow = document.createElement("div");
        childRow.className = "mm-tree-children";
        visibleChildren.forEach(function (child) {
          childRow.appendChild(buildTreeNodeEl(child, depth + 1));
        });
        wrapper.replaceChild(childRow, toggle);
      });
      wrapper.appendChild(toggle);
    }

    return wrapper;
  }

  function renderTree(tree) {
    treeContainer.textContent = "";
    if (!tree) {
      clearTree();
      return;
    }

    // Assign IDs for step-through
    let idCounter = 0;
    function assignIds(node) {
      node._id = idCounter++;
      if (node.children) node.children.forEach(assignIds);
    }
    assignIds(tree);

    // Flatten for step-through
    stepNodes = [];
    flattenTree(tree, stepNodes);
    stepIndex = -1;
    updateStepControls();

    const el = buildTreeNodeEl(tree, 0);
    treeContainer.appendChild(el);
  }

  // ============================================================
  // Step-Through
  // ============================================================

  function stepDelay() {
    return Math.round(1200 / stepSpeed);
  }

  function highlightStep(idx) {
    // Remove previous highlight
    const prev = treeContainer.querySelector(".mm-tree-box-active");
    if (prev) prev.classList.remove("mm-tree-box-active");

    if (idx < 0 || idx >= stepNodes.length) return;
    const node = stepNodes[idx];
    const el = treeContainer.querySelector(
      "[data-node-id='" + node._id + "'] > .mm-tree-box",
    );
    if (el) {
      el.classList.add("mm-tree-box-active");
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }

    const info = node.pruned
      ? "Pruned branch — not evaluated (α-β cutoff)"
      : node.score !== null
        ? "Score: " +
          scoreLabel(node.score) +
          " | Player: " +
          (node.player === "X" ? "MAX" : "MIN")
        : "Evaluating...";
    stepInfo.textContent =
      "Node " + (idx + 1) + "/" + stepNodes.length + ": " + info;
  }

  function updateStepControls() {
    btnStepBack.disabled = stepNodes.length === 0 || stepIndex <= 0;
    btnStepNext.disabled =
      stepNodes.length === 0 || stepIndex >= stepNodes.length - 1;
    btnStepPlay.disabled =
      stepNodes.length === 0 || stepIndex >= stepNodes.length - 1;
    btnStepPause.disabled = stepPlayInterval === null;
    if (stepNodes.length === 0) {
      stepInfo.textContent = "Run a game to enable step-through.";
    }
  }

  function stopStepPlay() {
    if (stepPlayInterval !== null) {
      clearInterval(stepPlayInterval);
      stepPlayInterval = null;
    }
    updateStepControls();
  }

  btnStepNext.addEventListener("click", function () {
    stopStepPlay();
    if (stepIndex < stepNodes.length - 1) {
      stepIndex++;
      highlightStep(stepIndex);
      updateStepControls();
    }
  });

  btnStepBack.addEventListener("click", function () {
    stopStepPlay();
    if (stepIndex > 0) {
      stepIndex--;
      highlightStep(stepIndex);
      updateStepControls();
    }
  });

  btnStepPlay.addEventListener("click", function () {
    if (stepNodes.length === 0) return;
    if (stepIndex >= stepNodes.length - 1) stepIndex = -1;
    stopStepPlay();
    stepPlayInterval = setInterval(function () {
      if (stepIndex >= stepNodes.length - 1) {
        stopStepPlay();
        return;
      }
      stepIndex++;
      highlightStep(stepIndex);
      updateStepControls();
    }, stepDelay());
    updateStepControls();
  });

  btnStepPause.addEventListener("click", function () {
    stopStepPlay();
  });

  // ============================================================
  // AI Move
  // ============================================================

  function clearAllTimers() {
    stepTimers.forEach(clearTimeout);
    stepTimers = [];
    stopStepPlay();
  }

  function applyAiMove() {
    if (gameOver) return;
    const moves = getAvailableMoves(board);
    if (moves.length === 0) return;

    const result = computeAiMove();
    treeData = result.tree;

    updateStats(result.nodesWithPruning, result.nodesWithoutPruning);
    renderTree(treeData);

    if (result.move === null) return;

    // Animate the AI move with a small delay
    const t = setTimeout(function () {
      board[result.move] = aiPlayer;
      const winner = checkWinner(board);
      const winLine = findWinLine(board, winner);
      renderBoard(winLine);

      if (winner === aiPlayer) {
        setStatus("AI wins! Better luck next time.", "mm-status-lose");
        gameOver = true;
        renderBoard(winLine);
      } else if (winner === "draw") {
        setStatus("It's a draw!", "mm-status-draw");
        gameOver = true;
      } else {
        setStatus("Your turn — click a cell to play.");
      }

      // Add AI pulse class
      cells[result.move].classList.add("mm-cell-ai");
    }, 300);
    stepTimers.push(t);
  }

  // ============================================================
  // Human Move
  // ============================================================

  cells.forEach(function (cell, idx) {
    cell.addEventListener("click", function () {
      if (gameOver || board[idx] !== null) return;

      board[idx] = humanPlayer;
      const winner = checkWinner(board);
      const winLine = findWinLine(board, winner);
      renderBoard(winLine);

      if (winner === humanPlayer) {
        setStatus("You win!", "mm-status-win");
        gameOver = true;
        return;
      }
      if (winner === "draw") {
        setStatus("It's a draw!", "mm-status-draw");
        gameOver = true;
        return;
      }

      setStatus("AI is thinking...");
      applyAiMove();
    });
  });

  // ============================================================
  // New Game
  // ============================================================

  function newGame() {
    clearAllTimers();
    board = Array(9).fill(null);
    gameOver = false;
    treeData = null;
    stepNodes = [];
    stepIndex = -1;
    renderBoard(null);
    clearStats();
    clearTree();
    updateStepControls();

    if (aiFirst) {
      setStatus("AI is thinking...");
      // Small delay so UI repaints first
      const t = setTimeout(applyAiMove, 100);
      stepTimers.push(t);
    } else {
      setStatus("Your turn (" + humanPlayer + ") — click a cell to play.");
    }
  }

  btnNewGame.addEventListener("click", newGame);

  // ============================================================
  // AI First Toggle
  // ============================================================

  btnAiFirst.addEventListener("click", function () {
    aiFirst = !aiFirst;
    if (aiFirst) {
      humanPlayer = "O";
      aiPlayer = "X";
      btnAiFirst.classList.add("mm-toggle-active");
    } else {
      humanPlayer = "X";
      aiPlayer = "O";
      btnAiFirst.classList.remove("mm-toggle-active");
    }
    newGame();
  });

  // ============================================================
  // Pruning Toggle
  // ============================================================

  btnPruning.addEventListener("click", function () {
    usePruning = !usePruning;
    if (usePruning) {
      btnPruning.classList.add("mm-toggle-active");
      btnPruning.textContent = "α-β Pruning: ON";
    } else {
      btnPruning.classList.remove("mm-toggle-active");
      btnPruning.textContent = "α-β Pruning: OFF";
    }
    // Re-render tree with updated ab display if tree exists
    if (treeData) {
      renderTree(treeData);
    }
  });

  // ============================================================
  // Speed Slider
  // ============================================================

  speedSlider.addEventListener("input", function () {
    stepSpeed = parseInt(speedSlider.value, 10);
    speedLabel.textContent = stepSpeed;
  });

  // ============================================================
  // Cleanup on unload
  // ============================================================

  window.addEventListener("unload", function () {
    clearAllTimers();
  });

  // ============================================================
  // Init
  // ============================================================

  // Set initial UI state
  btnPruning.classList.add("mm-toggle-active");
  stepSpeed = parseInt(speedSlider.value, 10);
  speedLabel.textContent = stepSpeed;

  updateStepControls();
  newGame();
})();
