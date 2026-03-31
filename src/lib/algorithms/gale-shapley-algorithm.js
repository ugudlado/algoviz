/**
 * Gale-Shapley Stable Matching Algorithm
 *
 * Pure functions — no DOM dependency.
 * Deterministic proposer-optimal stable matching with step snapshots.
 */
var GaleShapleyAlgorithm = (function () {
  "use strict";

  var MAX_SIZE = 24;

  function cloneMatches(matches) {
    var copy = {};
    var keys = Object.keys(matches);
    for (var i = 0; i < keys.length; i++) {
      copy[keys[i]] = matches[keys[i]];
    }
    return copy;
  }

  function cloneHistory(history) {
    var copy = {};
    var keys = Object.keys(history);
    for (var i = 0; i < keys.length; i++) {
      copy[keys[i]] = history[keys[i]].slice();
    }
    return copy;
  }

  function hasDuplicates(list) {
    var seen = {};
    for (var i = 0; i < list.length; i++) {
      if (seen[list[i]]) return true;
      seen[list[i]] = true;
    }
    return false;
  }

  function buildRankMap(prefsByName) {
    var rankMap = {};
    var names = Object.keys(prefsByName);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      var pref = prefsByName[name];
      var map = {};
      for (var j = 0; j < pref.length; j++) {
        map[pref[j]] = j + 1;
      }
      rankMap[name] = map;
    }
    return rankMap;
  }

  function validateInput(input) {
    if (!input || typeof input !== "object") {
      throw new Error("Input object is required.");
    }
    var proposers = input.proposers || [];
    var acceptors = input.acceptors || [];
    var proposerPreferences = input.proposerPreferences || {};
    var acceptorPreferences = input.acceptorPreferences || {};

    if (!Array.isArray(proposers) || !Array.isArray(acceptors)) {
      throw new Error("Proposers and acceptors must be arrays.");
    }
    if (proposers.length !== acceptors.length) {
      throw new Error("Both groups must have equal size.");
    }
    if (proposers.length > MAX_SIZE) {
      throw new Error(
        "Input size exceeds max supported size of " + MAX_SIZE + ".",
      );
    }
    if (hasDuplicates(proposers) || hasDuplicates(acceptors)) {
      throw new Error("Participant names must be unique in each group.");
    }

    var proposerSet = {};
    var acceptorSet = {};
    var i;
    for (i = 0; i < proposers.length; i++) proposerSet[proposers[i]] = true;
    for (i = 0; i < acceptors.length; i++) acceptorSet[acceptors[i]] = true;

    for (i = 0; i < proposers.length; i++) {
      var proposer = proposers[i];
      var proposerRank = proposerPreferences[proposer];
      if (
        !Array.isArray(proposerRank) ||
        proposerRank.length !== acceptors.length
      ) {
        throw new Error("Invalid proposer ranking for " + proposer + ".");
      }
      if (hasDuplicates(proposerRank)) {
        throw new Error(
          "Duplicate entries in proposer ranking for " + proposer + ".",
        );
      }
      for (var j = 0; j < proposerRank.length; j++) {
        if (!acceptorSet[proposerRank[j]]) {
          throw new Error(
            "Unknown acceptor '" +
              proposerRank[j] +
              "' in ranking for " +
              proposer +
              ".",
          );
        }
      }
    }

    for (i = 0; i < acceptors.length; i++) {
      var acceptor = acceptors[i];
      var acceptorRank = acceptorPreferences[acceptor];
      if (
        !Array.isArray(acceptorRank) ||
        acceptorRank.length !== proposers.length
      ) {
        throw new Error("Invalid acceptor ranking for " + acceptor + ".");
      }
      if (hasDuplicates(acceptorRank)) {
        throw new Error(
          "Duplicate entries in acceptor ranking for " + acceptor + ".",
        );
      }
      for (var k = 0; k < acceptorRank.length; k++) {
        if (!proposerSet[acceptorRank[k]]) {
          throw new Error(
            "Unknown proposer '" +
              acceptorRank[k] +
              "' in ranking for " +
              acceptor +
              ".",
          );
        }
      }
    }
  }

  function buildStep(
    type,
    description,
    matches,
    history,
    proposalNumber,
    proposer,
    acceptor,
  ) {
    return {
      type: type,
      description: description,
      proposalNumber: proposalNumber,
      proposer: proposer || null,
      acceptor: acceptor || null,
      matches: cloneMatches(matches),
      proposalsByProposer: cloneHistory(history),
    };
  }

  function isStableMatching(
    matchingByAcceptor,
    proposers,
    acceptors,
    proposerRank,
    acceptorRank,
  ) {
    var proposerPartner = {};
    for (var i = 0; i < acceptors.length; i++) {
      var acceptor = acceptors[i];
      var proposer = matchingByAcceptor[acceptor];
      if (proposer) proposerPartner[proposer] = acceptor;
    }

    for (var p = 0; p < proposers.length; p++) {
      var proposer = proposers[p];
      var currentAcceptor = proposerPartner[proposer];
      for (var a = 0; a < acceptors.length; a++) {
        var targetAcceptor = acceptors[a];
        if (targetAcceptor === currentAcceptor) continue;
        var proposerPrefersTarget =
          proposerRank[proposer][targetAcceptor] <
          proposerRank[proposer][currentAcceptor];
        if (!proposerPrefersTarget) continue;
        var matchedProposer = matchingByAcceptor[targetAcceptor];
        var acceptorPrefersProposer =
          matchedProposer === null ||
          acceptorRank[targetAcceptor][proposer] <
            acceptorRank[targetAcceptor][matchedProposer];
        if (acceptorPrefersProposer) {
          return false;
        }
      }
    }
    return true;
  }

  function buildOutcomeRows(
    matchingByAcceptor,
    proposers,
    acceptors,
    proposerRank,
    acceptorRank,
  ) {
    var proposerPartner = {};
    var i;
    for (i = 0; i < acceptors.length; i++) {
      var acceptor = acceptors[i];
      var proposer = matchingByAcceptor[acceptor];
      if (proposer) proposerPartner[proposer] = acceptor;
    }

    var proposerOutcome = [];
    for (i = 0; i < proposers.length; i++) {
      var p = proposers[i];
      var a = proposerPartner[p];
      proposerOutcome.push({
        proposer: p,
        acceptor: a || null,
        rank: a ? proposerRank[p][a] : null,
      });
    }

    var acceptorOutcome = [];
    for (i = 0; i < acceptors.length; i++) {
      var acc = acceptors[i];
      var prop = matchingByAcceptor[acc];
      acceptorOutcome.push({
        acceptor: acc,
        proposer: prop || null,
        rank: prop ? acceptorRank[acc][prop] : null,
      });
    }

    return {
      proposerOutcome: proposerOutcome,
      acceptorOutcome: acceptorOutcome,
    };
  }

  function runStableMatching(input) {
    validateInput(input);

    var proposers = input.proposers.slice();
    var acceptors = input.acceptors.slice();
    var proposerPreferences = input.proposerPreferences;
    var acceptorPreferences = input.acceptorPreferences;

    var proposerRank = buildRankMap(proposerPreferences);
    var acceptorRank = buildRankMap(acceptorPreferences);

    var matchesByAcceptor = {};
    var proposalsByProposer = {};
    var nextChoiceIndex = {};
    var i;
    for (i = 0; i < acceptors.length; i++) {
      matchesByAcceptor[acceptors[i]] = null;
    }
    for (i = 0; i < proposers.length; i++) {
      proposalsByProposer[proposers[i]] = [];
      nextChoiceIndex[proposers[i]] = 0;
    }

    var freeQueue = proposers.slice();
    var steps = [];
    var proposalNumber = 0;

    if (proposers.length === 0) {
      steps.push(
        buildStep(
          "done",
          "No participants. Empty matching is stable.",
          matchesByAcceptor,
          proposalsByProposer,
          0,
        ),
      );
      return {
        steps: steps,
        matching: [],
        isStable: true,
        proposerOutcome: [],
        acceptorOutcome: [],
      };
    }

    while (freeQueue.length > 0) {
      var proposer = freeQueue.shift();
      var idx = nextChoiceIndex[proposer];
      if (idx >= acceptors.length) {
        continue;
      }
      var acceptor = proposerPreferences[proposer][idx];
      nextChoiceIndex[proposer] = idx + 1;
      proposalsByProposer[proposer].push(acceptor);
      proposalNumber++;

      steps.push(
        buildStep(
          "proposal",
          proposer + " proposes to " + acceptor + ".",
          matchesByAcceptor,
          proposalsByProposer,
          proposalNumber,
          proposer,
          acceptor,
        ),
      );

      var current = matchesByAcceptor[acceptor];
      if (current === null) {
        matchesByAcceptor[acceptor] = proposer;
        steps.push(
          buildStep(
            "accept",
            acceptor + " is free and tentatively accepts " + proposer + ".",
            matchesByAcceptor,
            proposalsByProposer,
            proposalNumber,
            proposer,
            acceptor,
          ),
        );
      } else {
        var prefersNew =
          acceptorRank[acceptor][proposer] < acceptorRank[acceptor][current];
        if (prefersNew) {
          matchesByAcceptor[acceptor] = proposer;
          freeQueue.push(current);
          steps.push(
            buildStep(
              "swap",
              acceptor +
                " prefers " +
                proposer +
                " over " +
                current +
                " and swaps.",
              matchesByAcceptor,
              proposalsByProposer,
              proposalNumber,
              proposer,
              acceptor,
            ),
          );
        } else {
          freeQueue.push(proposer);
          steps.push(
            buildStep(
              "reject",
              acceptor + " rejects " + proposer + " and keeps " + current + ".",
              matchesByAcceptor,
              proposalsByProposer,
              proposalNumber,
              proposer,
              acceptor,
            ),
          );
        }
      }
    }

    var matching = [];
    for (i = 0; i < acceptors.length; i++) {
      var acc = acceptors[i];
      matching.push({ proposer: matchesByAcceptor[acc], acceptor: acc });
    }
    matching.sort(function (a, b) {
      return a.proposer < b.proposer ? -1 : a.proposer > b.proposer ? 1 : 0;
    });

    var stable = isStableMatching(
      matchesByAcceptor,
      proposers,
      acceptors,
      proposerRank,
      acceptorRank,
    );
    var outcomes = buildOutcomeRows(
      matchesByAcceptor,
      proposers,
      acceptors,
      proposerRank,
      acceptorRank,
    );

    steps.push(
      buildStep(
        "done",
        stable
          ? "Algorithm complete. Matching is stable."
          : "Algorithm complete. Matching is not stable.",
        matchesByAcceptor,
        proposalsByProposer,
        proposalNumber,
      ),
    );

    return {
      steps: steps,
      matching: matching,
      isStable: stable,
      proposerOutcome: outcomes.proposerOutcome,
      acceptorOutcome: outcomes.acceptorOutcome,
    };
  }

  return {
    MAX_SIZE: MAX_SIZE,
    runStableMatching: runStableMatching,
    isStableMatching: isStableMatching,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GaleShapleyAlgorithm;
}
