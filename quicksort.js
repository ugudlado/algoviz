(() => {
  "use strict";

  // --- DOM refs ---
  const valuesInput = document.getElementById("valuesInput");
  const sizeInput = document.getElementById("sizeInput");
  const schemeSelect = document.getElementById("schemeSelect");
  const strategySelect = document.getElementById("strategySelect");
  const btnRandom = document.getElementById("btnRandom");
  const btnVisualize = document.getElementById("btnVisualize");
  const pb = document.getElementById("pb");
  const infoEl = document.getElementById("info");
  const resultEl = document.getElementById("result");
  const vizContainer = document.getElementById("vizContainer");
  const comparisonsStat = document.getElementById("comparisonsStat");
  const swapsStat = document.getElementById("swapsStat");
  const stepStat = document.getElementById("stepStat");
  const worstCaseWarning = document.getElementById("worstCaseWarning");

  // --- State ---
  let sortResult = null;
  let steps = [];
  let stepIdx = -1;
  let currentArr = [];
  let sortedPositions = new Set();

  // --- Parse inputs ---
  function parseInputs() {
    const raw = valuesInput.value.trim();
    if (raw.length === 0) return [];
    return raw
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && isFinite(n));
  }

  // --- Generate random array ---
  function generateRandom() {
    const size = Math.max(2, Math.min(20, parseInt(sizeInput.value, 10) || 8));
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 50) + 1);
    }
    valuesInput.value = arr.join(", ");
    sizeInput.value = size;
  }

  // --- Compute sorted positions up to a given step index ---
  function computeSortedPositions(upToIdx) {
    const sorted = new Set();
    for (let i = 0; i <= upToIdx && i < steps.length; i++) {
      const step = steps[i];
      if (step.type === "partition-done") {
        sorted.add(step.pivotFinalIndex);
      }
      if (step.type === "complete") {
        if (step.array) {
          for (let j = 0; j < step.array.length; j++) sorted.add(j);
        }
      }
    }
    return sorted;
  }

  // --- Render the array state from a step ---
  function renderStep(idx) {
    vizContainer.textContent = "";

    let arr;
    let highlightPivot = -1;
    let highlightCompare = [-1, -1];
    let highlightSwap = [-1, -1];
    let lowBound = -1;
    let highBound = -1;
    let partitionInfo = "";

    if (idx < 0) {
      arr = currentArr.slice();
      sortedPositions = new Set();
    } else {
      const step = steps[idx];
      arr = step.array ? step.array.slice() : currentArr.slice();
      sortedPositions = computeSortedPositions(idx);

      if (step.type === "pivot-select") {
        highlightPivot = step.pivotIndex;
        lowBound = step.low;
        highBound = step.high;
        partitionInfo =
          "Partitioning [" +
          step.low +
          ".." +
          step.high +
          "]  pivot=" +
          step.pivotValue;
      } else if (step.type === "compare") {
        highlightPivot = step.pivotIndex;
        highlightCompare = [step.i, step.j];
        partitionInfo = step.explanation;
      } else if (step.type === "swap") {
        highlightSwap = [step.i, step.j];
        partitionInfo = step.explanation;
      } else if (step.type === "partition-done") {
        highlightPivot = step.pivotFinalIndex;
        lowBound = step.low;
        highBound = step.high;
        partitionInfo = step.explanation;
      } else if (step.type === "complete") {
        partitionInfo = step.explanation;
      }
    }

    // Build array row
    const arrayRow = document.createElement("div");
    arrayRow.className = "qs-array-row";

    for (let i = 0; i < arr.length; i++) {
      const box = document.createElement("div");
      box.className = "qs-val";

      if (sortedPositions.has(i)) {
        box.classList.add("qs-val-sorted");
      } else if (highlightSwap[0] === i || highlightSwap[1] === i) {
        box.classList.add("qs-val-swapping");
      } else if (highlightPivot === i) {
        box.classList.add("qs-val-pivot");
      } else if (highlightCompare[0] === i || highlightCompare[1] === i) {
        box.classList.add("qs-val-comparing");
      } else if (
        lowBound !== -1 &&
        i >= lowBound &&
        i < highlightPivot &&
        highlightPivot !== -1
      ) {
        box.classList.add("qs-val-left-partition");
      } else if (
        highlightPivot !== -1 &&
        highBound !== -1 &&
        i > highlightPivot &&
        i <= highBound
      ) {
        box.classList.add("qs-val-right-partition");
      } else {
        box.classList.add("qs-val-unsorted");
      }

      box.textContent = arr[i];
      arrayRow.appendChild(box);
    }
    vizContainer.appendChild(arrayRow);

    // Boundary label row
    if (lowBound !== -1 || highlightPivot !== -1) {
      const boundaryRow = document.createElement("div");
      boundaryRow.className = "qs-boundary-row";

      for (let i = 0; i < arr.length; i++) {
        const cell = document.createElement("div");
        cell.className = "qs-boundary-cell";

        const labels = [];
        if (i === lowBound) labels.push("lo");
        if (i === highBound) labels.push("hi");
        if (i === highlightPivot && highlightPivot !== -1) labels.push("piv");

        if (labels.length > 0) {
          if (i === highlightPivot) cell.classList.add("qs-boundary-pivot");
          else if (i === lowBound) cell.classList.add("qs-boundary-low");
          else if (i === highBound) cell.classList.add("qs-boundary-high");
          cell.textContent = labels.join("/");
        }

        boundaryRow.appendChild(cell);
      }
      vizContainer.appendChild(boundaryRow);
    }

    // Partition info text
    const infoRow = document.createElement("div");
    infoRow.className = "qs-partition-info";
    infoRow.textContent = partitionInfo;
    vizContainer.appendChild(infoRow);
  }

  // --- Update stats display ---
  function updateStats() {
    if (stepIdx < 0 || !sortResult) {
      comparisonsStat.textContent = "0";
      swapsStat.textContent = "0";
      stepStat.textContent = "0 / " + steps.length;
      return;
    }

    const step = steps[stepIdx];
    const comparisons = step.comparisons !== undefined ? step.comparisons : 0;
    const swaps = step.swaps !== undefined ? step.swaps : 0;
    comparisonsStat.textContent = comparisons;
    swapsStat.textContent = swaps;
    stepStat.textContent = stepIdx + 1 + " / " + steps.length;

    // Worst-case detector: flag when comparisons reach O(n^2) territory
    const n = currentArr.length;
    const worstCaseThreshold = (n * (n - 1)) / 2;
    if (comparisons >= worstCaseThreshold && n > 4) {
      comparisonsStat.classList.add("qs-stat-warn");
      worstCaseWarning.classList.add("qs-visible");
    } else {
      comparisonsStat.classList.remove("qs-stat-warn");
      worstCaseWarning.classList.remove("qs-visible");
    }
  }

  // --- Update info text ---
  function updateInfo() {
    if (stepIdx < 0) {
      infoEl.textContent = "Click Play or Step to start sorting.";
      return;
    }
    const step = steps[stepIdx];
    infoEl.textContent = step.explanation || "";
  }

  // --- Show result ---
  function showResult() {
    if (!sortResult) return;
    const last = steps[steps.length - 1];
    resultEl.textContent =
      "Sort complete! " +
      last.comparisons +
      " comparisons, " +
      last.swaps +
      " swaps.";
    resultEl.classList.remove("hidden");
  }

  // --- Playback component event handlers ---
  pb.addEventListener("pc-step", (e) => {
    stepIdx = e.detail.index;
    renderStep(stepIdx);
    updateStats();
    updateInfo();
  });

  pb.addEventListener("pc-reset", () => {
    stepIdx = -1;
    sortedPositions = new Set();
    renderStep(-1);
    resultEl.classList.add("hidden");
    worstCaseWarning.classList.remove("qs-visible");
    comparisonsStat.classList.remove("qs-stat-warn");
    updateStats();
    updateInfo();
  });

  pb.addEventListener("pc-complete", () => {
    showResult();
  });

  // --- Main visualize ---
  function visualize() {
    const arr = parseInputs();
    if (arr.length < 1) {
      infoEl.textContent = "Error: Enter at least one value.";
      return;
    }

    if (arr.length > 20) {
      infoEl.textContent = "Error: Maximum array size is 20.";
      return;
    }

    currentArr = arr.slice();
    sortedPositions = new Set();

    const scheme = schemeSelect ? schemeSelect.value : "lomuto";
    const strategy = strategySelect ? strategySelect.value : "last";

    // Call QuickSortAlgorithm — DRY: algorithm logic lives only in quicksort-algorithm.js
    sortResult = QuickSortAlgorithm.quickSort(arr, scheme, strategy);
    steps = sortResult.steps;
    stepIdx = -1;

    renderStep(-1);
    resultEl.classList.add("hidden");
    worstCaseWarning.classList.remove("qs-visible");
    comparisonsStat.classList.remove("qs-stat-warn");
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

  // Re-visualize when scheme or strategy changes
  if (schemeSelect) {
    schemeSelect.addEventListener("change", () => {
      if (currentArr.length > 0) visualize();
    });
  }
  if (strategySelect) {
    strategySelect.addEventListener("change", () => {
      if (currentArr.length > 0) visualize();
    });
  }

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
