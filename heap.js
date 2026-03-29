/* Min-Heap (Priority Queue) Visualization — AlgoViz */
(() => {
  "use strict";

  // All algorithm logic lives in HeapAlgorithm (heap-algorithm.js).
  // This file only handles DOM and visualization — NO redeclaration of
  // constants or pure functions from the algorithm module.

  // --- Speed map: slider value (1-10) -> milliseconds per step ---
  const SPEED_MAP = [null, 1200, 1000, 800, 600, 450, 300, 200, 130, 80, 40];

  // --- CSS class names used for history log entries ---
  const HISTORY_CLASSES = {
    insert: "hp-history-entry-insert",
    extract: "hp-history-entry-extract",
    build: "hp-history-entry-build",
  };

  // --- State ---
  let heap = HeapAlgorithm.createHeap();
  let pendingSteps = [];
  let currentStepIdx = -1;
  let playing = false;
  let playTimer = null;
  let totalComparisons = 0;
  let totalSwaps = 0;
  let historyEntries = [];
  // activeIndices: set of indices to highlight in current step
  let activeIndices = [];
  let activeType = ""; // "compare" | "swap" | "extract"

  // --- DOM refs ---
  const insertValInput = document.getElementById("hp-insertVal");
  const btnInsert = document.getElementById("hp-btnInsert");
  const btnExtract = document.getElementById("hp-btnExtract");
  const buildInput = document.getElementById("hp-buildInput");
  const btnBuild = document.getElementById("hp-btnBuild");
  const btnReset = document.getElementById("hp-btnReset");
  const errorEl = document.getElementById("hp-error");
  const btnStepBack = document.getElementById("hp-btnStepBack");
  const btnPlay = document.getElementById("hp-btnPlay");
  const btnPause = document.getElementById("hp-btnPause");
  const btnStepNext = document.getElementById("hp-btnStepNext");
  const speedSlider = document.getElementById("hp-speed");
  const stepCounterEl = document.getElementById("hp-stepCounter");
  const narrativeEl = document.getElementById("hp-narrative");
  const treeSvg = document.getElementById("hp-treeSvg");
  const arrayRowEl = document.getElementById("hp-arrayRow");
  const sizeValEl = document.getElementById("hp-sizeVal");
  const comparisonsEl = document.getElementById("hp-comparisons");
  const swapsEl = document.getElementById("hp-swaps");
  const minValEl = document.getElementById("hp-minVal");
  const historyLogEl = document.getElementById("hp-historyLog");

  // Watch panel refs
  const hpWatchOp = document.getElementById("hp-watch-op");
  const hpWatchCurr = document.getElementById("hp-watch-curr");
  const hpWatchParent = document.getElementById("hp-watch-parent");
  const hpWatchAction = document.getElementById("hp-watch-action");
  const hpWatchSize = document.getElementById("hp-watch-size");

  // --- Watch panel ---
  function updateWatch(step) {
    var em = "\u2014";
    if (!step) {
      hpWatchOp.textContent = em;
      hpWatchOp.className = "algo-watch-value";
      hpWatchCurr.textContent = em;
      hpWatchCurr.className = "algo-watch-value";
      hpWatchParent.textContent = em;
      hpWatchParent.className = "algo-watch-value";
      hpWatchAction.textContent = em;
      hpWatchAction.className = "algo-watch-value";
      hpWatchSize.textContent = em;
      hpWatchSize.className = "algo-watch-value";
      return;
    }
    hpWatchOp.textContent = step.type;
    hpWatchOp.className = "algo-watch-value aw-neutral";
    var i0 =
      step.indices && step.indices[0] !== undefined ? step.indices[0] : -1;
    var i1 =
      step.indices && step.indices[1] !== undefined ? step.indices[1] : -1;
    var v0 = step.values && step.values[0] !== undefined ? step.values[0] : em;
    var v1 = step.values && step.values[1] !== undefined ? step.values[1] : em;
    if (i0 >= 0) {
      hpWatchCurr.textContent = i0 + " / " + v0;
      hpWatchCurr.className = "algo-watch-value aw-highlight";
    } else {
      hpWatchCurr.textContent = em;
      hpWatchCurr.className = "algo-watch-value";
    }
    if (i1 >= 0) {
      hpWatchParent.textContent = i1 + " / " + v1;
      hpWatchParent.className = "algo-watch-value aw-neutral";
    } else {
      hpWatchParent.textContent = em;
      hpWatchParent.className = "algo-watch-value";
    }
    if (step.type === "swap") {
      hpWatchAction.textContent = "swap";
      hpWatchAction.className = "algo-watch-value aw-error";
    } else if (step.type === "compare") {
      hpWatchAction.textContent = "compare";
      hpWatchAction.className = "algo-watch-value aw-warn";
    } else if (step.type === "extract") {
      hpWatchAction.textContent = "extract min";
      hpWatchAction.className = "algo-watch-value aw-success";
    } else if (step.type === "insert") {
      hpWatchAction.textContent = "insert";
      hpWatchAction.className = "algo-watch-value aw-highlight";
    } else {
      hpWatchAction.textContent = step.type;
      hpWatchAction.className = "algo-watch-value aw-neutral";
    }
    hpWatchSize.textContent = step.heapSnapshot
      ? String(step.heapSnapshot.length)
      : em;
    hpWatchSize.className = "algo-watch-value aw-neutral";
  }

  // --- Timer cleanup ---
  function clearPlayTimer() {
    if (playTimer !== null) {
      clearTimeout(playTimer);
      playTimer = null;
    }
  }

  // --- Narrative messages ---
  function narrativeForStep(step) {
    if (!step) return "Ready.";
    const i = step.indices;
    const v = step.values;
    switch (step.type) {
      case "insert":
        return (
          "Inserting " +
          v[0] +
          " at index " +
          i[0] +
          " — sifting up to restore heap property."
        );
      case "compare":
        return (
          "Comparing index " +
          i[0] +
          " (value " +
          v[0] +
          ") with index " +
          i[1] +
          " (value " +
          v[1] +
          ")."
        );
      case "swap":
        return (
          "Swapping index " +
          i[0] +
          " (value " +
          v[0] +
          ") with index " +
          i[1] +
          " (value " +
          v[1] +
          ")."
        );
      case "extract":
        return "Extracting minimum value " + v[0] + " from root.";
      default:
        return "";
    }
  }

  // --- Playback controls ---
  function updatePlaybackControls() {
    const hasSteps = pendingSteps.length > 0;
    const atStart = currentStepIdx <= -1;
    const atEnd = currentStepIdx >= pendingSteps.length - 1;
    btnStepBack.disabled = atStart || !hasSteps;
    btnPlay.disabled = atEnd || !hasSteps || playing;
    btnPause.disabled = !playing;
    btnStepNext.disabled = atEnd || !hasSteps;
    if (hasSteps) {
      stepCounterEl.textContent =
        "Step " + (currentStepIdx + 1) + " / " + pendingSteps.length;
    } else {
      stepCounterEl.textContent = "";
    }
  }

  // --- Apply a step: update activeIndices and activeType from step ---
  function applyStep(step) {
    activeIndices = step.indices ? step.indices.slice() : [];
    activeType = step.type;
    // Update heap data to the snapshot state
    heap.data = step.heapSnapshot.slice();
  }

  // --- Render both views ---
  function renderAll() {
    renderTree(heap.data, activeIndices, activeType);
    renderArray(heap.data, activeIndices, activeType);
    updateStats();
    updatePlaybackControls();
  }

  // --- Compute SVG tree node positions ---
  // Returns array of { x, y, idx, value, parentIdx }
  function computeTreeLayout(data) {
    const n = data.length;
    if (n === 0) return [];

    const svgWidth = treeSvg.clientWidth || 600;
    const svgHeight = 300;
    const levels = Math.ceil(Math.log2(n + 1));
    const nodeRadius = Math.max(14, Math.min(20, (svgWidth / (n + 1)) * 0.6));
    const levelHeight = Math.max(50, (svgHeight - 20) / (levels + 0.5));

    const nodes = [];
    for (let i = 0; i < n; i++) {
      // Level of node i (0-indexed)
      const level = Math.floor(Math.log2(i + 1));
      // Position within level (0-indexed)
      const posInLevel = i - (Math.pow(2, level) - 1);
      const nodesInLevel = Math.pow(2, level);
      const cellWidth = svgWidth / nodesInLevel;
      const x = cellWidth * posInLevel + cellWidth / 2;
      const y = 30 + level * levelHeight;
      const parentIdx = i === 0 ? -1 : Math.floor((i - 1) / 2);
      nodes.push({ x, y, idx: i, value: data[i], parentIdx, nodeRadius });
    }
    return nodes;
  }

  // --- Render tree SVG ---
  function renderTree(data, highlightIndices, highlightType) {
    // Clear SVG
    while (treeSvg.firstChild) treeSvg.removeChild(treeSvg.firstChild);

    if (data.length === 0) {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", "50%");
      t.setAttribute("y", "50%");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "central");
      t.setAttribute("fill", "#8b949e");
      t.setAttribute("font-size", "13");
      t.textContent = "Empty heap";
      treeSvg.appendChild(t);
      return;
    }

    const nodes = computeTreeLayout(data);

    // Draw edges first (behind circles)
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      const parent = nodes[node.parentIdx];
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", parent.x);
      line.setAttribute("y1", parent.y);
      line.setAttribute("x2", node.x);
      line.setAttribute("y2", node.y);

      const bothHighlighted =
        highlightIndices.includes(i) &&
        highlightIndices.includes(node.parentIdx);
      if (highlightType === "swap" && bothHighlighted) {
        line.setAttribute("class", "hp-edge-line-swap");
      } else if (
        (highlightType === "compare" || highlightType === "swap") &&
        (highlightIndices.includes(i) ||
          highlightIndices.includes(node.parentIdx))
      ) {
        line.setAttribute("class", "hp-edge-line-active");
      } else {
        line.setAttribute("class", "hp-edge-line");
      }
      treeSvg.appendChild(line);
    }

    // Draw nodes
    for (const node of nodes) {
      const isHighlighted = highlightIndices.includes(node.idx);
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", node.nodeRadius);

      if (isHighlighted) {
        if (highlightType === "extract") {
          circle.setAttribute("class", "hp-node-circle-extract");
        } else if (highlightType === "swap") {
          circle.setAttribute("class", "hp-node-circle-swap");
        } else if (highlightType === "compare") {
          circle.setAttribute("class", "hp-node-circle-active");
        } else {
          circle.setAttribute("class", "hp-node-circle-active");
        }
      } else if (node.idx === 0) {
        circle.setAttribute("class", "hp-node-circle-root");
      } else {
        circle.setAttribute("class", "hp-node-circle");
      }

      // Value label
      const valText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      valText.setAttribute("x", node.x);
      valText.setAttribute("y", node.y);
      valText.setAttribute("class", "hp-node-label-text");
      valText.textContent = String(node.value);

      // Index label (small, below node)
      const idxText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      idxText.setAttribute("x", node.x);
      idxText.setAttribute("y", node.y + node.nodeRadius + 9);
      idxText.setAttribute("class", "hp-node-index-text");
      idxText.textContent = String(node.idx);

      g.appendChild(circle);
      g.appendChild(valText);
      g.appendChild(idxText);
      treeSvg.appendChild(g);
    }
  }

  // --- Render array backing store ---
  function renderArray(data, highlightIndices, highlightType) {
    // Clear
    while (arrayRowEl.firstChild) arrayRowEl.removeChild(arrayRowEl.firstChild);

    if (data.length === 0) {
      const emptyMsg = document.createElement("span");
      emptyMsg.className = "hp-label";
      emptyMsg.textContent = "Empty";
      arrayRowEl.appendChild(emptyMsg);
      return;
    }

    // Compute bar heights relative to max value
    const maxVal = Math.max(...data.map(Math.abs)) || 1;
    const minBarHeight = 16;
    const maxBarHeight = 48;

    for (let i = 0; i < data.length; i++) {
      const isHighlighted = highlightIndices.includes(i);
      const barHeight =
        minBarHeight +
        (Math.abs(data[i]) / maxVal) * (maxBarHeight - minBarHeight);

      const cell = document.createElement("div");
      cell.className = "hp-array-cell";

      const bar = document.createElement("div");
      bar.className = "hp-array-bar";
      bar.style.height = barHeight + "px";

      if (isHighlighted) {
        if (highlightType === "extract") {
          bar.className += " hp-array-bar-extract";
        } else if (highlightType === "swap") {
          bar.className += " hp-array-bar-swap";
        } else {
          bar.className += " hp-array-bar-active";
        }
      }

      const valSpan = document.createElement("span");
      valSpan.className = "hp-array-val";
      valSpan.textContent = String(data[i]);

      const idxSpan = document.createElement("span");
      idxSpan.className = "hp-array-idx";
      idxSpan.textContent = String(i);

      bar.appendChild(valSpan);
      cell.appendChild(bar);
      cell.appendChild(idxSpan);
      arrayRowEl.appendChild(cell);
    }
  }

  // --- Update stats display ---
  function updateStats() {
    sizeValEl.textContent = String(HeapAlgorithm.size(heap));
    comparisonsEl.textContent = String(totalComparisons);
    swapsEl.textContent = String(totalSwaps);
    const min = HeapAlgorithm.peek(heap);
    minValEl.textContent = min !== null ? String(min) : "—";
  }

  // --- Add history entry ---
  function addHistoryEntry(type, label) {
    historyEntries.push({ type, label });
    const li = document.createElement("li");
    li.className = "hp-history-entry " + (HISTORY_CLASSES[type] || "");
    li.textContent = label;
    historyLogEl.appendChild(li);
    historyLogEl.scrollTop = historyLogEl.scrollHeight;
  }

  // --- Load steps from an operation result ---
  function loadSteps(steps) {
    clearPlayTimer();
    playing = false;
    pendingSteps = steps;
    currentStepIdx = -1;
    activeIndices = [];
    activeType = "";
  }

  // --- Step forward ---
  function stepForward() {
    if (currentStepIdx >= pendingSteps.length - 1) return;
    currentStepIdx++;
    const step = pendingSteps[currentStepIdx];
    applyStep(step);
    narrativeEl.textContent = narrativeForStep(step);
    updateWatch(step);
    renderAll();
  }

  // --- Step backward ---
  function stepBackward() {
    if (currentStepIdx <= -1) return;
    currentStepIdx--;
    if (currentStepIdx >= 0) {
      const step = pendingSteps[currentStepIdx];
      applyStep(step);
      narrativeEl.textContent = narrativeForStep(step);
      updateWatch(step);
    } else {
      // Back to pre-operation state: first step's snapshot is post-first-action,
      // so use the snapshot before first step if available
      activeIndices = [];
      activeType = "";
      if (pendingSteps.length > 0) {
        // We don't have a "before" snapshot stored, so show empty highlight
        heap.data = pendingSteps[0].heapSnapshot.slice();
        narrativeEl.textContent = "Ready.";
      }
      updateWatch(null);
    }
    renderAll();
  }

  // --- Play loop ---
  function scheduleNext() {
    if (!playing) return;
    if (currentStepIdx >= pendingSteps.length - 1) {
      playing = false;
      updatePlaybackControls();
      return;
    }
    const speed = parseInt(speedSlider.value, 10);
    const delay = SPEED_MAP[speed] || 300;
    playTimer = setTimeout(() => {
      stepForward();
      scheduleNext();
    }, delay);
  }

  // --- Count comparisons and swaps in a step array ---
  function countOps(steps) {
    let comparisons = 0;
    let swaps = 0;
    for (const s of steps) {
      if (s.type === "compare") comparisons++;
      if (s.type === "swap") swaps++;
    }
    return { comparisons, swaps };
  }

  // --- Reset all state ---
  function resetAll() {
    clearPlayTimer();
    playing = false;
    heap = HeapAlgorithm.createHeap();
    pendingSteps = [];
    currentStepIdx = -1;
    activeIndices = [];
    activeType = "";
    totalComparisons = 0;
    totalSwaps = 0;
    historyEntries = [];
    while (historyLogEl.firstChild)
      historyLogEl.removeChild(historyLogEl.firstChild);
    errorEl.textContent = "";
    narrativeEl.textContent = "Insert a value or build a heap to begin.";
    updateWatch(null);
    renderAll();
  }

  // --- Error helpers ---
  function showError(msg) {
    errorEl.textContent = msg;
  }

  function clearError() {
    errorEl.textContent = "";
  }

  // --- Event handlers ---

  btnInsert.addEventListener("click", () => {
    clearError();
    const raw = insertValInput.value.trim();
    if (raw === "") {
      showError("Enter a value to insert.");
      return;
    }
    const val = parseInt(raw, 10);
    if (isNaN(val)) {
      showError("Value must be an integer.");
      return;
    }
    if (val < -999 || val > 999) {
      showError("Value must be between -999 and 999.");
      return;
    }
    if (HeapAlgorithm.size(heap) >= HeapAlgorithm.MAX_SIZE) {
      showError("Heap is full (" + HeapAlgorithm.MAX_SIZE + " elements max).");
      return;
    }

    clearPlayTimer();
    playing = false;
    activeIndices = [];
    activeType = "";

    const result = HeapAlgorithm.insert(heap, val);
    const ops = countOps(result.steps);
    totalComparisons += ops.comparisons;
    totalSwaps += ops.swaps;

    loadSteps(result.steps);
    addHistoryEntry("insert", "Insert(" + val + ")");
    narrativeEl.textContent = "Inserted " + val + ". Use Step/Play to animate.";
    renderAll();
  });

  btnExtract.addEventListener("click", () => {
    clearError();
    if (HeapAlgorithm.size(heap) === 0) {
      showError("Heap is empty.");
      return;
    }

    clearPlayTimer();
    playing = false;
    activeIndices = [];
    activeType = "";

    const result = HeapAlgorithm.extractMin(heap);
    const ops = countOps(result.steps);
    totalComparisons += ops.comparisons;
    totalSwaps += ops.swaps;

    loadSteps(result.steps);
    addHistoryEntry("extract", "ExtractMin() = " + result.value);
    narrativeEl.textContent =
      "Extracted minimum: " + result.value + ". Use Step/Play to animate.";
    renderAll();
  });

  btnBuild.addEventListener("click", () => {
    clearError();
    const raw = buildInput.value.trim();
    if (raw === "") {
      showError("Enter comma-separated values to build a heap.");
      return;
    }

    const parts = raw.split(",");
    const arr = [];
    for (const p of parts) {
      const n = parseInt(p.trim(), 10);
      if (isNaN(n)) {
        showError("All values must be integers. Got: " + p.trim());
        return;
      }
      if (n < -999 || n > 999) {
        showError("Values must be between -999 and 999. Got: " + n);
        return;
      }
      arr.push(n);
    }

    if (arr.length === 0) {
      showError("Enter at least one value.");
      return;
    }

    clearPlayTimer();
    playing = false;
    activeIndices = [];
    activeType = "";

    // Reset heap state (build replaces existing heap)
    heap = HeapAlgorithm.createHeap();
    totalComparisons = 0;
    totalSwaps = 0;
    while (historyLogEl.firstChild)
      historyLogEl.removeChild(historyLogEl.firstChild);
    historyEntries = [];

    const result = HeapAlgorithm.buildHeap(arr);
    heap = result.heap;

    const ops = countOps(result.steps);
    totalComparisons += ops.comparisons;
    totalSwaps += ops.swaps;

    const truncated = arr.length > HeapAlgorithm.MAX_SIZE;
    loadSteps(result.steps);
    addHistoryEntry(
      "build",
      "BuildHeap([" +
        arr.slice(0, HeapAlgorithm.MAX_SIZE).join(",") +
        "])" +
        (truncated ? " (truncated to " + HeapAlgorithm.MAX_SIZE + ")" : ""),
    );
    narrativeEl.textContent =
      "Heap built from " +
      heap.data.length +
      " elements using O(n) Floyd\u2019s algorithm." +
      (result.steps.length > 0 ? " Use Step/Play to animate." : "");
    renderAll();
  });

  btnReset.addEventListener("click", resetAll);

  btnStepBack.addEventListener("click", () => {
    clearPlayTimer();
    playing = false;
    stepBackward();
  });

  btnPlay.addEventListener("click", () => {
    if (playing) return;
    playing = true;
    updatePlaybackControls();
    scheduleNext();
  });

  btnPause.addEventListener("click", () => {
    clearPlayTimer();
    playing = false;
    updatePlaybackControls();
  });

  btnStepNext.addEventListener("click", () => {
    clearPlayTimer();
    playing = false;
    stepForward();
  });

  // Allow Enter key on insert input
  insertValInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnInsert.click();
  });

  // Allow Enter key on build input
  buildInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnBuild.click();
  });

  // --- Page unload cleanup ---
  window.addEventListener("unload", () => {
    clearPlayTimer();
  });

  // --- Initial render ---
  renderAll();
})();
