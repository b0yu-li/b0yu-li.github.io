---
layout: post
title: "From Zero to Value: The Power of the Steel Thread"
author: boyu
date: 2026-02-12 13:10:00 +0800
categories: [ Tech, Agile ]
tags: [ steel-thread, poc, value ]
description: "Stop building horizontal layers that don't connect. Learn how 'Steel Threading' helps you deliver end-to-end value from Day 1."
image: /assets/images/headers/steel-thread.jpg
---

## The Layered Cake Trap

It's not crazy for me to imagine that some engineers, say Bob, would build a system horizontally, so let's have a look at Bob's "Layered Cake" approach.

+ Week 1: Design the perfect Database schema.
+ Week 2: Build the entire API layer.
+ Week 3: Build the Frontend components.
+ Week 4: **Nothing works together.**

This is the "Layered Cake" approach. Bob has a lot of code, but zero _value_ until the very end.

## Here's a Remedy: Steel Thread

A Steel Thread is a single, thin slice of functionality that cuts through all layers of the application—from the user interface,
through the API, business logic, and database, back to the user.

+ It is narrow (one specific feature).
+ It is complete (end-to-end working).
+ It is unbreakable (hence "Steel").

## The Approach: Value-Driven Development

+ **Step 1: Identify the "Walking Skeleton".** What is the absolute minimum feature? (e.g., A button that says "Click me" and saves a timestamp to the DB).
+ **Step 2: Connect the dots.** Build the UI, the endpoint, and the table for _just that one thing_.
+ **Step 3: Verify.** Does it work in Production (or Staging/UAT, or SIT if that's fine)? If yes, I have a Steel Thread.
+ **Step 4: Thicken the Thread.** Now add validation, error handling, complex logic, and more fields.

## Why Steel-Threading Wins Projects

+ **Risk Reduction:** I prove the architecture works on Day 1, not Day 30.
+ **Feedback Loop:** I can show the stakeholder a working button immediately. They can say "I hate that color" _now_, not after I built 50 screens.
+ **Morale:** It feels good to see something work. It prevents the "Integration Hell" at the end of a project.

## Real World Example: Exp-Z

[My interactive demo: Exp-Z Expense Tracker](/posts/demo-exp-z/)

+ Instead of really thinking through what features should I have...
+ I built a form that takes "Amount" and saves it to a list.
+ Once that **"Thread"** was solid, I started to think about things like "I should include Dates", "I actually care about the monthly expenses, it would be great if I group my expenses by month", "Oh, if I can export the data to keep a copy myself, isn't that wonderful?"
+ In this way, I always get the short feedback loop, the flywheel is spinning **FAST**!

## How to Get Started?

I don't need permission to start Steel Threading. I just need to change my definition of "Done."

1. **Pick the "Hello World" of my Domain:**
    Don't start with the complex reporting dashboard. Start with the "Login" or the "Submit Order" button. Pick the feature that forces me to touch the Database, the API, and the UI.

2. **Ignore the "What Ifs" (Temporarily):**
    When building the thread, ignore the edge cases. Ignore the "Invalid Email" validation. Ignore the CSS styling. My goal is **connectivity**, not perfection. Make the data flow from the user to the storage and back.

3. **Thicken the Thread:**
    Once I see that "200 OK" and the data in my database, _then_ I go back. Add the validation. Add the error handling. Add the beautiful CSS.

Build the skeleton first. The muscles and skin come later.

---

## Steel Thread vs. PoC vs. MVP

It is easy to confuse these terms, but they serve different masters.

### 1. Proof of Concept (PoC)

+ **The Question:** _"Is this technically possible?"_

+ **The Code:** Often "throwaway" code. Messy, hardcoded, just trying to prove a specific mechanism (e.g., _"Can we actually parse this weird PDF format?"_).

+ **The Fate:** Usually deleted or heavily refactored.

### 2. Steel Thread

+ **The Question:** _"Does the architecture hold together?"_

+ **The Code:** **Production-quality** skeleton. It connects the UI to the DB. It is not throwaway; it is the foundation.

+ **The Fate:** It stays. I build the rest of the application _around_ it.

### 3. Minimum Viable Product (MVP)

+ **The Question:** _"Is this valuable to the user?"_

+ **The Code:** A collection of "Thickened Threads." It is polished enough to be sold or used by real customers.

+ **The Fate:** It evolves into the full product.

**The Relationship:** I build a **PoC** to see if an idea is crazy. Once I know it's not, I build a **Steel Thread** to prove the architecture works. Once I thicken that thread enough to solve a user problem, I have an **MVP**.

---

## The Pragmatic Philosophy: The "Value-Driven" Mindset

Steel Threading taught me a harder truth: **Code is a liability, not an asset.**

The only thing that matters is **delivered value**.

Being value-driven means asking uncomfortable questions before I write a single line of code:

+ _"Does this fancy caching layer actually help the user right now, or am I just showing off?"_

+ _"If I stop working today, does the user have something better than they had yesterday?"_

In the "Layered Cake" approach, if I stop halfway, the user gets **zero**. In the "Steel Thread" approach, if I stop halfway, the user gets a working (albeit ugly) feature.

### Why is Code a Liability?

We often treat lines of code like assets on a balance sheet.
We think, "I wrote 5,000 lines of code, so I created value."

**This is false.**

Every line of code I write is a line that must be:

+ Read and understood by the next developer.
+ Debugged when it breaks.
+ Updated when dependencies change.
+ Secured against vulnerabilities.

Code is **inventory**. It is a cost of doing business.
The **asset** is the functionality—the solved problem.

The "Steel Thread" approach forces me to write only the code necessary to solve the immediate problem. It prevents me from hoarding "inventory" (unused layers, over-engineered abstractions) that rots before it ever reaches the customer.

**The best code is no code. The second best is code that works end-to-end today.**
