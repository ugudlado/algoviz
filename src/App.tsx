import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LearningPathDetail from "./pages/LearningPathDetail";
import Settings from "./pages/Settings";
import BubbleSort from "./pages/algorithms/BubbleSort";
import MergeSort from "./pages/algorithms/MergeSort";
import QuickSort from "./pages/algorithms/QuickSort";
import RadixSort from "./pages/algorithms/RadixSort";
import BinarySearch from "./pages/algorithms/BinarySearch";
import BfsPathfinding from "./pages/algorithms/BfsPathfinding";
import DfsPathfinding from "./pages/algorithms/DfsPathfinding";
import AStar from "./pages/algorithms/AStar";
import Dijkstra from "./pages/algorithms/Dijkstra";
import Kruskal from "./pages/algorithms/Kruskal";
import Tarjan from "./pages/algorithms/Tarjan";
import Prims from "./pages/algorithms/Prims";
import FloydWarshall from "./pages/algorithms/FloydWarshall";
import TopoSort from "./pages/algorithms/TopoSort";
import FordFulkerson from "./pages/algorithms/FordFulkerson";
import Knapsack from "./pages/algorithms/Knapsack";
import Lcs from "./pages/algorithms/Lcs";
import Levenshtein from "./pages/algorithms/Levenshtein";
import Kmp from "./pages/algorithms/Kmp";
import Huffman from "./pages/algorithms/Huffman";
import AvlTree from "./pages/algorithms/AvlTree";
import BstTraversal from "./pages/algorithms/BstTraversal";
import Btree from "./pages/algorithms/Btree";
import MinHeap from "./pages/algorithms/MinHeap";
import Trie from "./pages/algorithms/Trie";
import LruCache from "./pages/algorithms/LruCache";
import BloomFilter from "./pages/algorithms/BloomFilter";
import UnionFind from "./pages/algorithms/UnionFind";
import SlidingWindow from "./pages/algorithms/SlidingWindow";
import ConvexHull from "./pages/algorithms/ConvexHull";
import ElevatorScan from "./pages/algorithms/ElevatorScan";
import Minimax from "./pages/algorithms/Minimax";
import NQueens from "./pages/algorithms/NQueens";
import GaleShapley from "./pages/algorithms/GaleShapley";

export default function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/learning-paths/:slug" element={<LearningPathDetail />} />
        <Route path="/algorithms/bubble-sort" element={<BubbleSort />} />
        <Route path="/algorithms/merge-sort" element={<MergeSort />} />
        <Route path="/algorithms/quicksort" element={<QuickSort />} />
        <Route path="/algorithms/radix-sort" element={<RadixSort />} />
        <Route path="/algorithms/binary-search" element={<BinarySearch />} />
        <Route
          path="/algorithms/bfs-pathfinding"
          element={<BfsPathfinding />}
        />
        <Route
          path="/algorithms/dfs-pathfinding"
          element={<DfsPathfinding />}
        />
        <Route path="/algorithms/astar-pathfinding" element={<AStar />} />
        <Route path="/algorithms/dijkstra" element={<Dijkstra />} />
        <Route path="/algorithms/kruskal" element={<Kruskal />} />
        <Route path="/algorithms/tarjan" element={<Tarjan />} />
        <Route path="/algorithms/prims-mst" element={<Prims />} />
        <Route path="/algorithms/floyd-warshall" element={<FloydWarshall />} />
        <Route path="/algorithms/ford-fulkerson" element={<FordFulkerson />} />
        <Route path="/algorithms/topo-sort" element={<TopoSort />} />
        <Route path="/algorithms/knapsack" element={<Knapsack />} />
        <Route path="/algorithms/lcs" element={<Lcs />} />
        <Route path="/algorithms/levenshtein" element={<Levenshtein />} />
        <Route path="/algorithms/kmp" element={<Kmp />} />
        <Route path="/algorithms/huffman" element={<Huffman />} />
        <Route path="/algorithms/avl-tree" element={<AvlTree />} />
        <Route path="/algorithms/bst-traversal" element={<BstTraversal />} />
        <Route path="/algorithms/btree" element={<Btree />} />
        <Route path="/algorithms/min-heap" element={<MinHeap />} />
        <Route path="/algorithms/trie" element={<Trie />} />
        <Route path="/algorithms/lru-cache" element={<LruCache />} />
        <Route path="/algorithms/bloom-filter" element={<BloomFilter />} />
        <Route path="/algorithms/union-find" element={<UnionFind />} />
        <Route path="/algorithms/sliding-window" element={<SlidingWindow />} />
        <Route path="/algorithms/convex-hull" element={<ConvexHull />} />
        <Route path="/algorithms/elevator-scan" element={<ElevatorScan />} />
        <Route path="/algorithms/minimax" element={<Minimax />} />
        <Route path="/algorithms/n-queens" element={<NQueens />} />
        <Route path="/algorithms/gale-shapley" element={<GaleShapley />} />
      </Routes>
    </BrowserRouter>
  );
}
