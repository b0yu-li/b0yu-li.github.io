---
name: create-post
description: Scaffold a new blog post for the Rooby Studio Jekyll blog. Use when the user wants to write, draft, create, or start a new blog post.
---

# Create a New Blog Post

## Phase 1 — Gather Inputs

Ask the user (or infer from context) for:

1. **Title** — the full post title
2. **Track** — Tech, Studio, or Journal/Life
3. **Publish time** — default to current date + a reasonable HH:MM at +0800; ask only if they specify one

If the user has already provided these, proceed without asking.

---

## Phase 2 — Derive Values

From the title, compute:

- **Slug**: lowercase the title, replace spaces with `-`, strip special characters and punctuation, collapse multiple hyphens  
  _e.g. "GraphQL: Ask for Exactly What You Want" → `graphql-ask-for-exactly-what-you-want`_  
  _Keep it readable — truncate after ~5 meaningful words if very long_

- **Filename**: `_posts/YYYY-MM-DD-<slug>.md`

- **Image path**: `/assets/images/headers/<slug>.jpg`

- **Categories** — pick 1–2 in PascalCase based on track:

  | Track | Suggested categories |
  |-------|----------------------|
  | Tech | `[ Tech, <subtopic> ]` — subtopic: Java, API, Design, Demo, Agile, Backend, etc. |
  | Studio | `[ Studio, <subtopic> ]` — subtopic: Code, Music, etc. |
  | Journal | `[ Journal, <subtopic> ]` — subtopic: Thoughts, Philosophy, Leadership, Life, etc. |

- **Tags** — 3–6 lowercase tags derived from the topic; always include the track anchor (`tech`, `studio`, or a topic word)

---

## Phase 3 — Create the File

Create `_posts/YYYY-MM-DD-<slug>.md` with this front matter (in this exact order):

```yaml
---
layout: post
title: "<Full Title>"
author: boyu
date: YYYY-MM-DD HH:MM:SS +0800
categories: [ PascalCase, PascalCase ]
tags: [ lowercase, lowercase ]
description: "<1–2 SEO sentences.>"
image: /assets/images/headers/<slug>.jpg
---
```

Add optional fields only when applicable — after `image`, before `---`:

```yaml
mermaid: true      # only if post will contain Mermaid diagrams
strudel: true      # only if post embeds Strudel live-coding players
```

**Diagram check:** If the post introduces a framework, a contrast (X vs. Y), or a multi-step flow, include `mermaid: true` and stub a diagram placeholder early in the body (after the thesis, before the deep-dive). See the Mermaid Diagrams section in the post style guide for formatting conventions.

Then stub the body based on track:

### Tech post body stub

```markdown
## 1. What Is <Topic>?

<!-- Introduce the concept in 2–3 sentences. -->

---

## 2. The Analogy: <Analogy Name>

<!-- Lead with a vivid real-world scenario, then map it to the tech concept. -->

---

## 3. The Example

<!-- Concrete code or walkthrough. -->

---

## 4. <Topic> vs. <Alternative>

<!-- Comparison table. -->

| | **<Topic>** | **<Alternative>** |
|---|---|---|
|  |  |  |

---

## 5. The Takeaway

<!-- Land the point. One tight paragraph. -->
```

### Journal / Life post body stub

```markdown
<!-- Open with a quote, observation, or provocative question. -->

## <First Descriptive Heading>

<!-- First section body. -->

## <Second Descriptive Heading>

<!-- Second section body. -->

## The Takeaway

<!-- Close with a grounding reflection. -->
```

### Studio post body stub

```markdown
<!-- One-line opener — what we're building. -->

---

## Round I: <First Element>

<!-- First musical building block. -->

---

## Round II: <Second Element>

<!-- Layer on the next element. -->

---

## Round III: <Third Element>

<!-- Final layer or full arrangement. -->
```

---

## Phase 4 — Remind the User

After creating the file, always remind:

> **Next step:** Add a header image at `assets/images/headers/<slug>.jpg` (or `.png`) before publishing.  
> Recommended size: 1200×630px.
