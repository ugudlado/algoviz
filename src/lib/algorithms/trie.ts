import TrieAlgorithmModule from "./trie-algorithm";

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

type TrieAlgorithmModuleType = {
  createTrie: () => Trie;
  insert: (trie: Trie, word: string) => { steps: TrieStep[] };
  search: (trie: Trie, word: string) => { steps: TrieStep[]; found: boolean };
  prefixQuery: (
    trie: Trie,
    prefix: string,
  ) => { steps: TrieStep[]; words: string[] };
  getWords: (trie: Trie) => string[];
};

const TrieAlgorithm = TrieAlgorithmModule as TrieAlgorithmModuleType;

export const createTrie: () => Trie = TrieAlgorithm.createTrie;
export const insert: (trie: Trie, word: string) => { steps: TrieStep[] } =
  TrieAlgorithm.insert;
export const search: (
  trie: Trie,
  word: string,
) => { steps: TrieStep[]; found: boolean } = TrieAlgorithm.search;
export const prefixQuery: (
  trie: Trie,
  prefix: string,
) => { steps: TrieStep[]; words: string[] } = TrieAlgorithm.prefixQuery;
export const getWords: (trie: Trie) => string[] = TrieAlgorithm.getWords;
