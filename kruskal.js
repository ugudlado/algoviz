(() => {
  "use strict";

  const edgesInput = document.getElementById("edgesInput");
  const nodesInput = document.getElementById("nodesInput");
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
  const edgesListEl = document.getElementById("edgesList");
  const mstListEl = document.getElementById("mstList");
  const stepStat = document.getElementById("stepStat");
  const weightStat = document.getElementById("weightStat");
  const edgeCountStat = document.getElementById("edgeCountStat");
  const targetStat = document.getElementById("targetStat");

  const MAX_NODES = 20;
  const MAX_EDGES = 50;

  let mstResult = null;
  let steps = [];
  let stepIdx = -1;
  let timer = null;
  let isPlaying = false;

  function parseEdges() {
    const raw = edgesInput.value.trim();
    const numNodes = Math.max(
      2,
      Math.min(MAX_NODES, parseInt(nodesInput.value, 10) || 6),
    );
    if (raw.length === 0)
      return { edges: null, numNodes: numNodes, error: "Please enter edges." };

    const parts = raw
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (parts.length > MAX_EDGES)
      return {
        edges: null,
        numNodes: numNodes,
        error: "Maximum " + MAX_EDGES + " edges.",
      };

    const edges = [];
    for (let i = 0; i < parts.length; i++) {
      const match = parts[i].match(/^(\d+)\s*-\s*(\d+)\s*:\s*(\d+)$/);
      if (!match)
        return {
          edges: null,
          numNodes: numNodes,
          error: 'Invalid edge format: "' + parts[i] + '". Use u-v:weight.',
        };
      const u = parseInt(match[1], 10);
      const v = parseInt(match[2], 10);
      const w = parseInt(match[3], 10);
      if (u >= numNodes || v >= numNodes)
        return {
          edges: null,
          numNodes: numNodes,
          error:
            "Node " + Math.max(u, v) + " exceeds node count " + numNodes + ".",
        };
      if (u === v)
        return {
          edges: null,
          numNodes: numNodes,
          error: "Self-loop " + u + "-" + v + " not allowed.",
        };
      edges.push({ u: u, v: v, w: w });
    }
    return { edges: edges, numNodes: numNodes, error: null };
  }

  function renderEdgeItem(edge, className) {
    const el = document.createElement("div");
    el.className = "kr-edge" + (className ? " " + className : "");

    const label = document.createElement("span");
    label.className = "kr-edge-label";
    label.textContent = edge.u + " — " + edge.v;
    el.appendChild(label);

    const weight = document.createElement("span");
    weight.className = "kr-edge-weight";
    weight.textContent = "w=" + edge.w;
    el.appendChild(weight);

    return el;
  }

  function renderStep() {
    edgesListEl.textContent = "";
    mstListEl.textContent = "";

    if (stepIdx < 0 || stepIdx >= steps.length) {
      // Initial state
      if (mstResult && mstResult.steps.length > 0) {
        const sortedEdges = mstResult.steps[0].sortedEdges || [];
        for (let i = 0; i < sortedEdges.length; i++) {
          edgesListEl.appendChild(renderEdgeItem(sortedEdges[i], ""));
        }
      }
      stepStat.textContent = "0 / " + steps.length;
      weightStat.textContent = "0";
      edgeCountStat.textContent = "0";
      targetStat.textContent = mstResult
        ? String(parseInt(nodesInput.value, 10) - 1)
        : "—";
      infoEl.textContent = "Step through the algorithm or press Play.";
      return;
    }

    const step = steps[stepIdx];
    const isLastStep = stepIdx === steps.length - 1;
    const sortedEdges = step.sortedEdges || [];

    // Render sorted edges list with status
    for (let i = 0; i < sortedEdges.length; i++) {
      let cls = "";
      if (step.phase === "sort") {
        cls = "";
      } else if (i === step.edgeIdx) {
        cls = step.accepted ? "kr-accepted" : "kr-rejected";
        if (!isLastStep && step.phase === "consider") {
          cls = step.accepted ? "kr-considering" : "kr-rejected";
        }
      } else if (i < step.edgeIdx) {
        // Check if this edge was accepted or rejected
        const wasAccepted = step.mstEdges.some(
          (e) =>
            e.u === sortedEdges[i].u &&
            e.v === sortedEdges[i].v &&
            e.w === sortedEdges[i].w,
        );
        cls = wasAccepted ? "kr-accepted" : "kr-rejected";
      }
      edgesListEl.appendChild(renderEdgeItem(sortedEdges[i], cls));
    }

    // Render MST edges
    for (let j = 0; j < step.mstEdges.length; j++) {
      mstListEl.appendChild(renderEdgeItem(step.mstEdges[j], "kr-mst-edge"));
    }

    stepStat.textContent = stepIdx + 1 + " / " + steps.length;
    weightStat.textContent = String(step.totalWeight);
    edgeCountStat.textContent = String(step.mstEdges.length);
    targetStat.textContent = String(parseInt(nodesInput.value, 10) - 1);
    infoEl.textContent = step.explanation;

    if (isLastStep) {
      resultEl.textContent =
        "MST weight: " +
        step.totalWeight +
        " (" +
        step.mstEdges.length +
        " edges)";
      resultEl.classList.remove("hidden");
    }
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
    }
  }

  btnVisualize.addEventListener("click", () => {
    stopPlayback();
    const parsed = parseEdges();
    if (parsed.error) {
      infoEl.textContent = parsed.error;
      return;
    }
    mstResult = KruskalAlgorithm.findMST(parsed.numNodes, parsed.edges);
    steps = mstResult.steps;
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

  // Pre-populate on page load
  function renderInitialState() {
    const parsed = parseEdges();
    if (parsed.error || !parsed.edges) return;
    const result = KruskalAlgorithm.findMST(parsed.numNodes, parsed.edges);
    if (result.steps.length > 0 && result.steps[0].sortedEdges) {
      const sortedEdges = result.steps[0].sortedEdges;
      for (let i = 0; i < sortedEdges.length; i++) {
        edgesListEl.appendChild(renderEdgeItem(sortedEdges[i], ""));
      }
    }
  }
  renderInitialState();
})();
