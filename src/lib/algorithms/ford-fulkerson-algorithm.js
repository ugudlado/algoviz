/**
 * Ford-Fulkerson Max-Flow Algorithm (Edmonds-Karp variant using BFS)
 *
 * Pure functions — no DOM dependency.
 * Finds maximum flow in a directed graph from source to sink.
 * Uses BFS to find augmenting paths (Edmonds-Karp), guaranteeing O(VE^2) time.
 */
var FordFulkersonAlgorithm = (function () {
  "use strict";

  /**
   * Deep clone a residual capacity object.
   * @param {Object} residual
   * @returns {Object}
   */
  function cloneResidual(residual) {
    var copy = {};
    var nodes = Object.keys(residual);
    for (var i = 0; i < nodes.length; i++) {
      var u = nodes[i];
      copy[u] = {};
      var neighbors = Object.keys(residual[u]);
      for (var j = 0; j < neighbors.length; j++) {
        var v = neighbors[j];
        copy[u][v] = residual[u][v];
      }
    }
    return copy;
  }

  /**
   * BFS to find an augmenting path from source to sink in the residual graph.
   * @param {Object} residual - { nodeId: { neighborId: remainingCapacity } }
   * @param {string} source
   * @param {string} sink
   * @returns {{ path: string[]|null, parent: Object }}
   */
  function bfs(residual, source, sink) {
    var visited = {};
    var parent = {};
    var queue = [source];
    visited[source] = true;
    parent[source] = null;

    while (queue.length > 0) {
      var u = queue.shift();
      var neighbors = Object.keys(residual[u] || {});
      for (var i = 0; i < neighbors.length; i++) {
        var v = neighbors[i];
        if (!visited[v] && residual[u][v] > 0) {
          visited[v] = true;
          parent[v] = u;
          if (v === sink) {
            // Reconstruct path
            var path = [];
            var cur = sink;
            while (cur !== null) {
              path.unshift(cur);
              cur = parent[cur];
            }
            return { path: path, parent: parent };
          }
          queue.push(v);
        }
      }
    }
    return { path: null, parent: parent };
  }

  /**
   * Compute min-cut from source side reachability in residual graph.
   * @param {Object} residual
   * @param {string} source
   * @param {string[]} allNodes
   * @returns {{ sideS: string[], sideT: string[], edges: {from:string,to:string}[] }}
   */
  function computeMinCut(residual, source, allNodes, originalGraph) {
    // BFS/DFS from source in residual graph to find S-side
    var visited = {};
    var queue = [source];
    visited[source] = true;
    while (queue.length > 0) {
      var u = queue.shift();
      var neighbors = Object.keys(residual[u] || {});
      for (var i = 0; i < neighbors.length; i++) {
        var v = neighbors[i];
        if (!visited[v] && residual[u][v] > 0) {
          visited[v] = true;
          queue.push(v);
        }
      }
    }

    var sideS = allNodes.filter(function (n) {
      return visited[n];
    });
    var sideT = allNodes.filter(function (n) {
      return !visited[n];
    });

    // Min-cut edges: original edges from S-side to T-side
    var cutEdges = [];
    for (var j = 0; j < sideS.length; j++) {
      var s = sideS[j];
      var origNeighbors = Object.keys(originalGraph[s] || {});
      for (var k = 0; k < origNeighbors.length; k++) {
        var t = origNeighbors[k];
        if (!visited[t]) {
          cutEdges.push({ from: s, to: t });
        }
      }
    }

    return { sideS: sideS, sideT: sideT, edges: cutEdges };
  }

  /**
   * Build the initial residual graph from the original capacity graph.
   * Adds reverse edges with 0 capacity if not present.
   * @param {Object} graph - { nodeId: { neighborId: capacity } }
   * @returns {Object} residual graph
   */
  function buildResidual(graph) {
    var residual = {};
    var nodes = Object.keys(graph);

    // Initialize all nodes
    for (var i = 0; i < nodes.length; i++) {
      var u = nodes[i];
      if (!residual[u]) residual[u] = {};
      var neighbors = Object.keys(graph[u]);
      for (var j = 0; j < neighbors.length; j++) {
        var v = neighbors[j];
        if (!residual[v]) residual[v] = {};
        // Forward edge
        residual[u][v] = (residual[u][v] || 0) + graph[u][v];
        // Reverse edge (only if not already forward)
        if (residual[v][u] === undefined) {
          residual[v][u] = 0;
        }
      }
    }
    return residual;
  }

  /**
   * Run Ford-Fulkerson (Edmonds-Karp) and return steps for visualization.
   * @param {Object} graph - { nodeId: { neighborId: capacity } }
   * @param {string} source
   * @param {string} sink
   * @returns {{ flow: number, steps: Object[], minCut: Object }}
   */
  function maxFlow(graph, source, sink) {
    var allNodes = Object.keys(graph);
    var residual = buildResidual(graph);
    var totalFlow = 0;
    var steps = [];

    // Validate source and sink exist
    if (allNodes.indexOf(source) === -1 || allNodes.indexOf(sink) === -1) {
      steps.push({
        type: "done",
        path: null,
        bottleneck: 0,
        residual: cloneResidual(residual),
        totalFlow: 0,
        description: "Source or sink not found in graph.",
      });
      return {
        flow: 0,
        steps: steps,
        minCut: { sideS: [], sideT: allNodes, edges: [] },
      };
    }

    // Special case: source === sink
    if (source === sink) {
      var minCutTrivial = computeMinCut(residual, source, allNodes, graph);
      steps.push({
        type: "done",
        path: null,
        bottleneck: 0,
        residual: cloneResidual(residual),
        totalFlow: 0,
        description: "Source equals sink — max flow is 0.",
      });
      return { flow: 0, steps: steps, minCut: minCutTrivial };
    }

    var iteration = 0;
    var maxIterations = 1000; // Safety guard

    while (iteration < maxIterations) {
      iteration++;

      // BFS start step
      steps.push({
        type: "bfs-start",
        path: null,
        bottleneck: 0,
        residual: cloneResidual(residual),
        totalFlow: totalFlow,
        description:
          "BFS search for augmenting path from " + source + " to " + sink + ".",
      });

      var bfsResult = bfs(residual, source, sink);

      if (bfsResult.path === null) {
        // No augmenting path found
        steps.push({
          type: "bfs-no-path",
          path: null,
          bottleneck: 0,
          residual: cloneResidual(residual),
          totalFlow: totalFlow,
          description:
            "No augmenting path from " +
            source +
            " to " +
            sink +
            ". Algorithm complete.",
        });
        break;
      }

      var path = bfsResult.path;

      // Find bottleneck
      var bottleneck = Infinity;
      for (var i = 0; i < path.length - 1; i++) {
        var u = path[i];
        var v = path[i + 1];
        if (residual[u][v] < bottleneck) {
          bottleneck = residual[u][v];
        }
      }

      steps.push({
        type: "bfs-path-found",
        path: path.slice(),
        bottleneck: bottleneck,
        residual: cloneResidual(residual),
        totalFlow: totalFlow,
        description:
          "Found path: " +
          path.join(" → ") +
          " with bottleneck capacity " +
          bottleneck +
          ".",
      });

      // Augment flow along path
      for (var j = 0; j < path.length - 1; j++) {
        var pu = path[j];
        var pv = path[j + 1];
        residual[pu][pv] -= bottleneck;
        residual[pv][pu] += bottleneck;
      }

      totalFlow += bottleneck;

      steps.push({
        type: "augment",
        path: path.slice(),
        bottleneck: bottleneck,
        residual: cloneResidual(residual),
        totalFlow: totalFlow,
        description:
          "Pushed " +
          bottleneck +
          " units along path. Total flow: " +
          totalFlow +
          ".",
      });
    }

    var minCut = computeMinCut(residual, source, allNodes, graph);

    steps.push({
      type: "done",
      path: null,
      bottleneck: 0,
      residual: cloneResidual(residual),
      totalFlow: totalFlow,
      description:
        "Max flow = " +
        totalFlow +
        ". Min-cut has " +
        minCut.edges.length +
        " edge(s).",
    });

    return { flow: totalFlow, steps: steps, minCut: minCut };
  }

  /**
   * Preset network graphs for demonstration.
   */
  var PRESETS = {
    simple: {
      name: "Simple 4-node",
      description: "S→A→T, S→B→T with A→B cross edge. Max flow = 5.",
      nodes: ["S", "A", "B", "T"],
      source: "S",
      sink: "T",
      graph: {
        S: { A: 3, B: 2 },
        A: { T: 2, B: 1 },
        B: { T: 3 },
        T: {},
      },
      expectedMaxFlow: 5,
      positions: {
        S: { x: 80, y: 150 },
        A: { x: 230, y: 80 },
        B: { x: 230, y: 220 },
        T: { x: 380, y: 150 },
      },
    },
    classic: {
      name: "Classic 6-node",
      description: "Textbook max-flow example with 6 nodes. Max flow = 23.",
      nodes: ["S", "A", "B", "C", "D", "T"],
      source: "S",
      sink: "T",
      graph: {
        S: { A: 16, B: 13 },
        A: { B: 4, C: 12 },
        B: { A: 0, D: 14 },
        C: { B: 9, T: 20 },
        D: { C: 7, T: 4 },
        T: {},
      },
      expectedMaxFlow: 23,
      positions: {
        S: { x: 60, y: 180 },
        A: { x: 190, y: 90 },
        B: { x: 190, y: 270 },
        C: { x: 320, y: 90 },
        D: { x: 320, y: 270 },
        T: { x: 450, y: 180 },
      },
    },
    bipartite: {
      name: "Bipartite matching",
      description: "3 left nodes (L1-L3), 3 right nodes (R1-R3). Max flow = 3.",
      nodes: ["S", "L1", "L2", "L3", "R1", "R2", "R3", "T"],
      source: "S",
      sink: "T",
      graph: {
        S: { L1: 1, L2: 1, L3: 1 },
        L1: { R1: 1, R2: 1 },
        L2: { R1: 1, R3: 1 },
        L3: { R2: 1, R3: 1 },
        R1: { T: 1 },
        R2: { T: 1 },
        R3: { T: 1 },
        T: {},
      },
      expectedMaxFlow: 3,
      positions: {
        S: { x: 60, y: 190 },
        L1: { x: 180, y: 80 },
        L2: { x: 180, y: 190 },
        L3: { x: 180, y: 300 },
        R1: { x: 330, y: 80 },
        R2: { x: 330, y: 190 },
        R3: { x: 330, y: 300 },
        T: { x: 450, y: 190 },
      },
    },
  };

  return {
    maxFlow: maxFlow,
    buildResidual: buildResidual,
    bfs: bfs,
    computeMinCut: computeMinCut,
    PRESETS: PRESETS,
  };
})();

// Node.js export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = FordFulkersonAlgorithm;
}

