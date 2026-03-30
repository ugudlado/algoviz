(() => {
  "use strict";

  const KEY_SLOT = 36;
  const NODE_H = 36;
  const PAD = 14;
  const SVG_W = 720;
  const TOP_Y = 42;
  const LEVEL_GAP = 92;

  const tSelect = document.getElementById("bt-tSelect");
  const insertInput = document.getElementById("bt-insertInput");
  const deleteInput = document.getElementById("bt-deleteInput");
  const searchInput = document.getElementById("bt-searchInput");
  const btnInsert = document.getElementById("bt-btnInsert");
  const btnDelete = document.getElementById("bt-btnDelete");
  const btnSearch = document.getElementById("bt-btnSearch");
  const btnClear = document.getElementById("bt-btnClear");
  const btInfo = document.getElementById("bt-info");
  const btSvg = document.getElementById("bt-svg");
  const btPlayback = document.getElementById("bt-playback");
  const btnReset = document.getElementById("bt-btnReset");
  const btnStepBack = document.getElementById("bt-btnStepBack");
  const btnPlay = document.getElementById("bt-btnPlay");
  const btnPause = document.getElementById("bt-btnPause");
  const btnStep = document.getElementById("bt-btnStep");
  const speedSlider = document.getElementById("bt-speed");
  const statKeys = document.getElementById("bt-statKeys");
  const statNodes = document.getElementById("bt-statNodes");
  const statStep = document.getElementById("bt-statStep");

  /** Canonical tree for new operations (not affected by step-back scrubbing). */
  let committedRoot = null;
  let pendingSteps = [];
  let stepIdx = -1;
  let timer = null;
  let isPlaying = false;
  let highlightKey = null;

  function getT() {
    const v = parseInt(tSelect.value, 10);
    if (v >= BTreeAlgorithm.MIN_T && v <= BTreeAlgorithm.MAX_T) return v;
    return 3;
  }

  /** B-tree shape depends on t; changing t with data would invalidate the tree. */
  function updateTSelectEnabled() {
    const hasKeys =
      committedRoot !== null && BTreeAlgorithm.keyCount(committedRoot) > 0;
    tSelect.disabled = hasKeys;
    tSelect.title = hasKeys
      ? "Clear the tree before changing minimum degree t."
      : "";
  }

  function clearSvg() {
    while (btSvg.firstChild) btSvg.removeChild(btSvg.firstChild);
  }

  function nodeWidth(node) {
    const k = Math.max(1, node.keys.length);
    return k * KEY_SLOT + PAD * 2;
  }

  /**
   * Layout subtree; returns { cx, bottomY, topY, width } in px.
   */
  function layoutSubtree(node, depth, x0, x1) {
    const y = TOP_Y + depth * LEVEL_GAP;
    const mid = (x0 + x1) / 2;
    if (!node || node.leaf || node.children.length === 0) {
      const w = nodeWidth(node);
      const cx = mid;
      return {
        cx,
        topY: y,
        bottomY: y + NODE_H,
        width: w,
        layout: [{ node, cx, y, w }],
        edges: [],
      };
    }
    const childLayouts = [];
    const span = x1 - x0;
    const ratios = node.children.map((ch) => Math.max(40, nodeWidth(ch)));
    const sum = ratios.reduce((a, b) => a + b, 0);
    let acc = x0;
    const childBoxes = [];
    for (let i = 0; i < node.children.length; i++) {
      const seg = (ratios[i] / sum) * span;
      const c0 = acc;
      const c1 = acc + seg;
      const sub = layoutSubtree(node.children[i], depth + 1, c0, c1);
      childLayouts.push(sub);
      childBoxes.push(sub);
      acc = c1;
    }
    const firstCx = childBoxes[0].cx;
    const lastCx = childBoxes[childBoxes.length - 1].cx;
    const cx = (firstCx + lastCx) / 2;
    const w = nodeWidth(node);
    const layout = [{ node, cx, y, w }];
    const edges = [];
    const parentBottom = y + NODE_H;
    for (let j = 0; j < childBoxes.length; j++) {
      const ch = childBoxes[j];
      edges.push({
        x1: cx,
        y1: parentBottom,
        x2: ch.cx,
        y2: ch.topY,
      });
    }
    for (let j = 0; j < childLayouts.length; j++) {
      layout.push(...childLayouts[j].layout);
      edges.push(...childLayouts[j].edges);
    }
    const maxBottom = Math.max(y + NODE_H, ...childBoxes.map((b) => b.bottomY));
    return {
      cx,
      topY: y,
      bottomY: maxBottom,
      width: w,
      layout,
      edges,
    };
  }

  function drawTree(root, hlKey) {
    clearSvg();
    highlightKey = hlKey == null ? null : hlKey;
    if (!root) {
      btSvg.removeAttribute("viewBox");
      btSvg.setAttribute("height", "200");
      return;
    }
    const L = layoutSubtree(root, 0, 24, SVG_W - 24);
    btSvg.setAttribute("height", String(Math.max(260, L.bottomY + 48)));
    btSvg.setAttribute("viewBox", "0 0 " + SVG_W + " " + (L.bottomY + 48));

    for (let e = 0; e < L.edges.length; e++) {
      const ed = L.edges[e];
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", ed.x1);
      line.setAttribute("y1", ed.y1);
      line.setAttribute("x2", ed.x2);
      line.setAttribute("y2", ed.y2);
      line.setAttribute("class", "bt-edge");
      btSvg.appendChild(line);
    }

    for (let i = 0; i < L.layout.length; i++) {
      const item = L.layout[i];
      const n = item.node;
      const cx = item.cx;
      const y = item.y;
      const w = item.w;
      const x0 = cx - w / 2;
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      let hasHl = hlKey != null && n.keys.indexOf(hlKey) !== -1;
      rect.setAttribute(
        "class",
        hasHl ? "bt-node-rect bt-node-highlight" : "bt-node-rect",
      );
      rect.setAttribute("x", x0);
      rect.setAttribute("y", y);
      rect.setAttribute("width", w);
      rect.setAttribute("height", NODE_H);
      btSvg.appendChild(rect);

      for (let k = 0; k < n.keys.length; k++) {
        const kx = x0 + PAD + k * KEY_SLOT + KEY_SLOT / 2;
        if (k > 0) {
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
          );
          line.setAttribute("x1", x0 + PAD + k * KEY_SLOT);
          line.setAttribute("y1", y + 4);
          line.setAttribute("x2", x0 + PAD + k * KEY_SLOT);
          line.setAttribute("y2", y + NODE_H - 4);
          line.setAttribute("class", "bt-key-sep");
          btSvg.appendChild(line);
        }
        const t = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        t.setAttribute("x", kx);
        t.setAttribute("y", y + NODE_H / 2 + 4);
        t.setAttribute("class", "bt-key-text");
        t.textContent = String(n.keys[k]);
        btSvg.appendChild(t);
      }
    }
  }

  function countNodes(root) {
    if (!root) return 0;
    let c = 1;
    if (!root.leaf) {
      for (let i = 0; i < root.children.length; i++) {
        c += countNodes(root.children[i]);
      }
    }
    return c;
  }

  function updateStats(root) {
    statKeys.textContent = String(BTreeAlgorithm.keyCount(root));
    statNodes.textContent = String(countNodes(root));
    if (pendingSteps.length === 0) {
      statStep.textContent = "— / —";
    } else {
      statStep.textContent = stepIdx + 1 + " / " + pendingSteps.length;
    }
  }

  function updateButtons() {
    const hasSteps = pendingSteps.length > 0;
    const atEnd = stepIdx >= pendingSteps.length - 1;
    const atStart = stepIdx < 0;

    btnPlay.disabled = isPlaying || !hasSteps || atEnd;
    btnPause.disabled = !isPlaying;
    btnStep.disabled = isPlaying || atEnd || !hasSteps;
    btnStepBack.disabled = isPlaying || atStart;
    btnReset.disabled = isPlaying;
  }

  function showStep(idx) {
    if (idx < 0 || idx >= pendingSteps.length) return;
    const step = pendingSteps[idx];
    const snap = step.tree;
    const displayRoot = snap ? BTreeAlgorithm.cloneTree(snap) : null;
    const hl =
      step.type === "found" || step.type === "visit" ? highlightKey : null;
    btInfo.textContent = step.message;
    drawTree(displayRoot, hl);
    updateStats(displayRoot);
    updateButtons();
  }

  function getDelay() {
    const spd = parseInt(speedSlider.value, 10);
    return Math.round(800 / spd);
  }

  function stopPlay() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    isPlaying = false;
    btnPlay.classList.add("active");
    btnPause.classList.remove("active");
    btnPause.disabled = true;
    btnPlay.disabled = false;
    updateButtons();
  }

  function stepForward() {
    if (stepIdx >= pendingSteps.length - 1) {
      stopPlay();
      return;
    }
    stepIdx++;
    showStep(stepIdx);
    if (stepIdx >= pendingSteps.length - 1) stopPlay();
  }

  function stepBack() {
    if (stepIdx <= 0) return;
    stepIdx--;
    showStep(stepIdx);
  }

  function startPlay() {
    if (pendingSteps.length === 0 || stepIdx >= pendingSteps.length - 1) return;
    isPlaying = true;
    btnPlay.classList.remove("active");
    btnPause.classList.add("active");
    btnPause.disabled = false;
    btnPlay.disabled = true;
    function tick() {
      if (!isPlaying) return;
      if (stepIdx >= pendingSteps.length - 1) {
        stopPlay();
        return;
      }
      stepForward();
      timer = setTimeout(tick, getDelay());
    }
    timer = setTimeout(tick, getDelay());
  }

  function beginSteps(steps) {
    stopPlay();
    pendingSteps = steps;
    if (pendingSteps.length === 0) {
      btPlayback.classList.add("hidden");
      const dr = committedRoot ? BTreeAlgorithm.cloneTree(committedRoot) : null;
      drawTree(dr, null);
      updateStats(committedRoot);
      return;
    }
    btPlayback.classList.remove("hidden");
    stepIdx = pendingSteps.length - 1;
    showStep(stepIdx);
  }

  function onInsert() {
    const key = parseInt(insertInput.value, 10);
    if (Number.isNaN(key) || key < -999 || key > 999) {
      btInfo.textContent = "Enter an integer key from -999 to 999.";
      return;
    }
    const res = BTreeAlgorithm.insertKey(committedRoot, key, getT(), []);
    if (res.error) {
      btInfo.textContent = res.steps.length
        ? res.steps[res.steps.length - 1].message
        : "Cannot insert.";
      return;
    }
    committedRoot = res.root;
    highlightKey = null;
    updateTSelectEnabled();
    beginSteps(res.steps);
  }

  function onDelete() {
    const key = parseInt(deleteInput.value, 10);
    if (Number.isNaN(key) || key < -999 || key > 999) {
      btInfo.textContent = "Enter an integer key from -999 to 999.";
      return;
    }
    const res = BTreeAlgorithm.deleteKey(committedRoot, key, getT(), []);
    committedRoot = res.root;
    highlightKey = null;
    updateTSelectEnabled();
    beginSteps(res.steps);
  }

  function onSearch() {
    const key = parseInt(searchInput.value, 10);
    if (Number.isNaN(key) || key < -999 || key > 999) {
      btInfo.textContent = "Enter an integer key from -999 to 999.";
      return;
    }
    highlightKey = key;
    const res = BTreeAlgorithm.searchWithSteps(committedRoot, key);
    beginSteps(res.steps);
  }

  function onClear() {
    stopPlay();
    committedRoot = null;
    pendingSteps = [];
    stepIdx = -1;
    btPlayback.classList.add("hidden");
    highlightKey = null;
    btInfo.textContent = "Tree cleared.";
    drawTree(null, null);
    updateStats(null);
    updateTSelectEnabled();
    updateButtons();
  }

  btnInsert.addEventListener("click", onInsert);
  btnDelete.addEventListener("click", onDelete);
  btnSearch.addEventListener("click", onSearch);
  btnClear.addEventListener("click", onClear);
  btnReset.addEventListener("click", () => {
    stopPlay();
    if (pendingSteps.length === 0) return;
    stepIdx = 0;
    showStep(0);
  });
  btnStepBack.addEventListener("click", stepBack);
  btnStep.addEventListener("click", stepForward);
  btnPlay.addEventListener("click", startPlay);
  btnPause.addEventListener("click", stopPlay);

  window.addEventListener("beforeunload", stopPlay);

  drawTree(null, null);
  updateStats(committedRoot);
  updateTSelectEnabled();
  updateButtons();
})();
