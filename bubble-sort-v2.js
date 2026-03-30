(() => {
  "use strict";

  // DOM Refs
  const valuesInput = document.getElementById("v2Values");
  const chart = document.getElementById("chart");
  const narrator = document.getElementById("narrator");
  const operator = document.getElementById("operator");

  // State refs
  const statePass = document.getElementById("statePass");
  const stateI = document.getElementById("stateI");
  const stateLeft = document.getElementById("stateLeft");
  const stateRight = document.getElementById("stateRight");

  // Metric refs
  const statComps = document.getElementById("statComps");
  const statSwaps = document.getElementById("statSwaps");

  // Code refs
  const codeLines = document.querySelectorAll("#pseudocode .code-line");

  // Control refs
  const btnRandom = document.getElementById("btnRandom");
  const btnWorst = document.getElementById("btnWorst");
  const btnBest = document.getElementById("btnBest");
  const btnTurtle = document.getElementById("btnTurtle");

  const btnReset = document.getElementById("btnReset");
  const btnStepBack = document.getElementById("btnStepBack");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");
  const btnStep = document.getElementById("btnStep");
  const speedSlider = document.getElementById("speed");

  // State
  let elements = []; // Tracks DOM elements { id: string, val: number, node: HTMLElement }
  let steps = [];
  let stepIdx = -1;
  let timer = null;
  let isPlaying = false;
  let maxVal = 1;

  function generateArray(size, random = true) {
    const arr = [];
    for (let i = 0; i < size; i++)
      arr.push(random ? Math.floor(Math.random() * 50) + 1 : i + 1);
    return arr;
  }

  function parseInputs() {
    return valuesInput.value
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && isFinite(n));
  }

  // --- Core Algorithm with DOM tracking logic ---
  function runSort(arr) {
    const resultSteps = [];
    // Clone array and assign unique IDs to track them through swaps
    let tracked = arr.map((val, idx) => ({ id: "bar-" + idx, val }));
    let comps = 0,
      swaps = 0;

    // Save initial state
    resultSteps.push(
      createStep(
        tracked,
        comps,
        swaps,
        -1,
        -1,
        false,
        arr.length,
        0,
        "Initial state",
        0,
      ),
    );

    let n = tracked.length;
    let swapped;

    for (let pass = 0; pass < n - 1; pass++) {
      swapped = false;
      resultSteps.push(
        createStep(
          tracked,
          comps,
          swaps,
          -1,
          -1,
          false,
          n - pass,
          pass + 1,
          `Starting Pass ${pass + 1}.`,
          1,
        ),
      );

      for (let i = 0; i < n - pass - 1; i++) {
        comps++;
        let left = tracked[i],
          right = tracked[i + 1];

        // Comparing
        resultSteps.push(
          createStep(
            tracked,
            comps,
            swaps,
            i,
            i + 1,
            false,
            n - pass,
            pass + 1,
            `Comparing <strong>${left.val}</strong> and <strong>${right.val}</strong>.`,
            3,
          ),
        );

        if (left.val > right.val) {
          // Swap logic
          swaps++;
          tracked[i] = right;
          tracked[i + 1] = left;
          swapped = true;
          resultSteps.push(
            createStep(
              tracked,
              comps,
              swaps,
              i,
              i + 1,
              true,
              n - pass,
              pass + 1,
              `<strong>${left.val}</strong> > <strong>${right.val}</strong>, so they swap.`,
              4,
            ),
          );
        } else {
          resultSteps.push(
            createStep(
              tracked,
              comps,
              swaps,
              i,
              i + 1,
              false,
              n - pass,
              pass + 1,
              `<strong>${left.val}</strong> &le; <strong>${right.val}</strong>, they stay in place.`,
              3,
            ),
          );
        }
      }

      if (!swapped) {
        resultSteps.push(
          createStep(
            tracked,
            comps,
            swaps,
            -1,
            -1,
            false,
            0,
            pass + 1,
            `No swaps in this pass. The array is sorted early!`,
            6,
          ),
        );
        break;
      } else {
        resultSteps.push(
          createStep(
            tracked,
            comps,
            swaps,
            -1,
            -1,
            false,
            n - pass - 1,
            pass + 1,
            `Pass complete. The largest remaining element reached its final position.`,
            0,
          ),
        );
      }
    }

    // Final state
    if (swapped) {
      resultSteps.push(
        createStep(
          tracked,
          comps,
          swaps,
          -1,
          -1,
          false,
          0,
          n - 1,
          `All passes complete. Array is sorted!`,
          6,
        ),
      );
    }
    return resultSteps;
  }

  function createStep(
    trackedArr,
    comps,
    swaps,
    j1,
    j2,
    didSwap,
    boundary,
    pass,
    text,
    code,
  ) {
    return {
      arr: trackedArr.slice(), // shallow copy of current object references
      comps,
      swaps,
      comparing: [j1, j2],
      swapped: didSwap,
      boundary,
      pass,
      text,
      codeLine: code,
    };
  }

  // --- Rendering ---
  function initDOM(arr) {
    // Clear all existing bars (keep operator)
    Array.from(chart.children).forEach((c) => {
      if (c.id !== "operator") c.remove();
    });
    elements = [];
    maxVal = Math.max(...arr, 1);

    arr.forEach((val, i) => {
      const bar = document.createElement("div");
      bar.className = "v2-bar";
      bar.id = "bar-" + i;

      const heightPct = Math.max(5, (val / maxVal) * 90);
      bar.style.height = heightPct + "%";

      const label = document.createElement("span");
      label.className = "v2-bar-label";
      label.textContent = val;
      bar.appendChild(label);

      chart.appendChild(bar);
      elements.push({ id: bar.id, val, node: bar });
    });
  }

  function updateVisuals(step) {
    const total = step.arr.length;
    const barWidthPct = 100 / total;

    // Remove active classes
    elements.forEach((e) => {
      e.node.classList.remove("comparing", "swapping", "sorted");
    });

    // Animate to new positions
    step.arr.forEach((item, idx) => {
      // Find the physical DOM node
      const el = elements.find((e) => e.id === item.id);
      if (!el) return;

      // Calculate left position
      const leftPct = idx * barWidthPct + barWidthPct * 0.1; // slight padding
      const widthPct = barWidthPct * 0.8;

      el.node.style.left = leftPct + "%";
      el.node.style.width = widthPct + "%";

      // Add classes based on state
      if (idx >= step.boundary) el.node.classList.add("sorted");
      if (step.comparing.includes(idx)) {
        el.node.classList.add(step.swapped ? "swapping" : "comparing");
      }
    });

    // Update Floating Operator
    if (step.comparing[0] !== -1) {
      operator.classList.add("visible");
      const c1 = step.comparing[0];
      const c2 = step.comparing[1];
      const centerIdx = (c1 + c2) / 2;
      operator.style.left = centerIdx * barWidthPct + barWidthPct / 2 + "%";

      if (step.swapped) {
        operator.innerHTML = "&gt;";
        operator.style.color = "var(--bs-accent)";
        operator.style.borderColor = "var(--bs-accent)";
      } else {
        operator.innerHTML = "&le;";
        operator.style.color = "var(--bs-ink)";
        operator.style.borderColor = "var(--bs-ink)";
      }
    } else {
      operator.classList.remove("visible");
    }

    // Update Narrator
    narrator.innerHTML = step.text;

    // Update Stats
    statComps.textContent = step.comps;
    statSwaps.textContent = step.swaps;

    // Update Logic State Board
    if (step.pass > 0) statePass.textContent = step.pass;

    if (step.comparing[0] !== -1) {
      stateI.textContent = step.comparing[0];
      stateLeft.textContent = step.arr[step.comparing[0]].val;
      stateRight.textContent = step.arr[step.comparing[1]].val;
    } else {
      stateI.textContent = "—";
      stateLeft.textContent = "—";
      stateRight.textContent = "—";
    }

    // Update Code Highlight
    codeLines.forEach((el) => el.classList.remove("highlight"));
    if (step.codeLine >= 0 && step.codeLine < codeLines.length) {
      codeLines[step.codeLine].classList.add("highlight");
    }
  }

  // --- Playback ---
  function getDelay() {
    return Math.round(1000 / parseInt(speedSlider.value, 10));
  }

  function stepForward() {
    if (stepIdx >= steps.length - 1) {
      stopPlay();
      return;
    }
    stepIdx++;
    updateVisuals(steps[stepIdx]);
    updateButtons();
  }

  function stepBackward() {
    if (stepIdx <= 0) return;
    stepIdx--;
    updateVisuals(steps[stepIdx]);
    updateButtons();
  }

  function startPlay() {
    if (stepIdx >= steps.length - 1) resetViz();
    isPlaying = true;
    updateButtons();
    tick();
  }

  function tick() {
    if (!isPlaying) return;
    if (stepIdx >= steps.length - 1) {
      stopPlay();
      return;
    }
    stepForward();
    timer = setTimeout(tick, getDelay());
  }

  function stopPlay() {
    isPlaying = false;
    clearTimeout(timer);
    updateButtons();
  }

  function updateButtons() {
    btnPlay.disabled = isPlaying;
    btnPause.disabled = !isPlaying;
    btnStep.disabled = isPlaying || stepIdx >= steps.length - 1;
    btnStepBack.disabled = isPlaying || stepIdx <= 0;
  }

  function resetViz() {
    stopPlay();
    stepIdx = 0;
    if (steps.length > 0) updateVisuals(steps[0]);
    updateButtons();
  }

  // --- Init ---
  function visualize() {
    stopPlay();
    const arr = parseInputs();
    if (arr.length < 2) return;

    initDOM(arr);
    steps = runSort(arr);
    stepIdx = 0;
    updateVisuals(steps[0]);
    updateButtons();
  }

  // Presets trigger visualization immediately
  btnRandom.onclick = () => {
    valuesInput.value = generateArray(9, true).join(", ");
    visualize();
    setTimeout(startPlay, 200);
  };
  btnWorst.onclick = () => {
    valuesInput.value = "9, 8, 7, 6, 5, 4, 3, 2, 1";
    visualize();
    setTimeout(startPlay, 200);
  };
  btnBest.onclick = () => {
    valuesInput.value = "1, 2, 3, 4, 5, 6, 7, 8, 9";
    visualize();
    setTimeout(startPlay, 200);
  };
  btnTurtle.onclick = () => {
    valuesInput.value = "2, 3, 4, 5, 6, 7, 8, 9, 1";
    visualize();
    setTimeout(startPlay, 200);
  };

  // Manual input triggers on Enter
  valuesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      visualize();
      setTimeout(startPlay, 200);
    }
  });

  btnPlay.onclick = startPlay;
  btnPause.onclick = stopPlay;
  btnStep.onclick = () => {
    stopPlay();
    stepForward();
  };
  btnStepBack.onclick = () => {
    stopPlay();
    stepBackward();
  };
  btnReset.onclick = resetViz;

  // Render initial state on page load
  visualize();
})();
