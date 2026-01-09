---
layout: post
title: "Java Performance Tips"
author: boyu
date: 2026-01-08 15:38:00 +0800
categories: tech
tags: [ tech, java, performance, tips, cheatsheet ]
redirect_from:
  - /tech/2026/01/08/java-performance-tips.html
---

This is an evolving tips list (or a cheatsheet) for common Java performance optimizations.

### Space Optimization

+ **Optimize Sorting with In-Place Implementation**

``` Java
// ⚠️
final int[] sorted = Arrays.stream(nums).sorted().toArray(); 
// This spikes space usage to O(N) because it allocates a new array and creates stream objects.

// ✅
Arrays.sort(nums);
// Sorts in-place, avoiding the O(N) heap allocation. 
```
