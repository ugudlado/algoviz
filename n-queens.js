(function () {
  "use strict";

  // ============================================================
  // State
  // ============================================================

  let steps = [];
  let currentStep = -1;
  let playInterval = null;
  let boardSize = 8;
  let totalSolutions = 0;
  let isPlaying = false;

  // ============================================================
  // DOM references
  // ============================================================

  const boardEl = document.getElementById("nqBoard");
  const infoEl = document.getElementById("nqInfo");
  const btnSolve = document.getElementById("nqBtnSolve");
  const btnReset = document.getElementById("nqBtnReset");
  const btnPlay = document.getElementById("nqBtnPlay");
  const btnPause = document.getElementById("nqBtnPause");
  const btnStepBack = document.getElementById("nqBtnStepBack");
  const btnStepFwd = document.getElementById("nqBtnStepFwd");
  const stepCounterEl = document.getElementById("nqStepCounter");
  const speedSlider = document.getElementById("nqSpeed");
  const speedLabelEl = document.getElementById("nqSpeedLabel");
  const boardSizeSelect = document.getElementById("nqBoardSize");
  const statSteps = document.getElementById("nqStatSteps");
  const statBacktracks = document.getElementById("nqStatBacktracks");
  const statSolutions = document.getElementById("nqStatSolutions");
  const treeContainer = document.getElementById("nqTreeContainer");

  // ============================================================
  // DOM helpers
  // ============================================================

  /**
   * Remove all children of an element safely.
   * @param {Element} el
   */
  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  // ============================================================
  // Board rendering
  // ============================================================

  /**
   * Build the empty chessboard grid for the current boardSize.
   */
  function buildBoard() {
    boardEl.style.gridTemplateColumns = "repeat(" + boardSize + ", 1fr)";

    // Determine cell size based on board size
    const cellSize = Math.max(28, Math.min(64, Math.floor(480 / boardSize)));

    clearChildren(boardEl);
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const cell = document.createElement("div");
        cell.className =
          "nq-cell " + ((r + c) % 2 === 0 ? "nq-cell-light" : "nq-cell-dark");
        cell.style.width = cellSize + "px";
        cell.style.height = cellSize + "px";
        cell.dataset.row = r;
        cell.dataset.col = c;
        boardEl.appendChild(cell);
      }
    }
  }

  /**
   * Render the board state from a step object.
   * @param {Object} step
   */
  function renderStep(step) {
    const isSolution = step.type === "solution";

    // Build sets for quick lookup
    const conflictSet = new Set();
    if (step.conflictCells) {
      step.conflictCells.forEach(function (cell) {
        conflictSet.add(cell.row + "," + cell.col);
      });
    }

    // Compute attacked squares for the current queen being placed/conflicting
    const attackedSet = new Set();
    if (step.type === "place" || step.type === "conflict") {
      const r = step.row;
      const c = step.col;
      for (let i = 0; i < boardSize; i++) {
        attackedSet.add(r + "," + i);
        attackedSet.add(i + "," + c);
        if (r + i < boardSize && c + i < boardSize)
          attackedSet.add(r + i + "," + (c + i));
        if (r + i < boardSize && c - i >= 0)
          attackedSet.add(r + i + "," + (c - i));
        if (r - i >= 0 && c + i < boardSize)
          attackedSet.add(r - i + "," + (c + i));
        if (r - i >= 0 && c - i >= 0) attackedSet.add(r - i + "," + (c - i));
      }
    }

    const cells = boardEl.querySelectorAll(".nq-cell");
    cells.forEach(function (cell) {
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      const isLight = (r + c) % 2 === 0;
      const key = r + "," + c;

      const hasQueen = step.board[r] === c;
      const isActiveQueen = r === step.row && c === step.col;
      const isConflictingExisting = conflictSet.has(key);

      let baseClass = isLight ? "nq-cell-light" : "nq-cell-dark";

      if (isSolution && hasQueen) {
        baseClass = "nq-cell-solution-queen";
      } else if (step.type === "conflict" && isActiveQueen) {
        baseClass = isLight
          ? "nq-cell-conflict-light"
          : "nq-cell-conflict-dark";
      } else if (isConflictingExisting) {
        baseClass = isLight
          ? "nq-cell-conflict-light"
          : "nq-cell-conflict-dark";
      } else if (step.type === "place" && isActiveQueen && hasQueen) {
        baseClass = "nq-cell-queen";
      } else if (hasQueen) {
        baseClass = isSolution ? "nq-cell-solution-queen" : "nq-cell-queen";
      } else if (
        step.type !== "backtrack" &&
        attackedSet.has(key) &&
        !hasQueen
      ) {
        baseClass = isLight
          ? "nq-cell-attacked-light"
          : "nq-cell-attacked-dark";
      }

      cell.className = "nq-cell " + baseClass;
      cell.textContent = hasQueen ? "\u265B" : "";
    });
  }

  // ============================================================
  // Recursion tree rendering
  // ============================================================

  /**
   * Render a simple SVG recursion tree for all steps up to currentStep.
   */
  function renderTree() {
    // Build a map of tree nodes from steps 0..currentStep
    const nodeMap = {};
    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i];
      if (!s.treeNode) continue;
      const tn = s.treeNode;
      nodeMap[tn.id] = {
        id: tn.id,
        parentId: tn.parentId,
        row: tn.row,
        col: tn.col,
        status: tn.status,
        stepType: s.type,
      };
    }

    const nodes = Object.values(nodeMap);
    if (nodes.length === 0) {
      clearChildren(treeContainer);
      const p = document.createElement("p");
      p.className = "nq-tree-empty";
      p.textContent = "Press Solve to see the recursion tree.";
      treeContainer.appendChild(p);
      return;
    }

    // Group by row (depth level)
    const byRow = {};
    nodes.forEach(function (n) {
      if (!byRow[n.row]) byRow[n.row] = [];
      byRow[n.row].push(n);
    });

    const rows = Object.keys(byRow)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    const maxRow = rows[rows.length - 1];
    const nodeSpacing = 38;
    const rowHeight = 48;
    const nodeRadius = 13;
    const svgPadding = 20;

    // Assign x positions within each row
    const posMap = {};
    rows.forEach(function (row) {
      const rowNodes = byRow[row];
      rowNodes.forEach(function (n, i) {
        posMap[n.id] = {
          x: svgPadding + i * nodeSpacing,
          y: svgPadding + row * rowHeight,
        };
      });
    });

    // Calculate SVG dimensions
    let maxX = 0;
    Object.values(posMap).forEach(function (p) {
      if (p.x > maxX) maxX = p.x;
    });
    const svgWidth = Math.max(200, maxX + svgPadding + nodeRadius);
    const svgHeight = (maxRow + 1) * rowHeight + svgPadding * 2;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("class", "nq-tree-svg");

    // Draw edges first
    nodes.forEach(function (n) {
      if (n.parentId == null) return;
      const pp = posMap[n.parentId];
      const cp = posMap[n.id];
      if (!pp || !cp) return;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", pp.x);
      line.setAttribute("y1", pp.y);
      line.setAttribute("x2", cp.x);
      line.setAttribute("y2", cp.y);
      line.setAttribute("stroke", n.status === "pruned" ? "#444" : "#58a6ff44");
      line.setAttribute("stroke-width", "1.5");
      svg.appendChild(line);
    });

    // Draw nodes
    nodes.forEach(function (n) {
      const pos = posMap[n.id];
      if (!pos) return;

      let fillColor = "#21262d";
      let strokeColor = "#30363d";
      if (n.status === "solution") {
        fillColor = "#1a4a2a";
        strokeColor = "#3fb950";
      } else if (n.status === "active") {
        fillColor = "#1b2d4a";
        strokeColor = "#58a6ff";
      } else if (n.status === "pruned") {
        fillColor = "#0d1117";
        strokeColor = "#444";
      }

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", nodeRadius);
      circle.setAttribute("fill", fillColor);
      circle.setAttribute("stroke", strokeColor);
      circle.setAttribute("stroke-width", "1.5");
      svg.appendChild(circle);

      // Label: show column index
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", pos.x);
      text.setAttribute("y", pos.y + 4);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "10");
      text.setAttribute("fill", n.status === "pruned" ? "#555" : "#ccc");
      text.setAttribute("font-family", "monospace");
      text.textContent = n.col;
      svg.appendChild(text);
    });

    clearChildren(treeContainer);
    treeContainer.appendChild(svg);
  }

  // ============================================================
  // Step info text
  // ============================================================

  function getStepDescription(step) {
    switch (step.type) {
      case "place":
        return (
          "Placing queen at row " +
          (step.row + 1) +
          ", col " +
          (step.col + 1) +
          ". No conflict \u2014 moving to next row."
        );
      case "conflict":
        return (
          "Conflict at row " +
          (step.row + 1) +
          ", col " +
          (step.col + 1) +
          ". Trying next column."
        );
      case "backtrack":
        return (
          "Backtracking from row " +
          (step.row + 1) +
          ". All columns exhausted \u2014 removing queen."
        );
      case "solution":
        return (
          "Solution found! All " +
          boardSize +
          " queens placed without conflict."
        );
      default:
        return "";
    }
  }

  // ============================================================
  // Navigation
  // ============================================================

  function goToStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    currentStep = idx;
    const step = steps[currentStep];
    renderStep(step);
    renderTree();
    updateUI();
  }

  function updateUI() {
    const step = currentStep >= 0 ? steps[currentStep] : null;

    stepCounterEl.textContent =
      "Step: " + (currentStep + 1) + " / " + steps.length;

    if (step) {
      infoEl.textContent = getStepDescription(step);
      statSteps.textContent = step.stepCount;
      statBacktracks.textContent = step.backtracks;
    }

    btnStepBack.disabled = currentStep <= 0 || isPlaying;
    btnStepFwd.disabled = currentStep >= steps.length - 1 || isPlaying;
    btnPlay.disabled = currentStep >= steps.length - 1 || isPlaying;
    btnPause.disabled = !isPlaying;
  }

  function getSpeed() {
    const val = parseInt(speedSlider.value, 10);
    // Speed 1 = 1200ms, Speed 10 = 50ms
    return Math.round(1200 - (val - 1) * (1150 / 9));
  }

  function startPlay() {
    if (isPlaying) return;
    if (currentStep >= steps.length - 1) return;
    isPlaying = true;
    updateUI();

    function tick() {
      if (currentStep >= steps.length - 1) {
        stopPlay();
        return;
      }
      goToStep(currentStep + 1);
      playInterval = setTimeout(tick, getSpeed());
    }
    playInterval = setTimeout(tick, getSpeed());
  }

  function stopPlay() {
    isPlaying = false;
    if (playInterval !== null) {
      clearTimeout(playInterval);
      playInterval = null;
    }
    updateUI();
  }

  // ============================================================
  // Solve
  // ============================================================

  function solve() {
    stopPlay();
    boardSize = parseInt(boardSizeSelect.value, 10);

    // Compute total solutions (for display) using pure algorithm
    const result = NQueensAlgorithm.solveAll(boardSize);
    totalSolutions = result.count;
    statSolutions.textContent = totalSolutions;

    // Generate visualization steps
    steps = NQueensAlgorithm.generateSteps(boardSize);
    currentStep = -1;

    buildBoard();

    clearChildren(treeContainer);
    const emptyP = document.createElement("p");
    emptyP.className = "nq-tree-empty";
    emptyP.textContent = "Press Play to see the recursion tree.";
    treeContainer.appendChild(emptyP);

    infoEl.textContent =
      "Ready. " +
      steps.length +
      " steps to show. N=" +
      boardSize +
      " has " +
      totalSolutions +
      " solution" +
      (totalSolutions !== 1 ? "s" : "") +
      ".";
    stepCounterEl.textContent = "Step: 0 / " + steps.length;

    statSteps.textContent = "\u2014";
    statBacktracks.textContent = "\u2014";

    btnStepBack.disabled = true;
    btnStepFwd.disabled = false;
    btnPlay.disabled = false;
    btnPause.disabled = true;
  }

  // ============================================================
  // Reset
  // ============================================================

  function reset() {
    stopPlay();
    steps = [];
    currentStep = -1;
    buildBoard();
    infoEl.textContent =
      "Select a board size and press Solve to watch the backtracking algorithm find solutions.";
    stepCounterEl.textContent = "Step: 0 / 0";
    statSteps.textContent = "\u2014";
    statBacktracks.textContent = "\u2014";
    statSolutions.textContent = "\u2014";
    clearChildren(treeContainer);
    const emptyP = document.createElement("p");
    emptyP.className = "nq-tree-empty";
    emptyP.textContent = "Press Solve to see the recursion tree.";
    treeContainer.appendChild(emptyP);
    btnStepBack.disabled = true;
    btnStepFwd.disabled = true;
    btnPlay.disabled = true;
    btnPause.disabled = true;
  }

  // ============================================================
  // Event listeners
  // ============================================================

  btnSolve.addEventListener("click", function () {
    solve();
  });

  btnReset.addEventListener("click", function () {
    reset();
  });

  btnPlay.addEventListener("click", function () {
    if (steps.length === 0) {
      solve();
    }
    if (currentStep < 0) {
      goToStep(0);
    }
    startPlay();
  });

  btnPause.addEventListener("click", function () {
    stopPlay();
  });

  btnStepBack.addEventListener("click", function () {
    goToStep(currentStep - 1);
  });

  btnStepFwd.addEventListener("click", function () {
    if (steps.length === 0) {
      solve();
      goToStep(0);
      return;
    }
    if (currentStep < 0) {
      goToStep(0);
    } else {
      goToStep(currentStep + 1);
    }
  });

  speedSlider.addEventListener("input", function () {
    speedLabelEl.textContent = speedSlider.value;
  });

  boardSizeSelect.addEventListener("change", function () {
    reset();
  });

  // ============================================================
  // Cleanup on page unload
  // ============================================================

  window.addEventListener("beforeunload", function () {
    stopPlay();
  });

  // ============================================================
  // Init
  // ============================================================

  buildBoard();
})();
