import AVLAlgorithmModule from "./avl-tree-algorithm";

export interface AVLNode {
  value: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;
}

export interface AVLLayoutNode {
  value: number;
  x: number;
  y: number;
  balanceFactor: number;
  height: number;
}

export interface AVLLayoutEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface AVLLayout {
  nodes: AVLLayoutNode[];
  edges: AVLLayoutEdge[];
}

export type AVLRotationType = "LL" | "RR" | "LR" | "RL";

export interface AVLStep {
  type: string;
  value?: number;
  rotationType?: AVLRotationType;
  imbalancedNode?: number | null;
  rootSnapshot: AVLNode | null;
}

interface AVLInsertResult {
  root: AVLNode;
  steps: AVLStep[];
}

type AVLAlgorithmModuleType = {
  insert: (root: AVLNode | null, value: number) => AVLInsertResult;
  getLayout: (
    root: AVLNode | null,
    width?: number,
    verticalSpacing?: number,
  ) => AVLLayout;
  size: (root: AVLNode | null) => number;
  height: (node: AVLNode | null) => number;
  balanceFactor: (node: AVLNode | null) => number;
};

const AVLAlgorithm = AVLAlgorithmModule as AVLAlgorithmModuleType;

export const insert: (root: AVLNode | null, value: number) => AVLInsertResult =
  AVLAlgorithm.insert;
export const getLayout: (
  root: AVLNode | null,
  width?: number,
  verticalSpacing?: number,
) => AVLLayout = AVLAlgorithm.getLayout;
export const size: (root: AVLNode | null) => number = AVLAlgorithm.size;
export const height: (node: AVLNode | null) => number = AVLAlgorithm.height;
export const balanceFactor: (node: AVLNode | null) => number =
  AVLAlgorithm.balanceFactor;
