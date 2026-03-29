(() => {
  "use strict";

  const tabs = Array.from(document.querySelectorAll(".idea-tab"));
  const panels = Array.from(document.querySelectorAll(".idea-panel"));
  const frames = Array.from(document.querySelectorAll(".viz-frame"));

  function activatePanel(targetId) {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.target === targetId);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activatePanel(tab.dataset.target));
  });

  frames.forEach((frame) => {
    const values = (frame.dataset.bars || "")
      .split(",")
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value));
    const compare = (frame.dataset.compare || "")
      .split(",")
      .map((value) => parseInt(value.trim(), 10));
    const sortedFrom = parseInt(frame.dataset.sorted || values.length, 10);
    const max = Math.max(...values, 1);

    values.forEach((value, index) => {
      const bar = document.createElement("div");
      const label = document.createElement("span");
      const comparing = compare.includes(index);
      const sorted = index >= sortedFrom;

      bar.className = "mock-bar";
      if (comparing) {
        bar.classList.add("is-comparing");
      }
      if (sorted) {
        bar.classList.add("is-sorted");
      }

      bar.style.height = `${Math.max(48, (value / max) * 100)}%`;

      label.className = "mock-bar-label";
      label.textContent = String(value);

      bar.appendChild(label);
      frame.appendChild(bar);
    });
  });
})();
