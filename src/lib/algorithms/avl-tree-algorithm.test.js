/**
 */

describe("avl tree algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

var AVLAlgorithm = require("./avl-tree-algorithm.js");
  // Helper: collect all balance factors from a tree
  function collectBalanceFactors(root) {
    var factors = [];
    function traverse(node) {
      if (node === null) return;
      factors.push(AVLAlgorithm.balanceFactor(node));
      traverse(node.left);
      traverse(node.right);
    }
    traverse(root);
    return factors;
  }

  // Helper: insert sequence and return root
  function buildTree(values) {
    var root = null;
    for (var i = 0; i < values.length; i++) {
      var result = AVLAlgorithm.insert(root, values[i]);
      root = result.root;
    }
    return root;
  }

  // --- createNode ---
  it(function () {
    var node = AVLAlgorithm.createNode(5);
    assertEqual(node.value, 5, "value is 5");
    assertEqual(node.left, null, "left is null");
    assertEqual(node.right, null, "right is null");
    assertEqual(node.height, 1, "height is 1");
  }, "createNode creates node with height 1");

  // --- height ---
  it(function () {
    assertEqual(AVLAlgorithm.height(null), 0, "height(null) is 0");
    var node = AVLAlgorithm.createNode(5);
    assertEqual(AVLAlgorithm.height(node), 1, "height of leaf is 1");
  }, "height returns 0 for null, 1 for leaf");

  // --- balanceFactor ---
  it(function () {
    assertEqual(
      AVLAlgorithm.balanceFactor(null),
      0,
      "balanceFactor(null) is 0",
    );
    var node = AVLAlgorithm.createNode(5);
    assertEqual(
      AVLAlgorithm.balanceFactor(node),
      0,
      "balanceFactor of leaf is 0",
    );
  }, "balanceFactor returns 0 for null and leaf");

  // --- Empty tree insert ---
  it(function () {
    var result = AVLAlgorithm.insert(null, 10);
    assert(result.root !== null, "root is not null after insert");
    assertEqual(result.root.value, 10, "root value is 10");
    assert(Array.isArray(result.steps), "steps is an array");
    assert(result.steps.length > 0, "steps has at least one entry");
  }, "Insert into empty tree");

  // --- Single node ---
  it(function () {
    var result = AVLAlgorithm.insert(null, 42);
    assertEqual(result.root.value, 42, "root value is 42");
    assertEqual(result.root.height, 1, "height is 1");
    assertEqual(
      AVLAlgorithm.balanceFactor(result.root),
      0,
      "balance factor is 0",
    );
  }, "Single node insert: balanced");

  // --- RR case: insert 1,2,3 triggers left rotation ---
  it(function () {
    var root = null;
    root = AVLAlgorithm.insert(root, 1).root;
    root = AVLAlgorithm.insert(root, 2).root;
    var result = AVLAlgorithm.insert(root, 3);
    root = result.root;

    // After RR rotation, root should be 2
    assertEqual(root.value, 2, "RR: new root is 2");
    assertEqual(root.left.value, 1, "RR: left child is 1");
    assertEqual(root.right.value, 3, "RR: right child is 3");

    // Verify a rotation step was recorded
    var rotationSteps = result.steps.filter(function (s) {
      return s.rotation === "RR";
    });
    assert(rotationSteps.length > 0, "RR rotation step recorded");
  }, "RR case (insert 1,2,3): right rotation produces balanced tree");

  // --- LL case: insert 3,2,1 triggers right rotation ---
  it(function () {
    var root = null;
    root = AVLAlgorithm.insert(root, 3).root;
    root = AVLAlgorithm.insert(root, 2).root;
    var result = AVLAlgorithm.insert(root, 1);
    root = result.root;

    // After LL rotation, root should be 2
    assertEqual(root.value, 2, "LL: new root is 2");
    assertEqual(root.left.value, 1, "LL: left child is 1");
    assertEqual(root.right.value, 3, "LL: right child is 3");

    var rotationSteps = result.steps.filter(function (s) {
      return s.rotation === "LL";
    });
    assert(rotationSteps.length > 0, "LL rotation step recorded");
  }, "LL case (insert 3,2,1): left rotation produces balanced tree");

  // --- LR case: insert 3,1,2 triggers LR double rotation ---
  it(function () {
    var root = null;
    root = AVLAlgorithm.insert(root, 3).root;
    root = AVLAlgorithm.insert(root, 1).root;
    var result = AVLAlgorithm.insert(root, 2);
    root = result.root;

    // After LR rotation, root should be 2
    assertEqual(root.value, 2, "LR: new root is 2");
    assertEqual(root.left.value, 1, "LR: left child is 1");
    assertEqual(root.right.value, 3, "LR: right child is 3");

    var rotationSteps = result.steps.filter(function (s) {
      return s.rotation === "LR";
    });
    assert(rotationSteps.length > 0, "LR rotation step recorded");
  }, "LR case (insert 3,1,2): LR double rotation produces balanced tree");

  // --- RL case: insert 1,3,2 triggers RL double rotation ---
  it(function () {
    var root = null;
    root = AVLAlgorithm.insert(root, 1).root;
    root = AVLAlgorithm.insert(root, 3).root;
    var result = AVLAlgorithm.insert(root, 2);
    root = result.root;

    // After RL rotation, root should be 2
    assertEqual(root.value, 2, "RL: new root is 2");
    assertEqual(root.left.value, 1, "RL: left child is 1");
    assertEqual(root.right.value, 3, "RL: right child is 3");

    var rotationSteps = result.steps.filter(function (s) {
      return s.rotation === "RL";
    });
    assert(rotationSteps.length > 0, "RL rotation step recorded");
  }, "RL case (insert 1,3,2): RL double rotation produces balanced tree");

  // --- Sequential inserts 1..7: all balance factors in {-1,0,1} ---
  it(function () {
    var root = null;
    for (var i = 1; i <= 7; i++) {
      root = AVLAlgorithm.insert(root, i).root;
      assert(AVLAlgorithm.isBalanced(root), "Balanced after inserting " + i);
      var factors = collectBalanceFactors(root);
      for (var j = 0; j < factors.length; j++) {
        assert(
          factors[j] >= -1 && factors[j] <= 1,
          "Balance factor in range after insert " +
            i +
            ", factor=" +
            factors[j],
        );
      }
    }
    assertEqual(AVLAlgorithm.size(root), 7, "7 nodes after 7 inserts");
  }, "Sequential inserts 1..7: always balanced");

  // --- Insert sequence 7..1 (reverse): always balanced ---
  it(function () {
    var root = null;
    for (var i = 7; i >= 1; i--) {
      root = AVLAlgorithm.insert(root, i).root;
      assert(AVLAlgorithm.isBalanced(root), "Balanced after inserting " + i);
    }
    assertEqual(AVLAlgorithm.size(root), 7, "7 nodes");
  }, "Reverse sequential inserts 7..1: always balanced");

  // --- All duplicates: no size increase ---
  it(function () {
    var root = null;
    root = AVLAlgorithm.insert(root, 5).root;
    root = AVLAlgorithm.insert(root, 5).root;
    root = AVLAlgorithm.insert(root, 5).root;
    assertEqual(
      AVLAlgorithm.size(root),
      1,
      "Duplicate inserts don't grow tree",
    );
  }, "Duplicate inserts are ignored");

  // --- Delete operations ---
  it(function () {
    var root = buildTree([5, 3, 7, 1, 4, 6, 8]);
    var result = AVLAlgorithm.deleteNode(root, 3);
    root = result.root;
    assertEqual(AVLAlgorithm.size(root), 6, "Size 6 after deleting one node");
    assert(AVLAlgorithm.isBalanced(root), "Tree balanced after delete");

    // 3 should not be found in tree
    var factors = collectBalanceFactors(root);
    for (var i = 0; i < factors.length; i++) {
      assert(factors[i] >= -1 && factors[i] <= 1, "All factors in range");
    }
  }, "Delete a leaf node");

  it(function () {
    var root = buildTree([5, 3, 7]);
    var result = AVLAlgorithm.deleteNode(root, 5);
    root = result.root;
    assertEqual(AVLAlgorithm.size(root), 2, "Size 2 after deleting root");
    assert(AVLAlgorithm.isBalanced(root), "Balanced after deleting root");
  }, "Delete root node with two children");

  it(function () {
    var root = buildTree([5]);
    var result = AVLAlgorithm.deleteNode(root, 5);
    assertEqual(result.root, null, "Tree empty after deleting only node");
  }, "Delete only node results in empty tree");

  it(function () {
    var root = buildTree([5, 3, 7]);
    var result = AVLAlgorithm.deleteNode(root, 99);
    assertEqual(
      AVLAlgorithm.size(result.root),
      3,
      "Tree unchanged when deleting non-existent value",
    );
    var notFoundStep = result.steps.find(function (s) {
      return s.explanation.indexOf("not found") >= 0;
    });
    assert(notFoundStep !== undefined, "Not-found step recorded");
  }, "Delete non-existent value: tree unchanged, step recorded");

  // --- Step structure ---
  it(function () {
    var result = AVLAlgorithm.insert(null, 10);
    var step = result.steps[0];
    assert(typeof step.type === "string", "step.type is string");
    assert(
      step.rotation === null || typeof step.rotation === "string",
      "step.rotation is null or string",
    );
    assert(typeof step.explanation === "string", "step.explanation is string");
    assert(
      step.root !== null || step.type === "balanced",
      "step.root is not null",
    );
  }, "Step objects have correct structure");

  it(function () {
    var root = null;
    root = AVLAlgorithm.insert(root, 1).root;
    root = AVLAlgorithm.insert(root, 2).root;
    var result = AVLAlgorithm.insert(root, 3);
    var rotStep = result.steps.find(function (s) {
      return s.rotation === "RR";
    });
    assert(
      rotStep !== null && rotStep !== undefined,
      "RR rotation step exists",
    );
    assertEqual(rotStep.imbalancedNode, 1, "Imbalanced node is 1");
    assert(typeof rotStep.explanation === "string", "explanation is string");
    assert(rotStep.root !== null, "root snapshot is present");
  }, "Rotation step has imbalancedNode and root snapshot");

  // --- isBalanced ---
  it(function () {
    assert(AVLAlgorithm.isBalanced(null), "Empty tree is balanced");
  }, "isBalanced: null tree");

  it(function () {
    var root = buildTree([5, 3, 7, 1, 4, 6, 8]);
    assert(AVLAlgorithm.isBalanced(root), "Balanced tree is balanced");
  }, "isBalanced: balanced tree");

  // --- getLayout ---
  it(function () {
    var layout = AVLAlgorithm.getLayout(null);
    assertEqual(layout.nodes.length, 0, "No nodes for null root");
    assertEqual(layout.edges.length, 0, "No edges for null root");
  }, "getLayout: null root returns empty");

  it(function () {
    var root = AVLAlgorithm.insert(null, 5).root;
    var layout = AVLAlgorithm.getLayout(root, 700, 75);
    assertEqual(layout.nodes.length, 1, "One node");
    assertEqual(layout.edges.length, 0, "No edges");
    assertEqual(layout.nodes[0].value, 5, "Node value is 5");
    assert(typeof layout.nodes[0].x === "number", "Has x");
    assert(typeof layout.nodes[0].y === "number", "Has y");
    assert(
      typeof layout.nodes[0].balanceFactor === "number",
      "Has balanceFactor",
    );
  }, "getLayout: single node has balanceFactor in layout");

  it(function () {
    var root = buildTree([5, 3, 7]);
    var layout = AVLAlgorithm.getLayout(root, 700, 75);
    assertEqual(layout.nodes.length, 3, "Three nodes");
    assertEqual(layout.edges.length, 2, "Two edges");
    var rootNode = layout.nodes.find(function (n) {
      return n.value === 5;
    });
    assert(rootNode !== undefined, "Root node in layout");
    assertEqual(rootNode.balanceFactor, 0, "Root BF is 0 for balanced tree");
  }, "getLayout: three nodes with correct edges");

  // --- size ---
  it(function () {
    assertEqual(AVLAlgorithm.size(null), 0, "Empty tree size is 0");
  }, "size: null root is 0");

  it(function () {
    var root = buildTree([5, 3, 7, 1, 4, 6, 8]);
    assertEqual(AVLAlgorithm.size(root), 7, "Size is 7");
  }, "size: 7-node tree");

  // --- Larger random-ish insert sequence stays balanced ---
  it(function () {
    var values = [15, 10, 20, 5, 12, 17, 25, 3, 7, 11, 13, 16, 19, 22, 30];
    var root = null;
    for (var i = 0; i < values.length; i++) {
      root = AVLAlgorithm.insert(root, values[i]).root;
    }
    assert(AVLAlgorithm.isBalanced(root), "Tree balanced after 15 inserts");
    assertEqual(AVLAlgorithm.size(root), 15, "15 distinct nodes");
  }, "15 inserts: tree stays balanced throughout");
});
