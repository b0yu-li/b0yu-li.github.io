---
layout: post
title: "Why I Favor Early Return"
author: boyu
date: 2026-01-14 17:40:00 +0800
categories: [ Tech, Best Practices ]
tags: [ tech, clean-code, refactoring, best-practices, java ]
image: /assets/images/headers/early-return.jpg
description: "Stop writing nested 'Arrow Code'. Learn how the Early Return pattern (Guard Clauses) simplifies logic, eliminates indentation, and cleans up your Java code."
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

### 🤔 So, Should I Ban `else`?

You might notice a pattern in the "Bouncer" example above: **there is not a single `else` keyword.**

There is a concept in strict coding exercises (like *Object Calisthenics*) that challenges you to avoid `else` entirely.
While we don't need to be dogmatic, there is a logic to it.

When you use `else`, you are telling the reader: *"These two outcomes are equally likely."*

```java
// The "Coin Toss" Approach
public boolean canUserDoSomething() {
  if (isValid) {
    return true;
  } else {
    return false; // ❌ This keyword is actually redundant!
  }
}
```

But when you use **Early Return**, you are saying: _"Here is the exception handling. Done? Okay, now here is
the **standard** behavior."_

Since the `if` block contains a `return` (or a `throw`), the code execution stops there. The rest of the function **is**
the `else` block, implicitly. You don't need to wrap it in braces.

```java
// The "Clean" Approach
public boolean canUserDoSomething() {
  if (isValid) {
    return true;
  }

  // We don't need 'else' because we would have left the method already!
  return false;
}
```

> **The Rule of Thumb:**
>
> If your `if` block ends with a `return`, `throw`, `break`, or `continue`, you never need an `else`. Delete it,
> un-indent the next block, and enjoy the clean vertical line of code.
{: .prompt-tip }

### Why I Favor "Early Return"

1. **Zero (or Minimal) Indentation:** The core logic is always on the left margin, not buried deep to the right.
2. **Mental Freedom:** Once I pass a check (like `user == null`), I can completely forget about it. I don't need to
   scroll down to find the matching `} else {` block.
3. **Diff Friendly (Nice Bonus):** Adding a new check doesn't require re-indenting the entire function (which can mess
   up Git history).
