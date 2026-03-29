/* Union-Find (Disjoint Set Union) Visualization — AlgoViz */
(() => {
  "use strict";

  // All algorithm logic lives in UnionFindAlgorithm (union-find-algorithm.js).
  // This file only handles DOM and visualization — NO redeclaration of
  // constants or pure functions from the algorithm module.

  // --- Speed map: slider value (1-10) -> milliseconds per step ---
  const SPEED_MAP = [null, 1200, 1000, 800, 600, 450, 300, 200, 130, 80, 40];

  // --- CSS class names for operation history entries (used in renderHistory) ---
  const HISTORY_CLASSES = {
    union: "uf-history-entry-union",
    find: "uf-history-entry-find",
    connected: "uf-history-entry-connected",
  };

  // --- State ---
  let n = 8;
  let dsu = UnionFindAlgorithm.createDSU(n);
  let pendingSteps = []; // steps from the last operation
  let currentStepIdx = -1;
  let playing = false;
  let playTimer = null;
  let historyEntries = []; // { type, label, result }

  // --- DOM refs ---
  const nodeCountSlider = document.getElementById("uf-nodeCount");
  const nodeCountDisplay = document.getElementById("uf-nodeCountDisplay");
  const btnReset = document.getElementById("uf-btnReset");
  const opTypeSelect = document.getElementById("uf-opType");
  const nodeXInput = document.getElementById("uf-nodeX");
  const nodeYInput = document.getElementById("uf-nodeY");
  const nodeYLabel = document.querySelector(".uf-node-y-label");
  const nodeYInputEl = document.querySelector(".uf-node-y-input");
  const btnExecute = document.getElementById("uf-btnExecute");
  const errorEl = document.getElementById("uf-error");
  const btnStepBack = document.getElementById("uf-btnStepBack");
  const btnPlay = document.getElementById("uf-btnPlay");
  const btnPause = document.getElementById("uf-btnPause");
  const btnStepNext = document.getElementById("uf-btnStepNext");
  const speedSlider = document.getElementById("uf-speed");
  const narrativeEl = document.getElementById("uf-narrative");
  const forestSvg = document.getElementById("uf-forestSvg");
  const componentCountEl = document.getElementById("uf-componentCount");
  const membershipListEl = document.getElementById("uf-membershipList");
  const historyLogEl = document.getElementById("uf-historyLog");

  // --- Timer cleanup ---
  function clearPlay() {
    if (playTimer !== null) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    playing = false;
    btnPlay.disabled = false;
    btnPause.disabled = true;
  }

  // --- Reset all state ---
  function reset() {
    clearPlay();
    dsu = UnionFindAlgorithm.createDSU(n);
    pendingSteps = [];
    currentStepIdx = -1;
    historyEntries = [];
    errorEl.textContent = "";
    narrativeEl.textContent = "Execute an operation to begin.";
    renderForest(dsu, null);
    renderSidePanel(dsu);
    renderHistory();
    updatePlaybackButtons();
  }

  // --- Validate node input ---
  function validateInput() {
    const x = parseInt(nodeXInput.value, 10);
    const op = opTypeSelect.value;
    if (isNaN(x) || x < 0 || x >= n) {
      errorEl.textContent = "Node X must be 0.." + (n - 1);
      return null;
    }
    if (op === "union" || op === "connected") {
      const y = parseInt(nodeYInput.value, 10);
      if (isNaN(y) || y < 0 || y >= n) {
        errorEl.textContent = "Node Y must be 0.." + (n - 1);
        return null;
      }
      return { x, y };
    }
    return { x };
  }

  // --- Execute operation ---
  function executeOperation() {
    clearPlay();
    errorEl.textContent = "";
    const args = validateInput();
    if (!args) return;

    const op = opTypeSelect.value;
    const steps = [];
    let result = null;
    let histLabel = "";

    if (op === "union") {
      const merged = UnionFindAlgorithm.union(dsu, args.x, args.y, steps);
      result = merged ? "merged" : "already connected";
      histLabel = "Union(" + args.x + ", " + args.y + ") → " + result;
    } else if (op === "find") {
      const root = UnionFindAlgorithm.find(dsu, args.x, steps);
      result = "root = " + root;
      histLabel = "Find(" + args.x + ") → " + result;
    } else if (op === "connected") {
      const isConnected = UnionFindAlgorithm.connected(dsu, args.x, args.y);
      result = isConnected ? "yes" : "no";
      histLabel = "Connected?(" + args.x + ", " + args.y + ") → " + result;
      steps.push({
        type: "connected",
        args: { x: args.x, y: args.y },
        result: isConnected,
        parentBefore: dsu.parent.slice(),
        parentAfter: dsu.parent.slice(),
        componentCount: UnionFindAlgorithm.getComponentCount(dsu),
      });
    }

    pendingSteps = steps;
    currentStepIdx = -1;
    historyEntries.unshift({ type: op, label: histLabel });
    renderHistory();

    if (pendingSteps.length > 0) {
      currentStepIdx = 0;
      renderStep(currentStepIdx);
    } else {
      renderForest(dsu, null);
      renderSidePanel(dsu);
    }

    updatePlaybackButtons();
  }

  // --- Render one step ---
  function renderStep(idx) {
    if (idx < 0 || idx >= pendingSteps.length) return;
    const step = pendingSteps[idx];
    narrativeEl.textContent = buildNarrative(step, idx, pendingSteps.length);
    renderForest(dsu, step);
    renderSidePanel(dsu);
  }

  // --- Build human-readable narrative for a step ---
  function buildNarrative(step, idx, total) {
    const pos = "Step " + (idx + 1) + "/" + total + ": ";
    if (step.type === "union") {
      if (step.merged) {
        return (
          pos +
          "Merged component of " +
          step.args.x +
          " with component of " +
          step.args.y +
          ". Components: " +
          step.componentCount
        );
      }
      return (
        pos +
        "Union(" +
        step.args.x +
        ", " +
        step.args.y +
        ") — already in same component. Components: " +
        step.componentCount
      );
    }
    if (step.type === "find") {
      const compressed = step.pathCompressed
        ? " (path compressed to root " + step.rootFound + ")"
        : "";
      return (
        pos +
        "Find node " +
        step.node +
        " → root " +
        step.rootFound +
        compressed
      );
    }
    if (step.type === "connected") {
      return (
        pos +
        "Connected?(" +
        step.args.x +
        ", " +
        step.args.y +
        ") → " +
        (step.result ? "Yes" : "No")
      );
    }
    return pos + step.type;
  }

  // --- Playback ---
  function startPlay() {
    if (playing) return;
    if (pendingSteps.length === 0) return;
    playing = true;
    btnPlay.disabled = true;
    btnPause.disabled = false;
    advancePlay();
  }

  function advancePlay() {
    if (!playing) return;
    const next = currentStepIdx + 1;
    if (next >= pendingSteps.length) {
      clearPlay();
      updatePlaybackButtons();
      return;
    }
    currentStepIdx = next;
    renderStep(currentStepIdx);
    updatePlaybackButtons();
    const speed = parseInt(speedSlider.value, 10);
    const delay = SPEED_MAP[speed] || 300;
    playTimer = setTimeout(advancePlay, delay);
  }

  function pausePlay() {
    clearPlay();
    updatePlaybackButtons();
  }

  function stepBack() {
    clearPlay();
    if (currentStepIdx > 0) {
      currentStepIdx--;
      renderStep(currentStepIdx);
    }
    updatePlaybackButtons();
  }

  function stepNext() {
    clearPlay();
    if (currentStepIdx + 1 < pendingSteps.length) {
      currentStepIdx++;
      renderStep(currentStepIdx);
    }
    updatePlaybackButtons();
  }

  function updatePlaybackButtons() {
    const hasSteps = pendingSteps.length > 0;
    btnStepBack.disabled = !hasSteps || currentStepIdx <= 0;
    btnStepNext.disabled =
      !hasSteps || currentStepIdx >= pendingSteps.length - 1;
    btnPlay.disabled =
      !hasSteps || playing || currentStepIdx >= pendingSteps.length - 1;
    btnPause.disabled = !playing;
  }

  // --- Show/hide Y input based on operation ---
  function updateOpInputVisibility() {
    const op = opTypeSelect.value;
    const needsY = op === "union" || op === "connected";
    nodeYLabel.style.display = needsY ? "" : "none";
    nodeYInputEl.style.display = needsY ? "" : "none";
  }

  // --- Render the DSU forest as an SVG ---
  // Groups nodes by root component. Draws each component as a tree,
  // laid out left-to-right.
  function renderForest(currentDsu, activeStep) {
    const parent = currentDsu.parent;
    const N = parent.length;
    const svgW = forestSvg.clientWidth || 600;
    const svgH = 380;
    forestSvg.setAttribute("viewBox", "0 0 " + svgW + " " + svgH);

    // Build component tree structure
    const components = buildComponentTrees(parent, N);
    const positions = computeNodePositions(components, N, svgW, svgH);

    // Determine highlighted nodes from active step
    const highlights = buildHighlights(activeStep);

    // Clear SVG
    while (forestSvg.firstChild) forestSvg.removeChild(forestSvg.firstChild);

    // Draw edges first (below nodes)
    for (let i = 0; i < N; i++) {
      if (parent[i] !== i) {
        const from = positions[i];
        const to = positions[parent[i]];
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);
        line.setAttribute("x2", to.x);
        line.setAttribute("y2", to.y);
        const cls = highlights.compressedNodes.has(i)
          ? "uf-edge-line-compressed"
          : highlights.activeEdges.has(i)
            ? "uf-edge-line-active"
            : "uf-edge-line";
        line.setAttribute("class", cls);
        forestSvg.appendChild(line);
      }
    }

    // Draw nodes
    const R = Math.max(14, Math.min(18, Math.floor(svgW / (N * 3.5))));
    for (let i = 0; i < N; i++) {
      const pos = positions[i];
      const isRoot = parent[i] === i;

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", R);

      let cls;
      if (highlights.compressedNodes.has(i)) {
        cls = "uf-node-circle-compressed";
      } else if (highlights.activeNodes.has(i)) {
        cls = "uf-node-circle-active";
      } else if (highlights.queryNodes.has(i)) {
        cls = "uf-node-circle-query";
      } else if (isRoot) {
        cls = "uf-node-circle-root";
      } else {
        cls = "uf-node-circle";
      }
      circle.setAttribute("class", cls);
      forestSvg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", pos.x);
      text.setAttribute("y", pos.y);
      text.setAttribute("class", "uf-node-label-text");
      text.textContent = String(i);
      forestSvg.appendChild(text);
    }
  }

  // --- Build component tree structure ---
  // Returns array of { root, members } where members is { [node]: [children] }
  function buildComponentTrees(parent, N) {
    const roots = [];
    const children = {};
    for (let i = 0; i < N; i++) {
      children[i] = [];
    }
    for (let i = 0; i < N; i++) {
      if (parent[i] === i) {
        roots.push(i);
      } else {
        children[parent[i]].push(i);
      }
    }
    return { roots, children };
  }

  // --- Compute (x,y) positions for each node ---
  // Lays out each component subtree side-by-side with BFS-style level layout.
  function computeNodePositions(components, N, svgW, svgH) {
    const { roots, children } = components;
    const positions = new Array(N);
    const numComponents = roots.length;
    if (numComponents === 0) return positions;

    const levelH = Math.min(80, (svgH - 40) / 4);
    const marginX = 30;
    const usableW = svgW - marginX * 2;
    const componentW = usableW / numComponents;

    for (let ci = 0; ci < roots.length; ci++) {
      const root = roots[ci];
      const cX = marginX + ci * componentW + componentW / 2;

      // BFS to get nodes by level
      const levels = [];
      const queue = [{ node: root, level: 0 }];
      while (queue.length > 0) {
        const { node, level } = queue.shift();
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
        const ch = children[node] || [];
        for (let j = 0; j < ch.length; j++) {
          queue.push({ node: ch[j], level: level + 1 });
        }
      }

      for (let lvl = 0; lvl < levels.length; lvl++) {
        const nodes = levels[lvl];
        const y = 30 + lvl * levelH;
        const totalLevelW = Math.min(
          componentW * 0.9,
          (nodes.length - 1) * 40 + 1,
        );
        for (let k = 0; k < nodes.length; k++) {
          const x =
            nodes.length === 1
              ? cX
              : cX - totalLevelW / 2 + (k / (nodes.length - 1)) * totalLevelW;
          positions[nodes[k]] = { x: Math.round(x), y: Math.round(y) };
        }
      }
    }

    return positions;
  }

  // --- Determine which nodes/edges to highlight based on the step ---
  function buildHighlights(step) {
    const activeNodes = new Set();
    const activeEdges = new Set();
    const compressedNodes = new Set();
    const queryNodes = new Set();

    if (!step) return { activeNodes, activeEdges, compressedNodes, queryNodes };

    if (step.type === "find") {
      if (step.pathCompressed) {
        compressedNodes.add(step.node);
      } else {
        activeNodes.add(step.node);
      }
    } else if (step.type === "union") {
      activeNodes.add(step.args.x);
      activeNodes.add(step.args.y);
      if (step.rootX !== undefined) {
        activeNodes.add(step.rootX);
        activeNodes.add(step.rootY);
        activeEdges.add(step.rootX);
        activeEdges.add(step.rootY);
      }
    } else if (step.type === "connected") {
      queryNodes.add(step.args.x);
      queryNodes.add(step.args.y);
    }

    return { activeNodes, activeEdges, compressedNodes, queryNodes };
  }

  // --- Render side panel (component count + membership) ---
  function renderSidePanel(currentDsu) {
    const parent = currentDsu.parent;
    const N = parent.length;
    const count = UnionFindAlgorithm.getComponentCount(currentDsu);
    componentCountEl.textContent = String(count);

    // Build component map: root -> [members]
    const compMap = {};
    for (let i = 0; i < N; i++) {
      // Find root without mutating (use the current parent directly for root)
      let r = i;
      // Walk up without compression for display purposes
      let safety = N + 1;
      while (parent[r] !== r && safety-- > 0) r = parent[r];
      if (!compMap[r]) compMap[r] = [];
      compMap[r].push(i);
    }

    membershipListEl.textContent = "";
    const roots = Object.keys(compMap)
      .map(Number)
      .sort((a, b) => a - b);
    for (const root of roots) {
      const members = compMap[root].filter((m) => m !== root);
      const row = document.createElement("div");
      row.className = "uf-component-row";

      const rootSpan = document.createElement("span");
      rootSpan.className = "uf-component-root";
      rootSpan.textContent = "R:" + root;
      row.appendChild(rootSpan);

      const membersSpan = document.createElement("span");
      membersSpan.className = "uf-component-members";
      membersSpan.textContent =
        members.length > 0 ? "{" + members.join(",") + "}" : "{}";
      row.appendChild(membersSpan);

      membershipListEl.appendChild(row);
    }
  }

  // --- Render operation history log ---
  function renderHistory() {
    historyLogEl.textContent = "";
    for (let i = 0; i < historyEntries.length; i++) {
      const entry = historyEntries[i];
      const li = document.createElement("li");
      li.className =
        "uf-history-entry " +
        (HISTORY_CLASSES[entry.type] || "uf-history-entry-find");
      li.textContent = entry.label;
      historyLogEl.appendChild(li);
    }
  }

  // --- Event listeners ---
  nodeCountSlider.addEventListener("input", () => {
    n = parseInt(nodeCountSlider.value, 10);
    nodeCountDisplay.textContent = String(n);
    nodeXInput.max = String(n - 1);
    nodeYInput.max = String(n - 1);
    // Clamp values
    if (parseInt(nodeXInput.value, 10) >= n) nodeXInput.value = String(n - 1);
    if (parseInt(nodeYInput.value, 10) >= n) nodeYInput.value = String(n - 1);
    reset();
  });

  btnReset.addEventListener("click", reset);

  opTypeSelect.addEventListener("change", () => {
    updateOpInputVisibility();
    errorEl.textContent = "";
  });

  btnExecute.addEventListener("click", executeOperation);

  nodeXInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeOperation();
  });
  nodeYInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeOperation();
  });

  btnStepBack.addEventListener("click", stepBack);
  btnPlay.addEventListener("click", startPlay);
  btnPause.addEventListener("click", pausePlay);
  btnStepNext.addEventListener("click", stepNext);

  // --- Cleanup on page unload ---
  window.addEventListener("unload", clearPlay);

  // --- Initial render ---
  updateOpInputVisibility();
  renderForest(dsu, null);
  renderSidePanel(dsu);
  renderHistory();
  updatePlaybackButtons();
})();
