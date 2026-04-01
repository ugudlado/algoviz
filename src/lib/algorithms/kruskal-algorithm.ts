// @ts-nocheck
/**
 * Kruskal's MST Algorithm
 *
 * Pure functions — no DOM dependency.
 * Finds minimum spanning tree using sorted edges + union-find.
 * Records each step for visualization.
 */
var KruskalAlgorithm = (() => {
  "use strict";

  /**
   * Union-Find data structure for cycle detection.
   */
  function createUnionFind(n) {
    var parent = [];
    var rank = [];
    for (var i = 0; i < n; i++) {
      parent.push(i);
      rank.push(0);
    }

    function find(x) {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]]; // path compression
        x = parent[x];
      }
      return x;
    }

    function union(a, b) {
      var rootA = find(a);
      var rootB = find(b);
      if (rootA === rootB) return false;
      if (rank[rootA] < rank[rootB]) {
        parent[rootA] = rootB;
      } else if (rank[rootA] > rank[rootB]) {
        parent[rootB] = rootA;
      } else {
        parent[rootB] = rootA;
        rank[rootA]++;
      }
      return true;
    }

    function connected(a, b) {
      return find(a) === find(b);
    }

    return { find: find, union: union, connected: connected };
  }

  /**
   * Find MST using Kruskal's algorithm.
   *
   * @param {number} numNodes
   * @param {Array<{u: number, v: number, w: number}>} edges
   * @returns {{
   *   steps: Array<{phase: string, edgeIdx: number, edge: {u: number, v: number, w: number}|null, accepted: boolean|null, mstEdges: Array<{u: number, v: number, w: number}>, totalWeight: number, explanation: string}>,
   *   mstEdges: Array<{u: number, v: number, w: number}>,
   *   totalWeight: number
   * }}
   */
  function findMST(numNodes, edges) {
    var sortedEdges = edges.slice().sort(function (a, b) {
      return a.w - b.w;
    });
    var steps = [];
    var mstEdges = [];
    var totalWeight = 0;

    if (numNodes <= 1 || sortedEdges.length === 0) {
      return { steps: steps, mstEdges: mstEdges, totalWeight: 0 };
    }

    // Sort phase step
    steps.push({
      phase: "sort",
      edgeIdx: -1,
      edge: null,
      accepted: null,
      mstEdges: [],
      totalWeight: 0,
      sortedEdges: sortedEdges.map(function (e) {
        return { u: e.u, v: e.v, w: e.w };
      }),
      explanation:
        "Sort all " +
        sortedEdges.length +
        " edges by weight: [" +
        sortedEdges
          .map(function (e) {
            return e.u + "-" + e.v + "(" + e.w + ")";
          })
          .join(", ") +
        "]",
    });

    var uf = createUnionFind(numNodes);

    for (var i = 0; i < sortedEdges.length; i++) {
      var edge = sortedEdges[i];
      var wouldCycle = uf.connected(edge.u, edge.v);

      if (!wouldCycle) {
        uf.union(edge.u, edge.v);
        mstEdges.push({ u: edge.u, v: edge.v, w: edge.w });
        totalWeight += edge.w;

        steps.push({
          phase: "consider",
          edgeIdx: i,
          edge: { u: edge.u, v: edge.v, w: edge.w },
          accepted: true,
          mstEdges: mstEdges.map(function (e) {
            return { u: e.u, v: e.v, w: e.w };
          }),
          totalWeight: totalWeight,
          sortedEdges: sortedEdges.map(function (e) {
            return { u: e.u, v: e.v, w: e.w };
          }),
          explanation:
            "Edge " +
            edge.u +
            "-" +
            edge.v +
            " (weight " +
            edge.w +
            "): accepted \u2014 connects separate components",
        });
      } else {
        steps.push({
          phase: "consider",
          edgeIdx: i,
          edge: { u: edge.u, v: edge.v, w: edge.w },
          accepted: false,
          mstEdges: mstEdges.map(function (e) {
            return { u: e.u, v: e.v, w: e.w };
          }),
          totalWeight: totalWeight,
          sortedEdges: sortedEdges.map(function (e) {
            return { u: e.u, v: e.v, w: e.w };
          }),
          explanation:
            "Edge " +
            edge.u +
            "-" +
            edge.v +
            " (weight " +
            edge.w +
            "): rejected \u2014 would create a cycle",
        });
      }

      // Stop early if MST is complete
      if (mstEdges.length === numNodes - 1) break;
    }

    return { steps: steps, mstEdges: mstEdges, totalWeight: totalWeight };
  }

  return { findMST: findMST };
})();

export default KruskalAlgorithm;
