// @ts-nocheck
/**
 * Trie (Prefix Tree) Algorithm
 *
 * Pure functions — no DOM dependency.
 * Provides trie construction, word insertion with step trace,
 * exact search, prefix query, and word enumeration.
 */
var TrieAlgorithm = (function () {
  "use strict";

  /**
   * Create an empty trie node.
   * @param {string} char - character this node represents ('' for root)
   * @returns {{ char: string, children: Object, isEnd: boolean }}
   */
  function createNode(char) {
    return { char: char, children: {}, isEnd: false };
  }

  /**
   * Create an empty trie.
   * @returns {{ root: Object }}
   */
  function createTrie() {
    return { root: createNode("") };
  }

  /**
   * Insert a word into the trie. Returns step trace.
   * @param {{ root: Object }} trie
   * @param {string} word
   * @returns {{ steps: Array }}
   */
  function insert(trie, word) {
    var steps = [];
    var current = trie.root;
    var path = [];

    for (var i = 0; i < word.length; i++) {
      var ch = word[i];
      var isNew = !current.children[ch];

      if (isNew) {
        current.children[ch] = createNode(ch);
      }

      path.push(ch);
      current = current.children[ch];

      var isLastChar = i === word.length - 1;
      steps.push({
        char: ch,
        charIndex: i,
        path: path.slice(),
        isNew: isNew,
        isEnd: isLastChar,
        word: word,
        explanation: isNew
          ? "Create new node '" +
            ch +
            "'" +
            (isLastChar ? " (end of word)" : "")
          : "Follow existing node '" +
            ch +
            "'" +
            (isLastChar ? " (mark end of word)" : ""),
      });
    }

    current.isEnd = true;

    // Final summary step
    steps.push({
      char: "",
      charIndex: word.length,
      path: path.slice(),
      isNew: false,
      isEnd: true,
      word: word,
      explanation: "Inserted '" + word + "' into trie",
    });

    return { steps: steps };
  }

  /**
   * Search for an exact word in the trie.
   * @param {{ root: Object }} trie
   * @param {string} word
   * @returns {{ found: boolean, steps: Array }}
   */
  function search(trie, word) {
    var steps = [];
    var current = trie.root;
    var path = [];

    for (var i = 0; i < word.length; i++) {
      var ch = word[i];

      if (!current.children[ch]) {
        path.push(ch);
        steps.push({
          char: ch,
          charIndex: i,
          path: path.slice(),
          found: false,
          word: word,
          explanation: "Character '" + ch + "' not found — search fails",
        });
        return { found: false, steps: steps };
      }

      path.push(ch);
      current = current.children[ch];
      var isLastChar = i === word.length - 1;

      steps.push({
        char: ch,
        charIndex: i,
        path: path.slice(),
        found: isLastChar ? current.isEnd : null,
        word: word,
        explanation: isLastChar
          ? current.isEnd
            ? "Found '" + word + "' in trie"
            : "Path exists but '" + word + "' is not a complete word"
          : "Matched '" + ch + "', continue...",
      });
    }

    var found = current.isEnd;
    return { found: found, steps: steps };
  }

  /**
   * Find all words with a given prefix.
   * @param {{ root: Object }} trie
   * @param {string} prefix
   * @returns {{ words: string[], steps: Array }}
   */
  function prefixQuery(trie, prefix) {
    var steps = [];
    var current = trie.root;
    var path = [];

    // Traverse to end of prefix
    for (var i = 0; i < prefix.length; i++) {
      var ch = prefix[i];

      if (!current.children[ch]) {
        path.push(ch);
        steps.push({
          char: ch,
          charIndex: i,
          path: path.slice(),
          words: [],
          word: prefix,
          explanation: "Prefix character '" + ch + "' not found — no matches",
        });
        return { words: [], steps: steps };
      }

      path.push(ch);
      current = current.children[ch];

      steps.push({
        char: ch,
        charIndex: i,
        path: path.slice(),
        words: [],
        word: prefix,
        explanation: "Matched prefix character '" + ch + "'",
      });
    }

    // Collect all words from this node
    var words = [];
    collectWords(current, prefix, words);

    steps.push({
      char: "",
      charIndex: prefix.length,
      path: path.slice(),
      words: words.slice(),
      word: prefix,
      explanation:
        words.length > 0
          ? "Found " + words.length + " word(s) with prefix '" + prefix + "'"
          : "No complete words found with prefix '" + prefix + "'",
    });

    return { words: words, steps: steps };
  }

  /**
   * Recursively collect all words from a node.
   * @param {Object} node
   * @param {string} prefix
   * @param {string[]} result
   */
  function collectWords(node, prefix, result) {
    if (node.isEnd) {
      result.push(prefix);
    }
    var keys = Object.keys(node.children);
    for (var i = 0; i < keys.length; i++) {
      collectWords(node.children[keys[i]], prefix + keys[i], result);
    }
  }

  /**
   * Get all words stored in the trie.
   * @param {{ root: Object }} trie
   * @returns {string[]}
   */
  function getWords(trie) {
    var result = [];
    collectWords(trie.root, "", result);
    return result;
  }

  return {
    createTrie: createTrie,
    insert: insert,
    search: search,
    prefixQuery: prefixQuery,
    getWords: getWords,
  };
})();

// Node.js module export (for test runner)

export default TrieAlgorithm;
