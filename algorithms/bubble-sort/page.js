(() => {
  "use strict";

  // --- DOM refs ---
  const valuesInput = document.getElementById("valuesInput");
  const sizeInput = document.getElementById("sizeInput");
  const btnRandom = document.getElementById("btnRandom");
  const btnVisualize = document.getElementById("btnVisualize");
  const pb = document.getElementById("pb");
  const resultEl = document.getElementById("result");
  const barChart = document.getElementById("barChart");
  const comparisonsStat = document.getElementById("comparisonsStat");
  const swapsStat = document.getElementById("swapsStat");
  const codeLines = document.querySelectorAll("#pseudocode .code-line");

  // Watch panel refs
  const watchPass = document.getElementById("watchPass");
  const watchPos = document.getElementById("watchPos");
  const watchLeft = document.getElementById("watchLeft");
  const watchRight = document.getElementById("watchRight");
  const watchAction = document.getElementById("watchAction");
  const watchSorted = document.getElementById("watchSorted");

  // --- Pseudocode highlight ---
  function highlightCode(lineIdx) {
    codeLines.forEach((el) => el.classList.remove("highlight"));
    if (lineIdx >= 0 && lineIdx < codeLines.length) {
      codeLines[lineIdx].classList.add("highlight");
    }
  }

  // --- Watch panel update ---
  function updateWatch(step) {
    if (!step || step.comparing[0] === -1) {
      watchPass.textContent = "done";
      watchPass.className = "watch-val watch-ok";
      watchPos.textContent = "\u2014";
      watchPos.className = "watch-val";
      watchLeft.textContent = "\u2014";
      watchLeft.className = "watch-val";
      watchRight.textContent = "\u2014";
      watchRight.className = "watch-val";
      watchAction.textContent = step ? "sorted!" : "\u2014";
      watchAction.className = "watch-val watch-ok";
      watchSorted.textContent = "index 0+";
      watchSorted.className = "watch-val watch-ok";
      return;
    }

    var n = step.arr.length;
    watchPass.textContent = "pass " + (step.i + 1) + " of " + (n - 1);
    watchPass.className = "watch-val";

    watchPos.textContent =
      "j = " + step.j + " \u2192 [" + step.j + ", " + (step.j + 1) + "]";
    watchPos.className = "watch-val";

    if (step.swapped) {
      watchLeft.textContent = step.arr[step.j + 1] + " (was left)";
      watchRight.textContent = step.arr[step.j] + " (was right)";
      watchAction.textContent = "SWAP \u2194";
      watchAction.className = "watch-val watch-swap";
    } else {
      watchLeft.textContent = String(step.arr[step.j]);
      watchRight.textContent = String(step.arr[step.j + 1]);
      watchAction.textContent = "ok \u2713";
      watchAction.className = "watch-val watch-ok";
    }
    watchLeft.className = "watch-val" + (step.swapped ? " watch-swap" : "");
    watchRight.className = "watch-val" + (step.swapped ? " watch-swap" : "");

    watchSorted.textContent =
      step.sortedBoundary < n
        ? "index " + step.sortedBoundary + "+"
        : "none yet";
    watchSorted.className =
      "watch-val" + (step.sortedBoundary < n ? " watch-ok" : "");
  }

  function resetWatch() {
    [
      watchPass,
      watchPos,
      watchLeft,
      watchRight,
      watchAction,
      watchSorted,
    ].forEach(function (el) {
      el.textContent = "\u2014";
      el.className = "watch-val";
    });
  }

  // --- State ---
  let sortResult = null;
  let steps = [];
  let stepIdx = -1;
  let currentArr = [];
  let maxVal = 1;

  // --- Generate random array ---
  function generateRandom() {
    const size = Math.max(2, Math.min(30, parseInt(sizeInput.value, 10) || 9));
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

  // --- Render bars for a given array state ---
  function renderBars(arr, comparing, swapped, sortedBoundary) {
    barChart.textContent = "";

    for (let i = 0; i < arr.length; i++) {
      const bar = document.createElement("div");
      bar.className = "bs-bar";

      // Use percentage for responsive height (max 95% to leave breathing room at top)
      const heightPct = Math.max(5, (arr[i] / maxVal) * 95);
      bar.style.height = heightPct + "%";

      const label = document.createElement("span");
      label.className = "bsort-bar-label";
      label.textContent = arr[i];
      bar.appendChild(label);

      if (comparing[0] === i || comparing[1] === i) {
        if (swapped) {
          bar.classList.add("bsort-swapping");
        } else {
          bar.classList.add("bsort-comparing");
        }
      }

      if (i >= sortedBoundary) {
        bar.classList.add("bsort-sorted");
      }

      barChart.appendChild(bar);
    }
  }

  // --- Update stats ---
  function updateStats() {
    if (stepIdx < 0 || !sortResult) {
      comparisonsStat.textContent = "0";
      swapsStat.textContent = "0";
      return;
    }

    const step = steps[stepIdx];
    comparisonsStat.textContent = step.comparisons;
    swapsStat.textContent = step.swaps;
  }

  function renderAtIndex(idx) {
    if (idx < 0) {
      renderBars(currentArr, [-1, -1], false, currentArr.length);
      highlightCode(-1);
      resetWatch();
    } else {
      const step = steps[idx];
      const boundary = step.comparing[0] === -1 ? 0 : step.sortedBoundary;
      renderBars(step.arr, step.comparing, step.swapped, boundary);
      highlightCode(step.codeLine);
      updateWatch(step);
    }
  }

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
    renderAtIndex(stepIdx);
    updateStats();
  });

  pb.addEventListener("pc-reset", () => {
    stepIdx = -1;
    renderAtIndex(-1);
    resultEl.classList.add("hidden");
    updateStats();
  });

  pb.addEventListener("pc-complete", () => {
    showResult();
  });

  // --- Visualize ---
  function visualize() {
    const arr = parseInputs();
    if (arr.length < 1) {
      return;
    }

    currentArr = arr.slice();
    maxVal = Math.max(...arr, 1);

    sortResult = BubbleSortAlgorithm.sort(arr);
    steps = sortResult.steps;
    stepIdx = -1;

    const emptyEl = barChart.querySelector(".bs-chart-empty");
    if (emptyEl) emptyEl.remove();
    renderBars(currentArr, [-1, -1], false, currentArr.length);
    resultEl.classList.add("hidden");
    resetWatch();
    updateStats();
    pb.setSteps(steps);

    // Auto-start playback for better UX
    setTimeout(() => {
      const playBtn = pb.shadowRoot && pb.shadowRoot.getElementById("btnPlay");
      if (playBtn && !playBtn.disabled) playBtn.click();
    }, 100);
  }

  // --- Event listeners ---
  btnVisualize.addEventListener("click", visualize);
  btnRandom.addEventListener("click", () => {
    generateRandom();
    visualize();
  });

  valuesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") visualize();
  });
  sizeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      generateRandom();
      visualize();
    }
  });

  // Show empty state — don't auto-run
  barChart.textContent = "";
  const emptyMsg = document.createElement("div");
  emptyMsg.className = "bs-chart-empty";
  emptyMsg.textContent = "Enter values and click Visualize to begin";
  barChart.appendChild(emptyMsg);
})();
