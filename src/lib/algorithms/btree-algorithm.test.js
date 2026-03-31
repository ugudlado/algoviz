/**
 */
const BTreeAlgorithm = require("./btree-algorithm.js");

describe("btree algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }
  it("constants: MIN_T 2, MAX_T 5, MAX_KEYS_TOTAL 30", function () {
    assertEqual(BTreeAlgorithm.MIN_T, 2);
    assertEqual(BTreeAlgorithm.MAX_T, 5);
    assertEqual(BTreeAlgorithm.MAX_KEYS_TOTAL, 30);
  });

  it("single key insert: valid tree, inorder [42]", function () {
    var r = BTreeAlgorithm.insertKey(null, 42, 3, []).root;
    assert(BTreeAlgorithm.validateTree(r, 3));
    assertEqual(BTreeAlgorithm.inorderKeys(r), [42]);
  });

  it("empty tree: keyCount 0, validate true", function () {
    assertEqual(BTreeAlgorithm.keyCount(null), 0);
    assert(BTreeAlgorithm.validateTree(null, 3));
  });

  it("search hit and miss (t=3)", function () {
    var r = null;
    [10, 20, 5, 6, 30].forEach(function (k) {
      r = BTreeAlgorithm.insertKey(r, k, 3, []).root;
    });
    var hit = BTreeAlgorithm.searchWithSteps(r, 20);
    assert(hit.found === true);
    var miss = BTreeAlgorithm.searchWithSteps(r, 99);
    assert(miss.found === false);
  });

  it("insert causes root split (t=2): still valid, sorted inorder", function () {
    var r = null;
    for (var i = 1; i <= 10; i++) {
      r = BTreeAlgorithm.insertKey(r, i, 2, []).root;
    }
    assert(BTreeAlgorithm.validateTree(r, 2));
    var keys = BTreeAlgorithm.inorderKeys(r);
    assertEqual(keys.length, 10);
    for (var j = 0; j < 10; j++) assertEqual(keys[j], j + 1);
  });

  it("delete from leaf after inserts (t=3)", function () {
    var r = null;
    [10, 20, 5, 6, 12, 30, 7, 17].forEach(function (k) {
      r = BTreeAlgorithm.insertKey(r, k, 3, []).root;
    });
    r = BTreeAlgorithm.deleteKey(r, 10, 3, []).root;
    assert(BTreeAlgorithm.validateTree(r, 3));
    assert(BTreeAlgorithm.searchWithSteps(r, 10).found === false);
    assert(BTreeAlgorithm.searchWithSteps(r, 17).found === true);
  });

  it("delete causing merge path (t=2)", function () {
    var r = null;
    for (var k = 1; k <= 15; k++) {
      r = BTreeAlgorithm.insertKey(r, k, 2, []).root;
    }
    r = BTreeAlgorithm.deleteKey(r, 8, 2, []).root;
    r = BTreeAlgorithm.deleteKey(r, 7, 2, []).root;
    assert(BTreeAlgorithm.validateTree(r, 2));
    assertEqual(BTreeAlgorithm.keyCount(r), 13);
  });

  it("orders t=2 through t=5: random insert/delete stress", function () {
    for (var t = 2; t <= 5; t++) {
      var r = null;
      var seq = [50, 20, 70, 10, 30, 60, 80, 5, 15, 25, 35];
      seq.forEach(function (k) {
        r = BTreeAlgorithm.insertKey(r, k, t, []).root;
      });
      assert(BTreeAlgorithm.validateTree(r, t));
      r = BTreeAlgorithm.deleteKey(r, 20, t, []).root;
      r = BTreeAlgorithm.deleteKey(r, 50, t, []).root;
      assert(BTreeAlgorithm.validateTree(r, t));
    }
  });

  it("duplicate insert ignored: count unchanged", function () {
    var r = BTreeAlgorithm.insertKey(null, 5, 3, []).root;
    r = BTreeAlgorithm.insertKey(r, 5, 3, []).root;
    assertEqual(BTreeAlgorithm.keyCount(r), 1);
  });

  it("MAX_KEYS_TOTAL rejects 31st key", function () {
    var r = null;
    for (var i = 0; i < 30; i++) {
      r = BTreeAlgorithm.insertKey(r, i, 3, []).root;
    }
    var out = BTreeAlgorithm.insertKey(r, 999, 3, []);
    assert(out.error === true);
    assertEqual(BTreeAlgorithm.keyCount(out.root), 30);
  });

  it("bulkInsert helper builds valid tree", function () {
    var res = BTreeAlgorithm.bulkInsert([3, 1, 4, 1, 5, 9], 3);
    assert(BTreeAlgorithm.validateTree(res.root, 3));
    assertEqual(BTreeAlgorithm.keyCount(res.root), 5);
  });

  it("delete last key leaves empty tree", function () {
    var r = BTreeAlgorithm.insertKey(null, 7, 3, []).root;
    var out = BTreeAlgorithm.deleteKey(r, 7, 3, []);
    assert(out.root === null);
    assertEqual(BTreeAlgorithm.keyCount(out.root), 0);
  });

  it("search on empty tree: not found, one terminal step", function () {
    var res = BTreeAlgorithm.searchWithSteps(null, 5);
    assert(res.found === false);
    assertEqual(res.steps.length, 1);
    assertEqual(res.steps[0].type, "not-found");
  });
});
