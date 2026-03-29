/**
 * KMP Visualization — DOM logic, animation, playback controls
 * Calls KMPAlgorithm.buildFailureFunction(), kmpSearch(), naiveSearch()
 * from kmp-algorithm.js — no logic duplication.
 */
(() => {
  "use strict";

  // --- Constants ---
  const MAX_PATTERN = 20;
  const MAX_TEXT = 100;

  const RANDOM_EXAMPLES = [
    { text: "AABAACAADAABAABA", pattern: "AABA" },
    { text: "ABCABCABCABC", pattern: "ABCABC" },
    { text: "ATCGATCGATCG", pattern: "ATCG" },
    { text: "AAAAAAAAAB", pattern: "AAAAB" },
    { text: "ABABABABABAB", pattern: "ABABAB" },
    { text: "HELLO WORLD HELLO", pattern: "HELLO" },
    { text: "AABAABAAB", pattern: "AABAA" },
    { text: "MISSISSIPPI", pattern: "ISSI" },
  ];

  // --- State ---
  let kmpResult = null;
  let naiveResult = null;
  let currentPhase = "failure"; // "failure" | "search"
  let failureStepIdx = -1;
  let searchStepIdx = -1;
  let animationTimer = null;
  let isPlaying = false;
  let currentText = "";
  let currentPattern = "";

  // --- DOM refs ---
  const textInput = document.getElementById("kmpTextInput");
  const patternInput = document.getElementById("kmpPatternInput");
  const btnVisualize = document.getElementById("kmpBtnVisualize");
  const btnRandom = document.getElementById("kmpBtnRandom");
  const btnReset = document.getElementById("kmpBtnReset");
  const btnStepBack = document.getElementById("kmpBtnStepBack");
  const btnPlay = document.getElementById("kmpBtnPlay");
  const btnPause = document.getElementById("kmpBtnPause");
  const btnStep = document.getElementById("kmpBtnStep");
  const speedSlider = document.getElementById("kmpSpeed");
  const playbackEl = document.getElementById("kmpPlayback");
  const infoEl = document.getElementById("kmpInfo");
  const failurePanel = document.getElementById("kmpFailurePanel");
  const searchPanel = document.getElementById("kmpSearchPanel");
  const statsKmp = document.getElementById("kmpStatKmp");
  const statsNaive = document.getElementById("kmpStatNaive");
  const statsSavings = document.getElementById("kmpStatSavings");
  const matchesDisplay = document.getElementById("kmpMatchesDisplay");

  // --- Input validation ---
  function validateInputs() {
    const text = textInput.value;
    const pattern = patternInput.value;

    if (text.length === 0) {
      showError("Text must not be empty.");
      return null;
    }
    if (pattern.length === 0) {
      showError("Pattern must not be empty.");
      return null;
    }
    if (text.length > MAX_TEXT) {
      showError("Text is too long (max " + MAX_TEXT + " characters).");
      return null;
    }
    if (pattern.length > MAX_PATTERN) {
      showError("Pattern is too long (max " + MAX_PATTERN + " characters).");
      return null;
    }

    infoEl.classList.remove("kmp-error");
    return { text, pattern };
  }

  function showError(msg) {
    infoEl.textContent = msg;
    infoEl.classList.add("kmp-error");
  }

  // --- Build failure function visualization table ---
  function buildFailureTable(pattern, filledCount) {
    failurePanel.textContent = "";

    const title = document.createElement("div");
    title.className = "kmp-panel-title";
    title.textContent = "Phase 1 — Failure Function";
    failurePanel.appendChild(title);

    const phaseLabel = document.createElement("div");
    phaseLabel.className = "kmp-phase-label";
    phaseLabel.textContent = "Building prefix table for pattern: ";
    const strong = document.createElement("strong");
    strong.textContent = pattern;
    phaseLabel.appendChild(strong);
    failurePanel.appendChild(phaseLabel);

    const failure = kmpResult.failureFunction;
    const table = document.createElement("table");
    table.className = "kmp-failure-table";

    // Header row: index numbers
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const cornerTh = document.createElement("th");
    cornerTh.textContent = "i";
    headerRow.appendChild(cornerTh);
    for (let i = 0; i < pattern.length; i++) {
      const th = document.createElement("th");
      th.textContent = i;
      th.className = "kmp-ft-index";
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Pattern row
    const patRow = document.createElement("tr");
    const patLabel = document.createElement("th");
    patLabel.textContent = "P[i]";
    patRow.appendChild(patLabel);
    for (let i = 0; i < pattern.length; i++) {
      const td = document.createElement("td");
      td.textContent = pattern[i];
      td.className = "kmp-ft-char";
      patRow.appendChild(td);
    }
    tbody.appendChild(patRow);

    // Failure function values row
    const failRow = document.createElement("tr");
    const failLabel = document.createElement("th");
    failLabel.textContent = "f[i]";
    failRow.appendChild(failLabel);
    for (let i = 0; i < pattern.length; i++) {
      const td = document.createElement("td");
      td.className = "kmp-ft-value";
      if (i < filledCount) {
        td.textContent = failure[i];
        td.classList.add("kmp-ft-filled");
      } else if (i === filledCount) {
        td.textContent = "?";
        td.classList.add("kmp-ft-active");
      } else {
        td.textContent = "?";
      }
      failRow.appendChild(td);
    }
    tbody.appendChild(failRow);

    table.appendChild(tbody);
    failurePanel.appendChild(table);

    // Explanation under table
    if (filledCount < pattern.length) {
      const hint = document.createElement("div");
      hint.className = "kmp-shift-arrow";
      if (filledCount === 0) {
        hint.textContent =
          'f[0] = 0 always (no proper prefix for single character "' +
          pattern[0] +
          '")';
      } else {
        const k = filledCount;
        hint.textContent =
          "Computing f[" +
          k +
          ']: longest prefix of "' +
          pattern.slice(0, k + 1) +
          '" that is also a suffix.';
      }
      failurePanel.appendChild(hint);
    } else {
      const done = document.createElement("div");
      done.className = "kmp-shift-arrow";
      done.textContent = "Failure function complete — ready for search phase.";
      failurePanel.appendChild(done);
    }
  }

  // --- Build search visualization ---
  function buildSearchPanel(stepIdx) {
    searchPanel.textContent = "";

    const title = document.createElement("div");
    title.className = "kmp-panel-title";
    title.textContent = "Phase 2 — KMP Search";
    searchPanel.appendChild(title);

    const phaseLabel = document.createElement("div");
    phaseLabel.className = "kmp-phase-label";
    const textLen = document.createTextNode(
      "Text (" +
        currentText.length +
        " chars), Pattern (" +
        currentPattern.length +
        " chars)",
    );
    phaseLabel.appendChild(textLen);
    searchPanel.appendChild(phaseLabel);

    // Text display
    renderSequenceDisplay(searchPanel, stepIdx);

    // Shift arrow explanation if step used failure function
    if (stepIdx >= 0 && stepIdx < kmpResult.steps.length) {
      const step = kmpResult.steps[stepIdx];
      if (step.shift) {
        const arrow = document.createElement("div");
        arrow.className = "kmp-shift-arrow";
        arrow.textContent =
          "Pattern shift: failure[" +
          (step.shiftFrom - 1) +
          "] = " +
          step.shiftTo +
          " — skipped " +
          (step.shiftFrom - step.shiftTo) +
          " unnecessary comparison(s).";
        searchPanel.appendChild(arrow);
      }
    }
  }

  // --- Render text + pattern with character highlights ---
  function renderSequenceDisplay(container, stepIdx) {
    if (!kmpResult) return;

    const step =
      stepIdx >= 0 && stepIdx < kmpResult.steps.length
        ? kmpResult.steps[stepIdx]
        : null;

    const textI = step ? step.textIdx : -1;
    const patJ = step ? step.patternIdx : -1;

    // Collect all match start positions seen so far
    const foundMatches = new Set();
    for (let s = 0; s <= stepIdx; s++) {
      if (s >= 0 && s < kmpResult.steps.length && kmpResult.steps[s].isFound) {
        const matchStart =
          kmpResult.steps[s].textIdx - currentPattern.length + 1;
        for (let k = 0; k < currentPattern.length; k++) {
          foundMatches.add(matchStart + k);
        }
      }
    }

    // Text sequence
    const seqLabel = document.createElement("div");
    seqLabel.className = "kmp-phase-label";
    seqLabel.textContent = "Text:";
    container.appendChild(seqLabel);

    const textSeq = document.createElement("div");
    textSeq.className = "kmp-sequence kmp-sequence-container";
    for (let i = 0; i < currentText.length; i++) {
      const cell = document.createElement("div");
      cell.className = "kmp-char-cell";

      const charEl = document.createElement("span");
      charEl.className = "kmp-char";
      charEl.textContent = currentText[i];

      if (i === textI && step) {
        if (step.isFound) {
          charEl.classList.add("kmp-char-found");
        } else if (step.isMatch) {
          charEl.classList.add("kmp-char-match");
        } else {
          charEl.classList.add("kmp-char-mismatch");
        }
      } else if (foundMatches.has(i)) {
        charEl.classList.add("kmp-char-past-match");
      } else if (i === textI) {
        charEl.classList.add("kmp-char-active");
      }

      const idxEl = document.createElement("span");
      idxEl.className = "kmp-char-index";
      idxEl.textContent = i;

      cell.appendChild(charEl);
      cell.appendChild(idxEl);
      textSeq.appendChild(cell);
    }
    container.appendChild(textSeq);

    // Pattern sequence aligned under current text position
    if (step && patJ >= 0) {
      const patLabel = document.createElement("div");
      patLabel.className = "kmp-phase-label";
      patLabel.textContent = "Pattern (aligned):";
      container.appendChild(patLabel);

      const patAlignRow = document.createElement("div");
      patAlignRow.style.display = "flex";
      patAlignRow.style.gap = "2px";

      // Offset: pattern starts at textI - patJ
      const offset = textI - patJ;

      for (let i = 0; i < offset; i++) {
        const spacer = document.createElement("div");
        spacer.className = "kmp-char-cell kmp-offset-spacer";
        const empty = document.createElement("span");
        empty.className = "kmp-char";
        empty.style.background = "transparent";
        empty.style.border = "none";
        empty.textContent = " ";
        spacer.appendChild(empty);
        const emptyIdx = document.createElement("span");
        emptyIdx.className = "kmp-char-index";
        emptyIdx.textContent = " ";
        spacer.appendChild(emptyIdx);
        patAlignRow.appendChild(spacer);
      }

      for (let j = 0; j < currentPattern.length; j++) {
        const cell = document.createElement("div");
        cell.className = "kmp-char-cell";

        const charEl = document.createElement("span");
        charEl.className = "kmp-char kmp-pattern-char";
        charEl.textContent = currentPattern[j];

        if (j === patJ && step) {
          if (step.isFound) {
            charEl.classList.add("kmp-char-found");
          } else if (step.isMatch) {
            charEl.classList.add("kmp-char-match");
          } else if (!step.isMatch && j === patJ) {
            charEl.classList.add("kmp-char-mismatch");
          }
        } else if (j < patJ) {
          charEl.classList.add("kmp-char-match");
        }

        const idxEl = document.createElement("span");
        idxEl.className = "kmp-char-index";
        idxEl.textContent = j;

        cell.appendChild(charEl);
        cell.appendChild(idxEl);
        patAlignRow.appendChild(cell);
      }

      container.appendChild(patAlignRow);
    }
  }

  // --- Update stats ---
  function updateStats() {
    if (!kmpResult || !naiveResult) return;

    const naiveSteps = naiveResult.stepCount;
    const savings =
      naiveSteps > 0
        ? Math.round(((naiveSteps - kmpResult.stepCount) / naiveSteps) * 100)
        : 0;

    statsKmp.textContent = String(kmpResult.stepCount);
    statsNaive.textContent = String(naiveSteps);
    statsSavings.textContent = savings + "%";
    statsSavings.className =
      "kmp-stat-value " + (savings >= 0 ? "kmp-stat-highlight" : "");
  }

  // --- Update match badges ---
  function updateMatchesDisplay(stepIdx) {
    matchesDisplay.textContent = "";

    // Collect matches found up to current step
    const foundSoFar = [];
    for (let s = 0; s <= stepIdx; s++) {
      if (s >= 0 && s < kmpResult.steps.length && kmpResult.steps[s].isFound) {
        foundSoFar.push(kmpResult.steps[s].textIdx - currentPattern.length + 1);
      }
    }

    if (foundSoFar.length === 0) {
      const none = document.createElement("span");
      none.textContent = "No matches found yet.";
      matchesDisplay.appendChild(none);
      return;
    }

    const label = document.createTextNode("Matches at index: ");
    matchesDisplay.appendChild(label);
    for (const idx of foundSoFar) {
      const badge = document.createElement("span");
      badge.className = "kmp-match-badge";
      badge.textContent = idx;
      matchesDisplay.appendChild(badge);
    }
  }

  // --- Render current state ---
  function render() {
    if (currentPhase === "failure") {
      const filled = failureStepIdx + 1; // -1 means none filled
      buildFailureTable(currentPattern, filled);
      buildSearchPanel(-1);

      infoEl.textContent =
        failureStepIdx < 0
          ? 'Ready. Building failure function for pattern "' +
            currentPattern +
            '".'
          : "Failure function: computing f[" +
            failureStepIdx +
            "] = " +
            kmpResult.failureFunction[failureStepIdx] +
            ".";
    } else {
      // Search phase
      buildFailureTable(currentPattern, currentPattern.length); // fully filled
      buildSearchPanel(searchStepIdx);

      if (searchStepIdx < 0) {
        infoEl.textContent =
          'Failure function built. Starting KMP search phase. Text: "' +
          currentText +
          '", Pattern: "' +
          currentPattern +
          '".';
      } else if (searchStepIdx < kmpResult.steps.length) {
        infoEl.textContent =
          "Step " +
          (searchStepIdx + 1) +
          "/" +
          kmpResult.steps.length +
          ": " +
          kmpResult.steps[searchStepIdx].explanation;
      } else {
        const matchCount = kmpResult.matches.length;
        infoEl.textContent =
          "Search complete. " +
          (matchCount === 0
            ? "No matches found."
            : matchCount +
              " match" +
              (matchCount === 1 ? "" : "es") +
              " found at position" +
              (matchCount === 1 ? "" : "s") +
              ": " +
              kmpResult.matches.join(", ") +
              ".");
      }

      updateMatchesDisplay(searchStepIdx);
    }

    updateStats();
    updateButtons();
  }

  // --- Playback controls ---
  function atStart() {
    return currentPhase === "failure" && failureStepIdx < 0;
  }

  function atEnd() {
    return (
      currentPhase === "search" && searchStepIdx >= kmpResult.steps.length - 1
    );
  }

  function stepForward() {
    if (!kmpResult) return;

    if (currentPhase === "failure") {
      if (failureStepIdx < currentPattern.length - 1) {
        failureStepIdx++;
      } else {
        // Transition to search phase
        currentPhase = "search";
        searchStepIdx = -1;
      }
    } else {
      if (searchStepIdx < kmpResult.steps.length - 1) {
        searchStepIdx++;
      } else {
        stopPlay();
      }
    }

    render();
  }

  function stepBackward() {
    if (!kmpResult) return;
    if (atStart()) return;

    if (currentPhase === "search") {
      if (searchStepIdx < 0) {
        // Go back to end of failure phase
        currentPhase = "failure";
        failureStepIdx = currentPattern.length - 1;
      } else {
        searchStepIdx--;
      }
    } else {
      failureStepIdx--;
    }

    render();
  }

  function getDelay() {
    const spd = parseInt(speedSlider.value, 10);
    return Math.round(1200 / spd);
  }

  function play() {
    if (atEnd()) {
      // Restart from beginning
      resetToStart();
    }
    isPlaying = true;
    updateButtons();
    tick();
  }

  function tick() {
    if (!isPlaying) return;
    if (atEnd()) {
      stopPlay();
      return;
    }
    stepForward();
    if (!atEnd()) {
      animationTimer = setTimeout(tick, getDelay());
    } else {
      stopPlay();
    }
  }

  function stopPlay() {
    isPlaying = false;
    if (animationTimer !== null) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }
    updateButtons();
  }

  function resetToStart() {
    stopPlay();
    if (!kmpResult) return;
    currentPhase = "failure";
    failureStepIdx = -1;
    searchStepIdx = -1;
    render();
  }

  function updateButtons() {
    if (!kmpResult) {
      btnPlay.disabled = true;
      btnPause.disabled = true;
      btnStep.disabled = true;
      btnStepBack.disabled = true;
      btnReset.disabled = true;
      return;
    }
    btnPlay.disabled = isPlaying;
    btnPause.disabled = !isPlaying;
    btnStep.disabled = isPlaying || atEnd();
    btnStepBack.disabled = isPlaying || atStart();
    btnReset.disabled = isPlaying;
  }

  // --- Visualize ---
  function visualize() {
    stopPlay();

    const input = validateInputs();
    if (!input) return;

    currentText = input.text;
    currentPattern = input.pattern;

    // Run algorithms — calls kmp-algorithm.js functions
    kmpResult = KMPAlgorithm.kmpSearch(currentText, currentPattern);
    naiveResult = KMPAlgorithm.naiveSearch(currentText, currentPattern);

    // Reset playback state
    currentPhase = "failure";
    failureStepIdx = -1;
    searchStepIdx = -1;

    playbackEl.classList.remove("hidden");
    infoEl.classList.remove("kmp-error");

    render();
  }

  // --- Random example ---
  function randomExample() {
    const ex =
      RANDOM_EXAMPLES[Math.floor(Math.random() * RANDOM_EXAMPLES.length)];
    textInput.value = ex.text;
    patternInput.value = ex.pattern;
  }

  // --- Legend setup ---
  function buildLegend() {
    const legendEl = document.getElementById("kmpLegend");
    if (!legendEl) return;

    const items = [
      { cls: "kmp-swatch-match", label: "Match" },
      { cls: "kmp-swatch-mismatch", label: "Mismatch" },
      { cls: "kmp-swatch-active", label: "Active comparison" },
      { cls: "kmp-swatch-found", label: "Pattern found" },
    ];

    for (const item of items) {
      const div = document.createElement("div");
      div.className = "kmp-legend-item";

      const swatch = document.createElement("span");
      swatch.className = "kmp-swatch " + item.cls;

      const label = document.createTextNode(item.label);
      div.appendChild(swatch);
      div.appendChild(label);
      legendEl.appendChild(div);
    }
  }

  // --- Event listeners ---
  btnVisualize.addEventListener("click", visualize);

  btnRandom.addEventListener("click", () => {
    randomExample();
    visualize();
  });

  btnPlay.addEventListener("click", play);
  btnPause.addEventListener("click", stopPlay);

  btnStep.addEventListener("click", () => {
    stopPlay();
    stepForward();
  });

  btnStepBack.addEventListener("click", () => {
    stopPlay();
    stepBackward();
  });

  btnReset.addEventListener("click", resetToStart);

  speedSlider.addEventListener("input", () => {
    if (isPlaying) {
      stopPlay();
      play();
    }
  });

  // Enforce input limits programmatically
  textInput.addEventListener("input", () => {
    if (textInput.value.length > MAX_TEXT) {
      textInput.value = textInput.value.slice(0, MAX_TEXT);
    }
  });

  patternInput.addEventListener("input", () => {
    if (patternInput.value.length > MAX_PATTERN) {
      patternInput.value = patternInput.value.slice(0, MAX_PATTERN);
    }
  });

  // Enter key triggers visualize
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") visualize();
  });
  patternInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") visualize();
  });

  // Clean up timer on page unload
  window.addEventListener("beforeunload", () => {
    stopPlay();
  });

  // --- Init ---
  buildLegend();
  visualize();
})();
