(() => {
  "use strict";

  // --- DOM refs ---
  const insertInput = document.getElementById("insertInput");
  const deleteInput = document.getElementById("deleteInput");
  const btnInsert = document.getElementById("btnInsert");
  const btnDelete = document.getElementById("btnDelete");
  const btnRandom = document.getElementById("btnRandom");
  const btnClear = document.getElementById("btnClear");
  const avlInfo = document.getElementById("avlInfo");
  const avlSvg = document.getElementById("avlSvg");
  const avlPlayback = document.getElementById("avlPlayback");
  const btnReset = document.getElementById("btnReset");
  const btnStepBack = document.getElementById("btnStepBack");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");
  const btnStep = document.getElementById("btnStep");
  const speedSlider = document.getElementById("avlSpeed");
  const statNodes = document.getElementById("statNodes");
  const statHeight = document.getElementById("statHeight");
  const statStep = document.getElementById("statStep");

  // --- State ---
  let treeRoot = null;
  let pendingSteps = [];
  let stepIdx = -1;
  let timer = null;
  let isPlaying = false;

  const NODE_RADIUS = 22;
  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 420;
  const VERTICAL_SPACING = 75;
  const MAX_NODES = 20;

  // --- Clear all SVG children ---
  function clearSvg() {
    while (avlSvg.firstChild) {
      avlSvg.removeChild(avlSvg.firstChild);
    }
  }

  // --- Render tree from a root snapshot ---
  function renderTree(rootSnapshot, imbalancedNode, rotatingNodes) {
    imbalancedNode = imbalancedNode || null;
    rotatingNodes = rotatingNodes || [];

    clearSvg();

    if (rootSnapshot === null) return;

    const layout = AVLAlgorithm.getLayout(
      rootSnapshot,
      SVG_WIDTH,
      VERTICAL_SPACING,
    );
    if (layout.nodes.length === 0) return;

    // Draw edges first
    for (let i = 0; i < layout.edges.length; i++) {
      const e = layout.edges[i];
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", e.fromX);
      line.setAttribute("y1", e.fromY);
      line.setAttribute("x2", e.toX);
      line.setAttribute("y2", e.toY);
      line.setAttribute("class", "avl-edge");
      avlSvg.appendChild(line);
    }

    // Draw nodes
    for (let i = 0; i < layout.nodes.length; i++) {
      const n = layout.nodes[i];
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // Determine node state
      let nodeClass = "avl-node";
      if (n.value === imbalancedNode) {
        nodeClass = "avl-node avl-node-imbalanced";
      } else if (rotatingNodes.indexOf(n.value) >= 0) {
        nodeClass = "avl-node avl-node-rotating";
      }
      g.setAttribute("class", nodeClass);

      // Circle
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      circle.setAttribute("r", NODE_RADIUS);
      circle.setAttribute("class", "avl-node-circle");
      g.appendChild(circle);

      // Value label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.setAttribute("x", n.x);
      label.setAttribute("y", n.y);
      label.setAttribute("class", "avl-node-label");
      label.textContent = n.value;
      g.appendChild(label);

      // Balance factor label below the node
      const bfLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      bfLabel.setAttribute("x", n.x);
      bfLabel.setAttribute("y", n.y + NODE_RADIUS + 12);
      bfLabel.setAttribute("class", "avl-node-bf");
      const bf = n.balanceFactor;
      bfLabel.textContent = (bf > 0 ? "+" : "") + bf;
      g.appendChild(bfLabel);

      avlSvg.appendChild(g);
    }

    // Adjust SVG height based on tree depth
    const maxY = Math.max.apply(
      null,
      layout.nodes.map((n) => n.y),
    );
    avlSvg.setAttribute("height", Math.max(SVG_HEIGHT, maxY + 60));
  }

  // --- Get tree height from root ---
  function treeHeight(root) {
    return AVLAlgorithm.height(root);
  }

  // --- Update stats panel ---
  function updateStats(root) {
    statNodes.textContent = AVLAlgorithm.size(root);
    statHeight.textContent = treeHeight(root);
    if (pendingSteps.length === 0) {
      statStep.textContent = "— / —";
    } else {
      statStep.textContent = stepIdx + 1 + " / " + pendingSteps.length;
    }
  }

  // --- Update playback button states ---
  function updateButtons() {
    const hasSteps = pendingSteps.length > 0;
    const atEnd = stepIdx >= pendingSteps.length - 1;
    const atStart = stepIdx < 0;

    btnPlay.disabled = isPlaying || !hasSteps || atEnd;
    btnPause.disabled = !isPlaying;
    btnStep.disabled = isPlaying || atEnd || !hasSteps;
    btnStepBack.disabled = isPlaying || atStart;
    btnReset.disabled = isPlaying;
  }

  // --- Show a step ---
  function showStep(idx) {
    if (idx < 0 || idx >= pendingSteps.length) return;
    const step = pendingSteps[idx];

    let imbalancedNode = null;
    let rotatingNodes = [];

    if (
      step.type === "rotate-ll" ||
      step.type === "rotate-rr" ||
      step.type === "rotate-lr" ||
      step.type === "rotate-rl"
    ) {
      imbalancedNode = step.imbalancedNode;
    }

    renderTree(step.root, imbalancedNode, rotatingNodes);
    avlInfo.textContent = step.explanation;
    updateStats(step.root);
    updateButtons();
  }

  // --- Playback helpers ---
  function getDelay() {
    const spd = parseInt(speedSlider.value, 10);
    return Math.round(800 / spd);
  }

  function stepForward() {
    if (stepIdx >= pendingSteps.length - 1) {
      stopPlay();
      return;
    }
    stepIdx++;
    showStep(stepIdx);
    if (stepIdx >= pendingSteps.length - 1) {
      stopPlay();
    }
  }

  function stepBackward() {
    if (stepIdx <= 0) {
      stepIdx = -1;
      renderTree(treeRoot, null, []);
      avlInfo.textContent = "Stepped back to start.";
      updateStats(treeRoot);
      updateButtons();
      return;
    }
    stepIdx--;
    showStep(stepIdx);
  }

  function startPlay() {
    if (stepIdx >= pendingSteps.length - 1) {
      stepIdx = -1;
    }
    isPlaying = true;
    updateButtons();
    tick();
  }

  function tick() {
    if (!isPlaying) return;
    if (stepIdx >= pendingSteps.length - 1) {
      stopPlay();
      return;
    }
    stepForward();
    if (stepIdx < pendingSteps.length - 1) {
      timer = setTimeout(tick, getDelay());
    }
  }

  function stopPlay() {
    isPlaying = false;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    updateButtons();
  }

  function resetAnimation() {
    stopPlay();
    stepIdx = -1;
    pendingSteps = [];
    avlPlayback.classList.add("hidden");
    renderTree(treeRoot, null, []);
    updateStats(treeRoot);
    updateButtons();
  }

  // --- Insert a value ---
  function doInsert() {
    const val = parseInt(insertInput.value, 10);
    if (isNaN(val)) {
      avlInfo.textContent = "Error: Enter a valid integer.";
      return;
    }
    if (val < -99 || val > 99) {
      avlInfo.textContent = "Error: Value must be between -99 and 99.";
      return;
    }
    if (AVLAlgorithm.size(treeRoot) >= MAX_NODES) {
      avlInfo.textContent =
        "Error: Maximum " +
        MAX_NODES +
        " nodes reached. Delete some nodes first.";
      return;
    }

    stopPlay();
    const result = AVLAlgorithm.insert(treeRoot, val);
    treeRoot = result.root;
    pendingSteps = result.steps;
    stepIdx = -1;

    avlPlayback.classList.remove("hidden");
    updateStats(treeRoot);
    updateButtons();

    // Auto-play the animation
    startPlay();
    insertInput.value = "";
    insertInput.focus();
  }

  // --- Delete a value ---
  function doDelete() {
    const val = parseInt(deleteInput.value, 10);
    if (isNaN(val)) {
      avlInfo.textContent = "Error: Enter a valid integer to delete.";
      return;
    }
    if (treeRoot === null) {
      avlInfo.textContent = "Error: Tree is empty.";
      return;
    }

    stopPlay();
    const result = AVLAlgorithm.deleteNode(treeRoot, val);
    treeRoot = result.root;
    pendingSteps = result.steps;
    stepIdx = -1;

    avlPlayback.classList.remove("hidden");
    updateStats(treeRoot);
    updateButtons();

    startPlay();
    deleteInput.value = "";
    deleteInput.focus();
  }

  // --- Generate a random tree ---
  function doRandom() {
    stopPlay();
    treeRoot = null;
    const count = 7;
    const values = new Set();
    while (values.size < count) {
      values.add(Math.floor(Math.random() * 99) + 1);
    }
    const arr = Array.from(values);

    let lastSteps = [];
    for (let i = 0; i < arr.length; i++) {
      const result = AVLAlgorithm.insert(treeRoot, arr[i]);
      treeRoot = result.root;
      lastSteps = result.steps;
    }

    pendingSteps = lastSteps;
    stepIdx = -1;

    avlPlayback.classList.remove("hidden");
    renderTree(treeRoot, null, []);
    updateStats(treeRoot);
    updateButtons();
    avlInfo.textContent =
      "Random tree loaded: [" +
      arr.join(", ") +
      "]. Click Play to replay last insert animation.";
  }

  // --- Clear tree ---
  function doClear() {
    stopPlay();
    treeRoot = null;
    pendingSteps = [];
    stepIdx = -1;
    avlPlayback.classList.add("hidden");
    clearSvg();
    updateStats(null);
    avlInfo.textContent = "Tree cleared. Insert values to begin.";
  }

  // --- Event listeners ---
  btnInsert.addEventListener("click", doInsert);
  btnDelete.addEventListener("click", doDelete);
  btnRandom.addEventListener("click", doRandom);
  btnClear.addEventListener("click", doClear);

  btnPlay.addEventListener("click", startPlay);
  btnPause.addEventListener("click", stopPlay);
  btnStep.addEventListener("click", () => {
    stopPlay();
    stepForward();
  });
  btnStepBack.addEventListener("click", () => {
    stopPlay();
    stepBackward();
  });
  btnReset.addEventListener("click", resetAnimation);

  speedSlider.addEventListener("input", () => {
    if (isPlaying) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(tick, getDelay());
    }
  });

  insertInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doInsert();
  });
  deleteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doDelete();
  });

  // --- Cleanup on page unload ---
  window.addEventListener("beforeunload", () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  });

  // --- Auto-init: load a sample tree ---
  const sampleValues = [5, 3, 7, 1, 4, 6, 8];
  for (let i = 0; i < sampleValues.length; i++) {
    const result = AVLAlgorithm.insert(treeRoot, sampleValues[i]);
    treeRoot = result.root;
  }
  renderTree(treeRoot, null, []);
  updateStats(treeRoot);
  avlInfo.textContent =
    "Sample AVL tree loaded: [5, 3, 7, 1, 4, 6, 8]. Insert or delete values to see rotations.";
})();
