// @ts-nocheck
/**
 * Tarjan's Strongly Connected Components Algorithm
 *
 * Pure functions — no DOM dependency.
 * Finds all SCCs in a directed graph using DFS with discovery/low-link values.
 */
var TarjanAlgorithm = (function () {
  "use strict";

  /**
   * Find all SCCs in a directed graph.
   * @param {string[]} nodes - array of node IDs
   * @param {{from: string, to: string}[]} edges - array of directed edges
   * @returns {string[][]} array of SCCs, each SCC is an array of node IDs
   */
  function findSCCs(nodes, edges) {
    var index = 0;
    var stack = [];
    var onStack = {};
    var disc = {};
    var low = {};
    var visited = {};
    var sccs = [];

    // Build adjacency list
    var adj = {};
    nodes.forEach(function (n) {
      adj[n] = [];
    });
    edges.forEach(function (e) {
      if (adj[e.from]) {
        adj[e.from].push(e.to);
      }
    });

    function strongConnect(v) {
      disc[v] = index;
      low[v] = index;
      index++;
      visited[v] = true;
      stack.push(v);
      onStack[v] = true;

      var neighbors = adj[v] || [];
      for (var i = 0; i < neighbors.length; i++) {
        var w = neighbors[i];
        if (!visited[w]) {
          strongConnect(w);
          low[v] = Math.min(low[v], low[w]);
        } else if (onStack[w]) {
          low[v] = Math.min(low[v], disc[w]);
        }
      }

      // If v is a root node, pop SCC
      if (low[v] === disc[v]) {
        var scc = [];
        var node;
        do {
          node = stack.pop();
          onStack[node] = false;
          scc.push(node);
        } while (node !== v);
        sccs.push(scc);
      }
    }

    nodes.forEach(function (n) {
      if (!visited[n]) {
        strongConnect(n);
      }
    });

    return sccs;
  }

  /**
   * Generate step-by-step trace of Tarjan's algorithm.
   * @param {string[]} nodes - array of node IDs
   * @param {{from: string, to: string}[]} edges - array of directed edges
   * @returns {Object[]} array of step objects
   */
  function generateSteps(nodes, edges) {
    var index = 0;
    var stack = [];
    var onStack = {};
    var disc = {};
    var low = {};
    var visited = {};
    var sccs = [];
    var steps = [];

    // Build adjacency list
    var adj = {};
    nodes.forEach(function (n) {
      adj[n] = [];
    });
    edges.forEach(function (e) {
      if (adj[e.from]) {
        adj[e.from].push(e.to);
      }
    });

    function copyMaps() {
      var d = {};
      var l = {};
      Object.keys(disc).forEach(function (k) {
        d[k] = disc[k];
      });
      Object.keys(low).forEach(function (k) {
        l[k] = low[k];
      });
      return { discoveryTime: d, lowLink: l };
    }

    function copySccs() {
      return sccs.map(function (s) {
        return s.slice();
      });
    }

    function strongConnect(v) {
      disc[v] = index;
      low[v] = index;
      index++;
      visited[v] = true;
      stack.push(v);
      onStack[v] = true;

      var maps = copyMaps();
      steps.push({
        type: "visit",
        nodeId: v,
        discoveryTime: maps.discoveryTime,
        lowLink: maps.lowLink,
        stack: stack.slice(),
        sccs: copySccs(),
        edgeType: "tree",
        description:
          "Visit node " + v + " — discovery=" + disc[v] + ", low=" + low[v],
      });

      steps.push({
        type: "push",
        nodeId: v,
        discoveryTime: maps.discoveryTime,
        lowLink: maps.lowLink,
        stack: stack.slice(),
        sccs: copySccs(),
        edgeType: null,
        description: "Push " + v + " onto stack",
      });

      var neighbors = adj[v] || [];
      for (var i = 0; i < neighbors.length; i++) {
        var w = neighbors[i];
        if (!visited[w]) {
          // Tree edge
          strongConnect(w);
          var prevLow = low[v];
          low[v] = Math.min(low[v], low[w]);
          if (low[v] !== prevLow) {
            var maps2 = copyMaps();
            steps.push({
              type: "lowlink-update",
              nodeId: v,
              discoveryTime: maps2.discoveryTime,
              lowLink: maps2.lowLink,
              stack: stack.slice(),
              sccs: copySccs(),
              edgeType: "tree",
              fromNode: w,
              description:
                "Update low[" +
                v +
                "] = min(low[" +
                v +
                "], low[" +
                w +
                "]) = " +
                low[v],
            });
          }
        } else if (onStack[w]) {
          // Back edge
          var prevLow3 = low[v];
          low[v] = Math.min(low[v], disc[w]);
          var maps3 = copyMaps();
          steps.push({
            type: "lowlink-update",
            nodeId: v,
            discoveryTime: maps3.discoveryTime,
            lowLink: maps3.lowLink,
            stack: stack.slice(),
            sccs: copySccs(),
            edgeType: "back",
            fromNode: v,
            toNode: w,
            description:
              "Back edge " +
              v +
              " → " +
              w +
              ": update low[" +
              v +
              "] = " +
              low[v] +
              (prevLow3 !== low[v] ? " (updated)" : " (no change)"),
          });
        } else {
          // Cross edge — already visited and not on stack
          var maps4 = copyMaps();
          steps.push({
            type: "lowlink-update",
            nodeId: v,
            discoveryTime: maps4.discoveryTime,
            lowLink: maps4.lowLink,
            stack: stack.slice(),
            sccs: copySccs(),
            edgeType: "cross",
            fromNode: v,
            toNode: w,
            description: "Cross edge " + v + " → " + w + " (already in SCC)",
          });
        }
      }

      // If v is a root node, pop SCC
      if (low[v] === disc[v]) {
        var scc = [];
        var node;
        do {
          node = stack.pop();
          onStack[node] = false;
          scc.push(node);
        } while (node !== v);
        sccs.push(scc);
        var maps5 = copyMaps();
        steps.push({
          type: "scc-found",
          nodeId: v,
          discoveryTime: maps5.discoveryTime,
          lowLink: maps5.lowLink,
          stack: stack.slice(),
          sccs: copySccs(),
          sccNodes: scc.slice(),
          edgeType: null,
          description:
            "SCC found! Root " +
            v +
            " has low[" +
            v +
            "] = disc[" +
            v +
            "] = " +
            disc[v] +
            ". SCC: {" +
            scc.join(", ") +
            "}",
        });
      }
    }

    nodes.forEach(function (n) {
      if (!visited[n]) {
        strongConnect(n);
      }
    });

    steps.push({
      type: "done",
      nodeId: null,
      discoveryTime: copyMaps().discoveryTime,
      lowLink: copyMaps().lowLink,
      stack: [],
      sccs: copySccs(),
      edgeType: null,
      description:
        "Done! Found " +
        sccs.length +
        " strongly connected component" +
        (sccs.length !== 1 ? "s" : "") +
        ".",
    });

    return steps;
  }

  /**
   * Preset graph examples for demonstration.
   */
  var PRESETS = {
    classic: {
      name: "Classic 3-SCC (8 nodes)",
      nodes: ["0", "1", "2", "3", "4", "5", "6", "7"],
      edges: [
        { from: "0", to: "1" },
        { from: "1", to: "2" },
        { from: "2", to: "0" },
        { from: "1", to: "3" },
        { from: "3", to: "4" },
        { from: "4", to: "5" },
        { from: "5", to: "3" },
        { from: "4", to: "6" },
        { from: "6", to: "7" },
        { from: "7", to: "6" },
      ],
    },
    simpleCycle: {
      name: "Simple Cycle (all one SCC)",
      nodes: ["A", "B", "C"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "A" },
      ],
    },
    dag: {
      name: "DAG (each node is own SCC)",
      nodes: ["A", "B", "C", "D"],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "C" },
        { from: "B", to: "D" },
        { from: "C", to: "D" },
      ],
    },
  };

  return {
    findSCCs: findSCCs,
    generateSteps: generateSteps,
    PRESETS: PRESETS,
  };
})();

// Allow require() in Node.js test environment

export default TarjanAlgorithm;
