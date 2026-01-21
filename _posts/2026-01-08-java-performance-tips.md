---
layout: post
title: "Java Performance Tips"
author: boyu
date: 2026-01-08 15:38:00 +0800
categories: [ Tech, Java ]
tags: [ tech, java, performance, tips, cheatsheet ]
description: "An evolving cheatsheet of practical Java performance tips to boost your application's speed and efficiency. Learn simple yet effective optimizations for time and space complexity, from avoiding unnecessary stream overhead to mastering in-place operations."
image: /assets/images/headers/java-performance-tips.jpg
redirect_from:
  - /tech/2026/01/08/java-performance-tips.html
pin: true
---

This is an evolving tips list (or a cheatsheet) for common Java performance optimizations.


### Time Optimization

+ **Skip the Stream Pipeline for Conversions**: Don't build a complex pipeline just to pour a bucket of water.

```java
// ⚠️
return validTeams.stream().toList();
// Spins up a full Stream pipeline (Spliterator, ReferencePipeline, etc.) just to copy data.
// - 🐢 High Overhead: Allocates temporary objects that increase Garbage Collection pressure.
// - 🔒 Rigid: Returns an Immutable List (read-only), which creates runtime errors if modified.

// ✅
return new ArrayList<>(validTeams);
// "Teleports" data using System.arraycopy internally.
// - ⚡ Low Overhead: Zero temporary object allocation; blazing fast memory copy.
// - 🛠️ Flexible: Returns a standard Mutable List that is compatible with all Java versions.
```

---

### Space Optimization

+ **Optimize Sorting with In-Place Implementation**

```java
// ⚠️
final int[] sorted = Arrays.stream(nums).sorted().toArray(); 
// This spikes space usage to O(N) because it allocates a new array and creates stream objects.

// ✅
Arrays.sort(nums);
// Sorts in-place, avoiding the O(N) heap allocation. 
```
