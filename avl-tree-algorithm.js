/**
 * AVL Tree Algorithm
 *
 * Pure functions — no DOM dependency.
 * Self-balancing BST with LL, RR, LR, RL rotation tracking.
 */
var AVLAlgorithm = (function () {
  "use strict";

  /**
   * Create a new AVL node.
   * @param {number} value
   * @returns {{ value: number, left: null, right: null, height: number }}
   */
  function createNode(value) {
    return { value: value, left: null, right: null, height: 1 };
  }

  /**
   * Get the height of a node (0 for null).
   * @param {Object|null} node
   * @returns {number}
   */
  function height(node) {
    return node === null ? 0 : node.height;
  }

  /**
   * Get the balance factor of a node.
   * Positive = left-heavy, negative = right-heavy.
   * @param {Object|null} node
   * @returns {number}
   */
  function balanceFactor(node) {
    if (node === null) return 0;
    return height(node.left) - height(node.right);
  }

  /**
   * Recalculate and update a node's height from its children.
   * @param {Object} node
   */
  function updateHeight(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
  }

  /**
   * Deep copy a node and its subtree (for step snapshots).
   * @param {Object|null} node
   * @returns {Object|null}
   */
  function deepCopy(node) {
    if (node === null) return null;
    return {
      value: node.value,
      height: node.height,
      left: deepCopy(node.left),
      right: deepCopy(node.right),
    };
  }

  /**
   * Right rotation (LL case).
   *   y                x
   *  / \             /   \
   * x   T3   =>   T1     y
   * / \                  / \
   * T1  T2             T2   T3
   * @param {Object} y
   * @returns {Object} new root (x)
   */
  function rotateRight(y) {
    var x = y.left;
    var T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);

    return x;
  }

  /**
   * Left rotation (RR case).
   *   x                  y
   *  / \               /   \
   * T1   y    =>      x    T3
   *     / \          / \
   *    T2  T3       T1  T2
   * @param {Object} x
   * @returns {Object} new root (y)
   */
  function rotateLeft(x) {
    var y = x.right;
    var T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);

    return y;
  }

  /**
   * Rebalance a node after insert/delete. Returns new root of subtree.
   * Also pushes a rotation step if a rotation was performed.
   * @param {Object} node
   * @param {Array} steps
   * @returns {Object} (possibly new) root of subtree
   */
  function rebalance(node, steps) {
    updateHeight(node);
    var bf = balanceFactor(node);

    // LL case: left-heavy, left child is left-heavy or balanced
    if (bf > 1 && balanceFactor(node.left) >= 0) {
      steps.push({
        type: "rotate-ll",
        imbalancedNode: node.value,
        rotation: "LL",
        explanation:
          "Node " +
          node.value +
          " is left-heavy (balance factor " +
          bf +
          "). Performing LL (right) rotation.",
        root: null, // will be filled after rotation
      });
      var newRoot = rotateRight(node);
      steps[steps.length - 1].root = deepCopy(newRoot);
      return newRoot;
    }

    // RR case: right-heavy, right child is right-heavy or balanced
    if (bf < -1 && balanceFactor(node.right) <= 0) {
      steps.push({
        type: "rotate-rr",
        imbalancedNode: node.value,
        rotation: "RR",
        explanation:
          "Node " +
          node.value +
          " is right-heavy (balance factor " +
          bf +
          "). Performing RR (left) rotation.",
        root: null,
      });
      newRoot = rotateLeft(node);
      steps[steps.length - 1].root = deepCopy(newRoot);
      return newRoot;
    }

    // LR case: left-heavy, left child is right-heavy
    if (bf > 1 && balanceFactor(node.left) < 0) {
      steps.push({
        type: "rotate-lr",
        imbalancedNode: node.value,
        rotation: "LR",
        explanation:
          "Node " +
          node.value +
          " is left-heavy with right-heavy left child. Performing LR double rotation.",
        root: null,
      });
      node.left = rotateLeft(node.left);
      newRoot = rotateRight(node);
      steps[steps.length - 1].root = deepCopy(newRoot);
      return newRoot;
    }

    // RL case: right-heavy, right child is left-heavy
    if (bf < -1 && balanceFactor(node.right) > 0) {
      steps.push({
        type: "rotate-rl",
        imbalancedNode: node.value,
        rotation: "RL",
        explanation:
          "Node " +
          node.value +
          " is right-heavy with left-heavy right child. Performing RL double rotation.",
        root: null,
      });
      node.right = rotateRight(node.right);
      newRoot = rotateLeft(node);
      steps[steps.length - 1].root = deepCopy(newRoot);
      return newRoot;
    }

    // Balanced
    return node;
  }

  /**
   * Internal recursive insert. Returns new root of subtree.
   * @param {Object|null} node
   * @param {number} value
   * @param {Array} steps
   * @returns {Object}
   */
  function insertNode(node, value, steps) {
    if (node === null) {
      var newNode = createNode(value);
      steps.push({
        type: "insert",
        imbalancedNode: null,
        rotation: null,
        explanation: "Inserted node " + value + " into the tree.",
        root: null, // filled by caller after full insert
      });
      return newNode;
    }

    if (value < node.value) {
      node.left = insertNode(node.left, value, steps);
    } else if (value > node.value) {
      node.right = insertNode(node.right, value, steps);
    } else {
      // Duplicate: no insert
      steps.push({
        type: "insert",
        imbalancedNode: null,
        rotation: null,
        explanation: "Value " + value + " already exists in the tree.",
        root: null,
      });
      return node;
    }

    return rebalance(node, steps);
  }

  /**
   * Insert a value into the AVL tree.
   * @param {Object|null} root
   * @param {number} value
   * @returns {{ root: Object|null, steps: Array }}
   */
  function insert(root, value) {
    var steps = [];
    var newRoot = insertNode(root, value, steps);

    // Fill root snapshots for all steps that still have null root
    var rootSnapshot = deepCopy(newRoot);
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].root === null) {
        steps[i].root = rootSnapshot;
      }
    }

    // Add a final "balanced" step showing the complete tree
    steps.push({
      type: "balanced",
      imbalancedNode: null,
      rotation: null,
      explanation: "Tree is balanced. All balance factors are -1, 0, or 1.",
      root: rootSnapshot,
    });

    return { root: newRoot, steps: steps };
  }

  /**
   * Find the minimum node in a subtree.
   * @param {Object} node
   * @returns {Object}
   */
  function minNode(node) {
    var current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  /**
   * Internal recursive delete. Returns new root of subtree.
   * @param {Object|null} node
   * @param {number} value
   * @param {Array} steps
   * @returns {Object|null}
   */
  function deleteNodeHelper(node, value, steps) {
    if (node === null) {
      steps.push({
        type: "delete",
        imbalancedNode: null,
        rotation: null,
        explanation: "Value " + value + " not found in the tree.",
        root: null,
      });
      return null;
    }

    if (value < node.value) {
      node.left = deleteNodeHelper(node.left, value, steps);
    } else if (value > node.value) {
      node.right = deleteNodeHelper(node.right, value, steps);
    } else {
      // Found node to delete
      if (node.left === null || node.right === null) {
        var child = node.left !== null ? node.left : node.right;
        steps.push({
          type: "delete",
          imbalancedNode: null,
          rotation: null,
          explanation: "Removed node " + value + ".",
          root: null,
        });
        node = child;
      } else {
        // Two children: replace with inorder successor
        var successor = minNode(node.right);
        steps.push({
          type: "delete",
          imbalancedNode: null,
          rotation: null,
          explanation:
            "Replaced node " +
            value +
            " with inorder successor " +
            successor.value +
            ".",
          root: null,
        });
        node.value = successor.value;
        node.right = deleteNodeHelper(node.right, successor.value, steps);
      }
    }

    if (node === null) return null;
    return rebalance(node, steps);
  }

  /**
   * Delete a value from the AVL tree.
   * @param {Object|null} root
   * @param {number} value
   * @returns {{ root: Object|null, steps: Array }}
   */
  function deleteNode(root, value) {
    var steps = [];
    var newRoot = deleteNodeHelper(root, value, steps);

    var rootSnapshot = deepCopy(newRoot);
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].root === null) {
        steps[i].root = rootSnapshot;
      }
    }

    steps.push({
      type: "balanced",
      imbalancedNode: null,
      rotation: null,
      explanation:
        newRoot === null
          ? "Tree is now empty."
          : "Tree is balanced after deletion.",
      root: rootSnapshot,
    });

    return { root: newRoot, steps: steps };
  }

  /**
   * Count nodes in the tree.
   * @param {Object|null} root
   * @returns {number}
   */
  function size(root) {
    if (root === null) return 0;
    return 1 + size(root.left) + size(root.right);
  }

  /**
   * Compute layout positions for tree nodes (for SVG rendering).
   * @param {Object|null} root
   * @param {number} width
   * @param {number} verticalSpacing
   * @returns {{ nodes: Array, edges: Array }}
   */
  function getLayout(root, width, verticalSpacing) {
    width = width || 700;
    verticalSpacing = verticalSpacing || 75;
    var topPadding = 40;

    var nodes = [];
    var edges = [];

    if (root === null) {
      return { nodes: nodes, edges: edges };
    }

    function layoutNode(node, x, y, spread) {
      if (node === null) return;

      nodes.push({
        value: node.value,
        x: x,
        y: y,
        balanceFactor: balanceFactor(node),
        height: node.height,
      });

      var childY = y + verticalSpacing;
      var childSpread = Math.max(spread / 2, 20);

      if (node.left !== null) {
        var leftX = x - childSpread;
        edges.push({ fromX: x, fromY: y, toX: leftX, toY: childY });
        layoutNode(node.left, leftX, childY, childSpread);
      }

      if (node.right !== null) {
        var rightX = x + childSpread;
        edges.push({ fromX: x, fromY: y, toX: rightX, toY: childY });
        layoutNode(node.right, rightX, childY, childSpread);
      }
    }

    layoutNode(root, width / 2, topPadding, width / 4);

    return { nodes: nodes, edges: edges };
  }

  /**
   * Validate that all nodes in the tree have balance factors in {-1, 0, 1}.
   * @param {Object|null} root
   * @returns {boolean}
   */
  function isBalanced(root) {
    if (root === null) return true;
    var bf = balanceFactor(root);
    if (bf < -1 || bf > 1) return false;
    return isBalanced(root.left) && isBalanced(root.right);
  }

  return {
    createNode: createNode,
    height: height,
    balanceFactor: balanceFactor,
    updateHeight: updateHeight,
    rotateRight: rotateRight,
    rotateLeft: rotateLeft,
    insert: insert,
    deleteNode: deleteNode,
    getLayout: getLayout,
    size: size,
    isBalanced: isBalanced,
  };
})();

// Node.js module export (for test runner)
if (typeof module !== "undefined" && module.exports) {
  module.exports = AVLAlgorithm;
}
