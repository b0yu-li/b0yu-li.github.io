---
name: review-post
description: Reviews Jekyll blog post drafts for technical correctness, risky Git guidance, and style consistency. Use when the user asks to review a section/post, proofread technical content, or sanity-check command examples.
---

# Review Post

Run this workflow when reviewing content in `_posts/`, especially technical posts with commands.

## Scope

+ Focus on bugs, misleading guidance, workflow risks, and missing caveats before polish.
+ Keep summaries short; findings are the primary output.
+ Preserve the author's first-person voice unless clarity requires adjustment.

## Review Checklist

+ **Command correctness:** commands are valid, in safe order, and likely to work as pasted.
+ **Branch safety:** branch-sensitive commands (`rebase`, delete, force push) name or imply the correct current branch.
+ **Force operations:** risky commands include guardrails and clear "when/when not" context.
+ **Workflow nuance:** avoid overgeneralizing team practices (for example trunk-based vs feature-branch norms).
+ **Consistency:** terminology and command style stay consistent across the section.
+ **Reader usability:** snippets are concise and paired with a plain-English why.

## Required Output Format

Return findings in this structure:

```markdown
- [Severity] Short title
  - Why it matters
  - Suggested wording or command fix
  - File path
```

Severity levels:
+ **High:** likely to cause harmful or incorrect behavior.
+ **Medium:** can confuse readers or produce avoidable mistakes.
+ **Low:** clarity/style polish that improves reliability.

If there are no findings, explicitly say:
+ "No material findings."
+ Any residual assumptions (for example, "assumes branch naming convention `feature/*`").

## Fast Triage Heuristics

+ If a command depends on current branch state, require an explicit checkout/switch step nearby.
+ If a command rewrites history, verify the text explains collaboration impact.
+ If cleanup commands assume merge strategy, add squash/rebase note where helpful.
