/**
 * Min-Heap (Priority Queue) Algorithm
 *
 * Pure functions — no DOM dependency.
 * Implements a binary min-heap with full step tracing for visualization.
 *
 * The heap is stored as a flat array where for index i:
 *   parent: Math.floor((i - 1) / 2)
 *   left child: 2 * i + 1
 *   right child: 2 * i + 2
 *
 * Operations:
 *   insert(heap, value)  — O(log n) sift-up
 *   extractMin(heap)     — O(log n) sift-down
 *   peek(heap)           — O(1)
 *   buildHeap(arr)       — O(n) bottom-up heapify (Floyd's algorithm)
 *
 * Real-world uses: Dijkstra's shortest path, A* search, task scheduling,
 * event-driven simulation, median maintenance.
 */
var HeapAlgorithm = (function () {
  "use strict";

  /**
   * Maximum number of elements supported in the visualization.
   * @type {number}
   */
  var MAX_SIZE = 20;

  /**
   * Create a new empty min-heap.
   *
   * @returns {{ data: number[] }}
   */
  function createHeap() {
    return { data: [] };
  }

  /**
   * Return the number of elements in the heap.
   *
   * @param {{ data: number[] }} heap
   * @returns {number}
   */
  function size(heap) {
    return heap.data.length;
  }

  /**
   * Return the minimum value without removing it.
   * Returns null if the heap is empty.
   *
   * @param {{ data: number[] }} heap
   * @returns {number|null}
   */
  function peek(heap) {
    if (heap.data.length === 0) return null;
    return heap.data[0];
  }

  /**
   * Insert a value into the heap and sift up to restore heap property.
   * If the heap is already at MAX_SIZE, the operation is a no-op.
   *
   * @param {{ data: number[] }} heap
   * @param {number} value
   * @returns {{ steps: Array }}
   */
  function insert(heap, value) {
    var steps = [];

    if (heap.data.length >= MAX_SIZE) {
      return { steps: steps };
    }

    // Place value at end
    heap.data.push(value);
    var idx = heap.data.length - 1;

    // Record the initial insert step
    steps.push({
      type: "insert",
      indices: [idx],
      values: [value],
      heapSnapshot: heap.data.slice(),
    });

    // Sift up: while not root and smaller than parent, swap
    while (idx > 0) {
      var parentIdx = Math.floor((idx - 1) / 2);

      steps.push({
        type: "compare",
        indices: [idx, parentIdx],
        values: [heap.data[idx], heap.data[parentIdx]],
        heapSnapshot: heap.data.slice(),
      });

      if (heap.data[idx] < heap.data[parentIdx]) {
        // Swap
        var temp = heap.data[idx];
        heap.data[idx] = heap.data[parentIdx];
        heap.data[parentIdx] = temp;

        steps.push({
          type: "swap",
          indices: [idx, parentIdx],
          values: [heap.data[idx], heap.data[parentIdx]],
          heapSnapshot: heap.data.slice(),
        });

        idx = parentIdx;
      } else {
        break;
      }
    }

    return { steps: steps };
  }

  /**
   * Remove and return the minimum element (root) from the heap.
   * Returns null value if the heap is empty.
   * Restores heap property by moving last element to root and sifting down.
   *
   * @param {{ data: number[] }} heap
   * @returns {{ value: number|null, steps: Array }}
   */
  function extractMin(heap) {
    var steps = [];

    if (heap.data.length === 0) {
      return { value: null, steps: steps };
    }

    var minVal = heap.data[0];
    var last = heap.data.pop();

    // Record the extract step
    steps.push({
      type: "extract",
      indices: [0],
      values: [minVal],
      heapSnapshot: heap.data.slice(),
    });

    if (heap.data.length === 0) {
      // Heap is now empty
      return { value: minVal, steps: steps };
    }

    // Move last element to root
    heap.data[0] = last;

    steps.push({
      type: "insert",
      indices: [0],
      values: [last],
      heapSnapshot: heap.data.slice(),
    });

    // Sift down
    var idx = 0;
    var n = heap.data.length;

    while (true) {
      var left = 2 * idx + 1;
      var right = 2 * idx + 2;
      var smallest = idx;

      if (left < n) {
        steps.push({
          type: "compare",
          indices: [smallest, left],
          values: [heap.data[smallest], heap.data[left]],
          heapSnapshot: heap.data.slice(),
        });
        if (heap.data[left] < heap.data[smallest]) {
          smallest = left;
        }
      }

      if (right < n) {
        steps.push({
          type: "compare",
          indices: [smallest, right],
          values: [heap.data[smallest], heap.data[right]],
          heapSnapshot: heap.data.slice(),
        });
        if (heap.data[right] < heap.data[smallest]) {
          smallest = right;
        }
      }

      if (smallest !== idx) {
        var t = heap.data[idx];
        heap.data[idx] = heap.data[smallest];
        heap.data[smallest] = t;

        steps.push({
          type: "swap",
          indices: [idx, smallest],
          values: [heap.data[idx], heap.data[smallest]],
          heapSnapshot: heap.data.slice(),
        });

        idx = smallest;
      } else {
        break;
      }
    }

    return { value: minVal, steps: steps };
  }

  /**
   * Build a min-heap from an arbitrary array using Floyd's O(n) bottom-up
   * heapify algorithm. Input is truncated to MAX_SIZE elements.
   *
   * @param {number[]} arr
   * @returns {{ heap: { data: number[] }, steps: Array }}
   */
  function buildHeap(arr) {
    var steps = [];
    var heap = createHeap();

    if (arr.length === 0) {
      return { heap: heap, steps: steps };
    }

    // Truncate to MAX_SIZE
    heap.data = arr.slice(0, MAX_SIZE);

    var n = heap.data.length;

    // Start from last non-leaf node and sift down each
    var i;
    for (i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDown(heap.data, i, n, steps);
    }

    return { heap: heap, steps: steps };
  }

  /**
   * Sift down element at index i within data[0..n-1].
   * Mutates data in place and appends step records.
   *
   * @param {number[]} data
   * @param {number} i
   * @param {number} n
   * @param {Array} steps
   */
  function siftDown(data, i, n, steps) {
    var idx = i;

    while (true) {
      var left = 2 * idx + 1;
      var right = 2 * idx + 2;
      var smallest = idx;

      if (left < n) {
        steps.push({
          type: "compare",
          indices: [smallest, left],
          values: [data[smallest], data[left]],
          heapSnapshot: data.slice(),
        });
        if (data[left] < data[smallest]) {
          smallest = left;
        }
      }

      if (right < n) {
        steps.push({
          type: "compare",
          indices: [smallest, right],
          values: [data[smallest], data[right]],
          heapSnapshot: data.slice(),
        });
        if (data[right] < data[smallest]) {
          smallest = right;
        }
      }

      if (smallest !== idx) {
        var temp = data[idx];
        data[idx] = data[smallest];
        data[smallest] = temp;

        steps.push({
          type: "swap",
          indices: [idx, smallest],
          values: [data[idx], data[smallest]],
          heapSnapshot: data.slice(),
        });

        idx = smallest;
      } else {
        break;
      }
    }
  }

  return {
    MAX_SIZE: MAX_SIZE,
    createHeap: createHeap,
    insert: insert,
    extractMin: extractMin,
    peek: peek,
    buildHeap: buildHeap,
    size: size,
  };
})();

// Node.js module export (for test runner)

export default HeapAlgorithm;
