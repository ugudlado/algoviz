(() => {
  "use strict";

  const valuesInput = document.getElementById("valuesInput");
  const sizeInput = document.getElementById("sizeInput");
  const btnRandom = document.getElementById("btnRandom");
  const btnVisualize = document.getElementById("btnVisualize");
  const playbackDiv = document.getElementById("playback");
  const btnReset = document.getElementById("btnReset");
  const btnStepBack = document.getElementById("btnStepBack");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");
  const btnStep = document.getElementById("btnStep");
  const speedSlider = document.getElementById("speed");
  const infoEl = document.getElementById("info");
  const resultEl = document.getElementById("result");
  const currentArrayEl = document.getElementById("currentArray");
  const bucketsGridEl = document.getElementById("bucketsGrid");
  const bucketsLabelEl = document.getElementById("bucketsLabel");
  const digitStat = document.getElementById("digitStat");
  const stepStat = document.getElementById("stepStat");
  const maxDigitsStat = document.getElementById("maxDigitsStat");
  const roundStat = document.getElementById("roundStat");

  const MAX_ELEMENTS = 30;
  const MAX_VALUE = 9999;
  const DIGIT_NAMES = ["ones", "tens", "hundreds", "thousands"];

  let sortResult = null;
  let steps = [];
  let stepIdx = -1;
  let timer = null;
  let isPlaying = false;

  function generateRandom() {
    const size = Math.max(
      2,
      Math.min(MAX_ELEMENTS, parseInt(sizeInput.value, 10) || 8),
    );
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 1000));
    }
    valuesInput.value = arr.join(", ");
    sizeInput.value = size;
  }

  function parseInputs() {
    const raw = valuesInput.value.trim();
    if (raw.length === 0)
      return { arr: null, error: "Please enter at least one value." };
    const arr = raw
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && isFinite(n));
    if (arr.length === 0)
      return { arr: null, error: "No valid numbers found." };
    if (arr.length > MAX_ELEMENTS)
      return {
        arr: null,
        error: "Maximum " + MAX_ELEMENTS + " elements allowed.",
      };
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < 0)
        return {
          arr: null,
          error: "Radix sort requires non-negative integers.",
        };
      if (arr[i] > MAX_VALUE)
        return {
          arr: null,
          error: "Values must be between 0 and " + MAX_VALUE + ".",
        };
      if (!Number.isInteger(arr[i]))
        return { arr: null, error: "Only integers are supported." };
    }
    return { arr: arr, error: null };
  }

  function renderArray(container, arr, highlightIdx, highlightClass) {
    container.textContent = "";
    for (let i = 0; i < arr.length; i++) {
      const cell = document.createElement("div");
      cell.className = "rs-cell";
      if (i === highlightIdx && highlightClass) {
        cell.classList.add(highlightClass);
      }
      cell.textContent = String(arr[i]);
      container.appendChild(cell);
    }
  }

  function renderBuckets(buckets, highlightBucket, lastAdded) {
    bucketsGridEl.textContent = "";
    for (let b = 0; b < 10; b++) {
      const bucket = document.createElement("div");
      bucket.className = "rs-bucket";
      if (b === highlightBucket) {
        bucket.classList.add("rs-bucket-active");
      }

      const header = document.createElement("div");
      header.className = "rs-bucket-header";
      header.textContent = String(b);
      bucket.appendChild(header);

      for (let j = 0; j < buckets[b].length; j++) {
        const item = document.createElement("div");
        item.className = "rs-bucket-item";
        if (b === highlightBucket && j === buckets[b].length - 1 && lastAdded) {
          item.classList.add("rs-bucket-new");
        }
        item.textContent = String(buckets[b][j]);
        bucket.appendChild(item);
      }

      bucketsGridEl.appendChild(bucket);
    }
  }

  function digitName(pos) {
    return DIGIT_NAMES[pos] || "10^" + pos;
  }

  function renderStep() {
    if (stepIdx < 0 || stepIdx >= steps.length) {
      if (sortResult) {
        renderArray(currentArrayEl, sortResult.steps[0].arr, -1, null);
        renderBuckets([[], [], [], [], [], [], [], [], [], []], -1, false);
        bucketsLabelEl.textContent = "Buckets (digit 0 — ones)";
      }
      digitStat.textContent = "—";
      stepStat.textContent = "0 / " + steps.length;
      maxDigitsStat.textContent = sortResult
        ? String(sortResult.maxDigits)
        : "—";
      roundStat.textContent = "—";
      infoEl.textContent = "Step through the algorithm or press Play.";
      return;
    }

    const step = steps[stepIdx];
    const isLastStep = stepIdx === steps.length - 1;

    if (isLastStep && step.phase === "collect") {
      renderArray(currentArrayEl, step.arr, -1, "rs-sorted");
      // Mark all cells sorted
      currentArrayEl.textContent = "";
      for (let i = 0; i < step.arr.length; i++) {
        const cell = document.createElement("div");
        cell.className = "rs-cell rs-sorted";
        cell.textContent = String(step.arr[i]);
        currentArrayEl.appendChild(cell);
      }
    } else if (step.phase === "collect") {
      renderArray(currentArrayEl, step.arr, -1, "rs-collect");
      currentArrayEl.textContent = "";
      for (let i = 0; i < step.arr.length; i++) {
        const cell = document.createElement("div");
        cell.className = "rs-cell rs-collect";
        cell.textContent = String(step.arr[i]);
        currentArrayEl.appendChild(cell);
      }
    } else {
      renderArray(currentArrayEl, step.arr, step.highlightIdx, "rs-reading");
    }

    renderBuckets(
      step.buckets,
      step.phase === "extract" ? step.highlightBucket : -1,
      step.phase === "extract",
    );

    bucketsLabelEl.textContent =
      "Buckets (digit " +
      step.digitPosition +
      " — " +
      digitName(step.digitPosition) +
      ")";
    digitStat.textContent =
      step.digitPosition + " (" + digitName(step.digitPosition) + ")";
    stepStat.textContent = stepIdx + 1 + " / " + steps.length;
    maxDigitsStat.textContent = sortResult ? String(sortResult.maxDigits) : "—";
    roundStat.textContent =
      String(step.digitPosition + 1) +
      " / " +
      (sortResult ? sortResult.maxDigits : "?");
    infoEl.textContent = step.explanation;
  }

  function stopPlayback() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    isPlaying = false;
    btnPlay.disabled = false;
    btnPause.disabled = true;
  }

  function getDelay() {
    const speed = parseInt(speedSlider.value, 10) || 5;
    return Math.max(50, 1100 - speed * 100);
  }

  function playStep() {
    if (!isPlaying) return;
    if (stepIdx < steps.length - 1) {
      stepIdx++;
      renderStep();
      timer = setTimeout(playStep, getDelay());
    } else {
      stopPlayback();
      showResult();
    }
  }

  function showResult() {
    if (sortResult) {
      resultEl.textContent =
        "Sorted: [" + sortResult.sortedArray.join(", ") + "]";
      resultEl.classList.remove("hidden");
    }
  }

  btnRandom.addEventListener("click", generateRandom);

  btnVisualize.addEventListener("click", () => {
    stopPlayback();
    const parsed = parseInputs();
    if (parsed.error) {
      infoEl.textContent = parsed.error;
      return;
    }
    sortResult = RadixSortAlgorithm.sort(parsed.arr);
    steps = sortResult.steps;
    stepIdx = -1;
    resultEl.classList.add("hidden");
    playbackDiv.classList.remove("hidden");
    renderStep();
  });

  btnPlay.addEventListener("click", () => {
    if (steps.length === 0) return;
    if (stepIdx >= steps.length - 1) {
      stepIdx = -1;
    }
    isPlaying = true;
    btnPlay.disabled = true;
    btnPause.disabled = false;
    playStep();
  });

  btnPause.addEventListener("click", stopPlayback);

  btnStep.addEventListener("click", () => {
    stopPlayback();
    if (stepIdx < steps.length - 1) {
      stepIdx++;
      renderStep();
      if (stepIdx === steps.length - 1) {
        showResult();
      }
    }
  });

  btnStepBack.addEventListener("click", () => {
    stopPlayback();
    if (stepIdx > -1) {
      stepIdx--;
      renderStep();
      resultEl.classList.add("hidden");
    }
  });

  btnReset.addEventListener("click", () => {
    stopPlayback();
    stepIdx = -1;
    resultEl.classList.add("hidden");
    renderStep();
  });

  window.addEventListener("beforeunload", stopPlayback);

  // Pre-populate arrays on page load
  function renderInitialState() {
    const parsed = parseInputs();
    if (parsed.error || !parsed.arr || parsed.arr.length === 0) return;
    renderArray(currentArrayEl, parsed.arr, -1, null);
    renderBuckets([[], [], [], [], [], [], [], [], [], []], -1, false);
  }
  renderInitialState();
})();
