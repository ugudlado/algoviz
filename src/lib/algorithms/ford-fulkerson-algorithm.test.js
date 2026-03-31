/**
 * Tests for Ford-Fulkerson (Edmonds-Karp) max-flow algorithm.
 */
const FordFulkersonAlgorithm = require("./ford-fulkerson-algorithm.js");

describe("ford fulkerson algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }
  // --- maxFlow tests ---

  it("simple 2-node (S→T cap 5): max flow = 5", function () {
    var graph = { S: { T: 5 }, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    assertEqual(result.flow, 5, "max flow should be 5");
  });

  it("diamond graph: max flow = 5", function () {
    // S→A cap 3, S→B cap 2, A→T cap 2, B→T cap 3, A→B cap 1
    // Path 1: S→A→T, bottleneck = min(3,2) = 2. Residual: S→A=1, A→T=0
    // Path 2: S→A→B→T, bottleneck = min(1,1,3) = 1. Residual: S→A=0, A→B=0, B→T=2
    // Path 3: S→B→T, bottleneck = min(2,2) = 2. Residual: S→B=0
    // Total max flow = 2 + 1 + 2 = 5
    var graph = {
      S: { A: 3, B: 2 },
      A: { T: 2, B: 1 },
      B: { T: 3 },
      T: {},
    };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    assertEqual(result.flow, 5, "diamond max flow should be 5");
  });

  it("no path from S to T: max flow = 0", function () {
    var graph = { S: { A: 10 }, A: {}, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    assertEqual(result.flow, 0, "max flow should be 0 when no path");
  });

  it("parallel paths: max flow = sum of capacities", function () {
    // S→T via two parallel paths, no cross edges
    var graph = {
      S: { A: 5, B: 3 },
      A: { T: 5 },
      B: { T: 3 },
      T: {},
    };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    assertEqual(result.flow, 8, "parallel paths max flow should be 8");
  });

  it("single edge bottleneck: max flow limited by smallest cap", function () {
    var graph = {
      S: { A: 100 },
      A: { B: 1 },
      B: { T: 100 },
      T: {},
    };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    assertEqual(result.flow, 1, "bottleneck of 1 should limit max flow to 1");
  });

  it("classic 6-node preset: max flow = 23", function () {
    var preset = FordFulkersonAlgorithm.PRESETS.classic;
    var result = FordFulkersonAlgorithm.maxFlow(
      preset.graph,
      preset.source,
      preset.sink,
    );
    assertEqual(
      result.flow,
      preset.expectedMaxFlow,
      "classic preset max flow should be 23",
    );
  });

  it("bipartite preset: max flow = 3", function () {
    var preset = FordFulkersonAlgorithm.PRESETS.bipartite;
    var result = FordFulkersonAlgorithm.maxFlow(
      preset.graph,
      preset.source,
      preset.sink,
    );
    assertEqual(
      result.flow,
      preset.expectedMaxFlow,
      "bipartite max flow should be 3",
    );
  });

  it("simple preset: max flow = 5", function () {
    var preset = FordFulkersonAlgorithm.PRESETS.simple;
    var result = FordFulkersonAlgorithm.maxFlow(
      preset.graph,
      preset.source,
      preset.sink,
    );
    assertEqual(
      result.flow,
      preset.expectedMaxFlow,
      "simple preset max flow should be 5",
    );
  });

  // --- min-cut tests ---

  it("min-cut edges are correctly identified: source on S-side, sink on T-side", function () {
    var graph = {
      S: { A: 2, B: 2 },
      A: { T: 2 },
      B: { T: 2 },
      T: {},
    };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    // Min-cut edges must separate S from T
    var cutEdges = result.minCut.edges;
    assert(cutEdges.length > 0, "min-cut should have at least one edge");
    // Verify that all cut edges go from sideS to sideT
    var sideS = result.minCut.sideS;
    var sideT = result.minCut.sideT;
    cutEdges.forEach(function (edge) {
      assert(
        sideS.indexOf(edge.from) !== -1,
        "cut edge 'from' should be in S-side: " + edge.from,
      );
      assert(
        sideT.indexOf(edge.to) !== -1,
        "cut edge 'to' should be in T-side: " + edge.to,
      );
    });
    // Source should be on S-side, sink on T-side
    assert(sideS.indexOf("S") !== -1, "source should be on S-side");
    assert(sideT.indexOf("T") !== -1, "sink should be on T-side");
  });

  it("min-cut capacity equals max flow (max-flow min-cut theorem)", function () {
    // Simple graph where cut capacity is clear
    var graph = {
      S: { A: 2, B: 2 },
      A: { T: 2 },
      B: { T: 2 },
      T: {},
    };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    // Sum capacities of min-cut edges from original graph
    var cutCapacity = 0;
    result.minCut.edges.forEach(function (edge) {
      cutCapacity += graph[edge.from][edge.to];
    });
    assertEqual(
      cutCapacity,
      result.flow,
      "min-cut capacity should equal max flow",
    );
  });

  // --- steps tests ---

  it("steps array is non-empty", function () {
    var graph = { S: { T: 5 }, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    assert(Array.isArray(result.steps), "steps should be an array");
    assert(result.steps.length > 0, "steps should not be empty");
  });

  it("last step is always type 'done'", function () {
    var graph = { S: { A: 3 }, A: { T: 3 }, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    var last = result.steps[result.steps.length - 1];
    assertEqual(last.type, "done", "last step should be done");
  });

  it("steps contain bfs-path-found when path exists", function () {
    var graph = { S: { T: 5 }, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    var pathSteps = result.steps.filter(function (s) {
      return s.type === "bfs-path-found";
    });
    assert(
      pathSteps.length > 0,
      "should have at least one bfs-path-found step",
    );
    assert(
      Array.isArray(pathSteps[0].path),
      "bfs-path-found step should have path array",
    );
  });

  it("steps contain augment steps when flow is pushed", function () {
    var graph = { S: { T: 5 }, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    var augmentSteps = result.steps.filter(function (s) {
      return s.type === "augment";
    });
    assert(augmentSteps.length > 0, "should have at least one augment step");
    assertEqual(
      augmentSteps[0].bottleneck,
      5,
      "bottleneck should be 5 for direct S→T edge",
    );
  });

  it("steps have required fields", function () {
    var graph = { S: { T: 3 }, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    result.steps.forEach(function (step, i) {
      assert(typeof step.type === "string", "step " + i + " needs type");
      assert(
        typeof step.description === "string",
        "step " + i + " needs description",
      );
      assert(
        typeof step.totalFlow === "number",
        "step " + i + " needs totalFlow",
      );
      assert(
        typeof step.bottleneck === "number",
        "step " + i + " needs bottleneck",
      );
      assert(
        typeof step.residual === "object",
        "step " + i + " needs residual",
      );
    });
  });

  it("no path: steps contain bfs-no-path step", function () {
    var graph = { S: { A: 10 }, A: {}, T: {} };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    var noPathSteps = result.steps.filter(function (s) {
      return s.type === "bfs-no-path";
    });
    assert(
      noPathSteps.length > 0,
      "should have bfs-no-path step when no augmenting path",
    );
  });

  it("totalFlow in augment steps is monotonically increasing", function () {
    var graph = {
      S: { A: 3, B: 2 },
      A: { T: 3 },
      B: { T: 2 },
      T: {},
    };
    var result = FordFulkersonAlgorithm.maxFlow(graph, "S", "T");
    var augmentSteps = result.steps.filter(function (s) {
      return s.type === "augment";
    });
    for (var i = 1; i < augmentSteps.length; i++) {
      assert(
        augmentSteps[i].totalFlow >= augmentSteps[i - 1].totalFlow,
        "totalFlow should be non-decreasing across augment steps",
      );
    }
  });

  // --- buildResidual tests ---

  it("buildResidual creates reverse edges with 0 capacity", function () {
    var graph = { S: { T: 5 }, T: {} };
    var residual = FordFulkersonAlgorithm.buildResidual(graph);
    assertEqual(residual["S"]["T"], 5, "forward edge should have capacity 5");
    assertEqual(residual["T"]["S"], 0, "reverse edge should start at 0");
  });
});
