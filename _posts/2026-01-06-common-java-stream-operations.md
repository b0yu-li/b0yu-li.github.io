---
layout: post
title: "Java Stream Operations Cheatsheet"
author: "Boyu"
date: 2026-01-06 11:42:00 +0800
categories: tech
tags: [ tech, java, stream, utility, cheatsheet ]
redirect_from:
  - /tech/2026/01/06/common-java-stream-operations.html
---

This is an evolving cheatsheet for common Java Stream operations.

## `groupingBy`

### Get the frequency map using `Collectors.counting`

``` Java
import java.util.stream.Collectors;
import java.util.function.Function;

final List<String> letters = List.of("a", "b", "b", "c", "c", "c", "d", "d", "d", "d");

final Map<String, Long> frequencyMap = letters.stream()
    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
```

Output: The `frequencyMap` will look like this: `{a=1, b=2, c=3, d=4}`
