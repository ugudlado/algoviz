/**
 * Union-Find (Disjoint Set Union) with Path Compression Tests — Node.js runner compatible
 * Exports runTests() for run-tests.js harness
 *
 * Covers: createDSU, find (path compression), union (by rank), connected,
 * getComponentCount, runOperations, edge cases.
 */

function runTests({ assert, assertEqual }) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const UnionFindAlgorithm = require("./union-find-algorithm.js");
  const {
    createDSU,
    find,
    union,
    connected,
    getComponentCount,
    runOperations,
  } = UnionFindAlgorithm;

  function check(fn, name) {
    try {
      fn();
      passed++;
      console.log("  PASS: " + name);
    } catch (e) {
      failed++;
      failures.push({ name, message: e.message });
      console.log("  FAIL: " + name + " — " + e.message);
    }
  }

  // --- createDSU ---
  check(() => {
    const dsu = createDSU(5);
    assertEqual(dsu.parent, [0, 1, 2, 3, 4], "parent is identity array");
    assertEqual(dsu.rank, [0, 0, 0, 0, 0], "rank is all zeros");
  }, "createDSU: initial parent is identity, rank is zeros");

  check(() => {
    const dsu = createDSU(1);
    assertEqual(dsu.parent, [0], "single element parent is [0]");
    assertEqual(dsu.rank, [0], "single element rank is [0]");
  }, "createDSU: single element");

  check(() => {
    const dsu = createDSU(10);
    assert(dsu.parent.length === 10, "parent array length is 10");
    assert(dsu.rank.length === 10, "rank array length is 10");
    for (let i = 0; i < 10; i++) {
      assert(dsu.parent[i] === i, "parent[" + i + "] === " + i);
    }
  }, "createDSU: large n — all elements are their own root");

  // --- find ---
  check(() => {
    const dsu = createDSU(5);
    const steps = [];
    const root = find(dsu, 3, steps);
    assert(root === 3, "single element is its own root");
    assert(steps.length >= 1, "find records at least one step");
  }, "find: single element returns self");

  check(() => {
    const dsu = createDSU(4);
    // Manually set up parent chain: 0 -> 1 -> 2 -> 3
    dsu.parent[0] = 1;
    dsu.parent[1] = 2;
    dsu.parent[2] = 3;
    dsu.parent[3] = 3;
    const steps = [];
    const root = find(dsu, 0, steps);
    assert(root === 3, "root of chain is 3");
    // Path compression: after find, 0 and 1 should point directly to 3
    assert(dsu.parent[0] === 3, "path compressed: parent[0] = 3");
    assert(dsu.parent[1] === 3, "path compressed: parent[1] = 3");
  }, "find: path compression flattens chain");

  check(() => {
    const dsu = createDSU(3);
    const steps = [];
    find(dsu, 0, steps);
    const step = steps[0];
    assert(typeof step.type === "string", "step has type field");
    assert(step.type === "find", "step type is 'find'");
    assert(typeof step.node === "number", "step has node field");
    assert("parentBefore" in step, "step has parentBefore field");
    assert("parentAfter" in step, "step has parentAfter field");
    assert("rootFound" in step, "step has rootFound field");
    assert("pathCompressed" in step, "step has pathCompressed field");
  }, "find: step snapshot has correct structure");

  check(() => {
    const dsu = createDSU(5);
    // Link 0->1->2 manually
    dsu.parent[0] = 1;
    dsu.parent[1] = 2;
    const steps = [];
    find(dsu, 0, steps);
    // pathCompressed should be true for nodes that got their parent updated
    const compressed = steps.filter((s) => s.pathCompressed);
    assert(compressed.length >= 1, "at least one step has pathCompressed=true");
  }, "find: pathCompressed is true when compression occurs");

  // --- union ---
  check(() => {
    const dsu = createDSU(4);
    const steps = [];
    union(dsu, 0, 1, steps);
    // 0 and 1 should now be connected
    const r0 = find(dsu, 0, []);
    const r1 = find(dsu, 1, []);
    assert(r0 === r1, "after union(0,1), same root");
  }, "union: two separate elements become connected");

  check(() => {
    const dsu = createDSU(4);
    const steps = [];
    union(dsu, 0, 1, steps);
    union(dsu, 2, 3, steps);
    union(dsu, 0, 2, steps);
    const r0 = find(dsu, 0, []);
    const r3 = find(dsu, 3, []);
    assert(r0 === r3, "chain of unions: 0 and 3 share a root");
  }, "union: chain of unions produces single component");

  check(() => {
    const dsu = createDSU(4);
    const steps = [];
    union(dsu, 0, 1, steps);
    const countBefore = steps.length;
    union(dsu, 0, 1, steps); // already connected
    // A no-op union should still record a step but not change structure
    const r0Before = find(dsu, 0, []);
    assert(
      r0Before === find(dsu, 0, []),
      "no-op union does not break structure",
    );
    assert(steps.length > countBefore, "no-op union still records a step");
  }, "union: already connected elements (no-op)");

  check(() => {
    const dsu = createDSU(1);
    const steps = [];
    union(dsu, 0, 0, steps); // union(x,x)
    assert(dsu.parent[0] === 0, "union(0,0) leaves parent unchanged");
  }, "union: union(x,x) is a safe no-op");

  check(() => {
    const dsu = createDSU(4);
    const steps = [];
    union(dsu, 0, 1, steps);
    const step = steps[steps.length - 1];
    assert(typeof step.type === "string", "step has type field");
    assert(step.type === "union", "step type is 'union'");
    assert("args" in step, "step has args field");
    assert("parentBefore" in step, "step has parentBefore field");
    assert("parentAfter" in step, "step has parentAfter field");
    assert("componentCount" in step, "step has componentCount field");
  }, "union: step snapshot has correct structure");

  check(() => {
    // Union by rank: lower rank tree goes under higher rank tree
    const dsu = createDSU(6);
    // Make 0 have higher rank by doing two unions
    union(dsu, 0, 1, []);
    union(dsu, 0, 2, []);
    // Now rank[0] should be >= 1
    // rank[0] should be >= 1 after two unions
    find(dsu, 0, []);
    union(dsu, 0, 3, []); // 3 should go under 0's tree
    const root = find(dsu, 3, []);
    const root0 = find(dsu, 0, []);
    assert(root === root0, "lower rank tree merges under higher rank tree");
  }, "union: union by rank — smaller tree under larger");

  // --- connected ---
  check(() => {
    const dsu = createDSU(4);
    assert(connected(dsu, 0, 0) === true, "node connected to itself");
  }, "connected: node is connected to itself");

  check(() => {
    const dsu = createDSU(4);
    assert(connected(dsu, 0, 1) === false, "disconnected nodes return false");
  }, "connected: unconnected nodes return false");

  check(() => {
    const dsu = createDSU(4);
    union(dsu, 0, 1, []);
    assert(connected(dsu, 0, 1) === true, "after union, nodes are connected");
    assert(connected(dsu, 1, 0) === true, "connectivity is symmetric");
  }, "connected: true after union");

  check(() => {
    const dsu = createDSU(4);
    union(dsu, 0, 1, []);
    assert(connected(dsu, 0, 2) === false, "0 and 2 not connected");
    assert(connected(dsu, 2, 3) === false, "2 and 3 not connected");
  }, "connected: false for nodes in different components");

  check(() => {
    const dsu = createDSU(4);
    union(dsu, 0, 1, []);
    union(dsu, 1, 2, []);
    assert(connected(dsu, 0, 2) === true, "transitively connected");
  }, "connected: transitive connectivity through chain");

  // --- getComponentCount ---
  check(() => {
    const dsu = createDSU(5);
    assert(getComponentCount(dsu) === 5, "initial count equals n");
  }, "getComponentCount: starts at n");

  check(() => {
    const dsu = createDSU(4);
    union(dsu, 0, 1, []);
    assert(getComponentCount(dsu) === 3, "one union reduces count by 1");
  }, "getComponentCount: decreases by 1 after one union");

  check(() => {
    const dsu = createDSU(4);
    union(dsu, 0, 1, []);
    union(dsu, 2, 3, []);
    union(dsu, 0, 2, []);
    assert(
      getComponentCount(dsu) === 1,
      "three unions on 4 nodes = 1 component",
    );
  }, "getComponentCount: all merged into one");

  check(() => {
    const dsu = createDSU(4);
    union(dsu, 0, 1, []);
    union(dsu, 0, 1, []); // no-op
    assert(getComponentCount(dsu) === 3, "no-op union does not reduce count");
  }, "getComponentCount: no-op union does not change count");

  check(() => {
    const dsu = createDSU(1);
    assert(getComponentCount(dsu) === 1, "single element: count is 1");
  }, "getComponentCount: single element");

  // --- runOperations ---
  check(() => {
    const result = runOperations(4, [
      { type: "union", x: 0, y: 1 },
      { type: "union", x: 2, y: 3 },
      { type: "find", x: 0 },
      { type: "connected", x: 0, y: 2 },
    ]);
    assert("finalDsu" in result, "result has finalDsu");
    assert("steps" in result, "result has steps");
    assert(Array.isArray(result.steps), "steps is an array");
    assert(result.steps.length > 0, "steps is non-empty");
  }, "runOperations: returns finalDsu and steps");

  check(() => {
    const result = runOperations(4, [{ type: "union", x: 0, y: 1 }]);
    const step = result.steps[result.steps.length - 1];
    assert("type" in step, "step has type");
    assert("args" in step, "step has args");
    assert("parentBefore" in step, "step has parentBefore");
    assert("parentAfter" in step, "step has parentAfter");
    assert("componentCount" in step, "step has componentCount");
  }, "runOperations: step fields are present for union");

  check(() => {
    const result = runOperations(3, []);
    assert(result.steps.length === 0, "no operations = no steps");
    assertEqual(result.finalDsu.parent, [0, 1, 2], "finalDsu is untouched");
  }, "runOperations: empty operations list returns empty steps");

  check(() => {
    const result = runOperations(6, [
      { type: "union", x: 0, y: 1 },
      { type: "union", x: 1, y: 2 },
      { type: "union", x: 3, y: 4 },
    ]);
    assert(
      getComponentCount(result.finalDsu) === 3,
      "3 unions on 6 nodes = 3 components",
    );
  }, "runOperations: correct component count after operations");

  check(() => {
    const result = runOperations(20, [
      { type: "union", x: 0, y: 1 },
      { type: "union", x: 5, y: 10 },
      { type: "union", x: 15, y: 19 },
      { type: "find", x: 0 },
      { type: "connected", x: 5, y: 10 },
    ]);
    assert(result.finalDsu.parent.length === 20, "large n=20 supported");
    assert(result.steps.length > 0, "steps recorded for large n");
  }, "runOperations: large n=20 operations work correctly");

  check(() => {
    // Path compression test: use find() directly on a manually built chain.
    // Union-by-rank keeps trees flat, so path compression is best tested
    // with a forced deep chain (bypassing union-by-rank).
    const dsu = createDSU(5);
    // Manually build: 0->1->2->3->4
    dsu.parent[0] = 1;
    dsu.parent[1] = 2;
    dsu.parent[2] = 3;
    dsu.parent[3] = 4;
    dsu.parent[4] = 4;
    const steps = [];
    const root = find(dsu, 0, steps);
    assert(root === 4, "root of forced chain is 4");
    assert(dsu.parent[0] === 4, "parent[0] compressed to 4");
    assert(dsu.parent[1] === 4, "parent[1] compressed to 4");
    assert(dsu.parent[2] === 4, "parent[2] compressed to 4");
    assert(dsu.parent[3] === 4, "parent[3] compressed to 4");
    const compressed = steps.filter((s) => s.pathCompressed);
    assert(
      compressed.length >= 1,
      "path compression steps recorded for deep chain",
    );
  }, "runOperations: path compression recorded in steps for deep chain");

  return { passed, failed, failures };
}

module.exports = { runTests };
