/**
 */

describe("trie algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

  const TrieAlgorithm =
    require("./trie-algorithm.js").default || require("./trie-algorithm.js");
  // --- createTrie ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    assert(trie !== null && trie !== undefined, "Trie is not null");
    assert(typeof trie.root === "object", "Trie has root");
    assert(trie.root !== null, "Root is not null");
  }, "createTrie returns object with root node");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    assert(typeof trie.root.children === "object", "Root has children object");
    assertEqual(trie.root.isEnd, false, "Root isEnd is false");
  }, "createTrie root node has children and isEnd=false");

  // --- getWords on empty trie ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const words = TrieAlgorithm.getWords(trie);
    assertEqual(words, [], "Empty trie has no words");
  }, "getWords on empty trie returns []");

  // --- insert single word ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const result = TrieAlgorithm.insert(trie, "cat");
    assert(Array.isArray(result.steps), "insert returns steps array");
    assert(result.steps.length > 0, "insert has at least one step");
  }, "insert returns object with steps array");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    const words = TrieAlgorithm.getWords(trie);
    assertEqual(words, ["cat"], "getWords returns inserted word");
  }, "insert 'cat' then getWords returns ['cat']");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const result = TrieAlgorithm.insert(trie, "cat");
    // Should have one step per character plus possible completion step
    assert(result.steps.length >= 3, "At least 3 steps for 3-char word");
  }, "insert 3-char word has at least 3 steps");

  // --- insert single character word ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "a");
    const words = TrieAlgorithm.getWords(trie);
    assertEqual(words, ["a"], "Single char word inserted");
  }, "insert single character word");

  // --- insert multiple words ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    TrieAlgorithm.insert(trie, "car");
    TrieAlgorithm.insert(trie, "dog");
    const words = TrieAlgorithm.getWords(trie);
    words.sort();
    assertEqual(words, ["car", "cat", "dog"], "Three words inserted");
  }, "insert multiple words");

  // --- insert overlapping prefixes ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "car");
    TrieAlgorithm.insert(trie, "card");
    TrieAlgorithm.insert(trie, "care");
    TrieAlgorithm.insert(trie, "careful");
    const words = TrieAlgorithm.getWords(trie);
    words.sort();
    assertEqual(
      words,
      ["car", "card", "care", "careful"],
      "Overlapping prefixes all present",
    );
  }, "insert words with overlapping prefixes (car, card, care, careful)");

  // --- insert where word is prefix of another ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "be");
    TrieAlgorithm.insert(trie, "bee");
    TrieAlgorithm.insert(trie, "been");
    const words = TrieAlgorithm.getWords(trie);
    words.sort();
    assertEqual(words, ["be", "bee", "been"], "Nested words: be, bee, been");
  }, "insert where shorter word is prefix of longer");

  // --- insert step structure ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const result = TrieAlgorithm.insert(trie, "hi");
    const step = result.steps[0];
    assert(typeof step.char === "string", "Step has char");
    assert(Array.isArray(step.path), "Step has path array");
    assert(typeof step.explanation === "string", "Step has explanation");
  }, "insert step has char, path, explanation");

  // --- search: found ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "hello");
    const result = TrieAlgorithm.search(trie, "hello");
    assertEqual(result.found, true, "Found hello");
    assert(Array.isArray(result.steps), "Search returns steps");
  }, "search for existing word returns found=true");

  // --- search: not found ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "hello");
    const result = TrieAlgorithm.search(trie, "hell");
    assertEqual(result.found, false, "hell not found (is prefix, not word)");
  }, "search for prefix-only word returns found=false");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const result = TrieAlgorithm.search(trie, "anything");
    assertEqual(result.found, false, "Empty trie search returns false");
    assert(result.steps.length > 0, "Search on empty trie still has steps");
  }, "search on empty trie returns found=false");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    const result = TrieAlgorithm.search(trie, "dog");
    assertEqual(result.found, false, "Not-inserted word not found");
  }, "search for non-existent word returns found=false");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    const result = TrieAlgorithm.search(trie, "cats");
    assertEqual(result.found, false, "Extension of word not found");
  }, "search for word extended beyond trie returns found=false");

  // --- search step structure ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "go");
    const result = TrieAlgorithm.search(trie, "go");
    assert(result.steps.length >= 2, "At least 2 steps for 2-char word");
    const lastStep = result.steps[result.steps.length - 1];
    assert(
      typeof lastStep.found === "boolean",
      "Last search step has found boolean",
    );
  }, "search steps include found boolean in final step");

  // --- prefixQuery: found words ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    TrieAlgorithm.insert(trie, "car");
    TrieAlgorithm.insert(trie, "card");
    TrieAlgorithm.insert(trie, "dog");
    const result = TrieAlgorithm.prefixQuery(trie, "ca");
    result.words.sort();
    assertEqual(result.words, ["car", "card", "cat"], "Prefix 'ca' finds 3");
  }, "prefixQuery 'ca' finds car, card, cat");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    TrieAlgorithm.insert(trie, "car");
    const result = TrieAlgorithm.prefixQuery(trie, "cat");
    assertEqual(
      result.words,
      ["cat"],
      "Exact word as prefix finds only itself",
    );
  }, "prefixQuery with exact word as prefix");

  // --- prefixQuery: not found ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    const result = TrieAlgorithm.prefixQuery(trie, "dog");
    assertEqual(result.words, [], "No words for non-existent prefix");
    assert(result.steps.length > 0, "prefixQuery has steps even when empty");
  }, "prefixQuery with no matching prefix returns empty words");

  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const result = TrieAlgorithm.prefixQuery(trie, "a");
    assertEqual(result.words, [], "Empty trie prefix query");
  }, "prefixQuery on empty trie returns empty words");

  // --- prefixQuery step structure ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "hi");
    const result = TrieAlgorithm.prefixQuery(trie, "h");
    assert(Array.isArray(result.steps), "prefixQuery returns steps");
    assert(result.steps.length > 0, "prefixQuery has at least one step");
    const step = result.steps[0];
    assert(typeof step.explanation === "string", "Step has explanation");
  }, "prefixQuery returns steps with explanation");

  // --- getWords: sorted output ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "zebra");
    TrieAlgorithm.insert(trie, "apple");
    TrieAlgorithm.insert(trie, "mango");
    const words = TrieAlgorithm.getWords(trie);
    const sorted = words.slice().sort();
    // Words may or may not be sorted; they should at least all be present
    sorted.sort();
    const expected = ["apple", "mango", "zebra"];
    assertEqual(sorted, expected, "All 3 words retrieved");
  }, "getWords retrieves all inserted words");

  // --- large word set ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    const wordList = [
      "the",
      "their",
      "there",
      "they",
      "tree",
      "try",
      "true",
      "trust",
      "truth",
      "ten",
      "test",
      "text",
      "time",
      "tip",
      "top",
      "to",
      "too",
      "took",
      "tool",
      "town",
    ];
    wordList.forEach((w) => TrieAlgorithm.insert(trie, w));
    const words = TrieAlgorithm.getWords(trie);
    assertEqual(words.length, 20, "All 20 words stored");
  }, "insert 20 words and getWords returns all 20");

  // --- duplicate insert ---
  it(() => {
    const trie = TrieAlgorithm.createTrie();
    TrieAlgorithm.insert(trie, "cat");
    TrieAlgorithm.insert(trie, "cat");
    const words = TrieAlgorithm.getWords(trie);
    assertEqual(words.length, 1, "Duplicate insert does not create duplicate");
  }, "inserting duplicate word does not add duplicate to getWords");
});
