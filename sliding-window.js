(() => {
  "use strict";

  // ============================================================
  // Constants from algorithm module (DRY — no redeclaration)
  // ============================================================
  const MAX_ARRAY_SIZE = SlidingWindowAlgorithm.MAX_ARRAY_SIZE;
  const MAX_STRING_LENGTH = SlidingWindowAlgorithm.MAX_STRING_LENGTH;

  // ============================================================
  // DOM refs — Fixed Window panel
  // ============================================================
  const fixedArrayInput = document.getElementById("fixedArrayInput");
  const kSlider = document.getElementById("kSlider");
  const kValueEl = document.getElementById("kValue");
  const btnFixedVisualize = document.getElementById("btnFixedVisualize");
  const fixedArrayRow = document.getElementById("fixedArrayRow");
  const fixedBracketRow = document.getElementById("fixedBracketRow");
  const fixedCurrentSum = document.getElementById("fixedCurrentSum");
  const fixedMaxSum = document.getElementById("fixedMaxSum");
  const fixedInfo = document.getElementById("fixedInfo");
  const fixedPlayback = document.getElementById("fixedPlayback");
  const fixedBtnReset = document.getElementById("fixedBtnReset");
  const fixedBtnStepBack = document.getElementById("fixedBtnStepBack");
  const fixedBtnPlay = document.getElementById("fixedBtnPlay");
  const fixedBtnPause = document.getElementById("fixedBtnPause");
  const fixedBtnStep = document.getElementById("fixedBtnStep");
  const fixedSpeedSlider = document.getElementById("fixedSpeed");
  const fixedStepInfo = document.getElementById("fixedStepInfo");
  const fixedStepCountEl = document.getElementById("fixedStepCount");
  const fixedWindowCountEl = document.getElementById("fixedWindowCount");

  // ============================================================
  // DOM refs — Variable Window panel
  // ============================================================
  const varStringInput = document.getElementById("varStringInput");
  const btnVarVisualize = document.getElementById("btnVarVisualize");
  const varCharRow = document.getElementById("varCharRow");
  const varPtrRow = document.getElementById("varPtrRow");
  const varActionRow = document.getElementById("varActionRow");
  const varActionBadge = document.getElementById("varActionBadge");
  const varActionReason = document.getElementById("varActionReason");
  const varFreqMap = document.getElementById("varFreqMap");
  const varWindowContent = document.getElementById("varWindowContent");
  const varBestValue = document.getElementById("varBestValue");
  const varInfo = document.getElementById("varInfo");
  const varPlayback = document.getElementById("varPlayback");
  const varBtnReset = document.getElementById("varBtnReset");
  const varBtnStepBack = document.getElementById("varBtnStepBack");
  const varBtnPlay = document.getElementById("varBtnPlay");
  const varBtnPause = document.getElementById("varBtnPause");
  const varBtnStep = document.getElementById("varBtnStep");
  const varSpeedSlider = document.getElementById("varSpeed");
  const varStepInfo = document.getElementById("varStepInfo");
  const varStepCountEl = document.getElementById("varStepCount");
  const varMaxLenEl = document.getElementById("varMaxLen");

  // ============================================================
  // Fixed Window state
  // ============================================================
  let fixedSteps = [];
  let fixedStepIdx = -1;
  let fixedResult = null;
  let fixedTimer = null;
  let fixedIsPlaying = false;

  // ============================================================
  // Variable Window state
  // ============================================================
  let varSteps = [];
  let varStepIdx = -1;
  let varResult = null;
  let varTimer = null;
  let varIsPlaying = false;

  // ============================================================
  // Helpers
  // ============================================================

  function parseArrayInput(raw) {
    if (!raw || raw.trim().length === 0) return null;
    const parts = raw
      .trim()
      .split(/[,\s]+/)
      .map(Number);
    if (parts.some((n) => isNaN(n) || !isFinite(n))) return null;
    return parts;
  }

  function speedToMs(sliderVal) {
    // Slider 1..10, map to 1200ms..100ms
    return Math.round(1300 - sliderVal * 120);
  }

  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  // ============================================================
  // Fixed Window — render
  // ============================================================

  function renderFixed(arr, stepIdx) {
    const step =
      stepIdx >= 0 && stepIdx < fixedSteps.length ? fixedSteps[stepIdx] : null;

    // Render array cells
    clearChildren(fixedArrayRow);
    for (let i = 0; i < arr.length; i++) {
      const cell = document.createElement("div");
      cell.className = "sw-cell";

      if (step) {
        if (i >= step.left && i <= step.right) {
          cell.classList.add(step.isMax ? "sw-max-window" : "sw-in-window");
        }
      }

      const valEl = document.createElement("span");
      valEl.className = "sw-cell-value";
      valEl.textContent = String(arr[i]);

      const idxEl = document.createElement("span");
      idxEl.className = "sw-cell-index";
      idxEl.textContent = String(i);

      cell.appendChild(valEl);
      cell.appendChild(idxEl);
      fixedArrayRow.appendChild(cell);
    }

    // Render bracket row
    clearChildren(fixedBracketRow);
    for (let i = 0; i < arr.length; i++) {
      const slot = document.createElement("div");
      slot.className = "sw-bracket-slot";

      if (step) {
        if (i === step.left) {
          const lbl = document.createElement("span");
          lbl.className = "sw-bracket-label";
          lbl.textContent = "L";
          slot.appendChild(lbl);
        } else if (i === step.right) {
          const lbl = document.createElement("span");
          lbl.className = "sw-bracket-label sw-bracket-right";
          lbl.textContent = "R";
          slot.appendChild(lbl);
        }
      }

      fixedBracketRow.appendChild(slot);
    }

    // Update sum display
    if (step) {
      fixedCurrentSum.textContent = String(step.sum);
      fixedMaxSum.textContent = String(fixedResult.maxSum);
    } else {
      fixedCurrentSum.textContent = "\u2014";
      fixedMaxSum.textContent = "\u2014";
    }

    // Update step counter
    fixedStepCountEl.textContent =
      fixedSteps.length > 0 ? stepIdx + 1 + " / " + fixedSteps.length : "0 / 0";

    // Update info message
    if (step) {
      const msg =
        "Window [" +
        step.left +
        ".." +
        step.right +
        "]  sum = " +
        step.sum +
        (step.isMax ? "  \u2190 new max" : "");
      fixedInfo.textContent = msg;
    }

    updateFixedPlaybackState();
  }

  function updateFixedPlaybackState() {
    const atStart = fixedStepIdx <= 0;
    const atEnd = fixedStepIdx >= fixedSteps.length - 1;
    fixedBtnStepBack.disabled = atStart;
    fixedBtnStep.disabled = atEnd;
    fixedBtnPlay.disabled = atEnd || fixedIsPlaying;
    fixedBtnPause.disabled = !fixedIsPlaying;
  }

  // ============================================================
  // Fixed Window — playback
  // ============================================================

  function fixedClearTimer() {
    if (fixedTimer !== null) {
      clearTimeout(fixedTimer);
      fixedTimer = null;
    }
  }

  function fixedScheduleNext() {
    if (fixedStepIdx >= fixedSteps.length - 1) {
      fixedIsPlaying = false;
      updateFixedPlaybackState();
      return;
    }
    fixedTimer = setTimeout(
      () => {
        fixedTimer = null;
        fixedStepIdx++;
        renderFixed(fixedResult._arr, fixedStepIdx);
        if (fixedIsPlaying) {
          fixedScheduleNext();
        }
      },
      speedToMs(Number(fixedSpeedSlider.value)),
    );
  }

  // ============================================================
  // Fixed Window — event handlers
  // ============================================================

  kSlider.addEventListener("input", () => {
    kValueEl.textContent = kSlider.value;
  });

  btnFixedVisualize.addEventListener("click", () => {
    fixedClearTimer();
    fixedIsPlaying = false;

    const arr = parseArrayInput(fixedArrayInput.value);
    if (!arr || arr.length === 0) {
      fixedInfo.textContent = "Please enter a valid array of numbers.";
      return;
    }
    if (arr.length > MAX_ARRAY_SIZE) {
      fixedInfo.textContent =
        "Array too large \u2014 max " + MAX_ARRAY_SIZE + " elements.";
      return;
    }

    let k = parseInt(kSlider.value, 10);
    kSlider.max = String(arr.length);
    if (k > arr.length) {
      k = arr.length;
      kSlider.value = String(k);
      kValueEl.textContent = String(k);
    }

    fixedResult = SlidingWindowAlgorithm.maxSumFixedWindow(arr, k);
    fixedResult._arr = arr;
    fixedSteps = fixedResult.steps;
    fixedStepIdx = 0;

    fixedPlayback.classList.remove("hidden");
    fixedStepInfo.style.display = "";
    fixedWindowCountEl.textContent = String(fixedSteps.length);

    renderFixed(arr, fixedStepIdx);
    fixedInfo.textContent =
      "Window size k=" +
      k +
      ".  Max sum = " +
      fixedResult.maxSum +
      "  (window starting at index " +
      fixedResult.windowStart +
      ")";
  });

  fixedBtnReset.addEventListener("click", () => {
    fixedClearTimer();
    fixedIsPlaying = false;
    fixedStepIdx = 0;
    if (fixedResult) {
      renderFixed(fixedResult._arr, fixedStepIdx);
    }
  });

  fixedBtnStep.addEventListener("click", () => {
    if (fixedStepIdx < fixedSteps.length - 1) {
      fixedStepIdx++;
      renderFixed(fixedResult._arr, fixedStepIdx);
    }
  });

  fixedBtnStepBack.addEventListener("click", () => {
    if (fixedStepIdx > 0) {
      fixedStepIdx--;
      renderFixed(fixedResult._arr, fixedStepIdx);
    }
  });

  fixedBtnPlay.addEventListener("click", () => {
    if (fixedIsPlaying || fixedStepIdx >= fixedSteps.length - 1) return;
    fixedIsPlaying = true;
    updateFixedPlaybackState();
    fixedScheduleNext();
  });

  fixedBtnPause.addEventListener("click", () => {
    fixedClearTimer();
    fixedIsPlaying = false;
    updateFixedPlaybackState();
  });

  // ============================================================
  // Variable Window — render
  // ============================================================

  function renderVar(str, stepIdx) {
    const step =
      stepIdx >= 0 && stepIdx < varSteps.length ? varSteps[stepIdx] : null;

    // Render character cells
    clearChildren(varCharRow);
    for (let i = 0; i < str.length; i++) {
      const cell = document.createElement("div");
      cell.className = "sw-char-cell";

      if (step) {
        const inWindow = i >= step.left && i <= step.right;
        const isLeft = i === step.left;
        const isRight = i === step.right;
        const isShrink = step.action === "shrink";

        if (inWindow) {
          cell.classList.add("sw-char-in-window");
        }
        if (isLeft && isRight) {
          if (isShrink) {
            cell.classList.add("sw-char-shrink");
          }
        } else {
          if (isLeft) cell.classList.add("sw-char-left-ptr");
          if (isRight) {
            if (isShrink) {
              cell.classList.add("sw-char-shrink");
            } else {
              cell.classList.add("sw-char-right-ptr");
            }
          }
        }
      }

      const valEl = document.createElement("span");
      valEl.className = "sw-char-value";
      valEl.textContent = str[i];

      const idxEl = document.createElement("span");
      idxEl.className = "sw-char-idx";
      idxEl.textContent = String(i);

      cell.appendChild(valEl);
      cell.appendChild(idxEl);
      varCharRow.appendChild(cell);
    }

    // Render pointer labels row
    clearChildren(varPtrRow);
    for (let i = 0; i < str.length; i++) {
      const slot = document.createElement("div");
      slot.className = "sw-ptr-slot";

      if (step) {
        if (i === step.left && i === step.right) {
          const lbl = document.createElement("span");
          lbl.className = "sw-ptr-label sw-ptr-both";
          lbl.textContent = "L=R";
          slot.appendChild(lbl);
        } else if (i === step.left) {
          const lbl = document.createElement("span");
          lbl.className = "sw-ptr-label sw-ptr-left";
          lbl.textContent = "L";
          slot.appendChild(lbl);
        } else if (i === step.right) {
          const lbl = document.createElement("span");
          lbl.className = "sw-ptr-label sw-ptr-right";
          lbl.textContent = "R";
          slot.appendChild(lbl);
        }
      }

      varPtrRow.appendChild(slot);
    }

    // Render action badge + reason
    if (step) {
      varActionRow.style.display = "";
      varActionBadge.textContent = step.action;
      varActionBadge.className =
        "sw-action-badge " +
        (step.action === "expand" ? "sw-action-expand" : "sw-action-shrink");
      varActionReason.textContent = step.reason;
    } else {
      varActionRow.style.display = "none";
    }

    // Render frequency map
    clearChildren(varFreqMap);
    if (step && step.charFreq) {
      const chars = Object.keys(step.charFreq).sort();
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const count = step.charFreq[ch];
        if (count > 0) {
          const entry = document.createElement("div");
          entry.className = "sw-freq-entry";

          const charEl = document.createElement("span");
          charEl.className = "sw-freq-char";
          charEl.textContent = ch;

          const countEl = document.createElement("span");
          countEl.className = "sw-freq-count";
          countEl.textContent = String(count);

          entry.appendChild(charEl);
          entry.appendChild(countEl);
          varFreqMap.appendChild(entry);
        }
      }
    }

    // Update window / best display
    if (step) {
      varWindowContent.textContent = step.window || "\u2014";
    } else {
      varWindowContent.textContent = "\u2014";
    }

    if (varResult) {
      varBestValue.textContent =
        varResult.maxLen > 0
          ? '"' + varResult.substring + '" (len ' + varResult.maxLen + ")"
          : "\u2014";
      varMaxLenEl.textContent = String(varResult.maxLen);
    }

    // Update step counter
    varStepCountEl.textContent =
      varSteps.length > 0 ? stepIdx + 1 + " / " + varSteps.length : "0 / 0";

    // Update info
    if (step) {
      varInfo.textContent =
        "Step " +
        (stepIdx + 1) +
        "/" +
        varSteps.length +
        "  L=" +
        step.left +
        " R=" +
        step.right +
        '  window="' +
        step.window +
        '"';
    }

    updateVarPlaybackState();
  }

  function updateVarPlaybackState() {
    const atStart = varStepIdx <= 0;
    const atEnd = varStepIdx >= varSteps.length - 1;
    varBtnStepBack.disabled = atStart;
    varBtnStep.disabled = atEnd;
    varBtnPlay.disabled = atEnd || varIsPlaying;
    varBtnPause.disabled = !varIsPlaying;
  }

  // ============================================================
  // Variable Window — playback
  // ============================================================

  function varClearTimer() {
    if (varTimer !== null) {
      clearTimeout(varTimer);
      varTimer = null;
    }
  }

  function varScheduleNext() {
    if (varStepIdx >= varSteps.length - 1) {
      varIsPlaying = false;
      updateVarPlaybackState();
      return;
    }
    varTimer = setTimeout(
      () => {
        varTimer = null;
        varStepIdx++;
        renderVar(varResult._str, varStepIdx);
        if (varIsPlaying) {
          varScheduleNext();
        }
      },
      speedToMs(Number(varSpeedSlider.value)),
    );
  }

  // ============================================================
  // Variable Window — event handlers
  // ============================================================

  btnVarVisualize.addEventListener("click", () => {
    varClearTimer();
    varIsPlaying = false;

    const str = varStringInput.value;
    if (!str || str.length === 0) {
      varInfo.textContent = "Please enter a string.";
      return;
    }
    if (str.length > MAX_STRING_LENGTH) {
      varInfo.textContent =
        "String too long \u2014 max " + MAX_STRING_LENGTH + " characters.";
      return;
    }

    varResult = SlidingWindowAlgorithm.longestUniqueSubstring(str);
    varResult._str = str;
    varSteps = varResult.steps;
    varStepIdx = 0;

    if (varSteps.length === 0) {
      varInfo.textContent = "No steps generated for this input.";
      return;
    }

    varPlayback.classList.remove("hidden");
    varStepInfo.style.display = "";

    renderVar(str, varStepIdx);
    varInfo.textContent =
      'Longest unique substring: "' +
      varResult.substring +
      '"  (length ' +
      varResult.maxLen +
      ")";
  });

  varBtnReset.addEventListener("click", () => {
    varClearTimer();
    varIsPlaying = false;
    varStepIdx = 0;
    if (varResult) {
      renderVar(varResult._str, varStepIdx);
    }
  });

  varBtnStep.addEventListener("click", () => {
    if (varStepIdx < varSteps.length - 1) {
      varStepIdx++;
      renderVar(varResult._str, varStepIdx);
    }
  });

  varBtnStepBack.addEventListener("click", () => {
    if (varStepIdx > 0) {
      varStepIdx--;
      renderVar(varResult._str, varStepIdx);
    }
  });

  varBtnPlay.addEventListener("click", () => {
    if (varIsPlaying || varStepIdx >= varSteps.length - 1) return;
    varIsPlaying = true;
    updateVarPlaybackState();
    varScheduleNext();
  });

  varBtnPause.addEventListener("click", () => {
    varClearTimer();
    varIsPlaying = false;
    updateVarPlaybackState();
  });

  // ============================================================
  // Cleanup on unload
  // ============================================================
  window.addEventListener("unload", () => {
    fixedClearTimer();
    varClearTimer();
  });
})();
