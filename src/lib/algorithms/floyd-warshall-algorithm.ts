// @ts-nocheck
/**
 * Floyd-Warshall All-Pairs Shortest Paths Algorithm
 *
 * Pure functions — no DOM dependency.
 * Computes shortest paths between ALL pairs of vertices in a weighted graph,
 * recording each relaxation step as a snapshot for visualization.
 *
 * Unlike Dijkstra (single-source only, no negative weights), Floyd-Warshall:
 *   - Finds shortest paths between every pair of vertices in one pass
 *   - Handles negative edge weights (but not negative cycles)
 *   - Runs in O(n^3) time
 *
 * Real-world uses: network routing tables, GPS all-pairs distances,
 * detecting negative cycles in financial arbitrage graphs.
 */
var FloydWarshallAlgorithm = (function () {
  "use strict";

  /**
   * Build an n×n adjacency matrix from an edge list.
   *
   * @param {Array<{from: number, to: number, weight: number}>} edges
   * @param {number} numVertices
   * @returns {number[][]} n×n matrix — 0 on diagonal, Infinity where no edge
   */
  function createAdjacencyMatrix(edges, numVertices) {
    var n = numVertices;
    var matrix = [];
    var i, j;

    // Initialize: Infinity everywhere, 0 on diagonal
    for (i = 0; i < n; i++) {
      matrix[i] = [];
      for (j = 0; j < n; j++) {
        matrix[i][j] = i === j ? 0 : Infinity;
      }
    }

    // Fill in edges — skip self-loops (diagonal stays 0)
    for (var e = 0; e < edges.length; e++) {
      var edge = edges[e];
      if (edge.from !== edge.to) {
        matrix[edge.from][edge.to] = edge.weight;
      }
    }

    return matrix;
  }

  /**
   * Run the Floyd-Warshall all-pairs shortest paths algorithm.
   *
   * @param {number[][]} adjacencyMatrix - n×n matrix (0 on diagonal, Infinity for no edge)
   * @returns {{
   *   dist: number[][],   -- final n×n shortest-distance matrix
   *   pred: (number|null)[][], -- n×n predecessor matrix (null if no path)
   *   steps: Array<{
   *     k: number,        -- current intermediate vertex
   *     i: number,        -- source vertex for this check
   *     j: number,        -- target vertex for this check
   *     oldDist: number,  -- dist[i][j] before this step
   *     newDist: number,  -- dist[i][k] + dist[k][j]
   *     updated: boolean  -- true if dist[i][j] was improved
   *   }>
   * }}
   */
  function floydWarshall(adjacencyMatrix) {
    var n = adjacencyMatrix.length;
    var i, j, k;

    // Deep-copy the input matrix into dist
    var dist = [];
    for (i = 0; i < n; i++) {
      dist[i] = [];
      for (j = 0; j < n; j++) {
        dist[i][j] = adjacencyMatrix[i][j];
      }
    }

    // Initialize predecessor matrix
    // pred[i][j] = i if there is a direct edge i->j, else null
    var pred = [];
    for (i = 0; i < n; i++) {
      pred[i] = [];
      for (j = 0; j < n; j++) {
        if (i === j || dist[i][j] === Infinity) {
          pred[i][j] = null;
        } else {
          pred[i][j] = i;
        }
      }
    }

    var steps = [];

    // Main triple-loop: for each intermediate vertex k
    for (k = 0; k < n; k++) {
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          var through = dist[i][k] + dist[k][j];
          var oldDist = dist[i][j];
          var updated = false;

          if (through < oldDist) {
            dist[i][j] = through;
            pred[i][j] = pred[k][j];
            updated = true;
          }

          steps.push({
            k: k,
            i: i,
            j: j,
            oldDist: oldDist,
            newDist: through,
            updated: updated,
          });
        }
      }
    }

    return {
      dist: dist,
      pred: pred,
      steps: steps,
    };
  }

  /**
   * Reconstruct the shortest path from source to target using the predecessor matrix.
   *
   * @param {(number|null)[][]} pred - predecessor matrix from floydWarshall()
   * @param {number} source - source vertex index
   * @param {number} target - target vertex index
   * @returns {number[]|null} array of vertex indices from source to target, or null if unreachable
   */
  function reconstructPath(pred, source, target) {
    // Path to self
    if (source === target) {
      return [source];
    }

    // No path if predecessor is null
    if (pred[source][target] === null) {
      return null;
    }

    // Walk backwards from target to source using pred
    var path = [];
    var current = target;
    var maxIter = pred.length + 1; // guard against infinite loop

    while (current !== source && maxIter-- > 0) {
      path.unshift(current);
      current = pred[source][current];
      if (current === null) {
        return null; // unreachable
      }
    }

    path.unshift(source);
    return path;
  }

  return {
    floydWarshall: floydWarshall,
    reconstructPath: reconstructPath,
    createAdjacencyMatrix: createAdjacencyMatrix,
  };
})();

// Node.js module export (for test runner)

export default FloydWarshallAlgorithm;
