// @ts-ignore
import AVLAlgorithmModule from "./avl-tree-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AVLAlgorithm: any = AVLAlgorithmModule;

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const insert: (root: AVLNode | null, value: number) => AVLInsertResult =
  AVLAlgorithm.insert;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getLayout: (
  root: AVLNode | null,
  width?: number,
  verticalSpacing?: number,
) => AVLLayout = AVLAlgorithm.getLayout;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const size: (root: AVLNode | null) => number = AVLAlgorithm.size;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const height: (node: AVLNode | null) => number = AVLAlgorithm.height;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const balanceFactor: (node: AVLNode | null) => number =
  AVLAlgorithm.balanceFactor;
