import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
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

export default function App() {
  return (
    <BrowserRouter basename="/algoviz">
      <Routes>
        <Route path="/" element={<Home />} />
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
      </Routes>
    </BrowserRouter>
  );
}
