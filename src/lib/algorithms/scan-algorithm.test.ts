// Regression test: ScanAlgorithm.solve() accepts exactly 3 parameters.
// The 4th parameter (maxFloor) was removed in commit 22ff9b8 but callers
// in elevator.js and scan-algorithm.test.html still pass 4 arguments.
// This test documents the correct 3-arg signature.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load scan-algorithm source (IIFE that assigns to global var ScanAlgorithm)
const code = fs
  .readFileSync(path.join(__dirname, "scan-algorithm.ts"), "utf8")
  .replace(/^export\s+default\s+.*;$/m, "");

// Execute in a context that captures the global
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const ScanAlgorithm = sandbox.ScanAlgorithm;

describe("scan algorithm", () => {
  it("exposes solve() function", () => {
    // Arrange / Act
    const api = ScanAlgorithm;
    // Assert
    expect(typeof api).toBe("object");
    expect(typeof api.solve).toBe("function");
  });

  it("declares exactly 3 parameters", () => {
    // Assert
    expect(ScanAlgorithm.solve.length).toBe(3);
  });

  it("returns expected upward order", () => {
    // Arrange
    const requests = [2, 9, 6, 4, 1];
    // Act
    const result = ScanAlgorithm.solve(requests, 5, "up");
    // Assert
    expect(result.order).toEqual([6, 9, 4, 2, 1]);
    expect(result.totalDistance).toBe(12);
  });

  it("ignores extra fourth argument", () => {
    const result3 = ScanAlgorithm.solve([2, 9, 6, 4, 1], 5, "up");
    const result4 = ScanAlgorithm.solve([2, 9, 6, 4, 1], 5, "up", 10);
    expect(result4.order).toEqual(result3.order);
    expect(result4.totalDistance).toBe(result3.totalDistance);
  });

  it("handles empty requests", () => {
    const result = ScanAlgorithm.solve([], 5, "up");
    expect(result.order).toEqual([]);
    expect(result.totalDistance).toBe(0);
  });

  it("returns expected downward order", () => {
    const result = ScanAlgorithm.solve([2, 9, 6, 4, 1], 5, "down");
    expect(result.order).toEqual([4, 2, 1, 6, 9]);
    expect(result.totalDistance).toBe(12);
  });
});
