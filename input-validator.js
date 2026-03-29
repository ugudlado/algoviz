/**
 * input-validator.js
 * Shared input validation helpers for AlgoViz pages.
 *
 * showError(inputEl, errorEl, message) — marks input invalid, shows error message
 * clearError(inputEl, errorEl)         — clears validation state
 * validateNumber(value, opts)          — returns error string or null
 *   opts: { min, max, integer, label }
 * validateArray(values, opts)          — returns error string or null
 *   opts: { minLength, maxLength, min, max, integer, nonNegative, label }
 * autoClearOnInput(inputEl, errorEl)   — clears error when user types
 */
var InputValidator = (function () {
  "use strict";

  /**
   * Mark an input as invalid and show an error message below it.
   * @param {HTMLElement} inputEl  - the input element to mark
   * @param {HTMLElement} errorEl  - the element that displays the message
   * @param {string}      message  - plain-text error message
   */
  function showError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add("algo-input-invalid");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  /**
   * Clear validation state from an input and its error element.
   * @param {HTMLElement} inputEl  - the input element to unmark
   * @param {HTMLElement} errorEl  - the element showing the error
   */
  function clearError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove("algo-input-invalid");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  }

  /**
   * Validate a single numeric value.
   * @param {string|number} value
   * @param {{ min?: number, max?: number, integer?: boolean, label?: string }} opts
   * @returns {string|null} error message, or null if valid
   */
  function validateNumber(value, opts) {
    opts = opts || {};
    var label = opts.label || "Value";
    var n = Number(value);

    if (value === "" || value === null || value === undefined) {
      return label + " is required.";
    }
    if (isNaN(n) || !isFinite(n)) {
      return label + " must be a number.";
    }
    if (opts.integer && Math.floor(n) !== n) {
      return label + " must be a whole number.";
    }
    if (opts.min !== undefined && n < opts.min) {
      return label + " must be at least " + opts.min + ".";
    }
    if (opts.max !== undefined && n > opts.max) {
      return label + " must be at most " + opts.max + ".";
    }
    return null;
  }

  /**
   * Validate an array of numbers.
   * @param {number[]} values  - already-parsed numbers
   * @param {{
   *   minLength?: number,
   *   maxLength?: number,
   *   min?: number,
   *   max?: number,
   *   integer?: boolean,
   *   nonNegative?: boolean,
   *   label?: string
   * }} opts
   * @returns {string|null} error message, or null if valid
   */
  function validateArray(values, opts) {
    opts = opts || {};
    var label = opts.label || "Array";

    if (!values || values.length === 0) {
      return label + ": enter at least one value.";
    }
    if (opts.minLength !== undefined && values.length < opts.minLength) {
      return label + " must have at least " + opts.minLength + " element(s).";
    }
    if (opts.maxLength !== undefined && values.length > opts.maxLength) {
      return label + " must have at most " + opts.maxLength + " element(s).";
    }
    for (var i = 0; i < values.length; i++) {
      var n = values[i];
      if (isNaN(n) || !isFinite(n)) {
        return label + ': "' + n + '" is not a valid number.';
      }
      if (opts.integer && Math.floor(n) !== n) {
        return label + " values must be whole numbers.";
      }
      if (opts.nonNegative && n < 0) {
        return label + " values must be non-negative.";
      }
      if (opts.min !== undefined && n < opts.min) {
        return label + " values must be at least " + opts.min + ".";
      }
      if (opts.max !== undefined && n > opts.max) {
        return label + " values must be at most " + opts.max + ".";
      }
    }
    return null;
  }

  /**
   * Attach an input listener that clears error state whenever the user types.
   * @param {HTMLElement} inputEl  - the input to watch
   * @param {HTMLElement} errorEl  - the error element to clear
   */
  function autoClearOnInput(inputEl, errorEl) {
    if (!inputEl) return;
    inputEl.addEventListener("input", function () {
      clearError(inputEl, errorEl);
    });
  }

  return {
    showError: showError,
    clearError: clearError,
    validateNumber: validateNumber,
    validateArray: validateArray,
    autoClearOnInput: autoClearOnInput,
  };
})();
