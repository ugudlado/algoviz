# AlgoViz Memory Index

- [Project State](project_state.md) — ~36 algo pages, recently added algorithms, open/completed OpenSpec changes, infra added
- [Architecture](project_architecture.md) — Vanilla JS, 5-file pattern, G2 design system, quality gates, memory symlink setup
- [Implementation Rules](feedback_implementation_rules.md) — DRY tested=runtime, nav exhaustiveness, CSS prefix grep, timer cleanup, ESLint globals
- [Memory Setup](feedback_memory_setup.md) — Repo-versioned memory via symlink; `pnpm setup` creates it; no hook by design
- [Docusaurus Migration](feedback_docusaurus.md) — User wants it; mismatch with interactive pages; underlying goal still unclear as of 2026-03-30
- [Vite+React Migration](project_vite_migration.md) — Phase 1 complete: 4 sorting pages migrated to React+Vite+TS. Phase 2 pending: remaining 31 pages. Learned conventions: algorithm integration pattern, build config (@types/node, __dirname, tsconfig, base), GitHub Pages deployment
- [Vite+React Migration Phase 2 Learnings](project_vite-migration-phase2_learnings.md) — Pattern scaled perfectly: all 29 algorithm pages migrated. IIFE wrapper pattern, fieldset controls, bubble-sort UX redesigns, color bug in sorted boundary, SVG type safety challenges, CSS prefix grep pain, nav update fatigue. No rework needed.
- [Vite+React Migration Phase 2 Retrospective](feedback_vite-migration-phase2_spec_retrospective.md) — Perfect execution: 42/42 tasks, 249/249 files predicted, 0% unplanned ratio, 0 review iterations, 0 signoff rounds
- [Linear Config](linear-config.md) — Label IDs for automatic ticket tagging (shell product label)
- [Flux Env Fix](feedback_flux_env.md) — Always prefix flux with `FLUX_DATA="$HOME/code/shell/.flux/data.json"`; without it CLI writes to wrong store and UI never updates
