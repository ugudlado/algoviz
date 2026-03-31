import BTreeAlgorithmModule from "./btree-algorithm";

export interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
  leaf: boolean;
}

export interface BTreeStep {
  type: string;
  root: BTreeNode | null;
  message: string;
}

type BTreeAlgorithmModuleType = {
  keyCount: (root: BTreeNode | null) => number;
  insertKey: (
    root: BTreeNode | null,
    key: number,
    t: number,
    steps?: BTreeStep[],
  ) => { root: BTreeNode | null; steps: BTreeStep[]; error?: boolean };
  deleteKey: (
    root: BTreeNode | null,
    key: number,
    t: number,
    steps?: BTreeStep[],
  ) => { root: BTreeNode | null; steps: BTreeStep[]; error?: boolean };
  bulkInsert: (
    keys: number[],
    t: number,
  ) => { root: BTreeNode | null; steps: BTreeStep[] };
};

const BTreeAlgorithm = BTreeAlgorithmModule as BTreeAlgorithmModuleType;

export const keyCount: (root: BTreeNode | null) => number =
  BTreeAlgorithm.keyCount;
export const insertKey: (
  root: BTreeNode | null,
  key: number,
  t: number,
  steps?: BTreeStep[],
) => { root: BTreeNode | null; steps: BTreeStep[]; error?: boolean } =
  BTreeAlgorithm.insertKey;
export const deleteKey: (
  root: BTreeNode | null,
  key: number,
  t: number,
  steps?: BTreeStep[],
) => { root: BTreeNode | null; steps: BTreeStep[]; error?: boolean } =
  BTreeAlgorithm.deleteKey;
export const bulkInsert: (
  keys: number[],
  t: number,
) => { root: BTreeNode | null; steps: BTreeStep[] } = BTreeAlgorithm.bulkInsert;
