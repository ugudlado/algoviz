export interface PathStep {
  id: string;
  name: string;
  algorithmPath: string;
  narrative: string;
  setting: string;
  analogy: string;
  takeaway: string;
}

export interface PathTier {
  name: string;
  description: string;
  steps: PathStep[];
}

export interface LearningPath {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  accentColor: string;
  icon: string;
  tiers: PathTier[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "delivery-startup",
    title: "The Delivery Startup",
    tagline: "Build a company, algorithm by algorithm",
    description:
      "You're building a delivery startup from scratch. Each chapter solves a real problem your company faces as it grows — from sorting orders to optimizing routes to caching frequent zones.",
    accentColor: "var(--cat-sorting)",
    icon: "🚚",
    tiers: [
      {
        name: "Chapters",
        description: "Follow the story from founding to scale",
        steps: [
          {
            id: "ch-1",
            name: "Sort the Orders",
            algorithmPath: "/algorithms/bubble-sort",
            narrative:
              "Day one. Orders are pouring in and the warehouse is chaos. You need the simplest way to get packages in priority order — even if it's slow, it works.",
            setting: "Warehouse",
            analogy:
              "Like sorting books on a shelf by height — compare two neighbors, swap if out of order. After each pass, the tallest unsorted book bubbles to its correct spot.",
            takeaway:
              "Simple comparison-based sorting: O(n\u00B2) but easy to understand and implement. Foundation for grasping more efficient sorts.",
          },
          {
            id: "ch-2",
            name: "Scale the Sorting",
            algorithmPath: "/algorithms/merge-sort",
            narrative:
              "Business is booming. Bubble sort can't keep up with 10,000 daily orders. Time to divide the pile, sort each half, and merge — a strategy that scales.",
            setting: "Warehouse",
            analogy:
              "Sorting a giant pile of student papers: split the pile in two, give each half to an assistant, they sort their pile and hand it back. Merge the two sorted stacks by picking the smaller front card each time.",
            takeaway:
              "Divide and conquer guarantees O(n log n). Trading extra memory for predictable performance at scale.",
          },
          {
            id: "ch-3",
            name: "Find the Package",
            algorithmPath: "/algorithms/binary-search",
            narrative:
              "A customer calls: 'Where's my order?' With a sorted inventory, you can find any package in seconds by repeatedly halving the search space.",
            setting: "Inventory System",
            analogy:
              "Looking up a word in a dictionary — open to the middle, see if your word comes before or after, then eliminate half the book with each comparison.",
            takeaway:
              "Sorted data enables O(log n) search. The prerequisite (sorted input) is the cost; the payoff is exponentially faster lookups.",
          },
          {
            id: "ch-4",
            name: "Map the Routes",
            algorithmPath: "/algorithms/bfs-pathfinding",
            narrative:
              "Deliveries need routes. You start simple — explore the city grid layer by layer to find the shortest path from warehouse to customer.",
            setting: "City Map",
            analogy:
              "Ripples on a pond — waves expand one ring at a time from the start, so the first time the goal is reached uses the minimum number of steps.",
            takeaway:
              "BFS guarantees shortest path on unweighted graphs. Uses a queue (FIFO) to explore layer by layer.",
          },
          {
            id: "ch-5",
            name: "Optimize Delivery",
            algorithmPath: "/algorithms/dijkstra",
            narrative:
              "Not all roads are equal — highways are faster than side streets. Dijkstra's algorithm finds the truly shortest route by weighing each road segment.",
            setting: "City Map",
            analogy:
              "GPS navigation — starting from your location, the GPS explores nearby intersections first, always expanding to the closest unvisited intersection, until it finds the shortest route to your destination.",
            takeaway:
              "Greedy + priority queue = optimal shortest paths on weighted graphs. Extends BFS to handle edge weights.",
          },
          {
            id: "ch-6",
            name: "Build the Network",
            algorithmPath: "/algorithms/kruskal",
            narrative:
              "Time to open regional hubs. Connect all warehouses with the cheapest possible network of roads — a minimum spanning tree problem.",
            setting: "Logistics Network",
            analogy:
              "Connecting villages with roads — list all possible roads by cost, cheapest first. Build each road only if it links a village not yet reachable. Skip any that would create a loop.",
            takeaway:
              "Greedy edge selection + union-find cycle detection builds a minimum spanning tree in O(E log E).",
          },
          {
            id: "ch-7",
            name: "Schedule Deliveries",
            algorithmPath: "/algorithms/topo-sort",
            narrative:
              "Some deliveries depend on others — package B can't ship until package A arrives at the hub. Topological sort untangles these dependencies.",
            setting: "Dispatch Center",
            analogy:
              "Like scheduling university courses — you can't take Advanced Algorithms before Introduction to CS. Topological sort gives a valid order respecting all prerequisites.",
            takeaway:
              "Linear ordering of a DAG where every edge u\u2192v has u before v. Essential for dependency resolution.",
          },
          {
            id: "ch-8",
            name: "Load the Truck",
            algorithmPath: "/algorithms/knapsack",
            narrative:
              "The truck has limited space. Each package has a size and a delivery urgency score. The knapsack problem helps maximize value per trip.",
            setting: "Loading Dock",
            analogy:
              "Packing a suitcase for a flight — you have a weight limit and must choose which items to bring to maximize value. Each item is all-or-nothing.",
            takeaway:
              "Classic dynamic programming: build a table of optimal sub-solutions to avoid re-computing overlapping subproblems.",
          },
          {
            id: "ch-9",
            name: "Autocomplete Addresses",
            algorithmPath: "/algorithms/trie",
            narrative:
              "Customers mistype addresses constantly. A trie lets your app suggest completions as they type — fast prefix lookups from millions of addresses.",
            setting: "Customer App",
            analogy:
              "Like autocomplete on your phone — every prefix you type branches into all possible completions. Typing 'ap' immediately narrows to all words starting with 'ap'.",
            takeaway:
              "Tries trade memory for speed: O(m) lookup per key length m, independent of how many keys are stored.",
          },
          {
            id: "ch-10",
            name: "Cache Hot Zones",
            algorithmPath: "/algorithms/lru-cache",
            narrative:
              "90% of deliveries go to the same 50 neighborhoods. An LRU cache keeps the most-requested routes ready, evicting the least-used ones.",
            setting: "Backend System",
            analogy:
              "Like keeping your desk clear — when it gets full, you put away whatever you haven't touched in the longest time to make room for what you just picked up.",
            takeaway:
              "Doubly-linked list + hash map = O(1) get/put with automatic eviction of the least recently used entry.",
          },
        ],
      },
    ],
  },
  {
    slug: "algorithm-detective",
    title: "Algorithm Detective",
    tagline: "Solve mysteries using algorithmic thinking",
    description:
      "You're a detective solving cases. Each case presents a mystery that requires a specific algorithmic technique. Work your way from Rookie to Chief — within each rank, tackle cases in any order.",
    accentColor: "var(--cat-graph)",
    icon: "🔍",
    tiers: [
      {
        name: "Rookie",
        description: "Learn the fundamentals through your first cases",
        steps: [
          {
            id: "rookie-1",
            name: "The Shuffled Evidence",
            algorithmPath: "/algorithms/bubble-sort",
            narrative:
              "Crime scene photos are out of order. Sort them by timestamp to reconstruct the sequence of events. The simplest sort reveals the story.",
            setting: "Evidence Room",
            analogy:
              "Like sorting books on a shelf by height — compare two neighbors, swap if out of order. After each pass, the tallest unsorted book bubbles to its correct spot.",
            takeaway:
              "Bubble sort is O(n\u00B2) but teaches the core idea of comparison-based sorting through repeated adjacent swaps.",
          },
          {
            id: "rookie-2",
            name: "The Missing Witness",
            algorithmPath: "/algorithms/binary-search",
            narrative:
              "A witness is hiding in sorted police records. With thousands of files, you can't check each one — halve the search space until you find the name.",
            setting: "Records Archive",
            analogy:
              "Looking up a word in a dictionary — open to the middle, see if your word comes before or after, eliminate half the book each time.",
            takeaway:
              "Binary search achieves O(log n) by halving the search space with each comparison. Requires sorted input.",
          },
          {
            id: "rookie-3",
            name: "The Lost Hiker",
            algorithmPath: "/algorithms/bfs-pathfinding",
            narrative:
              "A hiker went missing in a forest grid. Search outward from their last known position, layer by layer, to cover the most ground systematically.",
            setting: "Forest Grid",
            analogy:
              "Ripples on a pond — waves expand one ring at a time, so the first time you reach a cell is via the shortest path.",
            takeaway:
              "BFS uses a queue to explore level by level, guaranteeing shortest path on unweighted graphs.",
          },
        ],
      },
      {
        name: "Inspector",
        description: "Harder cases requiring deeper algorithmic insight",
        steps: [
          {
            id: "inspector-1",
            name: "The Network Conspiracy",
            algorithmPath: "/algorithms/dijkstra",
            narrative:
              "Follow the money through a network of shell companies. Find the shortest chain of transactions linking the suspect to the crime.",
            setting: "Financial Network",
            analogy:
              "GPS navigation — starting from your location, always expand to the closest unvisited intersection until the shortest route is found.",
            takeaway:
              "Dijkstra's greedy approach with a priority queue finds optimal shortest paths on weighted graphs.",
          },
          {
            id: "inspector-2",
            name: "The DNA Match",
            algorithmPath: "/algorithms/kmp",
            narrative:
              "A DNA fragment was found at the scene. Search through the suspect's genome for this exact pattern — efficiently, without backtracking.",
            setting: "Forensics Lab",
            analogy:
              "Like searching for a word in a book — when a partial match fails, you skip ahead using what you already know instead of restarting from scratch.",
            takeaway:
              "KMP's failure function enables O(n+m) string matching by never re-scanning already matched characters.",
          },
          {
            id: "inspector-3",
            name: "The Efficient Filing System",
            algorithmPath: "/algorithms/avl-tree",
            narrative:
              "The precinct's case files are a mess — lookups take forever. Reorganize into a balanced tree where every search hits in logarithmic time.",
            setting: "Precinct Archive",
            analogy:
              "A perfectly balanced filing cabinet — every drawer stays within one level of any other, so you never search too deep. Rotations restore balance when one side grows too tall.",
            takeaway:
              "AVL trees maintain O(log n) operations through automatic rotations after every insert/delete.",
          },
        ],
      },
      {
        name: "Chief",
        description: "Complex cases for seasoned investigators",
        steps: [
          {
            id: "chief-1",
            name: "The Resource Heist",
            algorithmPath: "/algorithms/knapsack",
            narrative:
              "Thieves stole from a vault with limited bag space. Reconstruct what they took by finding the maximum value combination that fits the constraints.",
            setting: "Vault Crime Scene",
            analogy:
              "Packing a suitcase for a flight — you have a weight limit and must choose items to maximize value. Each item is all-or-nothing.",
            takeaway:
              "0/1 Knapsack uses DP to build optimal sub-solutions, avoiding exponential brute-force enumeration.",
          },
          {
            id: "chief-2",
            name: "The Encoded Message",
            algorithmPath: "/algorithms/huffman",
            narrative:
              "Intercepted a coded message using variable-length encoding. Build the Huffman tree to decode the transmission and reveal the plot.",
            setting: "Cryptanalysis Lab",
            analogy:
              "Like Morse code — common letters (E, T) get short codes while rare letters (Q, Z) get longer ones. Huffman finds the mathematically optimal assignment.",
            takeaway:
              "Greedy tree-building produces optimal prefix-free codes. Frequent symbols get shorter codes, minimizing total encoding length.",
          },
          {
            id: "chief-3",
            name: "The Final Standoff",
            algorithmPath: "/algorithms/minimax",
            narrative:
              "The criminal is one step ahead. Model the standoff as a game tree — predict their optimal move and counter it with yours.",
            setting: "Strategic Command",
            analogy:
              "Think several moves ahead in chess — you pick moves that guarantee the best worst-case outcome, assuming your opponent plays perfectly.",
            takeaway:
              "Minimax explores the game tree to find the optimal strategy by alternating between maximizing and minimizing players.",
          },
        ],
      },
    ],
  },
];

export function getPathBySlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}

export function getTotalSteps(path: LearningPath): number {
  return path.tiers.reduce((sum, tier) => sum + tier.steps.length, 0);
}
