// @ts-ignore
import TrieAlgorithmModule from "./trie-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TrieAlgorithm: any = TrieAlgorithmModule;

export interface TrieNode {
  char: string;
  isEnd: boolean;
  children: Record<string, TrieNode>;
}

export interface Trie {
  root: TrieNode;
}

export interface TrieStep {
  char: string;
  charIndex: number;
  path: string[];
  found?: boolean;
  isNew?: boolean;
  words?: string[];
  word?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const createTrie: () => Trie = TrieAlgorithm.createTrie;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const insert: (trie: Trie, word: string) => { steps: TrieStep[] } =
  TrieAlgorithm.insert;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const search: (
  trie: Trie,
  word: string,
) => { steps: TrieStep[]; found: boolean } = TrieAlgorithm.search;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const prefixQuery: (
  trie: Trie,
  prefix: string,
) => { steps: TrieStep[]; words: string[] } = TrieAlgorithm.prefixQuery;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getWords: (trie: Trie) => string[] = TrieAlgorithm.getWords;
