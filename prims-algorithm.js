/**
 * Prim's Minimum Spanning Tree Algorithm
 *
 * Pure functions — no DOM dependency.
 * Runs Prim's algorithm on a weighted undirected graph,
 * recording each step as a snapshot for visualization.
 *
 * Real-world example: Laying cables/pipes in a city with minimum total cost.
 */
var PrimsAlgorithm = (function () {
  "use strict";

  var MAX_VERTICES = 12;

  /**
   * Create an empty graph with numVertices nodes (labeled 0..numVertices-1).
   *
   * @param {number} numVertices
   * @returns {{ numVertices: number, adjacency: Object.<number, Array> }}
   */
  function createGraph(numVertices) {
    var adjacency = {};
    for (var i = 0; i < numVertices; i++) {
      adjacency[i] = [];
    }
    return { numVertices: numVertices, adjacency: adjacency };
  }

  /**
   * Add an undirected weighted edge between nodes u and v.
   * Mutates graph.adjacency in place.
   *
   * @param {object} graph
   * @param {number} u
   * @param {number} v
   * @param {number} weight
   */
  function addEdge(graph, u, v, weight) {
    graph.adjacency[u].push({ to: v, weight: weight });
    graph.adjacency[v].push({ to: u, weight: weight });
  }

  /**
   * Run Prim's algorithm on the graph starting from startNode.
   *
   * @param {object} graph - { numVertices, adjacency }
   * @param {number} startNode
   * @returns {{
   *   mstEdges: Array<{u: number, v: number, weight: number}>,
   *   totalWeight: number,
   *   steps: Array
   * }}
   */
  function primsMST(graph, startNode) {
    var adjacency = graph.adjacency;
    var visited = {};
    var visitedList = [];
    var mstEdges = [];
    var totalWeight = 0;
    var steps = [];

    // Priority queue: min-heap of candidate edges { u, v, weight }
    var pq = [];

    // Visit the start node
    visited[startNode] = true;
    visitedList = [startNode];

    // Add all edges from start node to priority queue
    var startNeighbors = adjacency[startNode] || [];
    for (var s = 0; s < startNeighbors.length; s++) {
      var nb = startNeighbors[s];
      pqPush(pq, { u: startNode, v: nb.to, weight: nb.weight });
    }

    // Record the initial visit step
    steps.push({
      type: "visit",
      node: startNode,
      edge: null,
      priorityQueue: pqToSortedArray(pq),
      mstSoFar: mstEdges.slice(),
      visited: visitedList.slice(),
      totalWeight: totalWeight,
    });

    while (pq.length > 0) {
      var candidate = pqPop(pq);

      // If destination already visited, skip (would create cycle)
      if (visited[candidate.v]) {
        steps.push({
          type: "skip_edge",
          node: candidate.v,
          edge: { u: candidate.u, v: candidate.v, weight: candidate.weight },
          priorityQueue: pqToSortedArray(pq),
          mstSoFar: mstEdges.slice(),
          visited: visitedList.slice(),
          totalWeight: totalWeight,
        });
        continue;
      }

      // Add this edge to MST
      mstEdges.push({
        u: candidate.u,
        v: candidate.v,
        weight: candidate.weight,
      });
      totalWeight += candidate.weight;

      // Record add_edge step
      steps.push({
        type: "add_edge",
        node: candidate.v,
        edge: { u: candidate.u, v: candidate.v, weight: candidate.weight },
        priorityQueue: pqToSortedArray(pq),
        mstSoFar: mstEdges.slice(),
        visited: visitedList.slice(),
        totalWeight: totalWeight,
      });

      // Visit the new node
      visited[candidate.v] = true;
      visitedList = visitedList.concat([candidate.v]);

      // Add new candidate edges from this node
      var newNeighbors = adjacency[candidate.v] || [];
      for (var m = 0; m < newNeighbors.length; m++) {
        var newNb = newNeighbors[m];
        if (!visited[newNb.to]) {
          pqPush(pq, { u: candidate.v, v: newNb.to, weight: newNb.weight });
        }
      }

      // Record visit step for the newly added node
      steps.push({
        type: "visit",
        node: candidate.v,
        edge: null,
        priorityQueue: pqToSortedArray(pq),
        mstSoFar: mstEdges.slice(),
        visited: visitedList.slice(),
        totalWeight: totalWeight,
      });
    }

    return {
      mstEdges: mstEdges,
      totalWeight: totalWeight,
      steps: steps,
    };
  }

  // --- Min-heap priority queue (keyed by weight) ---

  function pqPush(heap, entry) {
    heap.push(entry);
    var idx = heap.length - 1;
    while (idx > 0) {
      var parentIdx = Math.floor((idx - 1) / 2);
      if (heap[parentIdx].weight <= heap[idx].weight) break;
      var tmp = heap[parentIdx];
      heap[parentIdx] = heap[idx];
      heap[idx] = tmp;
      idx = parentIdx;
    }
  }

  function pqPop(heap) {
    if (heap.length === 0) return null;
    var top = heap[0];
    var last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      var idx = 0;
      while (true) {
        var left = 2 * idx + 1;
        var right = 2 * idx + 2;
        var smallest = idx;
        if (left < heap.length && heap[left].weight < heap[smallest].weight) {
          smallest = left;
        }
        if (right < heap.length && heap[right].weight < heap[smallest].weight) {
          smallest = right;
        }
        if (smallest === idx) break;
        var tmp2 = heap[idx];
        heap[idx] = heap[smallest];
        heap[smallest] = tmp2;
        idx = smallest;
      }
    }
    return top;
  }

  function pqToSortedArray(heap) {
    var result = [];
    for (var i = 0; i < heap.length; i++) {
      result.push({ u: heap[i].u, v: heap[i].v, weight: heap[i].weight });
    }
    result.sort(function (a, b) {
      return a.weight - b.weight;
    });
    return result;
  }

  return {
    createGraph: createGraph,
    addEdge: addEdge,
    primsMST: primsMST,
    MAX_VERTICES: MAX_VERTICES,
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = PrimsAlgorithm;
}
