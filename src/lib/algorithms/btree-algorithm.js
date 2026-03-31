/**
 * B-Tree Algorithm (CLRS-style, minimum degree t)
 *
 * Pure functions — no DOM. Each node: { leaf, keys: number[], children: BNode[] }
 * Max keys per node: 2t-1, min (non-root): t-1, max children: 2t.
 */
var BTreeAlgorithm = (function () {
  "use strict";

  var MIN_T = 2;
  var MAX_T = 5;
  /** Upper bound on total keys stored (visualization / input guard) */
  var MAX_KEYS_TOTAL = 30;

  function createNode(leaf) {
    return { leaf: !!leaf, keys: [], children: [] };
  }

  function cloneNode(n) {
    if (!n) return null;
    return {
      leaf: n.leaf,
      keys: n.keys.slice(),
      children: n.children.map(cloneNode),
    };
  }

  function cloneTree(root) {
    return cloneNode(root);
  }

  /** Full-tree snapshot for visualization (rootPtr.r is current root). */
  function pushSnap(steps, rootPtr, type, message, extra) {
    if (!steps) return;
    var o = {
      type: type,
      message: message,
      tree: cloneTree(rootPtr.r),
    };
    if (extra) {
      for (var ek in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, ek)) o[ek] = extra[ek];
      }
    }
    steps.push(o);
  }

  function isFull(node, t) {
    return node.keys.length >= 2 * t - 1;
  }

  function keyCount(root) {
    if (!root) return 0;
    var c = root.keys.length;
    for (var i = 0; i < root.children.length; i++) {
      c += keyCount(root.children[i]);
    }
    return c;
  }

  function findKeyIndex(node, key) {
    var i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    return i;
  }

  /** In-order traversal keys (sorted if B-tree valid) */
  function collectKeys(root, out) {
    if (!root) return;
    var i;
    for (i = 0; i < root.keys.length; i++) {
      if (!root.leaf) collectKeys(root.children[i], out);
      out.push(root.keys[i]);
    }
    if (!root.leaf) collectKeys(root.children[i], out);
  }

  function inorderKeys(root) {
    var out = [];
    collectKeys(root, out);
    return out;
  }

  function validateTree(root, t) {
    function v(node, isRoot) {
      if (!node) return true;
      var k = node.keys.length;
      if (k === 0) {
        return !!(isRoot && !node.leaf && node.children.length === 1);
      }
      if (k > 2 * t - 1) return false;
      if (!isRoot && k < t - 1) return false;
      if (node.leaf) return node.children.length === 0;
      if (node.children.length !== k + 1) return false;
      for (var i = 0; i < node.children.length; i++) {
        if (!v(node.children[i], false)) return false;
      }
      return true;
    }
    return v(root, true);
  }

  function splitChild(parent, i, t, steps, opPrefix, rootPtr) {
    var z = createNode();
    var y = parent.children[i];
    z.leaf = y.leaf;
    var mid = y.keys[t - 1];
    z.keys = y.keys.slice(t);
    y.keys = y.keys.slice(0, t - 1);
    if (!y.leaf) {
      z.children = y.children.slice(t);
      y.children = y.children.slice(0, t);
    }
    parent.keys.splice(i, 0, mid);
    parent.children.splice(i + 1, 0, z);
    pushSnap(
      steps,
      rootPtr,
      "split",
      (opPrefix || "") + "Split child: median " + mid + " promoted",
    );
  }

  function insertNonFull(x, key, t, steps, opPrefix, rootPtr) {
    if (x.leaf) {
      var j = findKeyIndex(x, key);
      if (j < x.keys.length && x.keys[j] === key) {
        pushSnap(
          steps,
          rootPtr,
          "noop",
          (opPrefix || "") + "Duplicate key " + key + " ignored",
        );
        return;
      }
      x.keys.splice(j, 0, key);
      pushSnap(
        steps,
        rootPtr,
        "insert",
        (opPrefix || "") + "Inserted " + key + " into leaf",
      );
      return;
    }
    var i = findKeyIndex(x, key);
    if (x.keys[i] === key) {
      pushSnap(
        steps,
        rootPtr,
        "noop",
        (opPrefix || "") + "Duplicate key " + key + " ignored",
      );
      return;
    }
    if (isFull(x.children[i], t)) {
      splitChild(x, i, t, steps, opPrefix, rootPtr);
      if (key > x.keys[i]) i++;
    }
    insertNonFull(x.children[i], key, t, steps, opPrefix, rootPtr);
  }

  /**
   * @returns {{ root: Object|null, steps: Array, duplicate?: boolean }}
   */
  function insertKey(root, key, t, steps) {
    steps = steps || [];
    if (keyCount(root) >= MAX_KEYS_TOTAL) {
      pushSnap(
        steps,
        { r: root },
        "error",
        "At most " + MAX_KEYS_TOTAL + " keys allowed",
      );
      return { root: root, steps: steps, error: true };
    }
    var rootPtr = { r: root };
    if (!rootPtr.r) {
      var n = createNode(true);
      n.keys = [key];
      rootPtr.r = n;
      pushSnap(steps, rootPtr, "insert", "Created root with key " + key);
      return { root: rootPtr.r, steps: steps };
    }
    if (isFull(rootPtr.r, t)) {
      var s = createNode(false);
      s.children[0] = rootPtr.r;
      rootPtr.r = s;
      splitChild(s, 0, t, steps, "", rootPtr);
    }
    insertNonFull(rootPtr.r, key, t, steps, "", rootPtr);
    pushSnap(steps, rootPtr, "done-insert", "Insert complete");
    return { root: rootPtr.r, steps: steps };
  }

  function getPred(root, idx) {
    var cur = root.children[idx];
    while (!cur.leaf) cur = cur.children[cur.children.length - 1];
    return cur.keys[cur.keys.length - 1];
  }

  function getSucc(root, idx) {
    var cur = root.children[idx + 1];
    while (!cur.leaf) cur = cur.children[0];
    return cur.keys[0];
  }

  function borrowFromPrev(parent, idx, t, steps, rootPtr) {
    var child = parent.children[idx];
    var sibling = parent.children[idx - 1];
    child.keys.unshift(parent.keys[idx - 1]);
    parent.keys[idx - 1] = sibling.keys.pop();
    if (!child.leaf) {
      child.children.unshift(sibling.children.pop());
    }
    pushSnap(steps, rootPtr, "borrow", "Borrowed from left sibling");
  }

  function borrowFromNext(parent, idx, t, steps, rootPtr) {
    var child = parent.children[idx];
    var sibling = parent.children[idx + 1];
    child.keys.push(parent.keys[idx]);
    parent.keys[idx] = sibling.keys.shift();
    if (!child.leaf) {
      child.children.push(sibling.children.shift());
    }
    pushSnap(steps, rootPtr, "borrow", "Borrowed from right sibling");
  }

  function mergeChildren(parent, idx, t, steps, rootPtr) {
    var child = parent.children[idx];
    var sibling = parent.children[idx + 1];
    var mid = parent.keys[idx];
    child.keys.push(mid);
    for (var i = 0; i < sibling.keys.length; i++) {
      child.keys.push(sibling.keys[i]);
    }
    if (!child.leaf) {
      for (var j = 0; j < sibling.children.length; j++) {
        child.children.push(sibling.children[j]);
      }
    }
    parent.keys.splice(idx, 1);
    parent.children.splice(idx + 1, 1);
    pushSnap(
      steps,
      rootPtr,
      "merge",
      "Merged with right sibling around key " + mid,
    );
  }

  function removeFromLeaf(node, idx, steps, rootPtr) {
    var k = node.keys[idx];
    node.keys.splice(idx, 1);
    pushSnap(steps, rootPtr, "remove", "Removed " + k + " from leaf");
  }

  function removeFromInternal(root, idx, key, t, steps, rootPtr) {
    if (root.children[idx].keys.length >= t) {
      var pred = getPred(root, idx);
      root.keys[idx] = pred;
      remove(root.children[idx], pred, t, steps, rootPtr);
    } else if (root.children[idx + 1].keys.length >= t) {
      var succ = getSucc(root, idx);
      root.keys[idx] = succ;
      remove(root.children[idx + 1], succ, t, steps, rootPtr);
    } else {
      mergeChildren(root, idx, t, steps, rootPtr);
      remove(root.children[idx], key, t, steps, rootPtr);
    }
  }

  function fillChild(parent, idx, t, steps, rootPtr) {
    if (idx > 0 && parent.children[idx - 1].keys.length >= t) {
      borrowFromPrev(parent, idx, t, steps, rootPtr);
    } else if (
      idx < parent.children.length - 1 &&
      parent.children[idx + 1].keys.length >= t
    ) {
      borrowFromNext(parent, idx, t, steps, rootPtr);
    } else {
      if (idx < parent.children.length - 1) {
        mergeChildren(parent, idx, t, steps, rootPtr);
      } else {
        mergeChildren(parent, idx - 1, t, steps, rootPtr);
      }
    }
  }

  function remove(root, key, t, steps, rootPtr) {
    if (!root) return;
    var idx = findKeyIndex(root, key);
    if (idx < root.keys.length && root.keys[idx] === key) {
      if (root.leaf) {
        removeFromLeaf(root, idx, steps, rootPtr);
      } else {
        removeFromInternal(root, idx, key, t, steps, rootPtr);
      }
    } else {
      if (root.leaf) {
        pushSnap(steps, rootPtr, "miss", "Key " + key + " not found");
        return;
      }
      var flag = idx === root.keys.length;
      if (root.children[idx].keys.length < t) {
        fillChild(root, idx, t, steps, rootPtr);
        if (flag && idx > root.keys.length) idx--;
      }
      remove(root.children[idx], key, t, steps, rootPtr);
    }
  }

  /**
   * @returns {{ root: Object|null, steps: Array }}
   */
  function deleteKey(root, key, t, steps) {
    steps = steps || [];
    if (!root) {
      steps.push({ type: "error", message: "Empty tree", tree: null });
      return { root: null, steps: steps };
    }
    var rootPtr = { r: root };
    remove(rootPtr.r, key, t, steps, rootPtr);
    if (rootPtr.r && rootPtr.r.keys.length === 0) {
      if (rootPtr.r.leaf) {
        rootPtr.r = null;
        pushSnap(steps, rootPtr, "empty", "Tree is now empty");
      } else {
        rootPtr.r = rootPtr.r.children[0];
        pushSnap(
          steps,
          rootPtr,
          "shrink-root",
          "Old root empty — child becomes root",
        );
      }
    }
    if (rootPtr.r) {
      pushSnap(steps, rootPtr, "done-delete", "Delete finished");
    } else {
      steps.push({
        type: "done-delete",
        message: "Delete finished",
        tree: null,
      });
    }
    return { root: rootPtr.r, steps: steps };
  }

  function searchWithSteps(root, key) {
    var steps = [];
    var node = root;
    var path = [];
    while (node) {
      var i = findKeyIndex(node, key);
      path.push({ depth: path.length, index: i, keys: node.keys.slice() });
      steps.push({
        type: "visit",
        message: "Visiting node, comparing at index " + i,
        tree: cloneTree(root),
        path: path.slice(),
        highlightIndex: i,
      });
      if (i < node.keys.length && node.keys[i] === key) {
        steps.push({
          type: "found",
          message: "Found " + key,
          tree: cloneTree(root),
          path: path.slice(),
        });
        return { found: true, steps: steps };
      }
      if (node.leaf) break;
      node = node.children[i];
    }
    steps.push({
      type: "not-found",
      message: "Key " + key + " not in tree",
      tree: cloneTree(root),
    });
    return { found: false, steps: steps };
  }

  /**
   * Run a sequence of insert operations (for tests / bulk UI).
   */
  function bulkInsert(keys, t) {
    var root = null;
    var allSteps = [];
    for (var i = 0; i < keys.length; i++) {
      var r = insertKey(root, keys[i], t, []);
      root = r.root;
      allSteps = allSteps.concat(r.steps);
    }
    return { root: root, steps: allSteps };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      MIN_T: MIN_T,
      MAX_T: MAX_T,
      MAX_KEYS_TOTAL: MAX_KEYS_TOTAL,
      createNode: createNode,
      cloneTree: cloneTree,
      keyCount: keyCount,
      inorderKeys: inorderKeys,
      validateTree: validateTree,
      insertKey: insertKey,
      deleteKey: deleteKey,
      searchWithSteps: searchWithSteps,
      bulkInsert: bulkInsert,
    };
  }

  return {
    MIN_T: MIN_T,
    MAX_T: MAX_T,
    MAX_KEYS_TOTAL: MAX_KEYS_TOTAL,
    createNode: createNode,
    cloneTree: cloneTree,
    keyCount: keyCount,
    inorderKeys: inorderKeys,
    validateTree: validateTree,
    insertKey: insertKey,
    deleteKey: deleteKey,
    searchWithSteps: searchWithSteps,
    bulkInsert: bulkInsert,
  };
})();
