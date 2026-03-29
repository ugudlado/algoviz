(function () {
  "use strict";

  // ── SCC color palette (synced with CSS variables) ───────────────────
  const SCC_COLORS = [
    "#3fb950",
    "#f0a500",
    "#a371f7",
    "#f85149",
    "#58a6ff",
    "#e3b341",
    "#39d353",
    "#ff7b72",
  ];

  const EDGE_COLORS = {
    tree: "#3fb950",
    back: "#f85149",
    cross: "#8b949e",
    default: "#444c56",
  };

  const NODE_RADIUS = 24;

  // ── State ────────────────────────────────────────────────────────────
  let nodes = []; // [{id, x, y, label}]
  let edges = []; // [{from, to}]
  let steps = [];
  let currentStep = -1;
  let playTimer = null;
  let isRunning = false;
  let nodeCounter = 0;

  // Drag state
  let dragging = null; // {type: 'edge'|'node', fromId} or {type:'node', node}
  let dragTarget = null; // node being dragged (for position drag)
  let mousePos = { x: 0, y: 0 };

  // Canvas
  const canvas = document.getElementById("tjCanvas");
  const ctx = canvas.getContext("2d");

  // ── Preset layouts ───────────────────────────────────────────────────
  function loadPreset(name) {
    const preset = TarjanAlgorithm.PRESETS[name];
    if (!preset) return;
    resetAll(false);

    const positions = {
      classic: [
        { id: "0", x: 150, y: 120 },
        { id: "1", x: 280, y: 60 },
        { id: "2", x: 280, y: 200 },
        { id: "3", x: 420, y: 120 },
        { id: "4", x: 530, y: 60 },
        { id: "5", x: 530, y: 200 },
        { id: "6", x: 610, y: 120 },
        { id: "7", x: 640, y: 310 },
      ],
      simpleCycle: [
        { id: "A", x: 350, y: 80 },
        { id: "B", x: 500, y: 300 },
        { id: "C", x: 200, y: 300 },
      ],
      dag: [
        { id: "A", x: 180, y: 200 },
        { id: "B", x: 360, y: 100 },
        { id: "C", x: 360, y: 320 },
        { id: "D", x: 530, y: 200 },
      ],
    };

    const pos = positions[name] || [];
    preset.nodes.forEach(function (id, i) {
      const p = pos[i] || { x: 100 + i * 80, y: 200 };
      nodes.push({ id: id, x: p.x, y: p.y, label: id });
    });
    preset.edges.forEach(function (e) {
      edges.push({ from: e.from, to: e.to });
    });

    nodeCounter = nodes.length;
    updateStats();
    drawGraph(null);
    setInfo("Preset loaded. Press Run Algorithm to start.");
  }

  // ── Canvas interaction ───────────────────────────────────────────────
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function nodeAtPos(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS) return n;
    }
    return null;
  }

  canvas.addEventListener("mousedown", function (e) {
    if (isRunning) return;
    const pos = getCanvasPos(e);
    const hit = nodeAtPos(pos.x, pos.y);

    if (hit) {
      if (e.button === 2) {
        e.preventDefault();
        dragging = { type: "edge", fromId: hit.id };
      } else {
        dragging = { type: "node", node: hit, startX: pos.x, startY: pos.y };
        dragTarget = hit;
      }
    }
  });

  canvas.addEventListener("mousemove", function (e) {
    mousePos = getCanvasPos(e);
    if (dragging) {
      if (dragging.type === "node" && dragTarget) {
        dragTarget.x = mousePos.x;
        dragTarget.y = mousePos.y;
      }
      drawGraph(null);
      if (dragging.type === "edge") {
        const from = nodes.find(function (n) {
          return n.id === dragging.fromId;
        });
        if (from) {
          ctx.save();
          ctx.strokeStyle = "#58a6ff";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    }
  });

  canvas.addEventListener("mouseup", function (e) {
    if (!dragging) return;
    const pos = getCanvasPos(e);

    if (dragging.type === "edge") {
      const target = nodeAtPos(pos.x, pos.y);
      if (target && target.id !== dragging.fromId) {
        const exists = edges.some(function (ed) {
          return ed.from === dragging.fromId && ed.to === target.id;
        });
        if (!exists && edges.length < 40) {
          edges.push({ from: dragging.fromId, to: target.id });
          updateStats();
        }
      }
    }

    dragging = null;
    dragTarget = null;
    drawGraph(null);
  });

  canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  canvas.addEventListener("dblclick", function (e) {
    if (isRunning) return;
    const pos = getCanvasPos(e);
    const hit = nodeAtPos(pos.x, pos.y);
    if (hit) {
      nodes = nodes.filter(function (n) {
        return n.id !== hit.id;
      });
      edges = edges.filter(function (ed) {
        return ed.from !== hit.id && ed.to !== hit.id;
      });
      updateStats();
      drawGraph(null);
    }
  });

  canvas.addEventListener("click", function (e) {
    if (isRunning) return;
    if (dragging) return;
    const pos = getCanvasPos(e);
    const hit = nodeAtPos(pos.x, pos.y);
    if (!hit) {
      if (nodes.length >= 15) {
        setInfo("Maximum 15 nodes allowed.");
        return;
      }
      const label = String(nodeCounter);
      nodes.push({ id: label, x: pos.x, y: pos.y, label: label });
      nodeCounter++;
      updateStats();
      drawGraph(null);
    }
  });

  // ── Drawing ──────────────────────────────────────────────────────────
  function drawGraph(step) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const disc = step ? step.discoveryTime : {};
    const low = step ? step.lowLink : {};
    const stack = step ? step.stack : [];
    const sccs = step ? step.sccs : [];
    const currentNodeId = step ? step.nodeId : null;
    const edgeType = step ? step.edgeType : null;
    const fromNode = step ? step.fromNode : null;
    const toNode = step ? step.toNode : null;

    // Build SCC color map
    const sccColorMap = {};
    sccs.forEach(function (scc, i) {
      const color = SCC_COLORS[i % SCC_COLORS.length];
      scc.forEach(function (nid) {
        sccColorMap[nid] = color;
      });
    });

    // Draw edges
    edges.forEach(function (ed) {
      let color = EDGE_COLORS.default;
      if (step && fromNode !== undefined && toNode !== undefined) {
        if (ed.from === fromNode && ed.to === toNode) {
          if (edgeType === "back") color = EDGE_COLORS.back;
          else if (edgeType === "cross") color = EDGE_COLORS.cross;
          else if (edgeType === "tree") color = EDGE_COLORS.tree;
        }
      }
      drawArrow(ed.from, ed.to, color);
    });

    // Draw nodes
    nodes.forEach(function (n) {
      const isCurrentNode = n.id === currentNodeId;
      const onStack = stack.indexOf(n.id) !== -1;
      const inScc = sccColorMap[n.id] !== undefined;

      let fill = "#21262d";
      let stroke = "#444c56";
      let textColor = "#8b949e";

      if (inScc) {
        fill = sccColorMap[n.id] + "33";
        stroke = sccColorMap[n.id];
        textColor = sccColorMap[n.id];
      } else if (isCurrentNode) {
        fill = "#f0a50033";
        stroke = "#f0a500";
        textColor = "#f0a500";
      } else if (onStack) {
        fill = "#1f6feb33";
        stroke = "#58a6ff";
        textColor = "#58a6ff";
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.label, n.x, n.y - (disc[n.id] !== undefined ? 6 : 0));

      if (disc[n.id] !== undefined) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "#6e7681";
        ctx.fillText("d=" + disc[n.id] + " l=" + low[n.id], n.x, n.y + 8);
      }
    });
  }

  function drawArrow(fromId, toId, color) {
    const from = nodes.find(function (n) {
      return n.id === fromId;
    });
    const to = nodes.find(function (n) {
      return n.id === toId;
    });
    if (!from || !to) return;

    if (fromId === toId) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(from.x, from.y - NODE_RADIUS, 12, 0, Math.PI * 1.7);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;

    const offset = 8;
    const px = -uy * offset;
    const py = ux * offset;

    const sx = from.x + ux * NODE_RADIUS + px;
    const sy = from.y + uy * NODE_RADIUS + py;
    const ex = to.x - ux * NODE_RADIUS + px;
    const ey = to.y - uy * NODE_RADIUS + py;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const aLen = 10;
    const aAngle = 0.4;
    const angle = Math.atan2(ey - sy, ex - sx);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(
      ex - aLen * Math.cos(angle - aAngle),
      ey - aLen * Math.sin(angle - aAngle),
    );
    ctx.lineTo(
      ex - aLen * Math.cos(angle + aAngle),
      ey - aLen * Math.sin(angle + aAngle),
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Algorithm execution ──────────────────────────────────────────────
  function runAlgorithm() {
    if (nodes.length === 0) {
      setInfo("Add some nodes first.");
      return;
    }
    const nodeIds = nodes.map(function (n) {
      return n.id;
    });
    steps = TarjanAlgorithm.generateSteps(nodeIds, edges);
    currentStep = 0;
    isRunning = true;
    updatePlayback();
    renderStep(currentStep);
  }

  function renderStep(index) {
    if (index < 0 || index >= steps.length) return;
    const step = steps[index];
    drawGraph(step);
    setInfo(step.description);
    updateStack(step.stack, step.type === "scc-found");

    const sccCount = step.sccs.length;
    document.getElementById("tjStatSccs").textContent =
      sccCount > 0 ? String(sccCount) : "\u2014";

    document.getElementById("tjStepCounter").textContent =
      "Step: " + (index + 1) + " / " + steps.length;
  }

  function updateStack(stack, highlight) {
    const container = document.getElementById("tjStackContents");
    // Clear existing content safely
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (stack.length === 0) {
      const empty = document.createElement("span");
      empty.className = "tj-stack-empty";
      empty.textContent = "Stack is empty";
      container.appendChild(empty);
      return;
    }

    stack.forEach(function (nid, i) {
      const span = document.createElement("span");
      let cls = "tj-stack-node";
      if (i === stack.length - 1) cls += " tj-stack-node-new";
      if (highlight) cls += " tj-stack-node-scc";
      span.className = cls;
      span.textContent = nid;
      container.appendChild(span);
    });
  }

  // ── Playback ─────────────────────────────────────────────────────────
  function getDelay() {
    const speed = parseInt(document.getElementById("tjSpeed").value, 10);
    return Math.round(1200 / speed);
  }

  function play() {
    if (steps.length === 0) {
      runAlgorithm();
    }
    if (currentStep >= steps.length - 1) {
      currentStep = 0;
    }
    document.getElementById("tjBtnPlay").disabled = true;
    document.getElementById("tjBtnPause").disabled = false;
    scheduleNext();
  }

  function scheduleNext() {
    playTimer = setTimeout(function () {
      if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(currentStep);
        updatePlayback();
        scheduleNext();
      } else {
        document.getElementById("tjBtnPlay").disabled = false;
        document.getElementById("tjBtnPause").disabled = true;
      }
    }, getDelay());
  }

  function pause() {
    clearTimeout(playTimer);
    playTimer = null;
    document.getElementById("tjBtnPlay").disabled = false;
    document.getElementById("tjBtnPause").disabled = true;
  }

  function stepBack() {
    pause();
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
    }
    updatePlayback();
  }

  function stepFwd() {
    if (steps.length === 0) runAlgorithm();
    pause();
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep(currentStep);
    }
    updatePlayback();
  }

  function updatePlayback() {
    document.getElementById("tjBtnStepBack").disabled = currentStep <= 0;
    document.getElementById("tjBtnStepFwd").disabled =
      currentStep >= steps.length - 1;
  }

  // ── Reset ────────────────────────────────────────────────────────────
  function resetAll(clearGraph) {
    pause();
    steps = [];
    currentStep = -1;
    isRunning = false;
    if (clearGraph) {
      nodes = [];
      edges = [];
      nodeCounter = 0;
    }
    document.getElementById("tjBtnStepBack").disabled = true;
    document.getElementById("tjBtnStepFwd").disabled = true;
    document.getElementById("tjBtnPlay").disabled = false;
    document.getElementById("tjBtnPause").disabled = true;
    document.getElementById("tjStepCounter").textContent = "Step: 0 / 0";
    document.getElementById("tjStatSccs").textContent = "\u2014";
    const container = document.getElementById("tjStackContents");
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    const empty = document.createElement("span");
    empty.className = "tj-stack-empty";
    empty.textContent = "Stack is empty";
    container.appendChild(empty);
    updateStats();
    drawGraph(null);
    setInfo(
      "Select a preset or build your own graph, then press Run Algorithm.",
    );
  }

  function updateStats() {
    document.getElementById("tjStatNodes").textContent = String(nodes.length);
    document.getElementById("tjStatEdges").textContent = String(edges.length);
  }

  function setInfo(msg) {
    document.getElementById("tjInfo").textContent = msg;
  }

  // ── Button wiring ─────────────────────────────────────────────────────
  document.getElementById("tjBtnRun").addEventListener("click", function () {
    resetAll(false);
    runAlgorithm();
    play();
  });

  document.getElementById("tjBtnReset").addEventListener("click", function () {
    resetAll(false);
  });

  document.getElementById("tjBtnClear").addEventListener("click", function () {
    resetAll(true);
  });

  document.getElementById("tjBtnPlay").addEventListener("click", play);
  document.getElementById("tjBtnPause").addEventListener("click", pause);
  document.getElementById("tjBtnStepBack").addEventListener("click", stepBack);
  document.getElementById("tjBtnStepFwd").addEventListener("click", stepFwd);

  document.getElementById("tjSpeed").addEventListener("input", function () {
    document.getElementById("tjSpeedLabel").textContent = this.value;
  });

  document
    .getElementById("tjPresetClassic")
    .addEventListener("click", function () {
      loadPreset("classic");
      setActivePreset(this);
    });

  document
    .getElementById("tjPresetCycle")
    .addEventListener("click", function () {
      loadPreset("simpleCycle");
      setActivePreset(this);
    });

  document.getElementById("tjPresetDag").addEventListener("click", function () {
    loadPreset("dag");
    setActivePreset(this);
  });

  function setActivePreset(btn) {
    document.querySelectorAll(".tj-preset-btn").forEach(function (b) {
      b.classList.remove("tj-preset-active");
    });
    btn.classList.add("tj-preset-active");
  }

  // ── Cleanup on unload ─────────────────────────────────────────────────
  window.addEventListener("beforeunload", function () {
    clearTimeout(playTimer);
  });

  // ── Init ──────────────────────────────────────────────────────────────
  updateStats();
  drawGraph(null);
})();
