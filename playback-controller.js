/* eslint-env browser, es2022 */
/* global customElements, HTMLElement, CustomEvent */
/**
 * <playback-controller> — shared playback web component for AlgoViz
 *
 * Usage:
 *   HTML: <playback-controller id="pb"></playback-controller>
 *   JS:   const pb = document.getElementById('pb');
 *         pb.setSteps(steps);           // provide steps array
 *         pb.addEventListener('pc-step', e => render(e.detail.index, e.detail.step));
 *         pb.addEventListener('pc-reset', () => resetViz());
 *
 * Attributes:
 *   speed-formula: "divide" (800/spd, default) | "subtract" (1100-spd*100)
 *
 * Public API:
 *   pb.setSteps(arr)     — load steps, resets to index -1
 *   pb.reset()           — reset to index -1, fires pc-reset
 *   pb.stepIndex         — current index (read-only)
 *   pb.totalSteps        — steps.length (read-only)
 */
class PlaybackController extends HTMLElement {
  constructor() {
    super();
    this._steps = [];
    this._stepIdx = -1;
    this._isPlaying = false;
    this._timer = null;
    this._shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
    this._bindEvents();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  _makeSvg(paths) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24");
    for (const def of paths) {
      const el = document.createElementNS(
        "http://www.w3.org/2000/svg",
        def.tag,
      );
      for (const [k, v] of Object.entries(def.attrs)) {
        el.setAttribute(k, v);
      }
      svg.appendChild(el);
    }
    return svg;
  }

  _makeBtn(id, title, svgDefs, extraClass) {
    const btn = document.createElement("button");
    btn.className = "icon-btn" + (extraClass ? " " + extraClass : "");
    btn.id = id;
    btn.title = title;
    btn.appendChild(this._makeSvg(svgDefs));
    return btn;
  }

  _render() {
    const styleEl = document.createElement("style");
    styleEl.textContent = [
      ":host {",
      "  display: none;",
      "  flex-direction: column;",
      "  gap: 0.75rem;",
      "  padding: 0.75rem 1rem;",
      "  background: var(--bg-card, #161b22);",
      "  border: 1px solid var(--border, #30363d);",
      "  border-radius: 8px;",
      "  margin-top: 1rem;",
      "}",
      ":host(.pc-visible) { display: flex; }",
      ".playback-btns { display: flex; align-items: center; gap: 0.5rem; }",
      ".icon-btn {",
      "  display: inline-flex; align-items: center; justify-content: center;",
      "  width: 36px; height: 36px; border-radius: 6px;",
      "  border: 1px solid var(--border, #30363d);",
      "  background: var(--bg-card, #161b22);",
      "  color: var(--text, #e6edf3);",
      "  cursor: pointer;",
      "  transition: background 0.15s, border-color 0.15s;",
      "  padding: 0;",
      "}",
      ".icon-btn:hover:not(:disabled) {",
      "  background: var(--bg-hover, #1c2128);",
      "  border-color: var(--accent, #58a6ff);",
      "}",
      ".icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }",
      ".icon-btn.active { border-color: var(--accent, #58a6ff); color: var(--accent, #58a6ff); }",
      ".speed-row { display: flex; align-items: center; gap: 0.75rem; }",
      ".speed-label {",
      "  font-size: 0.75rem; color: var(--text-muted, #8b949e);",
      "  font-weight: 600; white-space: nowrap;",
      "}",
      "input[type='range'] {",
      "  accent-color: var(--accent, #58a6ff);",
      "  cursor: pointer; flex: 1; min-width: 80px;",
      "}",
    ].join("\n");

    // SVG icon path definitions
    const ICONS = {
      reset: [
        {
          tag: "path",
          attrs: {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
          },
        },
        {
          tag: "path",
          attrs: {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            d: "M3 3v5h5",
          },
        },
      ],
      stepBack: [
        {
          tag: "polygon",
          attrs: {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            points: "19 20 9 12 19 4 19 20",
          },
        },
        {
          tag: "line",
          attrs: {
            stroke: "currentColor",
            "stroke-width": "2",
            x1: "5",
            y1: "19",
            x2: "5",
            y2: "5",
          },
        },
      ],
      play: [
        {
          tag: "polygon",
          attrs: { fill: "currentColor", points: "5 3 19 12 5 21 5 3" },
        },
      ],
      pause: [
        {
          tag: "rect",
          attrs: {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            x: "6",
            y: "4",
            width: "4",
            height: "16",
          },
        },
        {
          tag: "rect",
          attrs: {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            x: "14",
            y: "4",
            width: "4",
            height: "16",
          },
        },
      ],
      stepFwd: [
        {
          tag: "polygon",
          attrs: {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            points: "5 4 15 12 5 20 5 4",
          },
        },
        {
          tag: "line",
          attrs: {
            stroke: "currentColor",
            "stroke-width": "2",
            x1: "19",
            y1: "5",
            x2: "19",
            y2: "19",
          },
        },
      ],
    };

    // Buttons row
    const btnsRow = document.createElement("div");
    btnsRow.className = "playback-btns";

    this._btnReset = this._makeBtn("btnReset", "Reset", ICONS.reset, "");
    this._btnStepBack = this._makeBtn(
      "btnStepBack",
      "Step Back",
      ICONS.stepBack,
      "",
    );
    this._btnPlay = this._makeBtn("btnPlay", "Play", ICONS.play, "active");
    this._btnPause = this._makeBtn("btnPause", "Pause", ICONS.pause, "");
    this._btnPause.disabled = true;
    this._btnStep = this._makeBtn("btnStep", "Step Forward", ICONS.stepFwd, "");

    btnsRow.appendChild(this._btnReset);
    btnsRow.appendChild(this._btnStepBack);
    btnsRow.appendChild(this._btnPlay);
    btnsRow.appendChild(this._btnPause);
    btnsRow.appendChild(this._btnStep);

    // Speed row
    const speedRow = document.createElement("div");
    speedRow.className = "speed-row";

    const speedLabel = document.createElement("span");
    speedLabel.className = "speed-label";
    speedLabel.textContent = "Speed";

    this._speedSlider = document.createElement("input");
    this._speedSlider.type = "range";
    this._speedSlider.id = "speed";
    this._speedSlider.min = "1";
    this._speedSlider.max = "10";
    this._speedSlider.value = "5";

    speedRow.appendChild(speedLabel);
    speedRow.appendChild(this._speedSlider);

    this._shadow.appendChild(styleEl);
    this._shadow.appendChild(btnsRow);
    this._shadow.appendChild(speedRow);
  }

  _bindEvents() {
    this._btnPlay.addEventListener("click", () => this._startPlay());
    this._btnPause.addEventListener("click", () => this._stopPlay());
    this._btnStep.addEventListener("click", () => {
      this._stopPlay();
      this._stepForward();
    });
    this._btnStepBack.addEventListener("click", () => {
      this._stopPlay();
      this._stepBack();
    });
    this._btnReset.addEventListener("click", () => this.reset());

    this._speedSlider.addEventListener("input", () => {
      if (this._isPlaying) {
        this._cleanup();
        this._timer = setTimeout(() => this._tick(), this._getDelay());
      }
    });
  }

  // --- Public API ---

  setSteps(arr) {
    this._cleanup();
    this._steps = arr || [];
    this._stepIdx = -1;
    this._isPlaying = false;
    if (this._steps.length > 0) {
      this.classList.add("pc-visible");
    }
    this._updateButtons();
  }

  reset() {
    this._cleanup();
    this._stepIdx = -1;
    this._isPlaying = false;
    this._updateButtons();
    this._dispatch("pc-reset", { index: -1 });
  }

  get stepIndex() {
    return this._stepIdx;
  }

  get totalSteps() {
    return this._steps.length;
  }

  // --- Internal playback ---

  _stepForward() {
    if (this._stepIdx >= this._steps.length - 1) {
      this._stopPlay();
      this._dispatch("pc-complete", { steps: this._steps });
      return;
    }

    this._stepIdx++;
    this._updateButtons();
    this._dispatch("pc-step", {
      index: this._stepIdx,
      step: this._steps[this._stepIdx],
    });

    if (this._stepIdx === this._steps.length - 1) {
      this._stopPlay();
      this._dispatch("pc-complete", { steps: this._steps });
    }
  }

  _stepBack() {
    if (this._stepIdx < 0) return;

    this._stepIdx--;
    this._updateButtons();
    this._dispatch("pc-step", {
      index: this._stepIdx,
      step: this._stepIdx >= 0 ? this._steps[this._stepIdx] : null,
    });
  }

  _startPlay() {
    if (this._stepIdx >= this._steps.length - 1) {
      // Restart from beginning — fire reset so host can re-render initial state
      this._stepIdx = -1;
      this._dispatch("pc-reset", { index: -1 });
    }
    this._isPlaying = true;
    this._updateButtons();
    this._tick();
  }

  _stopPlay() {
    this._isPlaying = false;
    this._cleanup();
    this._updateButtons();
  }

  _tick() {
    if (!this._isPlaying) return;
    if (this._stepIdx >= this._steps.length - 1) {
      this._stopPlay();
      return;
    }
    this._stepForward();
    if (this._isPlaying && this._stepIdx < this._steps.length - 1) {
      this._timer = setTimeout(() => this._tick(), this._getDelay());
    }
  }

  _getDelay() {
    const spd = parseInt(this._speedSlider.value, 10) || 5;
    const formula = this.getAttribute("speed-formula");
    if (formula === "subtract") {
      return Math.max(50, 1100 - spd * 100);
    }
    return Math.round(800 / spd);
  }

  _updateButtons() {
    const atEnd = this._stepIdx >= this._steps.length - 1;
    const atStart = this._stepIdx < 0;

    this._btnPlay.disabled = this._isPlaying;
    this._btnPause.disabled = !this._isPlaying;
    this._btnStep.disabled = this._isPlaying || atEnd;
    this._btnStepBack.disabled = this._isPlaying || atStart;
    this._btnReset.disabled = this._isPlaying;

    if (this._isPlaying) {
      this._btnPlay.classList.remove("active");
    } else {
      this._btnPlay.classList.add("active");
    }
  }

  _cleanup() {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _dispatch(eventName, detail) {
    this.dispatchEvent(
      new CustomEvent(eventName, { detail: detail, bubbles: false }),
    );
  }
}

customElements.define("playback-controller", PlaybackController);
