/**
 * Tests for Gale-Shapley stable matching algorithm.
 */
const GaleShapleyAlgorithm =
  require("./gale-shapley-algorithm.js").default ||
  require("./gale-shapley-algorithm.js");
function makeCase(namesA, namesB, prefsA, prefsB) {
  return {
    proposers: namesA,
    acceptors: namesB,
    proposerPreferences: prefsA,
    acceptorPreferences: prefsB,
  };
}

describe("gale shapley algorithm", function () {
  function assert(condition, message) {
    expect(Boolean(condition), message || "Assertion failed").toBe(true);
  }

  function assertEqual(actual, expected, message) {
    expect(actual, message || "assertEqual").toEqual(expected);
  }
  it("empty input: stable empty result", function () {
    const result = GaleShapleyAlgorithm.runStableMatching(
      makeCase([], [], {}, {}),
    );
    assertEqual(result.matching.length, 0, "no pairs");
    assertEqual(result.isStable, true, "empty matching is stable");
    assertEqual(result.steps.length > 0, true, "has steps for UI");
    assertEqual(
      result.steps[result.steps.length - 1].type,
      "done",
      "ends done",
    );
  });

  it("size 1: proposer/acceptor are matched", function () {
    const result = GaleShapleyAlgorithm.runStableMatching(
      makeCase(["A"], ["X"], { A: ["X"] }, { X: ["A"] }),
    );
    assertEqual(
      result.matching,
      [{ proposer: "A", acceptor: "X" }],
      "pair A-X",
    );
    assertEqual(result.isStable, true, "size 1 matching stable");
    assertEqual(result.proposerOutcome[0].rank, 1, "proposer rank is 1");
  });

  it("deterministic steps and stable result for 3x3", function () {
    const input = makeCase(
      ["A", "B", "C"],
      ["X", "Y", "Z"],
      {
        A: ["Y", "X", "Z"],
        B: ["X", "Y", "Z"],
        C: ["X", "Z", "Y"],
      },
      {
        X: ["B", "A", "C"],
        Y: ["A", "B", "C"],
        Z: ["A", "C", "B"],
      },
    );
    const r1 = GaleShapleyAlgorithm.runStableMatching(input);
    const r2 = GaleShapleyAlgorithm.runStableMatching(input);
    assertEqual(r1.matching, r2.matching, "matching is deterministic");
    assertEqual(r1.steps, r2.steps, "steps are deterministic");
    assertEqual(r1.isStable, true, "final matching is stable");
    assert(
      r1.steps.some((s) => s.type === "proposal"),
      "contains proposal step",
    );
  });

  it("invalid preference duplicate (tie-like) is rejected", function () {
    let threw = false;
    try {
      GaleShapleyAlgorithm.runStableMatching(
        makeCase(
          ["A", "B"],
          ["X", "Y"],
          { A: ["X", "X"], B: ["Y", "X"] },
          { X: ["A", "B"], Y: ["A", "B"] },
        ),
      );
    } catch (err) {
      threw = true;
    }
    assertEqual(threw, true, "duplicate in ranking should throw");
  });

  it("invalid preference unknown participant is rejected", function () {
    let threw = false;
    try {
      GaleShapleyAlgorithm.runStableMatching(
        makeCase(
          ["A", "B"],
          ["X", "Y"],
          { A: ["X", "Y"], B: ["X", "Y"] },
          { X: ["A", "B"], Y: ["A", "Q"] },
        ),
      );
    } catch (err) {
      threw = true;
    }
    assertEqual(threw, true, "unknown participant in ranking should throw");
  });

  it("max supported size (24) runs and is stable", function () {
    const size = 24;
    const proposers = [];
    const acceptors = [];
    const proposerPreferences = {};
    const acceptorPreferences = {};

    for (let i = 0; i < size; i++) {
      proposers.push("P" + i);
      acceptors.push("A" + i);
    }
    for (let p = 0; p < size; p++) {
      proposerPreferences[proposers[p]] = acceptors.slice();
    }
    for (let a = 0; a < size; a++) {
      acceptorPreferences[acceptors[a]] = proposers.slice();
    }

    const result = GaleShapleyAlgorithm.runStableMatching(
      makeCase(proposers, acceptors, proposerPreferences, acceptorPreferences),
    );
    assertEqual(result.matching.length, size, "all participants are matched");
    assertEqual(result.isStable, true, "max-size case stable");
  });

  it("final rank outcomes are reported", function () {
    const result = GaleShapleyAlgorithm.runStableMatching(
      makeCase(
        ["A", "B"],
        ["X", "Y"],
        { A: ["X", "Y"], B: ["Y", "X"] },
        { X: ["A", "B"], Y: ["B", "A"] },
      ),
    );
    assertEqual(result.proposerOutcome.length, 2, "proposer outcomes present");
    assertEqual(result.acceptorOutcome.length, 2, "acceptor outcomes present");
    result.proposerOutcome.forEach(function (row) {
      assert(typeof row.rank === "number", "proposer rank is numeric");
    });
  });
});
