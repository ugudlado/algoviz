/**
 * Tests for Tarjan's SCC algorithm.
 */
const TarjanAlgorithm = require("./tarjan-algorithm.js");

describe("tarjan algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }
  function sccSizes(sccs) {
    return sccs
      .map(function (s) {
        return s.length;
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function containsNode(sccs, nodeId) {
    return sccs.some(function (scc) {
      return scc.indexOf(nodeId) !== -1;
    });
  }

  function nodesInSameSCC(sccs, a, b) {
    return sccs.some(function (scc) {
      return scc.indexOf(a) !== -1 && scc.indexOf(b) !== -1;
    });
  }

  // --- findSCCs tests ---

  it("empty graph: 0 SCCs", function () {
    var result = TarjanAlgorithm.findSCCs([], []);
    assertEqual(result.length, 0, "should have 0 SCCs");
  });

  it("single node: 1 SCC", function () {
    var result = TarjanAlgorithm.findSCCs(["A"], []);
    assertEqual(result.length, 1, "should have 1 SCC");
    assertEqual(result[0].length, 1, "SCC should contain 1 node");
    assert(result[0][0] === "A", "SCC should contain node A");
  });

  it("simple cycle A→B→C→A: 1 SCC with 3 nodes", function () {
    var nodes = ["A", "B", "C"];
    var edges = [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "A" },
    ];
    var result = TarjanAlgorithm.findSCCs(nodes, edges);
    assertEqual(result.length, 1, "should have 1 SCC");
    assertEqual(result[0].length, 3, "SCC should contain 3 nodes");
    assert(nodesInSameSCC(result, "A", "B"), "A and B should be in same SCC");
    assert(nodesInSameSCC(result, "B", "C"), "B and C should be in same SCC");
  });

  it("DAG A→B→C: 3 SCCs each with 1 node", function () {
    var nodes = ["A", "B", "C"];
    var edges = [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
    ];
    var result = TarjanAlgorithm.findSCCs(nodes, edges);
    assertEqual(result.length, 3, "should have 3 SCCs");
    var sizes = sccSizes(result);
    assertEqual(sizes, [1, 1, 1], "all SCCs should have size 1");
    assert(containsNode(result, "A"), "should contain node A");
    assert(containsNode(result, "B"), "should contain node B");
    assert(containsNode(result, "C"), "should contain node C");
    assert(
      !nodesInSameSCC(result, "A", "B"),
      "A and B should be in different SCCs",
    );
  });

  it("two separate cycles connected by edge: 2 SCCs", function () {
    // Cycle 1: A→B→A, Cycle 2: C→D→C, Bridge: A→C
    var nodes = ["A", "B", "C", "D"];
    var edges = [
      { from: "A", to: "B" },
      { from: "B", to: "A" },
      { from: "A", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "C" },
    ];
    var result = TarjanAlgorithm.findSCCs(nodes, edges);
    assertEqual(result.length, 2, "should have 2 SCCs");
    var sizes = sccSizes(result);
    assertEqual(sizes, [2, 2], "both SCCs should have size 2");
    assert(nodesInSameSCC(result, "A", "B"), "A and B should be in same SCC");
    assert(nodesInSameSCC(result, "C", "D"), "C and D should be in same SCC");
    assert(
      !nodesInSameSCC(result, "A", "C"),
      "A and C should be in different SCCs",
    );
  });

  it("classic 3-SCC example: 3 SCCs", function () {
    var preset = TarjanAlgorithm.PRESETS.classic;
    var result = TarjanAlgorithm.findSCCs(preset.nodes, preset.edges);
    assertEqual(result.length, 3, "should find 3 SCCs");
    // SCC sizes: {0,1,2}=3, {3,4,5}=3, {6,7}=2
    var sizes = sccSizes(result);
    assertEqual(sizes, [2, 3, 3], "should have SCCs of size 2, 3, 3");
    assert(nodesInSameSCC(result, "0", "1"), "0 and 1 should be in same SCC");
    assert(nodesInSameSCC(result, "1", "2"), "1 and 2 should be in same SCC");
    assert(nodesInSameSCC(result, "3", "4"), "3 and 4 should be in same SCC");
    assert(nodesInSameSCC(result, "4", "5"), "4 and 5 should be in same SCC");
    assert(nodesInSameSCC(result, "6", "7"), "6 and 7 should be in same SCC");
    assert(
      !nodesInSameSCC(result, "0", "3"),
      "0 and 3 should be in different SCCs",
    );
  });

  it("DAG preset: 4 SCCs each with 1 node", function () {
    var preset = TarjanAlgorithm.PRESETS.dag;
    var result = TarjanAlgorithm.findSCCs(preset.nodes, preset.edges);
    assertEqual(result.length, 4, "should have 4 SCCs");
    var sizes = sccSizes(result);
    assertEqual(sizes, [1, 1, 1, 1], "all SCCs should have size 1");
  });

  it("self-loop: node in its own SCC of size 1", function () {
    var nodes = ["A"];
    var edges = [{ from: "A", to: "A" }];
    var result = TarjanAlgorithm.findSCCs(nodes, edges);
    assertEqual(result.length, 1, "should have 1 SCC");
    assertEqual(result[0].length, 1, "SCC should contain 1 node");
  });

  // --- generateSteps tests ---

  it("generateSteps: returns steps array", function () {
    var result = TarjanAlgorithm.generateSteps(
      ["A", "B"],
      [{ from: "A", to: "B" }],
    );
    assert(Array.isArray(result), "steps should be an array");
    assert(result.length > 0, "should have at least one step");
  });

  it("generateSteps: last step is done type", function () {
    var nodes = ["A", "B", "C"];
    var edges = [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "A" },
    ];
    var result = TarjanAlgorithm.generateSteps(nodes, edges);
    var last = result[result.length - 1];
    assertEqual(last.type, "done", "last step should be 'done'");
    assertEqual(last.sccs.length, 1, "done step should have 1 SCC");
  });

  it("generateSteps: steps have required fields", function () {
    var nodes = ["A", "B"];
    var edges = [
      { from: "A", to: "B" },
      { from: "B", to: "A" },
    ];
    var result = TarjanAlgorithm.generateSteps(nodes, edges);
    result.forEach(function (step) {
      assert(typeof step.type === "string", "step.type should be string");
      assert(
        typeof step.description === "string",
        "step.description should be string",
      );
      assert(
        typeof step.discoveryTime === "object",
        "step.discoveryTime should be object",
      );
      assert(typeof step.lowLink === "object", "step.lowLink should be object");
      assert(Array.isArray(step.stack), "step.stack should be array");
      assert(Array.isArray(step.sccs), "step.sccs should be array");
    });
  });

  it("generateSteps: scc-found step present for cycle", function () {
    var nodes = ["A", "B", "C"];
    var edges = [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "A" },
    ];
    var result = TarjanAlgorithm.generateSteps(nodes, edges);
    var sccSteps = result.filter(function (s) {
      return s.type === "scc-found";
    });
    assert(sccSteps.length > 0, "should have at least one scc-found step");
    assert(sccSteps[0].sccNodes.length === 3, "scc should have 3 nodes");
  });

  it("generateSteps: empty graph produces only done step", function () {
    var result = TarjanAlgorithm.generateSteps([], []);
    assertEqual(result.length, 1, "should have exactly 1 step (done)");
    assertEqual(result[0].type, "done", "step should be done");
    assertEqual(result[0].sccs.length, 0, "no SCCs");
  });
});
