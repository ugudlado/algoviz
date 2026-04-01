import { describe, expect, it } from "vitest";
import {
  ALGOVIZ_PROGRESS_VERSION,
  clearPathMetaOnly,
  countCompletedStepsOnPath,
  createEmptyDocument,
  isAlgorithmCompleted,
  parseImportedProgress,
  setAlgorithmCompletion,
  touchPathMeta,
  tryMigrateLegacyV1,
  validateAlgovizProgressDocument,
} from "./algovizProgress";
import { LEARNING_PATHS, getPathBySlug } from "@/data/learningPaths";

describe("algovizProgress", () => {
  it("validateAlgovizProgressDocument accepts v2 payload", () => {
    const raw = {
      version: ALGOVIZ_PROGRESS_VERSION,
      algorithms: {
        "/algorithms/bubble-sort": {
          completedAt: "2026-04-01T12:00:00.000Z",
        },
      },
      pathMeta: {
        "delivery-startup": { lastVisited: "2026-04-01T10:00:00.000Z" },
      },
    };
    const r = validateAlgovizProgressDocument(raw);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(isAlgorithmCompleted(r.value, "/algorithms/bubble-sort")).toBe(true);
  });

  it("validateAlgovizProgressDocument rejects unknown route", () => {
    const r = validateAlgovizProgressDocument({
      version: ALGOVIZ_PROGRESS_VERSION,
      algorithms: {
        "/algorithms/not-real": { completedAt: "2026-04-01T00:00:00.000Z" },
      },
    });
    expect(r.ok).toBe(false);
  });

  it("tryMigrateLegacyV1 maps step ids to algorithm routes", () => {
    const v1 = {
      version: 1,
      paths: {
        "delivery-startup": {
          completedChapters: ["ch-1", "ch-2"],
          lastVisited: "2026-04-01T10:00:00.000Z",
        },
        "algorithm-detective": {
          completedCases: ["rookie-1"],
        },
      },
    };
    const doc = tryMigrateLegacyV1(v1);
    expect(doc).not.toBeNull();
    if (!doc) return;
    expect(isAlgorithmCompleted(doc, "/algorithms/bubble-sort")).toBe(true);
    expect(isAlgorithmCompleted(doc, "/algorithms/merge-sort")).toBe(true);
    expect(isAlgorithmCompleted(doc, "/algorithms/binary-search")).toBe(false);
    expect(doc.pathMeta?.["delivery-startup"]?.lastVisited).toBe(
      "2026-04-01T10:00:00.000Z",
    );
  });

  it("countCompletedStepsOnPath sums steps whose algorithm route is completed", () => {
    const delivery = getPathBySlug("delivery-startup")!;
    let doc = createEmptyDocument();
    doc = setAlgorithmCompletion(doc, "/algorithms/bubble-sort", true);
    doc = setAlgorithmCompletion(doc, "/algorithms/merge-sort", true);
    expect(countCompletedStepsOnPath(doc, delivery)).toBe(2);
  });

  it("setAlgorithmCompletion toggles", () => {
    let doc = createEmptyDocument();
    doc = setAlgorithmCompletion(doc, "/algorithms/trie", true);
    expect(isAlgorithmCompleted(doc, "/algorithms/trie")).toBe(true);
    doc = setAlgorithmCompletion(doc, "/algorithms/trie", false);
    expect(isAlgorithmCompleted(doc, "/algorithms/trie")).toBe(false);
  });

  it("clearPathMetaOnly does not remove algorithms", () => {
    let doc = createEmptyDocument();
    doc = touchPathMeta(doc, "delivery-startup");
    doc = setAlgorithmCompletion(doc, "/algorithms/kmp", true);
    doc = clearPathMetaOnly(doc, "delivery-startup");
    expect(doc.pathMeta?.["delivery-startup"]).toBeUndefined();
    expect(isAlgorithmCompleted(doc, "/algorithms/kmp")).toBe(true);
  });

  it("parseImportedProgress rejects oversized input", () => {
    const r = parseImportedProgress("x".repeat(400_000));
    expect(r.ok).toBe(false);
  });

  it("empty path yields zero completed", () => {
    for (const p of LEARNING_PATHS) {
      expect(countCompletedStepsOnPath(createEmptyDocument(), p)).toBe(0);
    }
  });
});
