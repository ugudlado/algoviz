/**
 * Kruskal's MST Algorithm — Tests
 */
var KruskalAlgorithm =
  typeof require !== "undefined"
    ? require("./kruskal-algorithm.js")
    : globalThis.KruskalAlgorithm;

describe("kruskal algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  it("builds correct MSTs and emits expected step traces", function () {
    // Arrange / Act / Assert (grouped by scenario below)

  // --- Basic triangle graph ---
  var r1 = KruskalAlgorithm.findMST(3, [
    { u: 0, v: 1, w: 1 },
    { u: 1, v: 2, w: 2 },
    { u: 0, v: 2, w: 3 },
  ]);
  assert(r1.totalWeight === 3, "triangle graph MST weight is 3");
  assert(r1.mstEdges.length === 2, "triangle graph MST has 2 edges");

  // --- Single node ---
  var r2 = KruskalAlgorithm.findMST(1, []);
  assert(r2.totalWeight === 0, "single node MST weight is 0");
  assert(r2.mstEdges.length === 0, "single node MST has 0 edges");

  // --- Two nodes ---
  var r3 = KruskalAlgorithm.findMST(2, [{ u: 0, v: 1, w: 5 }]);
  assert(r3.totalWeight === 5, "two-node MST weight is 5");
  assert(r3.mstEdges.length === 1, "two-node MST has 1 edge");

  // --- Square graph with diagonal ---
  // 0--1--2--3 with diagonal 0--3
  var r4 = KruskalAlgorithm.findMST(4, [
    { u: 0, v: 1, w: 1 },
    { u: 1, v: 2, w: 4 },
    { u: 2, v: 3, w: 2 },
    { u: 0, v: 3, w: 3 },
    { u: 1, v: 3, w: 5 },
  ]);
  assert(r4.totalWeight === 6, "square graph MST weight is 6");
  assert(r4.mstEdges.length === 3, "square graph MST has n-1=3 edges");

  // --- Disconnected graph ---
  var r5 = KruskalAlgorithm.findMST(4, [
    { u: 0, v: 1, w: 1 },
    { u: 2, v: 3, w: 2 },
  ]);
  assert(r5.totalWeight === 3, "disconnected graph: forest weight is 3");
  assert(r5.mstEdges.length === 2, "disconnected graph: 2 edges in forest");

  // --- All equal weights ---
  var r6 = KruskalAlgorithm.findMST(3, [
    { u: 0, v: 1, w: 5 },
    { u: 1, v: 2, w: 5 },
    { u: 0, v: 2, w: 5 },
  ]);
  assert(r6.totalWeight === 10, "equal weights MST is 10");
  assert(r6.mstEdges.length === 2, "equal weights MST has 2 edges");

  // --- No edges ---
  var r7 = KruskalAlgorithm.findMST(3, []);
  assert(r7.totalWeight === 0, "no edges MST weight is 0");
  assert(r7.mstEdges.length === 0, "no edges MST has 0 edges");

  // --- Larger graph (6 nodes) ---
  var r8 = KruskalAlgorithm.findMST(6, [
    { u: 0, v: 1, w: 4 },
    { u: 0, v: 2, w: 4 },
    { u: 1, v: 2, w: 2 },
    { u: 2, v: 3, w: 3 },
    { u: 3, v: 4, w: 3 },
    { u: 4, v: 5, w: 1 },
    { u: 3, v: 5, w: 2 },
    { u: 1, v: 4, w: 5 },
  ]);
  assert(r8.totalWeight === 12, "6-node graph MST weight is 12");
  assert(r8.mstEdges.length === 5, "6-node graph MST has 5 edges");

  // --- Does not mutate input ---
  var edges = [
    { u: 0, v: 1, w: 3 },
    { u: 1, v: 2, w: 1 },
  ];
  var edgesCopy = JSON.parse(JSON.stringify(edges));
  KruskalAlgorithm.findMST(3, edges);
  assert(
    JSON.stringify(edges) === JSON.stringify(edgesCopy),
    "does not mutate input edges",
  );

  // --- Step structure ---
  var r9 = KruskalAlgorithm.findMST(3, [
    { u: 0, v: 1, w: 1 },
    { u: 1, v: 2, w: 2 },
    { u: 0, v: 2, w: 3 },
  ]);
  assert(Array.isArray(r9.steps), "steps is an array");
  assert(r9.steps.length > 0, "steps non-empty for non-trivial graph");

  // Check step phases
  var phases = {};
  r9.steps.forEach(function (s) {
    phases[s.phase] = true;
  });
  assert(phases.sort === true, "steps include sort phase");
  assert(phases.consider === true, "steps include consider phase");

  // Step metadata
  var s0 = r9.steps[0];
  assert(typeof s0.phase === "string", "step has phase");
  assert(typeof s0.explanation === "string", "step has explanation");
  assert(Array.isArray(s0.mstEdges), "step has mstEdges array");
  assert(typeof s0.totalWeight === "number", "step has totalWeight");

  // --- MST edges are sorted by weight ---
  var edgeWeights = r9.mstEdges.map(function (e) {
    return e.w;
  });
  var isSorted = true;
  for (var i = 1; i < edgeWeights.length; i++) {
    if (edgeWeights[i] < edgeWeights[i - 1]) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, "MST edges are added in weight order");

  // --- Empty graph produces minimal steps ---
  var r10 = KruskalAlgorithm.findMST(1, []);
  assert(r10.steps.length === 0, "single node produces zero steps");

  // --- Cycle detection works ---
  // 4 nodes: 0-1(1), 0-2(2), 1-2(3), 2-3(4) — edge 1-2(3) rejected (cycle)
  var r11 = KruskalAlgorithm.findMST(4, [
    { u: 0, v: 1, w: 1 },
    { u: 0, v: 2, w: 2 },
    { u: 1, v: 2, w: 3 },
    { u: 2, v: 3, w: 4 },
  ]);
  var rejected = r11.steps.filter(function (s) {
    return s.phase === "consider" && s.accepted === false;
  });
  assert(rejected.length === 1, "one edge rejected for creating a cycle");
    assert(
      rejected[0].edge.u === 1 && rejected[0].edge.v === 2,
      "rejected edge is 1-2 (creates cycle with 0-1 and 0-2)",
    );
  });
});
