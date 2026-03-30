import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BubbleSort from './pages/algorithms/BubbleSort'
import MergeSort from './pages/algorithms/MergeSort'
import QuickSort from './pages/algorithms/QuickSort'
import RadixSort from './pages/algorithms/RadixSort'

export default function App() {
  return (
    <BrowserRouter basename="/algoviz">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/algorithms/bubble-sort" element={<BubbleSort />} />
        <Route path="/algorithms/merge-sort" element={<MergeSort />} />
        <Route path="/algorithms/quicksort" element={<QuickSort />} />
        <Route path="/algorithms/radix-sort" element={<RadixSort />} />
      </Routes>
    </BrowserRouter>
  )
}
