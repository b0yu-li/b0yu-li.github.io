# AGENTS.md — b0yu-li.github.io

## Project Overview

This is a Jekyll blog (Chirpy theme) at https://roobystudio.com. Blog posts live in `_posts/` with the naming convention `YYYY-MM-DD-slug.md`. Header images go in `assets/images/headers/`.

## Blog Post Format

Every post must have this frontmatter:

```yaml
---
layout: post
title: "Post Title"
author: boyu
date: YYYY-MM-DD HH:MM:SS +0800
categories: [ Category1, Category2 ]
tags: [ tag1, tag2 ]
description: "SEO description, 1-2 sentences"
mermaid: true
image: /assets/images/headers/slug.png
---
```

Categories used: Tech, Backend, Frontend, Journal, Philosophy, Music, AI.

## Writing Guidelines

- Use short, direct sentences
- Start with concrete examples before abstract concepts
- Use Mermaid diagrams for workflows and architecture
- Frame technical content as "what I wish I knew" (personal, humble)
- Avoid claims like "answers scattered across docs" — be humble
- End with practical next steps

## Cover Image Generation

Use the CLI cover generator in `tools/cover-generator/`:

```bash
cd tools/cover-generator
node render.mjs --title "Title" --subtitle "Subtitle" --style mesh --palette violet-cyan --slug post-slug --title-size 110
```

Available styles: glow, hills, blobs, waves, aurora, rings, mesh, beams.
Available palettes: violet, indigo-lime, navy-gold, forest-coral, teal, navy-ember, plum-cream, midnight-cyan, wine-rose, violet-cyan.

Output goes to `assets/images/headers/<slug>.png` (2400×1260).

**Note**: The subtitle font size is hardcoded to 240px in the engine. Use `--title-size` to control the title size only. Omit `--subtitle` to skip the subtitle entirely.

## context-mode Routing

context-mode is active. Follow this tool hierarchy:

```
ctx_batch_execute (highest)
  ── ctx_execute
        ── ctx_execute_file
              ─ ctx_search (lowest)
```

**Routing guide**:
- Read/edit files → `ctx_execute_file`
- Multi-command research → `ctx_batch_execute`
- Web pages → `ctx_fetch_and_index` then `ctx_search`
- Index docs → `ctx_index`
- Stats → `ctx_stats`
- Doctor → `ctx_doctor`
- Upgrade → `ctx_upgrade`
- Purge → `ctx_purge`

## pi-memory Usage

pi-memory is active for persistent memory across sessions.

**Core tools**:
- `memory_write` — Save facts, decisions, preferences to MEMORY.md
- `memory_read` — Read any memory file
- `scratchpad` — Manage todo checklist (add/done/undo/list)
- `memory_search` — Search across all memories (requires qmd)
- `memory_status` — Check health of memory system

**Storage**: `~/.pi/agent/memory/` (or project-local via `PI_MEMORY_DIR`)

**Example**:
```
you ▸ I always use pnpm in this repo, never npm. Remember that.
pi  ▸ Got it — saved to long-term memory.
```

## Project Structure

```
_posts/              # Blog posts (YYYY-MM-DD-slug.md)
assets/images/headers/  # Header images
tools/cover-generator/  # Cover image generator
.pi/                 # Project-local Pi config
  memory/            # pi-memory storage
  context-mode/      # context-mode storage
```

## Build & Preview

```bash
./tools/run.sh    # Start local server
./tools/test.sh   # Run tests
```

## Recent Posts

- 2026-10-07: How Pi Works: A Developer's Map to Customization (covers context-mode + pi-memory)
- 2026-10-06: Understanding Compaction in Pi: Why It Exists and Why It's Explicit
