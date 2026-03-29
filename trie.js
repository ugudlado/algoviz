(() => {
  "use strict";

  // --- DOM refs ---
  const tabInsert = document.getElementById("tabInsert");
  const tabSearch = document.getElementById("tabSearch");
  const tabPrefix = document.getElementById("tabPrefix");
  const wordInput = document.getElementById("wordInput");
  const presetSelect = document.getElementById("presetSelect");
  const btnRun = document.getElementById("btnRun");
  const btnReset = document.getElementById("btnReset");
  const btnStepBack = document.getElementById("btnStepBack");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");
  const btnStep = document.getElementById("btnStep");
  const speedSlider = document.getElementById("speed");
  const playbackDiv = document.getElementById("playback");
  const infoEl = document.getElementById("trieInfo");
  const wordDisplayEl = document.getElementById("trieWordDisplay");
  const foundWordsEl = document.getElementById("trieFoundWords");
  const treeSvg = document.getElementById("trieSvg");
  const wordCountStat = document.getElementById("wordCountStat");
  const stepStat = document.getElementById("stepStat");
  const presetWordsEl = document.getElementById("presetWords");

  // --- Constants ---
  const NODE_RADIUS = 16;
  const SVG_WIDTH = 780;
  const VERTICAL_SPACING = 72;
  const MAX_WORD_LENGTH = 20;
  const MAX_TRIE_WORDS = 30;

  const PRESETS = {
    animals: ["cat", "car", "card", "care", "dog", "dot", "door", "bat", "bar"],
    tech: [
      "data",
      "date",
      "dart",
      "dash",
      "bit",
      "bite",
      "byte",
      "base",
      "bash",
    ],
    words: [
      "the",
      "their",
      "there",
      "they",
      "tree",
      "try",
      "true",
      "ten",
      "tip",
      "to",
    ],
  };

  // --- State ---
  let trie = TrieAlgorithm.createTrie();
  let currentOp = "insert";
  let steps = [];
  let stepIdx = -1;
  let timer = null;
  let isPlaying = false;
  let activeWord = "";
  let activeStepPath = [];
  let activeStepCharIdx = -1;
  let highlightState = "none"; // 'none' | 'active' | 'found' | 'fail'

  // --- Init presets display ---
  function showPresetWords(key) {
    const words = PRESETS[key] || [];
    presetWordsEl.textContent = words.join(", ");
  }

  // --- Tab switching ---
  function setTab(op) {
    currentOp = op;
    tabInsert.classList.toggle("tr-op-tab-active", op === "insert");
    tabSearch.classList.toggle("tr-op-tab-active", op === "search");
    tabPrefix.classList.toggle("tr-op-tab-active", op === "prefix");
    const labels = {
      insert: "Insert word",
      search: "Search word",
      prefix: "Prefix query",
    };
    btnRun.textContent = labels[op];
    foundWordsEl.textContent = "";
    wordDisplayEl.textContent = "";
    infoEl.textContent = getPlaceholder(op);
  }

  function getPlaceholder(op) {
    if (op === "insert") return "Enter a word to insert into the trie.";
    if (op === "search") return "Enter a word to search in the trie.";
    return "Enter a prefix to find all matching words.";
  }

  // --- Trie layout computation ---
  function buildLayout(
    node,
    parentX,
    parentY,
    spread,
    depth,
    nodeList,
    edgeList,
  ) {
    const keys = Object.keys(node.children);
    if (keys.length === 0) return;

    const totalWidth = Math.max(
      spread * 2,
      keys.length * (NODE_RADIUS * 2 + 10),
    );
    const childSpacing = totalWidth / keys.length;
    const startX = parentX - totalWidth / 2 + childSpacing / 2;
    const childY = parentY + VERTICAL_SPACING;

    for (let i = 0; i < keys.length; i++) {
      const ch = keys[i];
      const child = node.children[ch];
      const cx = startX + i * childSpacing;

      edgeList.push({ x1: parentX, y1: parentY, x2: cx, y2: childY, char: ch });
      nodeList.push({
        x: cx,
        y: childY,
        char: ch,
        isEnd: child.isEnd,
        depth,
        node: child,
      });

      buildLayout(
        child,
        cx,
        childY,
        childSpacing / 2,
        depth + 1,
        nodeList,
        edgeList,
      );
    }
  }

  function getTrieLayout() {
    const nodeList = [];
    const edgeList = [];
    const rootX = SVG_WIDTH / 2;
    const rootY = 30;

    nodeList.push({
      x: rootX,
      y: rootY,
      char: "",
      isEnd: false,
      depth: 0,
      node: trie.root,
    });

    buildLayout(trie.root, rootX, rootY, SVG_WIDTH / 2, 1, nodeList, edgeList);
    return { nodes: nodeList, edges: edgeList };
  }

  // --- SVG rendering ---
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function renderTrie() {
    // Safe: clearing SVG canvas — no user data
    while (treeSvg.firstChild) {
      treeSvg.removeChild(treeSvg.firstChild);
    }
    const layout = getTrieLayout();

    // Draw edges
    for (let i = 0; i < layout.edges.length; i++) {
      const e = layout.edges[i];
      const isActive = activeStepPath.includes(e.char) && pathContainsEdge(e);

      const line = svgEl("line");
      line.setAttribute("x1", e.x1);
      line.setAttribute("y1", e.y1);
      line.setAttribute("x2", e.x2);
      line.setAttribute("y2", e.y2);
      line.setAttribute(
        "class",
        isActive ? "tr-edge tr-edge-active" : "tr-edge",
      );
      treeSvg.appendChild(line);
    }

    // Draw nodes
    for (let i = 0; i < layout.nodes.length; i++) {
      const n = layout.nodes[i];
      const g = svgEl("g");

      const isRoot = n.char === "";
      const inActivePath = isInActivePath(n);
      const isCurrentChar = isCurrentNode(n);

      let circleClass = "tr-node-circle";
      if (isCurrentChar) {
        if (highlightState === "found") circleClass = "tr-node-circle-found";
        else if (highlightState === "fail") circleClass = "tr-node-circle-fail";
        else circleClass = "tr-node-circle-active";
      } else if (inActivePath) {
        circleClass = "tr-node-circle-active";
      }

      const circle = svgEl("circle");
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      circle.setAttribute("r", NODE_RADIUS);
      circle.setAttribute("class", circleClass);
      g.appendChild(circle);

      // End-of-word inner dot
      if (n.isEnd) {
        const dot = svgEl("circle");
        dot.setAttribute("cx", n.x);
        dot.setAttribute("cy", n.y);
        dot.setAttribute("r", 4);
        dot.setAttribute("class", "tr-node-eow");
        g.appendChild(dot);
      }

      const label = svgEl("text");
      label.setAttribute("x", n.x);
      label.setAttribute("y", n.y);
      label.setAttribute(
        "class",
        isRoot ? "tr-node-label tr-node-label-root" : "tr-node-label",
      );
      label.textContent = isRoot ? "*" : n.char;
      g.appendChild(label);

      treeSvg.appendChild(g);
    }
  }

  function isInActivePath(n) {
    if (activeStepPath.length === 0) return false;
    const pathChars = activeWord.slice(0, activeStepCharIdx + 1).split("");
    return (
      pathChars.includes(n.char) && n.depth > 0 && n.depth <= pathChars.length
    );
  }

  function isCurrentNode(n) {
    if (activeStepCharIdx < 0 || activeWord === "") return false;
    const ch = activeWord[activeStepCharIdx];
    return n.char === ch && n.depth === activeStepCharIdx + 1;
  }

  function pathContainsEdge(e) {
    if (activeStepPath.length === 0) return false;
    return activeStepPath.includes(e.char);
  }

  // --- Word display with per-character highlight ---
  function renderWordDisplay(word, activeIdx, state) {
    while (wordDisplayEl.firstChild) {
      wordDisplayEl.removeChild(wordDisplayEl.firstChild);
    }
    if (word === "") return;

    for (let i = 0; i < word.length; i++) {
      const span = document.createElement("span");
      let charClass = "tr-word-char";
      if (i === activeIdx) {
        charClass = "tr-word-char tr-word-char-active";
      } else if (i < activeIdx) {
        charClass =
          state === "fail"
            ? "tr-word-char tr-word-char-fail"
            : "tr-word-char tr-word-char-done";
      }
      span.setAttribute("class", charClass);
      span.textContent = word[i];
      wordDisplayEl.appendChild(span);
    }
  }

  // --- Stats ---
  function updateStats() {
    const words = TrieAlgorithm.getWords(trie);
    wordCountStat.textContent = words.length;
    stepStat.textContent =
      steps.length > 0 ? stepIdx + 1 + " / " + steps.length : "0 / 0";
  }

  // --- Step application ---
  function applyStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    const step = steps[idx];

    activeWord = step.word || "";
    activeStepCharIdx = step.charIndex !== undefined ? step.charIndex : -1;
    activeStepPath = step.path || [];

    if (step.found === true) highlightState = "found";
    else if (step.found === false) highlightState = "fail";
    else highlightState = "active";

    infoEl.textContent = step.explanation || "";

    if (activeWord !== "") {
      renderWordDisplay(activeWord, activeStepCharIdx, highlightState);
    } else {
      wordDisplayEl.textContent = "";
    }

    // Found words for prefix query
    if (step.words && step.words.length > 0) {
      foundWordsEl.textContent = "Words: " + step.words.join(", ");
    } else if (currentOp === "prefix" && step.words !== undefined) {
      const wordLen = activeWord ? activeWord.length : 0;
      const isLastStep = step.charIndex === wordLen;
      foundWordsEl.textContent =
        isLastStep && step.words.length === 0 ? "No matching words" : "";
    }

    renderTrie();
    updateStats();
  }

  function clearActiveState() {
    activeWord = "";
    activeStepPath = [];
    activeStepCharIdx = -1;
    highlightState = "none";
    wordDisplayEl.textContent = "";
    foundWordsEl.textContent = "";
  }

  // --- Playback controls ---
  function stopTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    isPlaying = false;
    btnPlay.disabled = false;
    btnPause.disabled = true;
  }

  function getDelay() {
    const val = parseInt(speedSlider.value, 10);
    return Math.round(1200 - val * 100);
  }

  function playNext() {
    if (isPlaying === false) return;
    if (stepIdx >= steps.length - 1) {
      stopTimer();
      return;
    }
    stepIdx++;
    applyStep(stepIdx);
    timer = setTimeout(playNext, getDelay());
  }

  function startPlay() {
    if (steps.length === 0) return;
    if (stepIdx >= steps.length - 1) {
      stepIdx = -1;
    }
    isPlaying = true;
    btnPlay.disabled = true;
    btnPause.disabled = false;
    playNext();
  }

  function doStepForward() {
    stopTimer();
    if (stepIdx < steps.length - 1) {
      stepIdx++;
      applyStep(stepIdx);
    }
    updateStats();
  }

  function doStepBack() {
    stopTimer();
    if (stepIdx > 0) {
      stepIdx--;
      applyStep(stepIdx);
    } else if (stepIdx === 0) {
      stepIdx = -1;
      clearActiveState();
      renderTrie();
      updateStats();
    }
  }

  // --- Run operation ---
  function runOperation() {
    const word = wordInput.value.trim();
    if (word === "") {
      infoEl.textContent = "Please enter a word.";
      return;
    }
    if (word.length > MAX_WORD_LENGTH) {
      infoEl.textContent =
        "Word too long (max " + MAX_WORD_LENGTH + " characters).";
      return;
    }

    stopTimer();
    clearActiveState();
    foundWordsEl.textContent = "";

    let result;
    if (currentOp === "insert") {
      const wordCount = TrieAlgorithm.getWords(trie).length;
      if (wordCount >= MAX_TRIE_WORDS) {
        infoEl.textContent =
          "Trie full (max " + MAX_TRIE_WORDS + " words). Reset to start over.";
        return;
      }
      result = TrieAlgorithm.insert(trie, word);
    } else if (currentOp === "search") {
      result = TrieAlgorithm.search(trie, word);
    } else {
      result = TrieAlgorithm.prefixQuery(trie, word);
    }

    steps = result.steps;
    stepIdx = -1;
    playbackDiv.classList.remove("hidden");
    infoEl.textContent = "Ready. Press Play or Step to begin.";
    updateStats();
    renderTrie();
  }

  // --- Preset handling ---
  function loadPreset() {
    const key = presetSelect.value;
    const words = PRESETS[key] || [];
    showPresetWords(key);

    stopTimer();
    trie = TrieAlgorithm.createTrie();
    steps = [];
    stepIdx = -1;
    clearActiveState();
    playbackDiv.classList.add("hidden");

    words.forEach((w) => TrieAlgorithm.insert(trie, w));

    infoEl.textContent =
      "Loaded " + words.length + " words. Choose an operation.";
    renderTrie();
    updateStats();
  }

  // --- Event listeners ---
  tabInsert.addEventListener("click", () => setTab("insert"));
  tabSearch.addEventListener("click", () => setTab("search"));
  tabPrefix.addEventListener("click", () => setTab("prefix"));

  btnRun.addEventListener("click", runOperation);
  btnReset.addEventListener("click", () => {
    stopTimer();
    trie = TrieAlgorithm.createTrie();
    steps = [];
    stepIdx = -1;
    clearActiveState();
    playbackDiv.classList.add("hidden");
    infoEl.textContent = getPlaceholder(currentOp);
    renderTrie();
    updateStats();
  });

  btnStepBack.addEventListener("click", doStepBack);
  btnPlay.addEventListener("click", startPlay);
  btnPause.addEventListener("click", stopTimer);
  btnStep.addEventListener("click", doStepForward);
  presetSelect.addEventListener("change", loadPreset);

  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runOperation();
  });

  window.addEventListener("beforeunload", stopTimer);

  // --- Initial render ---
  setTab("insert");
  showPresetWords(presetSelect.value);
  playbackDiv.classList.add("hidden");
  renderTrie();
  updateStats();
})();
