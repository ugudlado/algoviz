import BSTAlgorithmModule from "./bst-algorithm";

export interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface BSTTree {
  root: BSTNode | null;
}

export interface BSTLayoutNode {
  value: number;
  x: number;
  y: number;
}

export interface BSTLayoutEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface BSTStep {
  type: string;
  value: number;
  visited: number[];
}

type BSTAlgorithmModuleType = {
  createTree: () => BSTTree;
  insert: (tree: BSTTree, value: number) => BSTTree;
  bulkInsert: (tree: BSTTree, values: number[]) => BSTTree;
  inorder: (tree: BSTTree) => { steps: BSTStep[]; result: number[] };
  preorder: (tree: BSTTree) => { steps: BSTStep[]; result: number[] };
  postorder: (tree: BSTTree) => { steps: BSTStep[]; result: number[] };
  getLayout: (
    tree: BSTTree,
    width?: number,
    verticalSpacing?: number,
  ) => { nodes: BSTLayoutNode[]; edges: BSTLayoutEdge[] };
  size: (tree: BSTTree) => number;
};

const BSTAlgorithm = BSTAlgorithmModule as BSTAlgorithmModuleType;

export const createTree: () => BSTTree = BSTAlgorithm.createTree;
export const insert: (tree: BSTTree, value: number) => BSTTree =
  BSTAlgorithm.insert;
export const bulkInsert: (tree: BSTTree, values: number[]) => BSTTree =
  BSTAlgorithm.bulkInsert;
export const inorder: (tree: BSTTree) => {
  steps: BSTStep[];
  result: number[];
} = BSTAlgorithm.inorder;
export const preorder: (tree: BSTTree) => {
  steps: BSTStep[];
  result: number[];
} = BSTAlgorithm.preorder;
export const postorder: (tree: BSTTree) => {
  steps: BSTStep[];
  result: number[];
} = BSTAlgorithm.postorder;
export const getLayout: (
  tree: BSTTree,
  width?: number,
  verticalSpacing?: number,
) => { nodes: BSTLayoutNode[]; edges: BSTLayoutEdge[] } =
  BSTAlgorithm.getLayout;
export const size: (tree: BSTTree) => number = BSTAlgorithm.size;
