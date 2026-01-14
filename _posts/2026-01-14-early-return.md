---
layout: post
title: "Why I Favor Early Return"
author: boyu
date: 2026-01-14 17:40:00 +0800
categories: tech
tags: [ tech, clean-code, refactoring, best-practices, java ]
---

We've all seen (or written) code that looks like a sideways pyramid. You know, the kind where you need a widescreen
monitor just to see the logic buried 99 (clearly I am joking) levels deep.

I've heard this is called **"Arrow Code"** because the indentation looks like an arrowhead marching to the right.
It’s hard to read, hard to debug, and hides the "happy path" of my logic.

The fix? **Return Early.**

### ❌ The "Nested" Mental Exhaustion

Here is a classic "Arrow" method. It forces my brain to hold MULTIPLE contexts (Is it null? Is it active? Is it
valid?) all at once.

```java
public void processUser(final User user) {
  if (user != null) {
    if (user.isActive()) {
      if (user.hasSubscription()) {
        // 🟢 The actual logic lives here
        sendWeeklyNewsletter(user);
      } else {
        log.error("No subscription");
      }
    } else {
      log.error("User inactive");
    }
  } else {
    throw new IllegalArgumentException("User is null");
  }
}
```

### ✅ "Early Return" - The "Bouncer" Pattern

Think of the method like a VIP club. The top of the method is the Bouncer. Its job is to kick out the invalid cases
immediately so the "Happy Path" (the VIP) can party uninterrupted at the bottom.

```java
public void processUser(final User user) {
  // 🛡️ Guard Clause 1: The Null Check
  if (user == null) {
    throw new IllegalArgumentException("User is null");
  }

  // 🛡️ Guard Clause 2: The Status Check
  if (!user.isActive()) {
    log.error("User inactive");
    return;
  }

  // 🛡️ Guard Clause 3: The Feature Check
  if (!user.hasSubscription()) {
    log.error("No subscription");
    return;
  }

  // 🟢 The Happy Path (Zero Indentation!)
  // If we are here, everything is valid. Just do the work.
  sendWeeklyNewsletter(user);
}
```

### Why I Favor "Early Return"

1. **Zero (or Minimal) Indentation:** The core logic is always on the left margin, not buried deep to the right.
2. **Mental Freedom:** Once I pass a check (like `user == null`), I can completely forget about it. I don't need to
   scroll down to find the matching `} else {` block.
3. **Diff Friendly (Nice Bonus):** Adding a new check doesn't require re-indenting the entire function (which can mess
   up Git history).
