/* Floyd-Warshall All-Pairs Shortest Paths Visualization — AlgoViz */
(() => {
  "use strict";

  // --- Constants ---
  const MAX_VERTICES = 8;
  const VERTEX_LABELS = "ABCDEFGH";

  // --- Preset graphs ---
  const PRESETS = {
    simple: {
      label: "Simple 4-node",
      numVertices: 4,
      edges: [
        { from: 0, to: 1, weight: 3 },
        { from: 0, to: 2, weight: 8 },
        { from: 0, to: 3, weight: -4 },
        { from: 1, to: 3, weight: 7 },
        { from: 1, to: 2, weight: 4 },
        { from: 2, to: 1, weight: -5 },
        { from: 3, to: 2, weight: 6 },
      ],
    },
    cities: {
      label: "City Routes (5 nodes)",
      numVertices: 5,
      edges: [
        { from: 0, to: 1, weight: 2 },
        { from: 0, to: 2, weight: 6 },
        { from: 1, to: 2, weight: 3 },
        { from: 1, to: 3, weight: 8 },
        { from: 2, to: 3, weight: 2 },
        { from: 2, to: 4, weight: 5 },
        { from: 3, to: 4, weight: 1 },
        { from: 4, to: 0, weight: 7 },
      ],
    },
    complete: {
      label: "Complete 4-node",
      numVertices: 4,
      edges: [
        { from: 0, to: 1, weight: 1 },
        { from: 0, to: 2, weight: 4 },
        { from: 0, to: 3, weight: 7 },
        { from: 1, to: 0, weight: 1 },
        { from: 1, to: 2, weight: 2 },
        { from: 1, to: 3, weight: 5 },
        { from: 2, to: 0, weight: 4 },
        { from: 2, to: 1, weight: 2 },
        { from: 2, to: 3, weight: 1 },
        { from: 3, to: 0, weight: 7 },
        { from: 3, to: 1, weight: 5 },
        { from: 3, to: 2, weight: 1 },
      ],
    },
  };

  // --- State ---
  let numVertices = 4;
  let edges = [];
  let adjMatrix = null;
  let result = null; // floydWarshall result
  let currentStep = -1;
  let playing = false;
  let playTimer = null;
  let selectedPair = null; // { i, j } for path display

  // --- DOM refs ---
  const presetSelect = document.getElementById("fw-presetSelect");
  const btnLoadPreset = document.getElementById("fw-btnLoadPreset");
  const btnCustom = document.getElementById("fw-btnCustom");
  const customPanel = document.getElementById("fw-customPanel");
  const vertexCountInput = document.getElementById("fw-vertexCount");
  const edgeListInput = document.getElementById("fw-edgeList");
  const btnApplyCustom = document.getElementById("fw-btnApplyCustom");
  const btnRun = document.getElementById("fw-btnRun");
  const infoEl = document.getElementById("fw-info");
  const playbackEl = document.getElementById("fw-playback");
  const btnReset = document.getElementById("fw-btnReset");
  const btnStepBack = document.getElementById("fw-btnStepBack");
  const btnPlay = document.getElementById("fw-btnPlay");
  const btnPause = document.getElementById("fw-btnPause");
  const btnStep = document.getElementById("fw-btnStep");
  const speedSlider = document.getElementById("fw-speed");
  const stepCountEl = document.getElementById("fw-stepCount");
  const distMatrixEl = document.getElementById("fw-distMatrix");
  const predMatrixEl = document.getElementById("fw-predMatrix");
  const narrativeEl = document.getElementById("fw-narrative");
  const pathInfoEl = document.getElementById("fw-pathInfo");
  const graphSvg = document.getElementById("fw-graphSvg");

  // --- Helpers ---
  function getDelay() {
    return 900 - (speedSlider.value - 1) * 80;
  }

  function label(i) {
    return VERTEX_LABELS[i];
  }

  function distStr(d) {
    return d === Infinity ? "\u221e" : String(d);
  }

  // --- Load a preset into state ---
  function loadPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    numVertices = preset.numVertices;
    edges = preset.edges.slice();
    adjMatrix = FloydWarshallAlgorithm.createAdjacencyMatrix(
      edges,
      numVertices,
    );
    result = null;
    currentStep = -1;
    selectedPair = null;
    renderInputGraph();
    renderMatrices(null, null);
    setInfo(
      "Preset loaded: " + preset.label + ". Click Run to start Floyd-Warshall.",
    );
    playbackEl.style.display = "none";
    pathInfoEl.textContent = "";
    narrativeEl.textContent = "";
  }

  // --- Parse custom edge list ---
  // Format: "from to weight" per line, 0-indexed vertices
  function parseCustomEdges() {
    const n = parseInt(vertexCountInput.value, 10);
    if (isNaN(n) || n < 1 || n > MAX_VERTICES) {
      setInfo(
        "Error: vertex count must be between 1 and " + MAX_VERTICES + ".",
      );
      return false;
    }
    const lines = edgeListInput.value.trim().split("\n");
    const newEdges = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/[\s,]+/);
      if (parts.length < 3) {
        setInfo("Error on line " + (i + 1) + ": expected 'from to weight'.");
        return false;
      }
      const from = parseInt(parts[0], 10);
      const to = parseInt(parts[1], 10);
      const weight = parseInt(parts[2], 10);
      if (
        isNaN(from) ||
        isNaN(to) ||
        isNaN(weight) ||
        from < 0 ||
        from >= n ||
        to < 0 ||
        to >= n
      ) {
        setInfo(
          "Error on line " +
            (i + 1) +
            ": vertex indices must be 0.." +
            (n - 1) +
            " and weight must be a number.",
        );
        return false;
      }
      newEdges.push({ from, to, weight });
    }
    numVertices = n;
    edges = newEdges;
    adjMatrix = FloydWarshallAlgorithm.createAdjacencyMatrix(
      edges,
      numVertices,
    );
    result = null;
    currentStep = -1;
    selectedPair = null;
    renderInputGraph();
    renderMatrices(null, null);
    setInfo(
      "Custom graph loaded (" +
        numVertices +
        " vertices, " +
        edges.length +
        " edges). Click Run to start.",
    );
    playbackEl.style.display = "none";
    pathInfoEl.textContent = "";
    narrativeEl.textContent = "";
    return true;
  }

  // --- Run Floyd-Warshall ---
  function runAlgorithm() {
    if (!adjMatrix) {
      setInfo("Load a preset or custom graph first.");
      return;
    }
    result = FloydWarshallAlgorithm.floydWarshall(adjMatrix);
    currentStep = 0;
    playing = false;
    selectedPair = null;
    pathInfoEl.textContent = "";
    applyStep(currentStep);
    playbackEl.style.display = "flex";
    updatePlaybackButtons();
  }

  // --- Build dist/pred snapshots up to a given step ---
  function buildSnapshots(stepIdx) {
    const n = numVertices;
    const distSnap = [];
    const predSnap = [];
    for (let i = 0; i < n; i++) {
      distSnap[i] = adjMatrix[i].slice();
      predSnap[i] = [];
      for (let j = 0; j < n; j++) {
        predSnap[i][j] = i === j || adjMatrix[i][j] === Infinity ? null : i;
      }
    }
    const steps = result.steps;
    for (let s = 0; s <= stepIdx; s++) {
      const step = steps[s];
      if (step.updated) {
        distSnap[step.i][step.j] = step.newDist;
        predSnap[step.i][step.j] = predSnap[step.k][step.j];
      }
    }
    return { distSnap, predSnap };
  }

  // --- Apply a step to the visualization ---
  function applyStep(stepIdx) {
    if (!result) return;
    const { distSnap, predSnap } = buildSnapshots(stepIdx);
    const steps = result.steps;

    const currentStepData = steps[stepIdx];
    const activeK = currentStepData ? currentStepData.k : -1;
    const activeI = currentStepData ? currentStepData.i : -1;
    const activeJ = currentStepData ? currentStepData.j : -1;

    renderMatrices(distSnap, predSnap, activeK, activeI, activeJ);
    updateNarrative(currentStepData);
    stepCountEl.textContent = stepIdx + 1 + " / " + steps.length;

    if (selectedPair !== null) {
      showPath(predSnap, selectedPair.i, selectedPair.j, distSnap);
    }

    renderGraph(distSnap, predSnap, activeK);
  }

  // --- Narrative ---
  function updateNarrative(step) {
    if (!step) {
      narrativeEl.textContent = "";
      return;
    }
    const through = "via " + label(step.k);
    const route =
      label(step.i) + "\u2192" + label(step.k) + "\u2192" + label(step.j);
    if (step.updated) {
      narrativeEl.textContent =
        "Updated dist[" +
        label(step.i) +
        "][" +
        label(step.j) +
        "]: " +
        distStr(step.oldDist) +
        " \u2192 " +
        distStr(step.newDist) +
        " (" +
        through +
        ", path " +
        route +
        ")";
    } else {
      narrativeEl.textContent =
        "Checking " +
        label(step.i) +
        "\u2192" +
        label(step.j) +
        " via " +
        label(step.k) +
        ": " +
        distStr(step.oldDist) +
        " \u2264 " +
        distStr(step.newDist) +
        " — no improvement.";
    }
  }

  // --- Render distance + predecessor matrices ---
  function renderMatrices(distData, predData, activeK, activeI, activeJ) {
    renderMatrix(distMatrixEl, distData, activeK, activeI, activeJ, "dist");
    renderMatrix(predMatrixEl, predData, activeK, activeI, activeJ, "pred");
  }

  function renderMatrix(container, data, activeK, activeI, activeJ, type) {
    // Clear
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const n = numVertices;
    const table = document.createElement("table");
    table.className = "fw-matrix-table";

    // Header row
    const headerRow = document.createElement("tr");
    const cornerCell = document.createElement("th");
    cornerCell.className = "fw-matrix-corner";
    headerRow.appendChild(cornerCell);
    for (let j = 0; j < n; j++) {
      const th = document.createElement("th");
      th.className = "fw-matrix-header";
      if (j === activeK) th.classList.add("fw-col-active-k");
      if (j === activeJ) th.classList.add("fw-col-active");
      th.textContent = label(j);
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Data rows
    for (let i = 0; i < n; i++) {
      const tr = document.createElement("tr");
      // Row label
      const rowLabel = document.createElement("th");
      rowLabel.className = "fw-matrix-header";
      if (i === activeK) rowLabel.classList.add("fw-row-active-k");
      if (i === activeI) rowLabel.classList.add("fw-row-active");
      rowLabel.textContent = label(i);
      tr.appendChild(rowLabel);

      for (let j = 0; j < n; j++) {
        const td = document.createElement("td");
        td.className = "fw-matrix-cell";

        // Highlight active cell
        if (i === activeI && j === activeJ) {
          td.classList.add("fw-cell-active");
        } else if (i === activeK || j === activeK) {
          td.classList.add("fw-cell-k");
        }

        // Clickable for path display (dist matrix only)
        if (type === "dist" && data !== null && i !== j) {
          td.classList.add("fw-cell-clickable");
          if (
            selectedPair !== null &&
            selectedPair.i === i &&
            selectedPair.j === j
          ) {
            td.classList.add("fw-cell-selected");
          }
          td.addEventListener("click", () => {
            onCellClick(i, j);
          });
        }

        if (data === null) {
          td.textContent = "—";
        } else if (type === "pred") {
          const v = data[i][j];
          td.textContent = v === null ? "\u2014" : label(v);
        } else {
          td.textContent = distStr(data[i][j]);
        }

        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    container.appendChild(table);
  }

  // --- Cell click: show reconstructed path ---
  function onCellClick(i, j) {
    if (!result) return;
    selectedPair = { i, j };
    const { predSnap, distSnap } = buildSnapshots(currentStep);
    showPath(predSnap, i, j, distSnap);
    // Re-render matrices to highlight selected cell
    const step = result.steps[currentStep];
    const activeK = step ? step.k : -1;
    const activeI = step ? step.i : -1;
    const activeJ = step ? step.j : -1;
    renderMatrices(distSnap, predSnap, activeK, activeI, activeJ);
    renderGraph(distSnap, predSnap, activeK);
  }

  function showPath(predSnap, i, j, distSnap) {
    const path = FloydWarshallAlgorithm.reconstructPath(predSnap, i, j);
    if (path === null) {
      pathInfoEl.textContent =
        "No path from " + label(i) + " to " + label(j) + ".";
    } else if (i === j) {
      pathInfoEl.textContent =
        "Path " +
        label(i) +
        " \u2192 " +
        label(j) +
        ": [" +
        label(i) +
        "] (distance 0)";
    } else {
      const dist = distSnap ? distSnap[i][j] : "?";
      const pathStr = path.map(label).join(" \u2192 ");
      pathInfoEl.textContent =
        "Shortest path " +
        label(i) +
        " \u2192 " +
        label(j) +
        ": " +
        pathStr +
        " (distance " +
        distStr(dist) +
        ")";
    }
  }

  // --- Graph SVG rendering ---
  function renderInputGraph() {
    renderGraph(null, null, -1);
  }

  function renderGraph(distData, predData, activeK) {
    // Clear SVG
    while (graphSvg.firstChild) {
      graphSvg.removeChild(graphSvg.firstChild);
    }

    const svgW = graphSvg.getAttribute("width");
    const svgH = graphSvg.getAttribute("height");
    const cx = svgW / 2;
    const cy = svgH / 2;
    const r = Math.min(cx, cy) - 45;
    const nr = 18; // node radius

    // Compute vertex positions (circle layout)
    const pos = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = (2 * Math.PI * i) / numVertices - Math.PI / 2;
      pos.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }

    // Determine highlighted path edges
    const pathEdgeSet = new Set();
    if (selectedPair !== null && predData !== null) {
      const path = FloydWarshallAlgorithm.reconstructPath(
        predData,
        selectedPair.i,
        selectedPair.j,
      );
      if (path && path.length > 1) {
        for (let p = 0; p < path.length - 1; p++) {
          pathEdgeSet.add(path[p] + "-" + path[p + 1]);
        }
      }
    }

    // Define arrowhead markers
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    function makeMarker(id, color) {
      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker",
      );
      marker.setAttribute("id", id);
      marker.setAttribute("markerWidth", "8");
      marker.setAttribute("markerHeight", "8");
      marker.setAttribute("refX", "6");
      marker.setAttribute("refY", "3");
      marker.setAttribute("orient", "auto");
      const arrow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      arrow.setAttribute("d", "M0,0 L0,6 L8,3 z");
      arrow.setAttribute("fill", color);
      marker.appendChild(arrow);
      defs.appendChild(marker);
    }

    makeMarker("fw-arrow-default", "#30363d");
    makeMarker("fw-arrow-path", "#3fb950");
    makeMarker("fw-arrow-k", "#e3b341");
    graphSvg.appendChild(defs);

    // Draw edges
    for (let e = 0; e < edges.length; e++) {
      const edge = edges[e];
      const from = pos[edge.from];
      const to = pos[edge.to];
      const key = edge.from + "-" + edge.to;
      const isPath = pathEdgeSet.has(key);
      const isKEdge =
        activeK >= 0 && (edge.from === activeK || edge.to === activeK);

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;

      // Offset so line starts/ends at node border
      const x1 = from.x + ux * (nr + 2);
      const y1 = from.y + uy * (nr + 2);
      const x2 = to.x - ux * (nr + 10);
      const y2 = to.y - uy * (nr + 10);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke-width", isPath ? "2.5" : "1.5");
      line.setAttribute(
        "stroke",
        isPath ? "#3fb950" : isKEdge ? "#e3b341" : "#30363d",
      );
      line.setAttribute(
        "marker-end",
        isPath
          ? "url(#fw-arrow-path)"
          : isKEdge
            ? "url(#fw-arrow-k)"
            : "url(#fw-arrow-default)",
      );
      graphSvg.appendChild(line);

      // Edge weight label
      const midX = (x1 + x2) / 2 - uy * 10;
      const midY = (y1 + y2) / 2 + ux * 10;
      const wLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      wLabel.setAttribute("x", midX);
      wLabel.setAttribute("y", midY);
      wLabel.setAttribute("text-anchor", "middle");
      wLabel.setAttribute("dominant-baseline", "middle");
      wLabel.setAttribute("font-size", "11");
      wLabel.setAttribute(
        "fill",
        isPath ? "#3fb950" : isKEdge ? "#e3b341" : "#8b949e",
      );
      wLabel.setAttribute("font-family", "inherit");
      wLabel.textContent = String(edge.weight);
      graphSvg.appendChild(wLabel);
    }

    // Draw nodes
    for (let i = 0; i < numVertices; i++) {
      const p = pos[i];
      const isK = i === activeK;
      const isPathNode =
        selectedPair !== null && (i === selectedPair.i || i === selectedPair.j);

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", nr);
      circle.setAttribute(
        "fill",
        isK ? "#d2992230" : isPathNode ? "#23863630" : "#21262d",
      );
      circle.setAttribute(
        "stroke",
        isK ? "#e3b341" : isPathNode ? "#3fb950" : "#30363d",
      );
      circle.setAttribute("stroke-width", isK || isPathNode ? "2.5" : "1.5");
      graphSvg.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", p.x);
      text.setAttribute("y", p.y);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "13");
      text.setAttribute("font-weight", "600");
      text.setAttribute(
        "fill",
        isK ? "#e3b341" : isPathNode ? "#3fb950" : "#c9d1d9",
      );
      text.setAttribute("font-family", "inherit");
      text.textContent = label(i);
      graphSvg.appendChild(text);

      // Show dist from selectedPair.i if available
      if (distData !== null && selectedPair !== null) {
        const d = distData[selectedPair.i][i];
        const dLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        dLabel.setAttribute("x", p.x);
        dLabel.setAttribute("y", p.y - nr - 6);
        dLabel.setAttribute("text-anchor", "middle");
        dLabel.setAttribute("font-size", "10");
        dLabel.setAttribute("fill", "#58a6ff");
        dLabel.setAttribute("font-family", "inherit");
        dLabel.textContent = distStr(d);
        graphSvg.appendChild(dLabel);
      }
    }
  }

  // --- Info bar ---
  function setInfo(msg) {
    infoEl.textContent = msg;
  }

  // --- Playback ---
  function updatePlaybackButtons() {
    if (!result) return;
    const total = result.steps.length;
    btnStepBack.disabled = currentStep <= 0;
    btnStep.disabled = currentStep >= total - 1;
    btnPlay.disabled = playing || currentStep >= total - 1;
    btnPause.disabled = !playing;
    if (currentStep >= total - 1 && !playing) {
      setInfo(
        "Floyd-Warshall complete. Click any cell in the distance matrix to view the shortest path.",
      );
    }
  }

  function stepForward() {
    if (!result) return;
    if (currentStep < result.steps.length - 1) {
      currentStep++;
      applyStep(currentStep);
      updatePlaybackButtons();
    }
  }

  function stepBackward() {
    if (!result) return;
    if (currentStep > 0) {
      currentStep--;
      applyStep(currentStep);
      updatePlaybackButtons();
    }
  }

  function startPlaying() {
    if (!result || playing) return;
    if (currentStep >= result.steps.length - 1) return;
    playing = true;
    updatePlaybackButtons();
    function tick() {
      if (!playing || currentStep >= result.steps.length - 1) {
        playing = false;
        updatePlaybackButtons();
        return;
      }
      currentStep++;
      applyStep(currentStep);
      updatePlaybackButtons();
      playTimer = setTimeout(tick, getDelay());
    }
    tick();
  }

  function stopPlaying() {
    playing = false;
    if (playTimer !== null) {
      clearTimeout(playTimer);
      playTimer = null;
    }
    updatePlaybackButtons();
  }

  function resetVisualization() {
    stopPlaying();
    result = null;
    currentStep = -1;
    selectedPair = null;
    playbackEl.style.display = "none";
    narrativeEl.textContent = "";
    pathInfoEl.textContent = "";
    stepCountEl.textContent = "0";
    renderMatrices(null, null);
    renderInputGraph();
    setInfo("Reset. Load a preset or enter a custom graph, then click Run.");
  }

  // --- Event handlers ---
  btnLoadPreset.addEventListener("click", () => {
    loadPreset(presetSelect.value);
  });

  btnCustom.addEventListener("click", () => {
    const isHidden = customPanel.style.display === "none";
    customPanel.style.display = isHidden ? "block" : "none";
    btnCustom.textContent = isHidden ? "Hide Custom Input" : "Custom Graph";
  });

  btnApplyCustom.addEventListener("click", () => {
    if (parseCustomEdges()) {
      customPanel.style.display = "none";
      btnCustom.textContent = "Custom Graph";
    }
  });

  btnRun.addEventListener("click", () => {
    runAlgorithm();
  });

  btnReset.addEventListener("click", resetVisualization);
  btnStep.addEventListener("click", stepForward);
  btnStepBack.addEventListener("click", stepBackward);
  btnPlay.addEventListener("click", startPlaying);
  btnPause.addEventListener("click", stopPlaying);

  // Cleanup timers on page unload
  window.addEventListener("unload", () => {
    if (playTimer !== null) {
      clearTimeout(playTimer);
      playTimer = null;
    }
  });

  // --- Init ---
  loadPreset("simple");
  setInfo(
    "Preset loaded. Click Run to start Floyd-Warshall, or load another preset / custom graph.",
  );
})();
