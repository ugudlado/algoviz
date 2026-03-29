/* Prim's Minimum Spanning Tree Visualization — AlgoViz */
(() => {
  "use strict";

  // --- Constants from algorithm module (DRY: no redeclaration) ---
  const MAX_VERTICES = PrimsAlgorithm.MAX_VERTICES;
  const NODE_RADIUS = 19;

  // --- Graph presets ---
  const PRESETS = {
    small: {
      label: "Small (4 nodes)",
      nodes: [
        { x: 140, y: 200 },
        { x: 320, y: 100 },
        { x: 460, y: 200 },
        { x: 300, y: 330 },
      ],
      edges: [
        { u: 0, v: 1, weight: 4 },
        { u: 0, v: 3, weight: 6 },
        { u: 1, v: 2, weight: 3 },
        { u: 1, v: 3, weight: 8 },
        { u: 2, v: 3, weight: 7 },
      ],
    },
    medium: {
      label: "Medium (7 nodes)",
      nodes: [
        { x: 100, y: 200 },
        { x: 220, y: 100 },
        { x: 220, y: 300 },
        { x: 340, y: 200 },
        { x: 460, y: 100 },
        { x: 460, y: 300 },
        { x: 560, y: 200 },
      ],
      edges: [
        { u: 0, v: 1, weight: 2 },
        { u: 0, v: 2, weight: 4 },
        { u: 1, v: 2, weight: 1 },
        { u: 1, v: 3, weight: 5 },
        { u: 2, v: 3, weight: 3 },
        { u: 3, v: 4, weight: 6 },
        { u: 3, v: 5, weight: 2 },
        { u: 4, v: 5, weight: 4 },
        { u: 4, v: 6, weight: 3 },
        { u: 5, v: 6, weight: 7 },
      ],
    },
    dense: {
      label: "Dense (10 nodes)",
      nodes: [
        { x: 300, y: 60 },
        { x: 460, y: 130 },
        { x: 530, y: 280 },
        { x: 440, y: 400 },
        { x: 280, y: 420 },
        { x: 140, y: 360 },
        { x: 80, y: 220 },
        { x: 160, y: 100 },
        { x: 300, y: 200 },
        { x: 380, y: 280 },
      ],
      edges: [
        { u: 0, v: 1, weight: 4 },
        { u: 0, v: 7, weight: 8 },
        { u: 1, v: 2, weight: 8 },
        { u: 1, v: 8, weight: 11 },
        { u: 2, v: 3, weight: 7 },
        { u: 2, v: 5, weight: 4 },
        { u: 2, v: 8, weight: 2 },
        { u: 3, v: 4, weight: 9 },
        { u: 3, v: 5, weight: 14 },
        { u: 4, v: 5, weight: 10 },
        { u: 5, v: 6, weight: 2 },
        { u: 6, v: 7, weight: 1 },
        { u: 6, v: 8, weight: 6 },
        { u: 7, v: 8, weight: 7 },
        { u: 8, v: 9, weight: 3 },
        { u: 9, v: 3, weight: 5 },
        { u: 9, v: 4, weight: 6 },
      ],
    },
  };

  // --- State ---
  let graphNodes = []; // { x, y }
  let graphEdges = []; // { u, v, weight }
  let steps = [];
  let currentStep = -1;
  let playing = false;
  let playTimer = null;
  let startNode = 0;

  // --- DOM refs ---
  const graphContainer = document.getElementById("pm-graph-container");
  const pqList = document.getElementById("pm-pq-list");
  const mstList = document.getElementById("pm-mst-list");
  const totalWeightEl = document.getElementById("pm-total-weight");
  const visitedEl = document.getElementById("pm-visited");
  const infoEl = document.getElementById("pm-info");
  const playbackEl = document.getElementById("pm-playback");

  const startNodeSelect = document.getElementById("pm-start-node");
  const presetSelect = document.getElementById("pm-preset");
  const btnRun = document.getElementById("pm-btn-run");
  const btnReset = document.getElementById("pm-btn-reset");
  const btnStepBack = document.getElementById("pm-btn-step-back");
  const btnPlay = document.getElementById("pm-btn-play");
  const btnPause = document.getElementById("pm-btn-pause");
  const btnStep = document.getElementById("pm-btn-step");
  const speedSlider = document.getElementById("pm-speed");

  // --- Delay from speed slider ---
  function getDelay() {
    return 900 - (parseInt(speedSlider.value, 10) - 1) * 80;
  }

  // --- Build a PrimsAlgorithm graph from current graphNodes/graphEdges ---
  function buildAlgoGraph() {
    const g = PrimsAlgorithm.createGraph(graphNodes.length);
    for (let i = 0; i < graphEdges.length; i++) {
      PrimsAlgorithm.addEdge(
        g,
        graphEdges[i].u,
        graphEdges[i].v,
        graphEdges[i].weight,
      );
    }
    return g;
  }

  // --- Load a preset ---
  function loadPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    if (preset.nodes.length > MAX_VERTICES) {
      setInfo("Preset exceeds maximum of " + MAX_VERTICES + " nodes.");
      return;
    }
    graphNodes = preset.nodes.map((n) => ({ x: n.x, y: n.y }));
    graphEdges = preset.edges.slice();
    steps = [];
    currentStep = -1;
    stopPlay();
    playbackEl.classList.remove("pm-playback-visible");
    startNode = 0;
    populateStartNodeDropdown();
    renderGraph();
    setInfo("Preset loaded. Select a start node and click Run.");
    updateSidebar(null);
  }

  // --- Populate start node dropdown ---
  function populateStartNodeDropdown() {
    while (startNodeSelect.firstChild) {
      startNodeSelect.removeChild(startNodeSelect.firstChild);
    }
    for (let i = 0; i < graphNodes.length; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = "Node " + i;
      if (i === startNode) opt.selected = true;
      startNodeSelect.appendChild(opt);
    }
  }

  // --- Run the algorithm ---
  function runAlgorithm() {
    if (graphNodes.length === 0) {
      setInfo("No graph loaded. Choose a preset and try again.");
      return;
    }
    stopPlay();
    const g = buildAlgoGraph();
    const result = PrimsAlgorithm.primsMST(g, startNode);
    steps = result.steps;
    currentStep = -1;
    playbackEl.classList.add("pm-playback-visible");
    renderGraph();
    updateSidebar(null);
    setInfo(
      "Algorithm ready. Use step controls or Play to walk through Prim\u2019s MST.",
    );
    updatePlaybackButtons();
  }

  // --- Step controls ---
  function stepForward() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      applyStep(steps[currentStep]);
      updatePlaybackButtons();
    } else {
      stopPlay();
      setInfo(
        "Algorithm complete. MST total weight: " + getFinalWeight() + ".",
      );
      updatePlaybackButtons();
    }
  }

  function stepBack() {
    if (currentStep > 0) {
      currentStep--;
      applyStep(steps[currentStep]);
    } else if (currentStep === 0) {
      currentStep = -1;
      renderGraph();
      updateSidebar(null);
      setInfo("Stepped back to start.");
    }
    updatePlaybackButtons();
  }

  function startPlay() {
    if (currentStep >= steps.length - 1) return;
    playing = true;
    updatePlaybackButtons();
    scheduleNext();
  }

  function scheduleNext() {
    if (!playing) return;
    playTimer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        applyStep(steps[currentStep]);
        updatePlaybackButtons();
        scheduleNext();
      } else {
        stopPlay();
        setInfo(
          "Algorithm complete. MST total weight: " + getFinalWeight() + ".",
        );
        updatePlaybackButtons();
      }
    }, getDelay());
  }

  function stopPlay() {
    playing = false;
    if (playTimer !== null) {
      clearTimeout(playTimer);
      playTimer = null;
    }
  }

  function resetAlgo() {
    stopPlay();
    steps = [];
    currentStep = -1;
    playbackEl.classList.remove("pm-playback-visible");
    renderGraph();
    updateSidebar(null);
    setInfo("Reset. Select a start node and click Run.");
  }

  function getFinalWeight() {
    if (steps.length === 0) return 0;
    return steps[steps.length - 1].totalWeight;
  }

  function updatePlaybackButtons() {
    btnPlay.disabled = playing || currentStep >= steps.length - 1;
    btnPause.disabled = !playing;
    btnStep.disabled = currentStep >= steps.length - 1;
    btnStepBack.disabled = currentStep < 0;
  }

  // --- Apply a step snapshot to the visualization ---
  function applyStep(step) {
    renderGraphAtStep(step);
    updateSidebar(step);

    let info = "";
    if (step.type === "visit") {
      info =
        "Visiting node " + step.node + ". Scanning its edges for candidates.";
    } else if (step.type === "add_edge") {
      info =
        "Adding edge " +
        step.edge.u +
        " \u2014 " +
        step.edge.v +
        " (weight " +
        step.edge.weight +
        ") to MST. Total weight: " +
        step.totalWeight +
        ".";
    } else if (step.type === "skip_edge") {
      info =
        "Skipping edge " +
        step.edge.u +
        " \u2014 " +
        step.edge.v +
        " (weight " +
        step.edge.weight +
        ") \u2014 node " +
        step.edge.v +
        " already in MST.";
    }
    setInfo(info);
  }

  // --- Determine edge visual state at current step ---
  function getEdgeState(edgeIndex, step) {
    if (!step) return "default";
    const e = graphEdges[edgeIndex];
    // Check if this edge is in mstSoFar
    for (let i = 0; i < step.mstSoFar.length; i++) {
      const m = step.mstSoFar[i];
      if ((m.u === e.u && m.v === e.v) || (m.u === e.v && m.v === e.u)) {
        return "mst";
      }
    }
    // Check if this edge is a current candidate in priority queue
    for (let i = 0; i < step.priorityQueue.length; i++) {
      const q = step.priorityQueue[i];
      if ((q.u === e.u && q.v === e.v) || (q.u === e.v && q.v === e.u)) {
        return "candidate";
      }
    }
    return "default";
  }

  // --- Determine node visual state at a step ---
  function getNodeState(nodeIndex, step) {
    if (!step) return "default";
    if (nodeIndex === startNode && step.visited.length === 0) return "start";
    if (step.visited.includes(nodeIndex)) {
      if (step.type === "visit" && step.node === nodeIndex) return "current";
      return "in-mst";
    }
    if (nodeIndex === startNode) return "start";
    return "default";
  }

  // --- Render the graph (no step state) ---
  function renderGraph() {
    renderGraphAtStep(null);
  }

  // --- Render graph at a step snapshot ---
  function renderGraphAtStep(step) {
    // Clear container
    while (graphContainer.firstChild) {
      graphContainer.removeChild(graphContainer.firstChild);
    }

    if (graphNodes.length === 0) return;

    // Build SVG for edges
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "pm-edge-svg");

    for (let i = 0; i < graphEdges.length; i++) {
      const e = graphEdges[i];
      const n1 = graphNodes[e.u];
      const n2 = graphNodes[e.v];
      if (!n1 || !n2) continue;

      const state = getEdgeState(i, step);
      const lineClass =
        "pm-edge-line" +
        (state === "mst"
          ? " pm-edge-mst"
          : state === "candidate"
            ? " pm-edge-candidate"
            : "");

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("class", lineClass);
      line.setAttribute("x1", String(n1.x));
      line.setAttribute("y1", String(n1.y));
      line.setAttribute("x2", String(n2.x));
      line.setAttribute("y2", String(n2.y));
      svg.appendChild(line);

      // Weight label at midpoint
      const mx = (n1.x + n2.x) / 2;
      const my = (n1.y + n2.y) / 2;
      const weightClass =
        "pm-edge-weight" +
        (state === "mst"
          ? " pm-edge-mst"
          : state === "candidate"
            ? " pm-edge-candidate"
            : "");
      const weightText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      weightText.setAttribute("class", weightClass);
      weightText.setAttribute("x", String(mx));
      weightText.setAttribute("y", String(my - 5));
      weightText.setAttribute("text-anchor", "middle");
      weightText.textContent = String(e.weight);
      svg.appendChild(weightText);
    }

    graphContainer.appendChild(svg);

    // Render nodes
    for (let i = 0; i < graphNodes.length; i++) {
      const n = graphNodes[i];
      const state = getNodeState(i, step);
      let nodeClass = "pm-node";
      if (state === "start") nodeClass += " pm-node-start";
      else if (state === "current") nodeClass += " pm-node-current";
      else if (state === "in-mst") nodeClass += " pm-node-in-mst";

      const div = document.createElement("div");
      div.setAttribute("class", nodeClass);
      div.style.left = n.x - NODE_RADIUS + "px";
      div.style.top = n.y - NODE_RADIUS + "px";
      div.style.width = NODE_RADIUS * 2 + "px";
      div.style.height = NODE_RADIUS * 2 + "px";
      div.textContent = String(i);
      graphContainer.appendChild(div);
    }
  }

  // --- Update sidebar panels ---
  function updateSidebar(step) {
    // Priority queue
    while (pqList.firstChild) pqList.removeChild(pqList.firstChild);
    if (!step || step.priorityQueue.length === 0) {
      const empty = document.createElement("div");
      empty.setAttribute("class", "pm-pq-empty");
      empty.textContent = step
        ? "Priority queue is empty"
        : "Run algorithm to see queue";
      pqList.appendChild(empty);
    } else {
      for (let i = 0; i < step.priorityQueue.length; i++) {
        const q = step.priorityQueue[i];
        const item = document.createElement("div");
        item.setAttribute(
          "class",
          "pm-pq-item" + (i === 0 ? " pm-pq-top" : ""),
        );

        const label = document.createElement("span");
        label.textContent = q.u + " \u2014 " + q.v;

        const wt = document.createElement("span");
        wt.setAttribute("class", "pm-pq-weight");
        wt.textContent = String(q.weight);

        item.appendChild(label);
        item.appendChild(wt);
        pqList.appendChild(item);
      }
    }

    // MST edges list
    while (mstList.firstChild) mstList.removeChild(mstList.firstChild);
    if (!step || step.mstSoFar.length === 0) {
      const empty = document.createElement("div");
      empty.setAttribute("class", "pm-mst-empty");
      empty.textContent = step
        ? "No MST edges yet"
        : "Run algorithm to see MST";
      mstList.appendChild(empty);
    } else {
      for (let i = 0; i < step.mstSoFar.length; i++) {
        const m = step.mstSoFar[i];
        const item = document.createElement("div");
        item.setAttribute("class", "pm-mst-item");

        const label = document.createElement("span");
        label.textContent = m.u + " \u2014 " + m.v;

        const wt = document.createElement("span");
        wt.setAttribute("class", "pm-mst-weight");
        wt.textContent = String(m.weight);

        item.appendChild(label);
        item.appendChild(wt);
        mstList.appendChild(item);
      }
    }

    // Total weight
    totalWeightEl.textContent = step ? String(step.totalWeight) : "0";

    // Visited nodes
    visitedEl.textContent =
      step && step.visited.length > 0
        ? step.visited.join(", ")
        : step
          ? "none"
          : "\u2014";
  }

  // --- Info bar ---
  function setInfo(text) {
    infoEl.textContent = text;
  }

  // --- Event listeners ---
  presetSelect.addEventListener("change", () => {
    loadPreset(presetSelect.value);
  });

  startNodeSelect.addEventListener("change", () => {
    startNode = parseInt(startNodeSelect.value, 10);
  });

  btnRun.addEventListener("click", runAlgorithm);
  btnReset.addEventListener("click", resetAlgo);
  btnStepBack.addEventListener("click", stepBack);
  btnPlay.addEventListener("click", startPlay);
  btnPause.addEventListener("click", stopPlay);
  btnStep.addEventListener("click", stepForward);

  // --- Cleanup timers on page unload ---
  window.addEventListener("unload", stopPlay);

  // --- Initialize with default preset ---
  loadPreset("small");
  updatePlaybackButtons();
})();
