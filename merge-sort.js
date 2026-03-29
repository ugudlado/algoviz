(() => {
  "use strict";

  // --- DOM refs ---
  const valuesInput = document.getElementById("valuesInput");
  const sizeInput = document.getElementById("sizeInput");
  const btnRandom = document.getElementById("btnRandom");
  const btnVisualize = document.getElementById("btnVisualize");
  const pb = document.getElementById("pb");
  const infoEl = document.getElementById("info");
  const resultEl = document.getElementById("result");
  const vizContainer = document.getElementById("vizContainer");
  const depthStat = document.getElementById("depthStat");
  const comparisonsStat = document.getElementById("comparisonsStat");
  const mergesStat = document.getElementById("mergesStat");
  const stepStat = document.getElementById("stepStat");

  // Watch panel refs
  const msWatchDepth = document.getElementById("ms-watch-depth");
  const msWatchPhase = document.getElementById("ms-watch-phase");
  const msWatchLeft = document.getElementById("ms-watch-left");
  const msWatchRight = document.getElementById("ms-watch-right");
  const msWatchAction = document.getElementById("ms-watch-action");

  // --- Watch panel ---
  function updateWatch(step) {
    var em = "\u2014";
    if (!step) {
      msWatchDepth.textContent = em;
      msWatchDepth.className = "algo-watch-value";
      msWatchPhase.textContent = em;
      msWatchPhase.className = "algo-watch-value";
      msWatchLeft.textContent = em;
      msWatchLeft.className = "algo-watch-value";
      msWatchRight.textContent = em;
      msWatchRight.className = "algo-watch-value";
      msWatchAction.textContent = em;
      msWatchAction.className = "algo-watch-value";
      return;
    }
    if (step.type === "complete") {
      msWatchDepth.textContent = "0";
      msWatchDepth.className = "algo-watch-value aw-neutral";
      msWatchPhase.textContent = "done";
      msWatchPhase.className = "algo-watch-value aw-success";
      msWatchLeft.textContent = em;
      msWatchLeft.className = "algo-watch-value";
      msWatchRight.textContent = em;
      msWatchRight.className = "algo-watch-value";
      msWatchAction.textContent = "sorted!";
      msWatchAction.className = "algo-watch-value aw-success";
      return;
    }
    msWatchDepth.textContent = String(step.depth);
    msWatchDepth.className = "algo-watch-value aw-neutral";
    if (step.type === "split") {
      msWatchPhase.textContent = "split";
      msWatchPhase.className = "algo-watch-value aw-warn";
      msWatchLeft.textContent = "[" + step.left.join(", ") + "]";
      msWatchLeft.className = "algo-watch-value aw-neutral";
      msWatchRight.textContent = "[" + step.right.join(", ") + "]";
      msWatchRight.className = "algo-watch-value aw-neutral";
      msWatchAction.textContent = "splitting";
      msWatchAction.className = "algo-watch-value aw-warn";
    } else if (step.type === "merge") {
      msWatchPhase.textContent = "merge";
      msWatchPhase.className = "algo-watch-value aw-highlight";
      var li = step.leftIndex;
      var ri = step.rightIndex;
      var lVal = li < step.left.length ? String(step.left[li]) : em;
      var rVal = ri < step.right.length ? String(step.right[ri]) : em;
      msWatchLeft.textContent = lVal + " (L[" + li + "])";
      msWatchLeft.className =
        "algo-watch-value" +
        (step.selected === "left" ? " aw-highlight" : " aw-neutral");
      msWatchRight.textContent = rVal + " (R[" + ri + "])";
      msWatchRight.className =
        "algo-watch-value" +
        (step.selected === "right" ? " aw-highlight" : " aw-neutral");
      msWatchAction.textContent = "took " + step.selected;
      msWatchAction.className = "algo-watch-value aw-highlight";
    }
  }

  // --- State ---
  let sortResult = null;
  let steps = [];
  let stepIdx = -1;
  let currentArr = [];

  // --- Build the tree structure from steps ---
  // We pre-compute the recursion tree so we can render any step's state
  let treeSnapshots = [];

  function buildTreeSnapshots() {
    // Each snapshot represents the visual state at that step
    // We track subarrays at each depth level
    treeSnapshots = [];

    // Initial snapshot: just the original array at depth 0
    const initialState = {
      rows: [
        {
          subarrays: [{ values: currentArr.slice(), state: "unsorted" }],
        },
      ],
      currentDepth: 0,
      phase: "initial",
    };
    treeSnapshots.push(initialState);

    // Track the tree being built
    let depthArrays = [[{ values: currentArr.slice(), state: "unsorted" }]];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let snapshot;

      if (step.type === "split") {
        // Add a new depth level with the split subarrays
        const depth = step.depth + 1;
        while (depthArrays.length <= depth) {
          depthArrays.push([]);
        }

        // Add left and right subarrays at the next depth
        depthArrays[depth].push({
          values: step.left.slice(),
          state: "split-highlight",
        });
        depthArrays[depth].push({
          values: step.right.slice(),
          state: "split-highlight",
        });

        // Mark the parent as being split
        snapshot = buildSnapshot(depthArrays, step.depth, "split", step);
      } else if (step.type === "merge") {
        // During merge, highlight the elements being compared
        snapshot = buildSnapshot(depthArrays, step.depth, "merge", step);
      } else if (step.type === "complete") {
        // All sorted
        snapshot = {
          rows: [
            {
              subarrays: [
                {
                  values: step.array.slice(),
                  state: "sorted",
                },
              ],
            },
          ],
          currentDepth: 0,
          phase: "complete",
          step: step,
        };
      }

      treeSnapshots.push(snapshot);
    }
  }

  function buildSnapshot(depthArrays, currentDepth, phase, step) {
    const rows = [];
    for (let d = 0; d < depthArrays.length; d++) {
      const subarrays = depthArrays[d].map((sa) => ({
        values: sa.values.slice(),
        state: d === currentDepth && phase === "split" ? "active" : sa.state,
      }));
      if (subarrays.length > 0) {
        rows.push({ subarrays: subarrays });
      }
    }
    return {
      rows: rows,
      currentDepth: currentDepth,
      phase: phase,
      step: step,
    };
  }

  // --- Render a snapshot ---
  function renderSnapshot(snapIdx) {
    vizContainer.textContent = "";

    if (snapIdx < 0 || snapIdx >= treeSnapshots.length) {
      // Show initial array
      renderInitialArray();
      return;
    }

    const snapshot = treeSnapshots[snapIdx];
    const step = snapshot.step;

    if (snapshot.phase === "complete") {
      // Show single sorted row
      const row = document.createElement("div");
      row.className = "ms-depth-row";
      row.setAttribute("data-depth", "0");

      const group = document.createElement("div");
      group.className = "ms-subarray ms-merged";

      for (const val of snapshot.rows[0].subarrays[0].values) {
        const box = document.createElement("div");
        box.className = "ms-val ms-sorted";
        box.textContent = val;
        group.appendChild(box);
      }

      row.appendChild(group);
      vizContainer.appendChild(row);
      return;
    }

    if (snapshot.phase === "split" && step) {
      renderSplitView(step);
      return;
    }

    if (snapshot.phase === "merge" && step) {
      renderMergeView(step);
      return;
    }

    // Fallback: render rows
    renderInitialArray();
  }

  function renderInitialArray() {
    const maxVal = Math.max(...currentArr);
    const barChart = document.createElement("div");
    barChart.className = "ms-bar-chart";

    for (const val of currentArr) {
      const barWrap = document.createElement("div");
      barWrap.className = "ms-bar-wrap";

      const bar = document.createElement("div");
      bar.className = "ms-bar ms-bar-unsorted";
      const heightPct =
        maxVal > 0 ? Math.max(8, Math.round((val / maxVal) * 100)) : 8;
      bar.style.height = heightPct + "%";

      const label = document.createElement("div");
      label.className = "ms-bar-label";
      label.textContent = val;

      barWrap.appendChild(bar);
      barWrap.appendChild(label);
      barChart.appendChild(barWrap);
    }

    vizContainer.appendChild(barChart);
  }

  function renderSplitView(step) {
    // Show the array being split and the two halves below
    // Row 1: original array with split highlight
    const origRow = document.createElement("div");
    origRow.className = "ms-depth-row";
    origRow.setAttribute("data-depth", step.depth);

    const origGroup = document.createElement("div");
    origGroup.className = "ms-subarray ms-active-split";

    for (const val of step.array) {
      const box = document.createElement("div");
      box.className = "ms-val ms-split-highlight";
      box.textContent = val;
      origGroup.appendChild(box);
    }

    origRow.appendChild(origGroup);
    vizContainer.appendChild(origRow);

    // Arrow
    const arrowRow = document.createElement("div");
    arrowRow.className = "ms-arrow-row";
    arrowRow.textContent = "\u25BC split \u25BC";
    vizContainer.appendChild(arrowRow);

    // Row 2: left and right halves
    const splitRow = document.createElement("div");
    splitRow.className = "ms-depth-row";
    splitRow.setAttribute("data-depth", step.depth + 1);

    const leftGroup = document.createElement("div");
    leftGroup.className = "ms-subarray";
    for (const val of step.left) {
      const box = document.createElement("div");
      box.className = "ms-val ms-left-source";
      box.textContent = val;
      leftGroup.appendChild(box);
    }

    const rightGroup = document.createElement("div");
    rightGroup.className = "ms-subarray";
    for (const val of step.right) {
      const box = document.createElement("div");
      box.className = "ms-val ms-right-source";
      box.textContent = val;
      rightGroup.appendChild(box);
    }

    splitRow.appendChild(leftGroup);
    splitRow.appendChild(rightGroup);
    vizContainer.appendChild(splitRow);
  }

  function renderMergeView(step) {
    // Show left and right source arrays, highlighting compared elements
    // and the result being built

    // Source arrays row
    const sourceRow = document.createElement("div");
    sourceRow.className = "ms-depth-row";
    sourceRow.setAttribute("data-depth", step.depth + 1);

    // Left subarray
    const leftGroup = document.createElement("div");
    leftGroup.className = "ms-subarray";
    for (let i = 0; i < step.left.length; i++) {
      const box = document.createElement("div");
      box.className = "ms-val ms-left-source";
      if (i === step.leftIndex && step.selected === "left") {
        box.className = "ms-val ms-selected";
      } else if (i === step.leftIndex) {
        box.className = "ms-val ms-left-source";
        box.style.borderWidth = "2px";
      }
      box.textContent = step.left[i];
      leftGroup.appendChild(box);
    }

    // Right subarray
    const rightGroup = document.createElement("div");
    rightGroup.className = "ms-subarray";
    for (let i = 0; i < step.right.length; i++) {
      const box = document.createElement("div");
      box.className = "ms-val ms-right-source";
      if (i === step.rightIndex && step.selected === "right") {
        box.className = "ms-val ms-selected";
      } else if (i === step.rightIndex) {
        box.className = "ms-val ms-right-source";
        box.style.borderWidth = "2px";
      }
      box.textContent = step.right[i];
      rightGroup.appendChild(box);
    }

    sourceRow.appendChild(leftGroup);
    sourceRow.appendChild(rightGroup);
    vizContainer.appendChild(sourceRow);

    // Arrow
    const arrowRow = document.createElement("div");
    arrowRow.className = "ms-arrow-row ms-merge-arrow";
    arrowRow.textContent = "\u25B2 merge \u25B2";
    vizContainer.appendChild(arrowRow);

    // Result row
    const resultRow = document.createElement("div");
    resultRow.className = "ms-depth-row";
    resultRow.setAttribute("data-depth", step.depth);

    const resultGroup = document.createElement("div");
    resultGroup.className = "ms-subarray ms-active-merge";
    for (const val of step.result) {
      const box = document.createElement("div");
      box.className = "ms-val ms-sorted";
      box.textContent = val;
      resultGroup.appendChild(box);
    }

    resultRow.appendChild(resultGroup);
    vizContainer.appendChild(resultRow);
  }

  // --- Generate random array ---
  function generateRandom() {
    const size = Math.max(1, Math.min(20, parseInt(sizeInput.value, 10) || 8));
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 50) + 1);
    }
    valuesInput.value = arr.join(", ");
    sizeInput.value = size;
  }

  // --- Parse inputs ---
  function parseInputs() {
    const raw = valuesInput.value.trim();
    if (raw.length === 0) return [];
    return raw
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && isFinite(n));
  }

  // --- Update stats ---
  function updateStats() {
    if (stepIdx < 0 || !sortResult) {
      depthStat.textContent = "0 / 0";
      comparisonsStat.textContent = "0";
      mergesStat.textContent = "0";
      stepStat.textContent = "0 / " + steps.length;
      return;
    }

    const step = steps[stepIdx];
    const depth = step.depth !== undefined ? step.depth : 0;
    const maxD =
      step.maxDepth !== undefined
        ? step.maxDepth
        : steps[steps.length - 1].maxDepth || 0;
    depthStat.textContent = depth + " / " + maxD;
    comparisonsStat.textContent = step.comparisons || 0;
    mergesStat.textContent = step.mergeOps || 0;
    stepStat.textContent = stepIdx + 1 + " / " + steps.length;
  }

  // --- Update info ---
  function updateInfo() {
    if (stepIdx < 0) {
      infoEl.textContent = "";
      const t1 = document.createTextNode("Click ");
      const s1 = document.createElement("strong");
      s1.textContent = "Play";
      const t2 = document.createTextNode(" or ");
      const s2 = document.createElement("strong");
      s2.textContent = "Step \u2192";
      const t3 = document.createTextNode(" to start.");
      infoEl.appendChild(t1);
      infoEl.appendChild(s1);
      infoEl.appendChild(t2);
      infoEl.appendChild(s2);
      infoEl.appendChild(t3);
      return;
    }
    const step = steps[stepIdx];
    infoEl.textContent = step.explanation;
  }

  function showResult() {
    if (!sortResult) return;
    const last = steps[steps.length - 1];
    resultEl.textContent =
      "Sort complete! " +
      last.comparisons +
      " comparisons, " +
      last.mergeOps +
      " merge operations.";
    resultEl.classList.remove("hidden");
  }

  // --- Playback component event handlers ---
  pb.addEventListener("pc-step", (e) => {
    stepIdx = e.detail.index;
    if (stepIdx < 0) {
      renderSnapshot(0);
    } else {
      // treeSnapshots[0] is the initial state, steps map to treeSnapshots[stepIdx+1]
      renderSnapshot(stepIdx + 1);
    }
    updateWatch(stepIdx >= 0 ? steps[stepIdx] : null);
    updateStats();
    updateInfo();
  });

  pb.addEventListener("pc-reset", () => {
    stepIdx = -1;
    renderSnapshot(0);
    resultEl.classList.add("hidden");
    updateWatch(null);
    updateStats();
    updateInfo();
  });

  pb.addEventListener("pc-complete", () => {
    showResult();
  });

  // --- Visualize ---
  function visualize() {
    const arr = parseInputs();
    if (arr.length < 1) {
      infoEl.textContent = "Error: Enter at least one value.";
      return;
    }

    currentArr = arr.slice();

    // Solve
    sortResult = MergeSortAlgorithm.sort(arr);
    steps = sortResult.steps;
    stepIdx = -1;

    // Build tree snapshots for visualization
    buildTreeSnapshots();

    // Render initial state
    renderSnapshot(0);
    resultEl.classList.add("hidden");
    updateWatch(null);
    pb.setSteps(steps);
    updateStats();
    updateInfo();
  }

  // --- Event listeners ---
  btnVisualize.addEventListener("click", visualize);
  btnRandom.addEventListener("click", () => {
    generateRandom();
    visualize();
  });

  // Enter key triggers visualize
  valuesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") visualize();
  });
  sizeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      generateRandom();
      visualize();
    }
  });

  // Auto-init
  visualize();
})();
