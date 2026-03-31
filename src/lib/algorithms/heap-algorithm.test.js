/**
 *
 * Covers: createHeap, insert, extractMin, peek, buildHeap, size, MAX_SIZE,
 * edge cases, step traces.
 */

describe("heap algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }

  const HeapAlgorithm =
    require("./heap-algorithm.js").default || require("./heap-algorithm.js");
  const { createHeap, insert, extractMin, peek, buildHeap, size, MAX_SIZE } =
    HeapAlgorithm;
  // Helper: verify min-heap property (each parent <= its children)
  function isMinHeap(data) {
    for (let i = 0; i < data.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < data.length && data[i] > data[left]) return false;
      if (right < data.length && data[i] > data[right]) return false;
    }
    return true;
  }

  // --- MAX_SIZE ---
  it(() => {
    assert(typeof MAX_SIZE === "number", "MAX_SIZE is a number");
    assert(MAX_SIZE === 20, "MAX_SIZE is 20");
  }, "MAX_SIZE: is 20");

  // --- createHeap ---
  it(() => {
    const heap = createHeap();
    assert("data" in heap, "createHeap returns object with data field");
    assertEqual(heap.data, [], "createHeap data is empty array");
  }, "createHeap: returns empty heap");

  it(() => {
    const h1 = createHeap();
    const h2 = createHeap();
    h1.data.push(1);
    assert(h2.data.length === 0, "createHeap creates independent instances");
  }, "createHeap: instances are independent");

  // --- size ---
  it(() => {
    const heap = createHeap();
    assert(size(heap) === 0, "empty heap has size 0");
  }, "size: empty heap is 0");

  it(() => {
    const heap = createHeap();
    insert(heap, 5);
    assert(size(heap) === 1, "size is 1 after one insert");
    insert(heap, 3);
    assert(size(heap) === 2, "size is 2 after two inserts");
  }, "size: increases after inserts");

  it(() => {
    const heap = createHeap();
    insert(heap, 5);
    insert(heap, 3);
    extractMin(heap);
    assert(size(heap) === 1, "size decreases after extractMin");
  }, "size: decreases after extractMin");

  // --- insert ---
  it(() => {
    const heap = createHeap();
    const result = insert(heap, 42);
    assert("steps" in result, "insert returns object with steps field");
    assert(Array.isArray(result.steps), "steps is an array");
    assert(size(heap) === 1, "heap size is 1 after insert");
    assert(heap.data[0] === 42, "single inserted value is at index 0");
  }, "insert: single value");

  it(() => {
    const heap = createHeap();
    insert(heap, 10);
    insert(heap, 5);
    insert(heap, 3);
    assert(heap.data[0] === 3, "minimum is at root after multiple inserts");
    assert(isMinHeap(heap.data), "heap property maintained after inserts");
  }, "insert: multiple values — min at root");

  it(() => {
    const heap = createHeap();
    const values = [5, 3, 8, 1, 4, 9, 2, 7, 6];
    values.forEach((v) => insert(heap, v));
    assert(heap.data[0] === 1, "minimum (1) is at root");
    assert(isMinHeap(heap.data), "min-heap property holds after all inserts");
  }, "insert: min-heap property maintained after 9 inserts");

  it(() => {
    const heap = createHeap();
    // Insert in reverse order — every insert should sift up
    for (let i = 10; i >= 1; i--) insert(heap, i);
    assert(heap.data[0] === 1, "min at root after reverse-order inserts");
    assert(
      isMinHeap(heap.data),
      "heap property holds after reverse-order inserts",
    );
  }, "insert: reverse-sorted sequence maintains min-heap");

  it(() => {
    const heap = createHeap();
    // Insert in sorted order — no sifting needed
    for (let i = 1; i <= 8; i++) insert(heap, i);
    assert(heap.data[0] === 1, "min at root after sorted inserts");
    assert(isMinHeap(heap.data), "heap property holds after sorted inserts");
  }, "insert: sorted sequence maintains min-heap");

  it(() => {
    const heap = createHeap();
    insert(heap, 5);
    insert(heap, 5);
    insert(heap, 5);
    assert(size(heap) === 3, "duplicates all inserted");
    assert(heap.data[0] === 5, "root is 5 with all duplicates");
    assert(isMinHeap(heap.data), "heap property holds with all duplicates");
  }, "insert: all duplicates — heap property holds");

  it(() => {
    const heap = createHeap();
    const result = insert(heap, 10);
    const step = result.steps[0];
    assert(typeof step.type === "string", "step has type field");
    assert(
      step.type === "insert" || step.type === "compare" || step.type === "swap",
      "step type is insert/compare/swap",
    );
    assert("heapSnapshot" in step, "step has heapSnapshot field");
    assert(Array.isArray(step.heapSnapshot), "heapSnapshot is an array");
  }, "insert: step trace has correct structure");

  it(() => {
    const heap = createHeap();
    // Fill to max size
    for (let i = 0; i < MAX_SIZE; i++) insert(heap, i);
    const result = insert(heap, 99);
    assert(
      size(heap) === MAX_SIZE,
      "size stays at MAX_SIZE after overflow attempt",
    );
    assert(
      result.steps.length === 0 || result.steps[0].type !== undefined,
      "overflow returns steps",
    );
  }, "insert: max size (20+) — does not exceed MAX_SIZE");

  // --- extractMin ---
  it(() => {
    const heap = createHeap();
    const result = extractMin(heap);
    assert(
      result.value === null,
      "extractMin on empty heap returns null value",
    );
    assert(
      Array.isArray(result.steps),
      "extractMin on empty heap returns steps array",
    );
  }, "extractMin: empty heap returns null");

  it(() => {
    const heap = createHeap();
    insert(heap, 42);
    const result = extractMin(heap);
    assert(result.value === 42, "single element extract returns that element");
    assert(size(heap) === 0, "heap is empty after extracting single element");
  }, "extractMin: single element");

  it(() => {
    const heap = createHeap();
    [5, 3, 8, 1, 4].forEach((v) => insert(heap, v));
    const result = extractMin(heap);
    assert(result.value === 1, "extracts minimum value (1)");
    assert(isMinHeap(heap.data), "heap property maintained after extract");
    assert(size(heap) === 4, "size decreased by 1");
  }, "extractMin: returns minimum, maintains heap property");

  it(() => {
    const heap = createHeap();
    [5, 3, 8, 1, 4, 9, 2, 7, 6].forEach((v) => insert(heap, v));
    const extracted = [];
    while (size(heap) > 0) {
      extracted.push(extractMin(heap).value);
    }
    // Should come out in sorted order
    for (let i = 0; i < extracted.length - 1; i++) {
      assert(
        extracted[i] <= extracted[i + 1],
        "extracted values are sorted ascending",
      );
    }
    assertEqual(
      extracted,
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "all values extracted in order",
    );
  }, "extractMin: repeated extracts give sorted sequence (heap sort)");

  it(() => {
    const heap = createHeap();
    insert(heap, 5);
    insert(heap, 5);
    insert(heap, 5);
    const r1 = extractMin(heap);
    const r2 = extractMin(heap);
    const r3 = extractMin(heap);
    assert(
      r1.value === 5 && r2.value === 5 && r3.value === 5,
      "all duplicates extracted",
    );
    assert(size(heap) === 0, "heap empty after extracting all duplicates");
  }, "extractMin: all duplicates extracted correctly");

  it(() => {
    const heap = createHeap();
    insert(heap, 10);
    insert(heap, 20);
    const result = extractMin(heap);
    assert("steps" in result, "extractMin returns steps field");
    assert(Array.isArray(result.steps), "steps is array");
    assert(result.steps.length >= 1, "steps has at least one entry");
    const step = result.steps[0];
    assert("type" in step, "step has type");
    assert("heapSnapshot" in step, "step has heapSnapshot");
  }, "extractMin: step trace has correct structure");

  it(() => {
    const heap = createHeap();
    [3, 1, 2].forEach((v) => insert(heap, v));
    const result = extractMin(heap);
    const extractStep = result.steps.find((s) => s.type === "extract");
    assert(extractStep !== undefined, "steps include extract type step");
    assert("indices" in extractStep, "extract step has indices");
    assert("values" in extractStep, "extract step has values");
  }, "extractMin: extract step has required fields");

  // --- peek ---
  it(() => {
    const heap = createHeap();
    const result = peek(heap);
    assert(result === null, "peek on empty heap returns null");
  }, "peek: empty heap returns null");

  it(() => {
    const heap = createHeap();
    insert(heap, 42);
    const result = peek(heap);
    assert(result === 42, "peek returns single element value");
    assert(size(heap) === 1, "peek does not remove element");
  }, "peek: single element, does not remove");

  it(() => {
    const heap = createHeap();
    [5, 3, 8, 1, 4].forEach((v) => insert(heap, v));
    const min = peek(heap);
    assert(min === 1, "peek returns minimum value");
    assert(size(heap) === 5, "peek does not modify size");
    assert(isMinHeap(heap.data), "peek does not modify heap structure");
  }, "peek: returns min without modifying heap");

  it(() => {
    const heap = createHeap();
    insert(heap, 7);
    peek(heap);
    peek(heap);
    assert(heap.data[0] === 7, "repeated peeks do not modify heap");
    assert(size(heap) === 1, "repeated peeks do not change size");
  }, "peek: repeated peeks are idempotent");

  // --- buildHeap ---
  it(() => {
    const result = buildHeap([]);
    assert("heap" in result, "buildHeap returns object with heap field");
    assert("steps" in result, "buildHeap returns object with steps field");
    assert(Array.isArray(result.steps), "steps is array");
    assertEqual(result.heap.data, [], "empty array builds empty heap");
  }, "buildHeap: empty array");

  it(() => {
    const result = buildHeap([42]);
    assertEqual(result.heap.data, [42], "single element heap is correct");
  }, "buildHeap: single element");

  it(() => {
    const arr = [4, 10, 3, 5, 1, 8, 2, 7, 6, 9];
    const result = buildHeap(arr);
    assert(isMinHeap(result.heap.data), "buildHeap produces valid min-heap");
    assert(result.heap.data[0] === 1, "minimum is at root");
    assert(result.heap.data.length === arr.length, "all elements present");
  }, "buildHeap: random array produces valid min-heap");

  it(() => {
    const arr = [1, 2, 3, 4, 5, 6, 7];
    const result = buildHeap(arr);
    assert(isMinHeap(result.heap.data), "sorted array builds valid min-heap");
    assert(result.heap.data[0] === 1, "min at root from sorted input");
  }, "buildHeap: already sorted array");

  it(() => {
    const arr = [7, 6, 5, 4, 3, 2, 1];
    const result = buildHeap(arr);
    assert(
      isMinHeap(result.heap.data),
      "reverse-sorted array builds valid min-heap",
    );
    assert(result.heap.data[0] === 1, "min at root from reverse-sorted input");
  }, "buildHeap: reverse-sorted array");

  it(() => {
    const arr = [5, 5, 5, 5, 5];
    const result = buildHeap(arr);
    assert(
      isMinHeap(result.heap.data),
      "all-duplicates array builds valid heap",
    );
    assert(result.heap.data[0] === 5, "root is 5 with all duplicates");
  }, "buildHeap: all duplicates");

  it(() => {
    // buildHeap should not exceed MAX_SIZE elements
    const arr = Array.from({ length: MAX_SIZE + 5 }, (_, i) => i);
    const result = buildHeap(arr);
    assert(
      result.heap.data.length <= MAX_SIZE,
      "buildHeap truncates to MAX_SIZE elements",
    );
  }, "buildHeap: truncates input exceeding MAX_SIZE");

  it(() => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6];
    const result = buildHeap(arr);
    assert(result.steps.length >= 1, "buildHeap produces at least one step");
    const step = result.steps[0];
    assert("type" in step, "buildHeap step has type");
    assert("heapSnapshot" in step, "buildHeap step has heapSnapshot");
  }, "buildHeap: step trace has correct structure");

  it(() => {
    // Already a valid min-heap
    const arr = [1, 3, 2, 7, 5, 4, 6];
    const result = buildHeap(arr);
    assert(isMinHeap(result.heap.data), "already-valid heap remains valid");
    assert(result.heap.data[0] === 1, "root unchanged for already-valid heap");
  }, "buildHeap: already valid heap");
});
