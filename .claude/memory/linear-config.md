---
name: Linear Config
description: Linear label IDs for automatic ticket tagging — read by create-ticket.yaml during /specify
type: reference
---

## Linear Labels for AlgoViz

When creating Linear tickets via `/specify` or `/develop`, attach these labels:

```
label_ids:
  - a116a1a4-7384-42f8-bec5-c32c21ebd743  # algoviz (product label)
```

These are passed as `labelIds` to `mcp__plugin_linear_linear__save_issue`.

To add more labels (e.g., type labels like "feature", "bug"), add their UUIDs to the list above.
