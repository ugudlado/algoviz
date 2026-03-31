// @ts-ignore
import BSTAlgorithmModule from "./bst-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BSTAlgorithm: any = BSTAlgorithmModule;

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const createTree: () => BSTTree = BSTAlgorithm.createTree;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const insert: (tree: BSTTree, value: number) => BSTTree =
  BSTAlgorithm.insert;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const bulkInsert: (tree: BSTTree, values: number[]) => BSTTree =
  BSTAlgorithm.bulkInsert;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const inorder: (tree: BSTTree) => {
  steps: BSTStep[];
  result: number[];
} = BSTAlgorithm.inorder;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const preorder: (tree: BSTTree) => {
  steps: BSTStep[];
  result: number[];
} = BSTAlgorithm.preorder;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const postorder: (tree: BSTTree) => {
  steps: BSTStep[];
  result: number[];
} = BSTAlgorithm.postorder;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getLayout: (
  tree: BSTTree,
  width?: number,
  verticalSpacing?: number,
) => { nodes: BSTLayoutNode[]; edges: BSTLayoutEdge[] } =
  BSTAlgorithm.getLayout;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const size: (tree: BSTTree) => number = BSTAlgorithm.size;
