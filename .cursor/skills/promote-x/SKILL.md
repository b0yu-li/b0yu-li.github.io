---
name: promote-x
description: Draft an X (Twitter) promo for a published Rooby Studio blog post. Use when the user asks to promote, tweet, share on X, or announce a live post.
---

# Promote a Post on X

## When to Run

+ User asks to promote / tweet / announce a published post
+ After a post is live on `https://roobystudio.com/posts/<slug>/`
+ Optionally at the end of `create-post` once the user confirms the post is published (not while still drafting)

## Inputs

Infer or ask for:

1. **Canonical URL** — `https://roobystudio.com/posts/<slug>/`
2. **Title** + one-line hook (from post thesis / description)
3. **Track** — Tech, Studio, or Journal (tones the draft)

Account: `@b0yu_li` (`_config.yml` → `twitter.username`). Site share button already uses X intent (`_data/share.yml`).

## Draft Rules

+ **One primary draft** + **one shorter alt** (for character budget / A-B)
+ First-person voice matching the blog (“I”, not brand-speak)
+ Lead with the insight or question, not “New blog post:”
+ Include the full URL on its own line (X unfurls `og:image` / title)
+ Soft CTA optional (“thread thoughts”, “what confused you”)
+ Hashtags: 0–2 max, only if natural (`#NodeJS`, `#Trance`) — prefer none
+ No emoji spam; at most one if it fits the track
+ Do **not** invent metrics, false claims, or “just published!!!” hype stacks
+ Keep primary draft under ~260 chars before the URL so the link + line break fit comfortably

## Template Shape

```text
<one punchy insight or question from the post>

<one supporting line — what the reader gets>

https://roobystudio.com/posts/<slug>/
```

## Tech-track example pattern

Hook the misconception the post kills (e.g. “why does a React app need Node?”), then point at the URL.

## Studio-track example pattern

Name the craft check or floor feeling, then URL.

## Journal-track example pattern

One quotable line from the thesis, then URL.

## Output Format

Return:

1. **Draft A** (primary) — copy-paste ready  
2. **Draft B** (shorter / alternate angle)  
3. **Intent link** (optional):  
   `https://twitter.com/intent/tweet?text=<urlencoded draft without URL>&url=<urlencoded canonical>`

Do not post to X for the user unless they explicitly ask you to use an external posting integration.
