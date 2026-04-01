# HL-152 — Algoviz progress (algorithms + learning paths)

## Problem

Learners need a single, coherent notion of “what I have finished” on Algoviz. Today (or in the intended HL-152 design), progress can be framed only around learning-path **steps** (chapter/case IDs). That duplicates the same underlying work when one **algorithm** appears in multiple paths or steps, and it does not match how users think about the product: they complete **visualizations** (algorithm routes), not abstract step IDs.

We need a spec for **one canonical progress store** so that:

- Marking an algorithm complete updates **every** learning-path step that points at that algorithm.
- The homepage and path views stay consistent without maintaining two parallel completion systems.

## Proposed solution

### Canonical model: completion by algorithm route

Treat each **algorithm page route** (e.g. `/algorithms/bubble-sort`) as the unit of completion. The learning path **never** stores its own duplicate completion list for steps; it **derives** step completion by checking whether `step.algorithmPath` is marked complete in global progress.

**Terminology**

- **Algoviz progress** — the full persisted document (algorithms + optional metadata).
- **Algorithm completion** — user-toggled “done” for one `algorithmPath`.
- **Path progress (derived)** — for a learning path, count steps whose `algorithmPath` is completed, over `getTotalSteps(path)`.

### Optional path metadata (non-completion)

If we still want “last opened this path” without conflating it with algorithm completion, store it separately, e.g. `pathMeta[slug].lastVisited`. This is optional; the spec allows omitting it in v1 of the unified design if we want fewer moving parts.

## Data model (draft)

**Storage**: `localStorage` under a single key (name TBD; prefer one stable key such as `algoviz-progress`).

**Versioned JSON** (conceptual shape):

```json
{
  "version": 2,
  "algorithms": {
    "/algorithms/bubble-sort": {
      "completedAt": "2026-04-01T12:00:00.000Z"
    }
  },
  "pathMeta": {
    "delivery-startup": {
      "lastVisited": "2026-04-01T10:00:00.000Z"
    }
  }
}
```

**Rules**

- `version` is a positive integer; bump when the schema changes incompatibly.
- `algorithms` keys are **algorithm routes** as used in the app (must match `algorithmPath` on path steps and homepage `path` values for available algorithms).
- Presence of a key in `algorithms` means “completed” (or use an explicit `completed: true` if we want tombstones later).
- `completedAt` is ISO-8601 when known; omit or allow null only if we explicitly decide partial records are allowed.
- **Import validation**: reject invalid JSON, wrong `version` if unsupported, non-object roots, absurd payload size, and unknown algorithm routes **for known catalog entries** (same strictness as today for known paths). Unknown keys may be preserved or stripped per implementation policy (document the choice in implementation notes).

**Export / import**

- **Export**: serialize the whole document as downloadable JSON (pretty-print optional).
- **Import**: parse, validate, then **replace** the in-memory document (full restore), unless product later chooses merge semantics (out of scope unless specified).

## UX specification

### Where users can toggle completion

1. **Learning path detail** — each step row offers a control (e.g. “Mark complete”) that toggles completion for `step.algorithmPath`. Visual state reflects derived completion (checkmark / filled state).
2. **Home — algorithm grid** — each available algorithm card exposes a non-navigation control to toggle completion for that card’s `path`, without breaking the primary “open visualization” affordance (e.g. stop propagation on the toggle, or split card into link + control).
3. **Algorithm visualization pages** (recommended) — a compact, consistent control near `Nav` or page header: “Mark as complete” / “Completed”, bound to the current page’s route. Ensures completion can be recorded from the place the user actually finished the work.

### Where progress is displayed (read-only derived)

1. **Home — learning path cards** — show derived fraction (e.g. “3 / 10”) and a thin progress bar from canonical algorithm completion.
2. **Learning path detail header** — same derived stats + bar.
3. **Optional**: small indicator on homepage algorithm cards when that route is already completed.

### Reset

- **Clear all Algoviz progress** — wipes `algorithms` (and optionally `pathMeta`).
- **Per learning path** — product decision:
  - **A (recommended for simplicity):** “Reset path” only clears `pathMeta` for that slug (if we store it); it does **not** remove algorithm completions (because those are global).
  - **B:** “Reset path” removes completion for every `algorithmPath` that appears in that path (surprising if those algorithms are shared with other paths).
  
The implementation should follow **A** unless product explicitly chooses **B** and copy is updated to warn users.

## Migration

If earlier builds wrote **v1** documents keyed by learning-path slug with `completedChapters` / `completedCases` (step IDs), **load** must:

1. Detect `version` (or infer v1 if `paths` with those arrays exists and no `algorithms` key).
2. Map each completed step id → its `algorithmPath` via `LEARNING_PATHS` data.
3. Write forward as **v2** (or current version) and persist once.

After migration, drop dependence on per-path step ID lists for completion (they become redundant).

## Acceptance criteria

1. Completing an algorithm (toggle on path step, home card, or algo page) marks that **`algorithmPath`** complete in storage.
2. Any learning-path step that references the same `algorithmPath` appears completed everywhere without duplicate storage.
3. Homepage learning-path cards show correct derived completion counts and progress bar.
4. Learning-path detail shows per-step completion consistent with global algorithm completion.
5. Export produces valid JSON for the current schema; import validates and replaces state, with clear error messaging on failure.
6. “Clear all” removes algorithm completion state; behavior for per-path reset matches the chosen product rule (**A** or **B**) and is explained in UI copy.
7. Cross-tab: storage events keep open tabs consistent (same tab already updates via React state).

## Out of scope (unless a follow-up ticket says otherwise)

- Accounts, sync across devices, or server-side persistence.
- Progress-aware ranking for hero spotlight or recommendations.
- Time-on-page or automatic completion when playback finishes.
- Per-step completion that **differs** for the same algorithm in two paths (would require abandoning the canonical model).

## Implementation notes (for the build phase)

- **Single module** should own: schema version, validation, migration, serialize/deserialize, and pure helpers (`isAlgorithmCompleted`, `countCompletedForPath`, etc.).
- **React layer** should be a small provider + hook; pages only read/write through it.
- **Tests** (Vitest): validation, migration from v1 fixture, derived counts with duplicate `algorithmPath` across steps, import size limit.

## Tasks and deliverables (implementation checklist)

- [ ] Finalize storage key and filename for export (document in code comment next to constant).
- [ ] Implement `version` + `algorithms` model and validation.
- [ ] Implement v1 → current migration on load.
- [ ] Provider + hook; wire learning path detail + home grid + path cards.
- [ ] Add completion control to algorithm page shell or each page (prefer shared component).
- [ ] Import / export / clear-all UI with accessible labels and error text.
- [ ] Quality gates: `pnpm run lint`, `pnpm test`, `pnpm run format:check`, `pnpm run knip`.
- [ ] UX review evidence for all touched UI (per `CLAUDE.md` workflow gates).
