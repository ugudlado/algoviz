/**
 *
 * Covers: known graphs, disconnected graph, single node, complete graph,
 * step trace structure, edge selection order, MAX_VERTICES, createGraph, addEdge.
 */

describe("prims algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  const PrimsAlgorithm =
    require("./prims-algorithm.js").default || require("./prims-algorithm.js");
  // --- createGraph helper ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    assert(g.numVertices === 3, "numVertices is 3");
    assert(typeof g.adjacency === "object", "adjacency is an object");
    assert(Array.isArray(g.adjacency[0]), "node 0 adjacency is array");
    assert(Array.isArray(g.adjacency[1]), "node 1 adjacency is array");
    assert(Array.isArray(g.adjacency[2]), "node 2 adjacency is array");
    assert(g.adjacency[0].length === 0, "node 0 starts empty");
  }, "createGraph: creates correct empty adjacency list");

  it(() => {
    const g = PrimsAlgorithm.createGraph(1);
    assert(g.numVertices === 1, "single node numVertices is 1");
    assert(Array.isArray(g.adjacency[0]), "single node 0 adjacency exists");
    assert(g.adjacency[0].length === 0, "single node 0 starts empty");
  }, "createGraph: single node");

  // --- addEdge helper ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 5);
    assert(g.adjacency[0].length === 1, "node 0 has 1 neighbor");
    assert(g.adjacency[1].length === 1, "node 1 has 1 neighbor (undirected)");
    assert(g.adjacency[0][0].to === 1, "node 0 -> node 1");
    assert(g.adjacency[0][0].weight === 5, "edge weight is 5");
    assert(g.adjacency[1][0].to === 0, "node 1 -> node 0 (undirected)");
    assert(g.adjacency[1][0].weight === 5, "reverse edge weight is 5");
  }, "addEdge: creates undirected edge in both directions");

  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 3);
    PrimsAlgorithm.addEdge(g, 1, 2, 7);
    assert(g.adjacency[0].length === 1, "node 0 has 1 neighbor");
    assert(g.adjacency[1].length === 2, "node 1 has 2 neighbors");
    assert(g.adjacency[2].length === 1, "node 2 has 1 neighbor");
  }, "addEdge: multiple edges from same node");

  // --- MAX_VERTICES ---
  it(() => {
    assert(PrimsAlgorithm.MAX_VERTICES === 12, "MAX_VERTICES is 12");
  }, "MAX_VERTICES constant is 12");

  // --- Single node graph ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(1);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(Array.isArray(result.mstEdges), "mstEdges is array");
    assert(result.mstEdges.length === 0, "single node has no MST edges");
    assert(result.totalWeight === 0, "single node total weight is 0");
    assert(Array.isArray(result.steps), "steps is array");
  }, "Single node: empty MST, zero weight");

  // --- Known 3-node triangle ---
  it(() => {
    // 0 -1- 1 -3- 2 -2- 0  (triangle with weights 1, 3, 2)
    // MST from node 0: pick edge 0-1 (w=1), then pick 0-2 (w=2), skip 1-2 (cycle)
    // Total MST weight = 3
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 1);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 0, 2, 2);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(result.mstEdges.length === 2, "triangle MST has 2 edges");
    assert(result.totalWeight === 3, "triangle MST total weight is 1+2=3");
  }, "Triangle graph: correct MST edges and total weight");

  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 1);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 0, 2, 2);
    const result = PrimsAlgorithm.primsMST(g, 0);
    // Check edge 0-1 (weight 1) is in MST
    const has01 = result.mstEdges.some(
      (e) =>
        ((e.u === 0 && e.v === 1) || (e.u === 1 && e.v === 0)) &&
        e.weight === 1,
    );
    // Check edge 0-2 (weight 2) is in MST
    const has02 = result.mstEdges.some(
      (e) =>
        ((e.u === 0 && e.v === 2) || (e.u === 2 && e.v === 0)) &&
        e.weight === 2,
    );
    assert(has01, "MST contains edge 0-1 (weight 1)");
    assert(has02, "MST contains edge 0-2 (weight 2)");
  }, "Triangle graph: MST contains cheapest edges");

  // --- Known 4-node graph ---
  it(() => {
    // 0-1:2, 0-3:6, 1-2:3, 1-3:8, 2-3:7
    // MST from 0: 0-1(2), 1-2(3), 0-3(6) — total 11
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 0, 3, 6);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 1, 3, 8);
    PrimsAlgorithm.addEdge(g, 2, 3, 7);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(result.mstEdges.length === 3, "4-node MST has 3 edges");
    assert(result.totalWeight === 11, "4-node MST total weight is 11");
  }, "4-node graph: correct MST total weight");

  it(() => {
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 0, 3, 6);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 1, 3, 8);
    PrimsAlgorithm.addEdge(g, 2, 3, 7);
    const result = PrimsAlgorithm.primsMST(g, 0);
    const has01 = result.mstEdges.some(
      (e) =>
        ((e.u === 0 && e.v === 1) || (e.u === 1 && e.v === 0)) &&
        e.weight === 2,
    );
    const has12 = result.mstEdges.some(
      (e) =>
        ((e.u === 1 && e.v === 2) || (e.u === 2 && e.v === 1)) &&
        e.weight === 3,
    );
    const has03 = result.mstEdges.some(
      (e) =>
        ((e.u === 0 && e.v === 3) || (e.u === 3 && e.v === 0)) &&
        e.weight === 6,
    );
    assert(has01, "4-node MST contains 0-1 (w=2)");
    assert(has12, "4-node MST contains 1-2 (w=3)");
    assert(has03, "4-node MST contains 0-3 (w=6)");
  }, "4-node graph: MST contains correct specific edges");

  // --- Complete graph (K4) ---
  it(() => {
    // K4: all 4 nodes fully connected with different weights
    // 0-1:1, 0-2:2, 0-3:3, 1-2:4, 1-3:5, 2-3:6
    // MST: 0-1(1), 0-2(2), 0-3(3) — total 6
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 1);
    PrimsAlgorithm.addEdge(g, 0, 2, 2);
    PrimsAlgorithm.addEdge(g, 0, 3, 3);
    PrimsAlgorithm.addEdge(g, 1, 2, 4);
    PrimsAlgorithm.addEdge(g, 1, 3, 5);
    PrimsAlgorithm.addEdge(g, 2, 3, 6);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(result.mstEdges.length === 3, "K4 MST has 3 edges");
    assert(result.totalWeight === 6, "K4 MST minimum total weight is 1+2+3=6");
  }, "Complete graph K4: minimum total weight MST");

  // --- Disconnected graph ---
  it(() => {
    // Nodes 0,1,2 connected; node 3 isolated
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 4);
    PrimsAlgorithm.addEdge(g, 1, 2, 2);
    // node 3 has no edges
    const result = PrimsAlgorithm.primsMST(g, 0);
    // MST covers reachable nodes only (0,1,2)
    assert(
      result.mstEdges.length === 2,
      "disconnected: MST covers only reachable nodes",
    );
    assert(result.totalWeight === 6, "disconnected: partial MST weight is 6");
    // Node 3 should NOT appear in MST edges
    const node3InMST = result.mstEdges.some((e) => e.u === 3 || e.v === 3);
    assert(!node3InMST, "disconnected: unreachable node 3 not in MST");
  }, "Disconnected graph: MST covers reachable nodes only");

  // --- Step trace structure ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 5);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(result.steps.length > 0, "has steps");
    const step = result.steps[0];
    assert(step.type !== undefined, "step has type");
    assert(step.node !== undefined, "step has node");
    assert(step.priorityQueue !== undefined, "step has priorityQueue");
    assert(Array.isArray(step.priorityQueue), "step.priorityQueue is array");
    assert(step.mstSoFar !== undefined, "step has mstSoFar");
    assert(Array.isArray(step.mstSoFar), "step.mstSoFar is array");
    assert(step.visited !== undefined, "step has visited");
    assert(Array.isArray(step.visited), "step.visited is array");
    assert(step.totalWeight !== undefined, "step has totalWeight");
  }, "Step trace: each step has required fields");

  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 5);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    const result = PrimsAlgorithm.primsMST(g, 0);
    // Steps should include 'visit' and 'add_edge' types
    const types = result.steps.map((s) => s.type);
    assert(types.includes("visit"), "steps include visit type");
    assert(types.includes("add_edge"), "steps include add_edge type");
  }, "Step trace: steps include visit and add_edge types");

  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 1);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 0, 2, 2);
    const result = PrimsAlgorithm.primsMST(g, 0);
    // skip_edge should appear when a cycle would form
    const types = result.steps.map((s) => s.type);
    assert(
      types.includes("skip_edge"),
      "steps include skip_edge type for cycle prevention",
    );
  }, "Step trace: skip_edge type appears for cycle-forming edges");

  // --- Edge selection order: cheapest candidate always selected first ---
  it(() => {
    // From node 0: candidates 0-1(w=10), 0-2(w=1)
    // Should pick 0-2 first (cheaper)
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 10);
    PrimsAlgorithm.addEdge(g, 0, 2, 1);
    PrimsAlgorithm.addEdge(g, 1, 2, 5);
    const result = PrimsAlgorithm.primsMST(g, 0);
    // First MST edge added should be the cheapest (0-2, w=1)
    const addEdgeSteps = result.steps.filter((s) => s.type === "add_edge");
    assert(addEdgeSteps.length > 0, "has add_edge steps");
    const firstEdge = addEdgeSteps[0].edge;
    assert(firstEdge !== null, "first add_edge step has edge");
    assert(firstEdge.weight === 1, "first MST edge is the cheapest (w=1)");
  }, "Edge selection: cheapest candidate always selected first");

  // --- Priority queue is sorted by weight ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 5);
    PrimsAlgorithm.addEdge(g, 0, 2, 2);
    PrimsAlgorithm.addEdge(g, 0, 3, 8);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    const result = PrimsAlgorithm.primsMST(g, 0);
    // Check that every step's priority queue is sorted by weight ascending
    for (const step of result.steps) {
      for (let i = 1; i < step.priorityQueue.length; i++) {
        assert(
          step.priorityQueue[i].weight >= step.priorityQueue[i - 1].weight,
          "priority queue is sorted ascending by weight at each step",
        );
      }
    }
  }, "Priority queue is sorted ascending by weight at each step");

  // --- mstSoFar grows monotonically ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    const result = PrimsAlgorithm.primsMST(g, 0);
    // mstSoFar length should never decrease across steps
    let prevLen = 0;
    for (const step of result.steps) {
      assert(
        step.mstSoFar.length >= prevLen,
        "mstSoFar never shrinks between steps",
      );
      prevLen = step.mstSoFar.length;
    }
  }, "mstSoFar grows monotonically across steps");

  // --- visited set grows monotonically ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    const result = PrimsAlgorithm.primsMST(g, 0);
    let prevSize = 0;
    for (const step of result.steps) {
      assert(
        step.visited.length >= prevSize,
        "visited set never shrinks between steps",
      );
      prevSize = step.visited.length;
    }
  }, "Visited set grows monotonically across steps");

  // --- Different start nodes give same MST weight ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 0, 3, 6);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 1, 3, 8);
    PrimsAlgorithm.addEdge(g, 2, 3, 7);
    const r0 = PrimsAlgorithm.primsMST(g, 0);
    const r2 = PrimsAlgorithm.primsMST(g, 2);
    assert(
      r0.totalWeight === r2.totalWeight,
      "MST weight is the same regardless of start node",
    );
  }, "Different start nodes yield same MST total weight");

  // --- Two-node graph ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(2);
    PrimsAlgorithm.addEdge(g, 0, 1, 7);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(result.mstEdges.length === 1, "two-node MST has exactly 1 edge");
    assert(result.totalWeight === 7, "two-node MST total weight is 7");
  }, "Two-node graph: single MST edge");

  // --- Final step totalWeight matches result totalWeight ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 0, 3, 6);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 2, 3, 7);
    const result = PrimsAlgorithm.primsMST(g, 0);
    const lastStep = result.steps[result.steps.length - 1];
    assert(
      lastStep.totalWeight === result.totalWeight,
      "last step totalWeight equals result totalWeight",
    );
  }, "Last step totalWeight matches final result totalWeight");

  // --- Start node is first in visited ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(3);
    PrimsAlgorithm.addEdge(g, 0, 1, 1);
    PrimsAlgorithm.addEdge(g, 1, 2, 2);
    const result = PrimsAlgorithm.primsMST(g, 1);
    const firstVisitStep = result.steps.find((s) => s.type === "visit");
    assert(firstVisitStep !== undefined, "has a visit step");
    assert(
      firstVisitStep.visited.includes(1),
      "start node 1 is in visited after first visit step",
    );
  }, "Start node is visited first");

  // --- All nodes visited in connected graph ---
  it(() => {
    const g = PrimsAlgorithm.createGraph(4);
    PrimsAlgorithm.addEdge(g, 0, 1, 2);
    PrimsAlgorithm.addEdge(g, 1, 2, 3);
    PrimsAlgorithm.addEdge(g, 2, 3, 1);
    const result = PrimsAlgorithm.primsMST(g, 0);
    assert(result.mstEdges.length === 3, "connected 4-node MST has 3 edges");
    // All 4 nodes should be in visited after algorithm completes
    const lastVisitStep = [...result.steps]
      .reverse()
      .find((s) => s.type === "visit");
    assert(lastVisitStep !== undefined, "has visit steps");
    assert(
      lastVisitStep.visited.length === 4,
      "all 4 nodes visited in connected graph",
    );
  }, "All nodes visited in connected graph");

  // --- MAX_VERTICES enforced by buildAlgoGraph callers (boundary check) ---
  it(() => {
    // Verify MAX_VERTICES is exported and is a positive integer <= 20
    const max = PrimsAlgorithm.MAX_VERTICES;
    assert(typeof max === "number", "MAX_VERTICES is a number");
    assert(max > 0, "MAX_VERTICES is positive");
    assert(max <= 20, "MAX_VERTICES is at most 20 (reasonable upper bound)");
    assert(Number.isInteger(max), "MAX_VERTICES is an integer");
  }, "MAX_VERTICES is exported and within valid range");
});
