/**
 *
 * Covers: basic correctness, predecessor matrix, path reconstruction,
 * createAdjacencyMatrix helper, edge cases, step trace structure.
 */

describe("floyd warshall algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

  const FloydWarshallAlgorithm =
    require("./floyd-warshall-algorithm.js").default ||
    require("./floyd-warshall-algorithm.js");
  const { floydWarshall, reconstructPath, createAdjacencyMatrix } =
    FloydWarshallAlgorithm;
  // --- createAdjacencyMatrix ---
  it(() => {
    // 3 vertices, edges 0->1 weight 4, 1->2 weight 3
    const matrix = createAdjacencyMatrix(
      [
        { from: 0, to: 1, weight: 4 },
        { from: 1, to: 2, weight: 3 },
      ],
      3,
    );
    assert(matrix[0][0] === 0, "Diagonal is 0");
    assert(matrix[0][1] === 4, "Edge 0->1 is 4");
    assert(matrix[1][2] === 3, "Edge 1->2 is 3");
    assert(matrix[0][2] === Infinity, "No direct edge 0->2 is Infinity");
    assert(matrix[2][0] === Infinity, "No edge 2->0 is Infinity");
  }, "createAdjacencyMatrix: basic construction");

  it(() => {
    const matrix = createAdjacencyMatrix([], 3);
    assert(matrix[0][0] === 0, "Diagonal 0,0 is 0");
    assert(matrix[1][1] === 0, "Diagonal 1,1 is 0");
    assert(matrix[2][2] === 0, "Diagonal 2,2 is 0");
    assert(matrix[0][1] === Infinity, "No edges means Infinity");
    assert(matrix[1][0] === Infinity, "No edges means Infinity");
  }, "createAdjacencyMatrix: no edges — all Infinity except diagonal");

  it(() => {
    const matrix = createAdjacencyMatrix([{ from: 0, to: 0, weight: 5 }], 2);
    // Self-loops: diagonal stays 0 (shortest path to self is always 0)
    assert(matrix[0][0] === 0, "Self-loop: diagonal stays 0");
  }, "createAdjacencyMatrix: self-loop on diagonal stays 0");

  it(() => {
    const matrix = createAdjacencyMatrix([], 1);
    assert(Array.isArray(matrix), "Returns array");
    assert(matrix.length === 1, "1x1 matrix");
    assert(matrix[0][0] === 0, "Single vertex diagonal is 0");
  }, "createAdjacencyMatrix: single vertex");

  // --- floydWarshall basic correctness ---
  it(() => {
    // 3-node graph: 0->1 (3), 1->2 (2), 0->2 (10)
    // Shortest 0->2 = 5 via 1
    const matrix = [
      [0, 3, 10],
      [Infinity, 0, 2],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.dist[0][0] === 0, "dist[0][0] = 0");
    assert(result.dist[0][1] === 3, "dist[0][1] = 3");
    assert(result.dist[0][2] === 5, "dist[0][2] = 5 via vertex 1");
    assert(result.dist[1][2] === 2, "dist[1][2] = 2");
    assert(
      result.dist[2][0] === Infinity,
      "dist[2][0] = Infinity (no path back)",
    );
  }, "floydWarshall: 3-node graph finds indirect shortest path");

  it(() => {
    // 4-node graph with multiple indirect paths
    // 0->1 (5), 0->2 (10), 1->3 (3), 2->3 (1), 1->2 (2)
    // dist[0][3] = min(5+3, 5+2+1, 10+1) = min(8, 8, 11) = 8
    const matrix = [
      [0, 5, 10, Infinity],
      [Infinity, 0, 2, 3],
      [Infinity, Infinity, 0, 1],
      [Infinity, Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.dist[0][3] === 8, "dist[0][3] = 8");
    assert(result.dist[0][2] === 7, "dist[0][2] = 7 via 0->1->2");
    assert(result.dist[1][3] === 3, "dist[1][3] = 3");
  }, "floydWarshall: 4-node graph with multiple paths");

  it(() => {
    // Single vertex
    const matrix = [[0]];
    const result = floydWarshall(matrix);
    assert(result.dist[0][0] === 0, "Single vertex distance to self is 0");
    assert(Array.isArray(result.pred), "pred is array");
    assert(Array.isArray(result.steps), "steps is array");
  }, "floydWarshall: single vertex");

  it(() => {
    // Disconnected graph: 0-1 connected, 2 isolated
    const matrix = [
      [0, 4, Infinity],
      [Infinity, 0, Infinity],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.dist[0][1] === 4, "Connected path 0->1");
    assert(result.dist[0][2] === Infinity, "Disconnected: 0->2 = Infinity");
    assert(result.dist[2][0] === Infinity, "Disconnected: 2->0 = Infinity");
  }, "floydWarshall: disconnected graph preserves Infinity");

  it(() => {
    // Complete undirected graph (symmetric)
    // 0->1 (1), 0->2 (4), 1->2 (2) — bidirectional
    const matrix = [
      [0, 1, 4],
      [1, 0, 2],
      [4, 2, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.dist[0][2] === 3, "0->2 = 3 via 0->1->2");
    assert(result.dist[2][0] === 3, "2->0 = 3 via 2->1->0");
  }, "floydWarshall: undirected (symmetric) graph");

  it(() => {
    // Self-loops on off-diagonal: should not affect shortest paths
    const matrix = [
      [0, 2, Infinity],
      [Infinity, 0, 3],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.dist[0][0] === 0, "Self distance always 0");
    assert(result.dist[1][1] === 0, "Self distance always 0");
    assert(result.dist[0][2] === 5, "0->2 = 5 via 0->1->2");
  }, "floydWarshall: diagonal always remains 0");

  it(() => {
    // 8-vertex linear chain
    const n = 8;
    const matrix = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        matrix[i][j] = i === j ? 0 : Infinity;
      }
    }
    for (let i = 0; i < n - 1; i++) {
      matrix[i][i + 1] = 1;
    }
    const result = floydWarshall(matrix);
    assert(result.dist[0][7] === 7, "8-node chain: dist[0][7] = 7");
    assert(result.dist[3][7] === 4, "8-node chain: dist[3][7] = 4");
  }, "floydWarshall: 8-vertex chain (max vertices)");

  // --- Predecessor matrix ---
  it(() => {
    const matrix = [
      [0, 3, 10],
      [Infinity, 0, 2],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    // pred[i][j] = last vertex before j on shortest path from i to j
    // path 0->1: pred[0][1] = 0 (direct)
    // path 0->2: via 1, so pred[0][2] = 1
    assert(result.pred[0][1] === 0, "pred[0][1] = 0 (direct edge)");
    assert(result.pred[0][2] === 1, "pred[0][2] = 1 (goes through 1)");
    assert(result.pred[1][2] === 1, "pred[1][2] = 1 (direct edge)");
  }, "floydWarshall: predecessor matrix correctness");

  it(() => {
    // No path: pred should be null for unreachable pairs
    const matrix = [
      [0, Infinity],
      [Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.pred[0][1] === null, "pred[0][1] = null (unreachable)");
    assert(result.pred[1][0] === null, "pred[1][0] = null (unreachable)");
  }, "floydWarshall: predecessor is null for unreachable vertices");

  // --- Step trace ---
  it(() => {
    const matrix = [
      [0, 1, Infinity],
      [Infinity, 0, 1],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(Array.isArray(result.steps), "steps is an array");
    assert(result.steps.length > 0, "steps array is non-empty");
    const step = result.steps[0];
    assert(typeof step.k === "number", "step has field k");
    assert(typeof step.i === "number", "step has field i");
    assert(typeof step.j === "number", "step has field j");
    assert(
      typeof step.oldDist === "number" || step.oldDist === Infinity,
      "step has field oldDist",
    );
    assert(
      typeof step.newDist === "number" || step.newDist === Infinity,
      "step has field newDist",
    );
    assert(typeof step.updated === "boolean", "step has field updated");
  }, "floydWarshall: step trace has correct structure");

  it(() => {
    // 3-node graph: 0->1 (3), 1->2 (2), 0->2 (10)
    // When k=1, considering path 0->1->2: oldDist=10, newDist=5, updated=true
    const matrix = [
      [0, 3, 10],
      [Infinity, 0, 2],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    // Find the step where k=1, i=0, j=2 and updated=true
    const updateStep = result.steps.find(
      (s) => s.k === 1 && s.i === 0 && s.j === 2 && s.updated,
    );
    assert(updateStep !== undefined, "Found an update step for k=1, i=0, j=2");
    assert(updateStep.oldDist === 10, "oldDist was 10");
    assert(updateStep.newDist === 5, "newDist is 5");
  }, "floydWarshall: step trace captures relaxation correctly");

  it(() => {
    // Step count: for n vertices, we examine n*n pairs for each of n intermediate vertices
    // Total steps = n^3 (all combinations checked)
    const n = 3;
    const matrix = [
      [0, 1, Infinity],
      [Infinity, 0, 1],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    // All steps where i != k and j != k are examined
    // We check all n^3 = 27 combinations (even i==k or j==k)
    assert(result.steps.length === n * n * n, "Step count = n^3 = 27");
  }, "floydWarshall: step count equals n^3");

  // --- reconstructPath ---
  it(() => {
    // Direct edge 0->1
    const matrix = [
      [0, 5, Infinity],
      [Infinity, 0, Infinity],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    const path = reconstructPath(result.pred, 0, 1);
    assertEqual(path, [0, 1], "Direct edge path is [0, 1]");
  }, "reconstructPath: direct edge");

  it(() => {
    // 0->1->2 multi-hop
    const matrix = [
      [0, 3, 10],
      [Infinity, 0, 2],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    const path = reconstructPath(result.pred, 0, 2);
    assertEqual(path, [0, 1, 2], "Multi-hop path is [0, 1, 2]");
  }, "reconstructPath: multi-hop path");

  it(() => {
    // 0->1->2->3 four-node chain
    const matrix = [
      [0, 1, Infinity, Infinity],
      [Infinity, 0, 1, Infinity],
      [Infinity, Infinity, 0, 1],
      [Infinity, Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    const path = reconstructPath(result.pred, 0, 3);
    assertEqual(path, [0, 1, 2, 3], "4-hop path is [0, 1, 2, 3]");
  }, "reconstructPath: 4-hop chain");

  it(() => {
    // Unreachable: no path
    const matrix = [
      [0, Infinity],
      [Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    const path = reconstructPath(result.pred, 0, 1);
    assertEqual(path, null, "No path returns null");
  }, "reconstructPath: unreachable returns null");

  it(() => {
    // Path to self
    const matrix = [
      [0, 2],
      [Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    const path = reconstructPath(result.pred, 0, 0);
    assertEqual(path, [0], "Path to self is [0]");
  }, "reconstructPath: path to self is [source]");

  it(() => {
    // Path when there's a better indirect route
    // 0->2 direct (9), 0->1->2 (3+3=6)
    const matrix = [
      [0, 3, 9],
      [Infinity, 0, 3],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    const path = reconstructPath(result.pred, 0, 2);
    assertEqual(path, [0, 1, 2], "Takes shorter indirect path [0, 1, 2]");
    assert(result.dist[0][2] === 6, "Shortest dist[0][2] = 6");
  }, "reconstructPath: uses indirect path when shorter");

  // --- Negative weights (allowed in Floyd-Warshall, unlike Dijkstra) ---
  it(() => {
    // Floyd-Warshall handles negative weights (just not negative cycles)
    const matrix = [
      [0, -2, Infinity],
      [Infinity, 0, 3],
      [Infinity, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    assert(result.dist[0][1] === -2, "Negative weight: dist[0][1] = -2");
    assert(result.dist[0][2] === 1, "dist[0][2] = -2+3 = 1");
  }, "floydWarshall: handles negative weights (no negative cycle)");

  // --- All-pairs completeness ---
  it(() => {
    // Verify all pairs are computed, not just from one source
    const matrix = [
      [0, 1, Infinity],
      [Infinity, 0, 1],
      [1, Infinity, 0],
    ];
    const result = floydWarshall(matrix);
    // 0->1=1, 1->2=1, 2->0=1
    assert(result.dist[0][1] === 1, "dist[0][1] = 1");
    assert(result.dist[1][2] === 1, "dist[1][2] = 1");
    assert(result.dist[2][0] === 1, "dist[2][0] = 1");
    // indirect: 0->1->2=2, 1->2->0=2, 2->0->1=2
    assert(result.dist[0][2] === 2, "dist[0][2] = 2 (via 1)");
    assert(result.dist[1][0] === 2, "dist[1][0] = 2 (via 2)");
    assert(result.dist[2][1] === 2, "dist[2][1] = 2 (via 0)");
  }, "floydWarshall: all-pairs computed correctly (cycle graph)");
});
