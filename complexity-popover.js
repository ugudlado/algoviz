// complexity-popover.js
// Initializes interactive complexity badges on any algo page.
// Auto-initializes on DOMContentLoaded.
//
// Each badge needs data attributes:
//   data-best="O(n)"       data-best-note="Already sorted"
//   data-avg="O(n²)"       data-avg-note="Random input"
//   data-worst="O(n²)"     data-worst-note="Reverse sorted"
//   data-space="O(1)"      data-space-note="In-place"
//   data-why="Plain-English derivation of the complexity"
//
// Add class="complexity-badge" to the badge element.

(function () {
  "use strict";

  var activePopover = null;
  var activeBadge = null;

  function createPopover(badge) {
    var popover = document.createElement("div");
    popover.className = "complexity-popover";
    popover.setAttribute("role", "tooltip");

    var rows = [
      {
        label: "Best",
        value: badge.dataset.best,
        note: badge.dataset.bestNote,
      },
      {
        label: "Average",
        value: badge.dataset.avg,
        note: badge.dataset.avgNote,
      },
      {
        label: "Worst",
        value: badge.dataset.worst,
        note: badge.dataset.worstNote,
      },
      {
        label: "Space",
        value: badge.dataset.space,
        note: badge.dataset.spaceNote,
      },
    ];

    rows.forEach(function (row) {
      var rowEl = document.createElement("div");
      rowEl.className = "cp-row";

      var labelEl = document.createElement("span");
      labelEl.className = "cp-label";
      labelEl.textContent = row.label;

      var valueEl = document.createElement("span");
      valueEl.className = "cp-value";
      valueEl.textContent = row.value || "\u2014";

      var noteEl = document.createElement("span");
      noteEl.className = "cp-note";
      noteEl.textContent = row.note || "";

      rowEl.appendChild(labelEl);
      rowEl.appendChild(valueEl);
      rowEl.appendChild(noteEl);
      popover.appendChild(rowEl);
    });

    var why = badge.dataset.why;
    if (why) {
      var whySection = document.createElement("div");
      whySection.className = "cp-why";

      var whyLabel = document.createElement("div");
      whyLabel.className = "cp-why-label";
      whyLabel.textContent =
        "WHY " +
        (badge.dataset.worst || badge.dataset.avg || badge.textContent.trim()) +
        "?";

      var whyText = document.createElement("div");
      whyText.className = "cp-why-text";
      whyText.textContent = why;

      whySection.appendChild(whyLabel);
      whySection.appendChild(whyText);
      popover.appendChild(whySection);
    }

    return popover;
  }

  function positionPopover(popover, badge) {
    var rect = badge.getBoundingClientRect();
    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;
    var popoverWidth = 260;
    var viewportWidth = document.documentElement.clientWidth;

    var top = rect.bottom + scrollY + 8;
    var left = rect.left + scrollX;

    if (left + popoverWidth > viewportWidth - 8) {
      left = viewportWidth - popoverWidth - 8;
    }
    if (left < 8) {
      left = 8;
    }

    popover.style.top = top + "px";
    popover.style.left = left + "px";
  }

  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
    if (activeBadge) {
      activeBadge.setAttribute("aria-expanded", "false");
      activeBadge = null;
    }
  }

  function openPopover(badge) {
    closePopover();

    var popover = createPopover(badge);
    document.body.appendChild(popover);
    positionPopover(popover, badge);

    badge.setAttribute("aria-expanded", "true");
    activePopover = popover;
    activeBadge = badge;
  }

  function handleBadgeClick(badge, e) {
    if (activePopover && activeBadge === badge) {
      closePopover();
    } else {
      openPopover(badge);
    }
    e.stopPropagation();
  }

  function initComplexityPopovers() {
    var badges = document.querySelectorAll(".complexity-badge");
    badges.forEach(function (badge) {
      badge.style.cursor = "pointer";
      badge.setAttribute("tabindex", "0");
      badge.setAttribute("aria-expanded", "false");
      badge.setAttribute("aria-haspopup", "true");

      badge.addEventListener("click", function (e) {
        handleBadgeClick(badge, e);
      });

      badge.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleBadgeClick(badge, e);
        }
      });
    });

    document.addEventListener("click", closePopover);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closePopover();
      }
    });
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComplexityPopovers);
  } else {
    initComplexityPopovers();
  }

  // Expose for manual call if needed
  window.initComplexityPopovers = initComplexityPopovers;
})();
