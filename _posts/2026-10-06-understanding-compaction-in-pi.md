---
layout: post
title: "Understanding Compaction in Pi: Why It Exists and Why It's Explicit"
author: boyu
date: 2026-10-07 15:50:00 +0800
categories: [ Tech, AI ]
tags: [ tech, pi, ai-agent, context-management, compaction, llm ]
description: "Compaction is Pi's intelligent context management system that summarizes older messages to free up context space. But why does it exist, and why is it exposed as an explicit /compact command instead of working invisibly? Let's explore the design philosophy behind this feature."
mermaid: false
image: /assets/images/headers/understanding-compaction-in-pi.png
---

## Introduction

When working with AI coding agents like Pi, you'll eventually encounter a fundamental constraint: **context windows are finite**. As your conversation grows with multiple turns, tool calls, and file reads, you're constantly consuming tokens. At some point, you hit the limit.

Pi solves this with **Compaction** — an intelligent context management system that summarizes older messages to free up space. But here's what's interesting: while compaction can happen automatically, Pi also exposes an explicit `/compact` command. Why make it visible when it could work invisibly?

In this post, we'll explore:
1. What compaction actually is
2. Why it's necessary (the problem it solves)
3. Why Pi makes it explicit rather than purely automatic

---

## What is Compaction?

### The Core Concept

Compaction is Pi's mechanism for managing conversation context by summarizing older messages while preserving recent ones. Think of it like compressing a conversation's history — you keep the essential information but reduce the token footprint.

### How It Works

The compaction process follows these steps:

1. **Find the cut point**: Pi walks backwards through the session, accumulating tokens until reaching `keepRecentTokens` (default: 20,000 tokens)
2. **Extract messages**: Collect messages from the previous kept boundary (or session start) up to the cut point
3. **Generate summary**: Call the LLM to create a structured summary, passing previous summaries as iterative context
4. **Append entry**: Save a `CompactionEntry` with the summary and `firstKeptEntryId`
5. **Rebuild context**: Use the summary + recent messages for subsequent requests

**Visual example:**

Imagine a 2-hour coding session where you've been refactoring authentication:

```
BEFORE COMPACTION (context: 95k tokens — approaching limit)

  ┌─────────────────────────────────────────────────────────────────────┐
  │ Entry 1: User asks about auth requirements              (2k tokens) │
  │ Entry 2: Assistant explains JWT vs session tokens        (3k tokens)│
  │ Entry 3: User chooses JWT, asks for implementation       (1k tokens)│
  │ Entry 4: Assistant reads auth.config.ts                   (8k tokens)│
  │ Entry 5: Assistant proposes JWT middleware code           (5k tokens)│
  │ Entry 6: User approves, asks to implement                 (1k tokens)│
  │ Entry 7: Assistant edits src/middleware/auth.ts          (12k tokens)│
  │ Entry 8: Tool result: file updated successfully           (2k tokens)│
  │ Entry 9: User reports test failure                        (1k tokens)│
  │ Entry 10: Assistant reads test file                       (6k tokens)│
  │ Entry 11: Assistant debugs and fixes the issue           (15k tokens)│
  │ Entry 12: User confirms tests pass, asks about refresh    (2k tokens)│
  │ Entry 13: Assistant explains refresh token strategy       (8k tokens)│
  │ Entry 14: Assistant edits refresh logic                  (10k tokens)│
  │ Entry 15: User asks about security implications           (1k tokens)│
  │ Entry 16: Assistant explains security best practices      (7k tokens)│
  │ Entry 17: User says "let's move to the next feature"     (1k tokens)│
  └─────────────────────────────────────────────────────────────────────┘
                                    ↑
                          Context limit approaching!
                          Need to free up space...


AFTER COMPACTION (context: 25k tokens — plenty of room)

  ┌─────────────────────────────────────────────────────────────────────┐
  │ [COMPACTION SUMMARY]                                    (8k tokens) │
  │                                                                     │
  │ "We implemented JWT authentication with refresh tokens.              │
  │  Key decisions:                                                      │
  │  - Chose JWT over session-based auth                                 │
  │  - Created middleware in src/middleware/auth.ts                      │
  │  - Fixed token validation bug in tests                               │
  │  - Implemented refresh token strategy                                │
  │  - Applied security best practices (short expiry, secure flags)"     │
  │                                                                     │
  │ Files modified: auth.config.ts, src/middleware/auth.ts               │
  └─────────────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────────────┐
  │ Entry 15: User asks about security implications           (1k token)│
  │ Entry 16: Assistant explains security best practices      (7k tokens)│
  │ Entry 17: User says "let's move to the next feature"     (1k tokens)│
  │ Entry 18: [NEW WORK CONTINUES HERE — plenty of context space!]       │
  └─────────────────────────────────────────────────────────────────────┘

Result: 14 entries → 1 summary + 3 recent entries
Token usage: 95k → 25k (saved 70k tokens!)
Context preserved: All key decisions and file changes
```

Notice what happened: the **essence** of the earlier work (decisions, file changes, bugs fixed) is preserved in the summary, while the **verbose details** (exact code, tool outputs, back-and-forth) are compressed. The recent entries — where you're about to start the next feature — remain intact so the model has full context for what comes next.

This is the key insight: compaction doesn't delete your work. It **distills** it.

### Key Features

- **Cumulative file tracking**: Tracks which files were read/modified across compactions
- **Iterative summarization**: Previous summaries are passed as context to new summarization requests
- **Tool result truncation**: Tool results are truncated to 2,000 characters during serialization to keep summaries manageable
- **Non-destructive**: Original session entries are preserved; compaction just changes what's sent to the model

---

## Why Does Compaction Exist?

### The Problem: Finite Context Windows

LLMs have hard limits on how much context they can process. A typical model might have a 128k or 200k token context window, but during a long coding session, you can easily consume that with:

- Multiple file reads (each file adds tokens)
- Tool calls and their results
- Back-and-forth conversation
- Code edits and explanations
- Error debugging and troubleshooting

### What Happens Without Compaction?

Without compaction, you'd face three bad outcomes:

1. **Context overflow errors**: The model refuses to respond because you've exceeded its limit
2. **Lost context**: The system drops older messages, losing important decisions and context
3. **Session termination**: You're forced to start a new session, losing your workflow momentum

### The Solution: Intelligent Summarization

Compaction solves this by:

- **Extending session length**: You can work much longer without hitting limits
- **Preserving essential context**: Recent work stays intact; older work is summarized
- **Maintaining continuity**: File operations, decisions, and key context carry forward
- **Enabling complex workflows**: Multi-hour sessions become possible

**Example scenario**: You're refactoring a large codebase. Over 2 hours, you:
- Read 15 files
- Make 30 edits
- Debug 5 issues
- Have 50+ conversation turns

Without compaction, you'd hit the context limit around turn 20. With compaction, Pi automatically summarizes the earlier work and keeps you going.

---

## Why Is Compaction Explicit? The Design Philosophy

Here's where it gets interesting. Pi could make auto-compaction completely invisible — it could silently summarize older messages whenever the context gets too large. Many systems work this way.

But Pi exposes an explicit `/compact` command. Why?

### Reason 1: Control Over Timing

Auto-compaction triggers when:
```
contextTokens > contextWindow - reserveTokens
```

This happens automatically, but **when** it happens might not align with your workflow. You might be:
- In the middle of a complex thought
- About to make a key decision
- Deep in a debugging session

With `/compact`, you choose **when** to compact — at a natural break point, before starting a new task, or when you sense the conversation is getting long.

**Benefit**: Predictability. You decide when the context reset happens, not the system.

### Reason 2: Focused Summaries with Instructions

This is the killer feature. The manual command accepts instructions:

```
/compact [instructions]
```

The optional `[instructions]` let you **focus the summary** on specific aspects. For example:

```
/compact Focus on the authentication changes we made
/compact Preserve the database schema decisions
/compact Keep the API endpoint modifications
```

Auto-compaction can't do this — it summarizes everything equally. The manual command lets you guide what's important.

**Benefit**: Intentionality. You tell the system what matters most.

### Reason 3: Proactive Context Management

Sometimes you know you're about to start a long, complex task and want to "clean the slate" first. Or you've finished a major feature and want to compact before moving to the next one.

With `/compact`, you can:
- Compact before starting a new feature
- Compact after completing a major milestone
- Compact when you notice the footer showing high context usage

**Benefit**: Agency. You're not passive — you actively manage your context.

### Reason 4: Transparency and Understanding

Making compaction explicit helps users understand what's happening to their context. When you see `/compact` in your history, you know:
- A summarization happened
- When it happened
- What the summary contains

If it were invisible, you might wonder: "Why doesn't the model remember what we discussed 20 turns ago?" The explicit command makes the mechanism visible and debuggable.

**Benefit**: Clarity. Users understand the system's behavior.

### Reason 5: Extension and Customization

The explicit `/compact` command integrates with Pi's extension system. Extensions can:
- Intercept `session_before_compact` events
- Provide custom summaries
- Cancel compaction
- Add metadata

This enables power users and extension developers to customize compaction behavior for specific workflows.

**Benefit**: Extensibility. The explicit command is an integration point.

---

## The Balance: Automatic + Manual

Pi's design strikes a balance:

- **Auto-compaction** handles the common case — you don't need to think about it
- **Manual `/compact`** provides control when you need it

This is similar to other systems:
- **Garbage collection** in programming languages: automatic, but you can call `gc.collect()` manually
- **Database transactions**: auto-commit by default, but you can explicitly `COMMIT` or `ROLLBACK`
- **Version control**: auto-save drafts, but you explicitly `git commit` when ready

The automatic mechanism handles 90% of cases. The manual command gives you power when you need it.

---

## Practical Tips

### When to Use Auto-Compaction
- Let it run normally for most work
- Don't disable it unless you have a specific reason
- Monitor the footer to see context usage

### When to Use Manual `/compact`
- Before starting a new major task
- After completing a complex feature
- When you want to preserve specific context (use instructions)
- When you notice high context usage and want to reset

### Example Workflows

**Workflow 1: Long debugging session**
```
[50 turns of debugging]
/compact Focus on the root cause we identified
[Continue debugging with clean context]
```

**Workflow 2: Multi-feature development**
```
[Complete feature A]
/compact Preserve the architecture decisions for feature A
[Start feature B with clean context]
```

**Workflow 3: Code review session**
```
[Review 10 files]
/compact Focus on the security issues we found
[Continue review with clean context]
```

---

## Conclusion

Compaction in Pi solves a real problem: finite context windows limit how long you can work. By summarizing older messages, Pi enables much longer, more productive sessions.

But the design goes further than just automatic summarization. The explicit `/compact` command gives you:
- **Control** over when compaction happens
- **Focus** through custom instructions
- **Agency** in managing your context
- **Transparency** in understanding the system
- **Extensibility** for custom workflows

This balance — automatic for the common case, manual for control — is a hallmark of good tool design. It respects both the casual user (who doesn't want to think about context management) and the power user (who wants fine-grained control).

So the next time you use `/compact`, remember: it's not just a command, it's a design philosophy that puts you in control.

---

## Further Reading

- [Compaction Reference](https://pi.dev/docs/latest/compaction) - Technical details
- [Sessions and Context](https://pi.dev/docs/latest/sessions) - User workflow guide
- [Session Format](https://pi.dev/docs/latest/session-format) - How entries are stored
