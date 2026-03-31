// @ts-ignore — IIFE + CommonJS bridge from gale-shapley-algorithm.js
import GaleShapleyAlgorithmModule from "./gale-shapley-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GaleShapleyAlgorithm: any = GaleShapleyAlgorithmModule;

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

export const MAX_SIZE: number =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  GaleShapleyAlgorithm.MAX_SIZE as number;

export function runStableMatching(
  input: StableMatchingInput,
): StableMatchingResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return GaleShapleyAlgorithm.runStableMatching(input) as StableMatchingResult;
}
