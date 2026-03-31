import GaleShapleyAlgorithmModule from "./gale-shapley-algorithm";

interface StableMatchingInput {
  proposers: string[];
  acceptors: string[];
  proposerPreferences: Record<string, string[]>;
  acceptorPreferences: Record<string, string[]>;
}

interface StableMatchingStep {
  type: "proposal" | "accept" | "reject" | "swap" | "done";
  description: string;
  proposalNumber: number;
  proposer: string | null;
  acceptor: string | null;
  matches: Record<string, string | null>;
  proposalsByProposer: Record<string, string[]>;
}

interface ProposerOutcome {
  proposer: string;
  acceptor: string | null;
  rank: number | null;
}

interface AcceptorOutcome {
  acceptor: string;
  proposer: string | null;
  rank: number | null;
}

interface StableMatchingResult {
  steps: StableMatchingStep[];
  matching: { proposer: string; acceptor: string }[];
  isStable: boolean;
  proposerOutcome: ProposerOutcome[];
  acceptorOutcome: AcceptorOutcome[];
}

type GaleShapleyAlgorithmModuleType = {
  MAX_SIZE: number;
  runStableMatching: (input: StableMatchingInput) => StableMatchingResult;
};

const GaleShapleyAlgorithm =
  GaleShapleyAlgorithmModule as GaleShapleyAlgorithmModuleType;

export const MAX_SIZE: number = GaleShapleyAlgorithm.MAX_SIZE;

export const runStableMatching = (
  input: StableMatchingInput,
): StableMatchingResult => GaleShapleyAlgorithm.runStableMatching(input);
