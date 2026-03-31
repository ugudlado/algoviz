# AlgoViz Memory Index

- [Project State](project_state.md) — All 29 algo pages in React (migration complete 2026-03-31). Pending: algorithms/bubble-sort/ prototype dir deletion.
- [Architecture](project_architecture.md) — React+Vite+TS, algorithm .js files stay IIFE+CJS, .ts wrappers for Vite, fieldset panel pattern, quality gates
- [Algorithm Module Contract](feedback_algorithm_module_contract.md) — Never add bare `export default` to .js files; breaks Node require(). Use .ts wrappers for Vite instead.
- [Implementation Rules](feedback_implementation_rules.md) — DRY tested=runtime, CSS prefix grep, timer cleanup, real-world analogy mandatory, ESLint globals
- [Vite+React Migration](project_vite_migration.md) — COMPLETE. All 29 pages migrated. Pattern: IIFE .js → .ts wrapper → React component. Nav now single-source in App.tsx.
- [Vite+React Migration Learnings](project_vite-migration-phase2_learnings.md) — export default pitfall, display state ownership, fieldset panels, color bug, SVG types
- [Vite+React Migration Retrospective](feedback_vite-migration-phase2_spec_retrospective.md) — Perfect execution: 42/42 tasks, 249/249 files, 0% unplanned
- [Memory Setup](feedback_memory_setup.md) — Repo-versioned memory via symlink; `pnpm setup` creates it; no hook by design
- [Docusaurus Migration](feedback_docusaurus.md) — User wants it; mismatch with interactive pages; underlying goal still unclear as of 2026-03-30
- [Linear Config](linear-config.md) — Label IDs for automatic ticket tagging
- [Flux Env Fix](feedback_flux_env.md) — Always prefix flux with `FLUX_DATA="$HOME/code/shell/.flux/data.json"`
