export interface PathStep {
  id: string;
  name: string;
  algorithmPath: string;
  narrative: string;
  setting: string;
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
          },
          {
            id: "ch-2",
            name: "Scale the Sorting",
            algorithmPath: "/algorithms/merge-sort",
            narrative:
              "Business is booming. Bubble sort can't keep up with 10,000 daily orders. Time to divide the pile, sort each half, and merge — a strategy that scales.",
            setting: "Warehouse",
          },
          {
            id: "ch-3",
            name: "Find the Package",
            algorithmPath: "/algorithms/binary-search",
            narrative:
              "A customer calls: 'Where's my order?' With a sorted inventory, you can find any package in seconds by repeatedly halving the search space.",
            setting: "Inventory System",
          },
          {
            id: "ch-4",
            name: "Map the Routes",
            algorithmPath: "/algorithms/bfs-pathfinding",
            narrative:
              "Deliveries need routes. You start simple — explore the city grid layer by layer to find the shortest path from warehouse to customer.",
            setting: "City Map",
          },
          {
            id: "ch-5",
            name: "Optimize Delivery",
            algorithmPath: "/algorithms/dijkstra",
            narrative:
              "Not all roads are equal — highways are faster than side streets. Dijkstra's algorithm finds the truly shortest route by weighing each road segment.",
            setting: "City Map",
          },
          {
            id: "ch-6",
            name: "Build the Network",
            algorithmPath: "/algorithms/kruskal",
            narrative:
              "Time to open regional hubs. Connect all warehouses with the cheapest possible network of roads — a minimum spanning tree problem.",
            setting: "Logistics Network",
          },
          {
            id: "ch-7",
            name: "Schedule Deliveries",
            algorithmPath: "/algorithms/topo-sort",
            narrative:
              "Some deliveries depend on others — package B can't ship until package A arrives at the hub. Topological sort untangles these dependencies.",
            setting: "Dispatch Center",
          },
          {
            id: "ch-8",
            name: "Load the Truck",
            algorithmPath: "/algorithms/knapsack",
            narrative:
              "The truck has limited space. Each package has a size and a delivery urgency score. The knapsack problem helps maximize value per trip.",
            setting: "Loading Dock",
          },
          {
            id: "ch-9",
            name: "Autocomplete Addresses",
            algorithmPath: "/algorithms/trie",
            narrative:
              "Customers mistype addresses constantly. A trie lets your app suggest completions as they type — fast prefix lookups from millions of addresses.",
            setting: "Customer App",
          },
          {
            id: "ch-10",
            name: "Cache Hot Zones",
            algorithmPath: "/algorithms/lru-cache",
            narrative:
              "90% of deliveries go to the same 50 neighborhoods. An LRU cache keeps the most-requested routes ready, evicting the least-used ones.",
            setting: "Backend System",
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
          },
          {
            id: "rookie-2",
            name: "The Missing Witness",
            algorithmPath: "/algorithms/binary-search",
            narrative:
              "A witness is hiding in sorted police records. With thousands of files, you can't check each one — halve the search space until you find the name.",
            setting: "Records Archive",
          },
          {
            id: "rookie-3",
            name: "The Lost Hiker",
            algorithmPath: "/algorithms/bfs-pathfinding",
            narrative:
              "A hiker went missing in a forest grid. Search outward from their last known position, layer by layer, to cover the most ground systematically.",
            setting: "Forest Grid",
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
          },
          {
            id: "inspector-2",
            name: "The DNA Match",
            algorithmPath: "/algorithms/kmp",
            narrative:
              "A DNA fragment was found at the scene. Search through the suspect's genome for this exact pattern — efficiently, without backtracking.",
            setting: "Forensics Lab",
          },
          {
            id: "inspector-3",
            name: "The Efficient Filing System",
            algorithmPath: "/algorithms/avl-tree",
            narrative:
              "The precinct's case files are a mess — lookups take forever. Reorganize into a balanced tree where every search hits in logarithmic time.",
            setting: "Precinct Archive",
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
          },
          {
            id: "chief-2",
            name: "The Encoded Message",
            algorithmPath: "/algorithms/huffman",
            narrative:
              "Intercepted a coded message using variable-length encoding. Build the Huffman tree to decode the transmission and reveal the plot.",
            setting: "Cryptanalysis Lab",
          },
          {
            id: "chief-3",
            name: "The Final Standoff",
            algorithmPath: "/algorithms/minimax",
            narrative:
              "The criminal is one step ahead. Model the standoff as a game tree — predict their optimal move and counter it with yours.",
            setting: "Strategic Command",
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
