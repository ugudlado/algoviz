/**
 * Union-Find (Disjoint Set Union) with Path Compression
 *
 * Pure functions — no DOM dependency.
 * Implements DSU with path compression and union by rank.
 *
 * Path compression: during find(), every node on the path is rerouted
 * directly to the root, flattening the tree for future O(α) lookups.
 *
 * Union by rank: the shorter tree is always placed under the taller tree,
 * keeping trees shallow and find() fast.
 *
 * Real-world uses: connected components in graphs, Kruskal's MST algorithm,
 * network connectivity, percolation problems, image segmentation.
 */
var UnionFindAlgorithm = (function () {
  "use strict";

  /**
   * Maximum number of nodes supported in the visualization.
   * @type {number}
   */
  var MAX_NODES = 16;

  /**
   * Create a new Disjoint Set Union structure for n elements (0..n-1).
   *
   * @param {number} n - number of elements
   * @returns {{ parent: number[], rank: number[] }}
   */
  function createDSU(n) {
    var parent = [];
    var rank = [];
    var i;
    for (i = 0; i < n; i++) {
      parent[i] = i;
      rank[i] = 0;
    }
    return { parent: parent, rank: rank };
  }

  /**
   * Find the root of element x with path compression.
   * Records each node visited and whether its parent was compressed.
   *
   * @param {{ parent: number[], rank: number[] }} dsu
   * @param {number} x
   * @param {Array} steps - array to push step snapshots into
   * @returns {number} root of x's component
   */
  function find(dsu, x, steps) {
    var parent = dsu.parent;
    var path = [];
    var current = x;

    // Walk up to root, collecting the path
    while (parent[current] !== current) {
      path.push(current);
      current = parent[current];
    }
    var root = current;

    // Path compression: point all nodes on path directly to root
    var i;
    for (i = 0; i < path.length; i++) {
      var node = path[i];
      var parentBefore = parent[node];
      var compressed = parentBefore !== root;
      parent[node] = root;

      steps.push({
        type: "find",
        node: node,
        parentBefore: parentBefore,
        parentAfter: root,
        rootFound: root,
        pathCompressed: compressed,
        componentCount: getComponentCount(dsu),
      });
    }

    // Always record at least one step (for the root itself, or single-element case)
    if (path.length === 0) {
      steps.push({
        type: "find",
        node: x,
        parentBefore: parent[x],
        parentAfter: parent[x],
        rootFound: root,
        pathCompressed: false,
        componentCount: getComponentCount(dsu),
      });
    }

    return root;
  }

  /**
   * Union the components containing x and y, using union by rank.
   * Records a step snapshot.
   *
   * @param {{ parent: number[], rank: number[] }} dsu
   * @param {number} x
   * @param {number} y
   * @param {Array} steps - array to push step snapshots into
   * @returns {boolean} true if the union merged two distinct components
   */
  function union(dsu, x, y, steps) {
    var parentBefore = dsu.parent.slice();
    var findSteps = [];
    var rx = find(dsu, x, findSteps);
    var ry = find(dsu, y, findSteps);

    var merged = false;

    if (rx !== ry) {
      // Union by rank: attach smaller rank tree under larger rank tree
      if (dsu.rank[rx] < dsu.rank[ry]) {
        dsu.parent[rx] = ry;
      } else if (dsu.rank[rx] > dsu.rank[ry]) {
        dsu.parent[ry] = rx;
      } else {
        // Equal rank: make rx the root and increment its rank
        dsu.parent[ry] = rx;
        dsu.rank[rx]++;
      }
      merged = true;
    }

    steps.push({
      type: "union",
      args: { x: x, y: y },
      rootX: rx,
      rootY: ry,
      parentBefore: parentBefore,
      parentAfter: dsu.parent.slice(),
      merged: merged,
      componentCount: getComponentCount(dsu),
    });

    return merged;
  }

  /**
   * Check whether x and y are in the same component.
   *
   * @param {{ parent: number[], rank: number[] }} dsu
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  function connected(dsu, x, y) {
    var rx = find(dsu, x, []);
    var ry = find(dsu, y, []);
    return rx === ry;
  }

  /**
   * Count the number of distinct components (nodes that are their own root).
   *
   * @param {{ parent: number[], rank: number[] }} dsu
   * @returns {number}
   */
  function getComponentCount(dsu) {
    var count = 0;
    var i;
    for (i = 0; i < dsu.parent.length; i++) {
      if (dsu.parent[i] === i) {
        count++;
      }
    }
    return count;
  }

  /**
   * Run a list of operations on a fresh DSU of n elements, returning
   * step-by-step snapshots for visualization.
   *
   * @param {number} n - number of elements
   * @param {Array<{type: 'union'|'find'|'connected', x: number, y?: number}>} operations
   * @returns {{
   *   finalDsu: { parent: number[], rank: number[] },
   *   steps: Array
   * }}
   */
  function runOperations(n, operations) {
    var dsu = createDSU(n);
    var steps = [];
    var i;

    for (i = 0; i < operations.length; i++) {
      var op = operations[i];
      if (op.type === "union") {
        union(dsu, op.x, op.y, steps);
      } else if (op.type === "find") {
        find(dsu, op.x, steps);
      } else if (op.type === "connected") {
        // Record a connected query as a find step pair
        var findSteps = [];
        var rx = find(dsu, op.x, findSteps);
        var ry = find(dsu, op.y, findSteps);
        steps.push({
          type: "connected",
          args: { x: op.x, y: op.y },
          rootX: rx,
          rootY: ry,
          result: rx === ry,
          parentBefore: dsu.parent.slice(),
          parentAfter: dsu.parent.slice(),
          pathCompressed: false,
          componentCount: getComponentCount(dsu),
        });
      }
    }

    return {
      finalDsu: dsu,
      steps: steps,
    };
  }

  return {
    MAX_NODES: MAX_NODES,
    createDSU: createDSU,
    find: find,
    union: union,
    connected: connected,
    getComponentCount: getComponentCount,
    runOperations: runOperations,
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = UnionFindAlgorithm;
}

