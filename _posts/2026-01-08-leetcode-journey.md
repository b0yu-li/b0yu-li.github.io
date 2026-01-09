---
layout: post
title: "LeetCode Journey: Digest LeetCode 75"
author: "Boyu"
date: 2026-01-08 11:36:00 +0800
categories: tech
tags: [ leetcode, java, journey ]
redirect_from:
  - /tech/2026/01/08/leetcode-journey.html
---

This is an evolving blog documenting how I approached the problems
in [LeetCode 75 Study Plan](https://leetcode.com/studyplan/leetcode-75/).

📚 Here's my code repo: [https://github.com/b0yu-li/lc2026](https://github.com/b0yu-li/lc2026)

---

### [Category] Two-Pointers

---

#### No.1679 - Max Number of K-Sum Pair

<details markdown="1">
<summary><h5 style="display:inline-block; margin:0; vertical-align:middle;">Description</h5></summary>

> **TIP** You can skip it if you already know the problem.

You are given an integer array `nums` and an integer `k`.

In one operation, you can pick two numbers from the array whose sum equals `k` and remove them from the array.

Return _the maximum number of operations you can perform on the array_.

**Example 1:**

**Input:** nums = [1,2,3,4], k = 5

**Output:** 2

**Explanation:** Starting with nums = [1,2,3,4]:

- Remove numbers 1 and 4, then nums = [2,3]
- Remove numbers 2 and 3, then nums = []
  There are no more pairs that sum up to 5, hence a total of 2 operations.

**Example 2:**

**Input:** nums = [3,1,3,4,3], k = 6

**Output:** 1

**Explanation:** Starting with nums = [3,1,3,4,3]:

- Remove the first two 3's, then nums = [1,4,3]
  There are no more pairs that sum up to 6, hence a total of 1 operation.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= k <= 10^9`

</details>

##### How I Approach It (Solution #1 - The Waiting Room Analogy)

+ Imagine I am the **bouncer** at the door of a club.
  + People (`nums`) arrive one by one.
  + I have a "Waiting Room" (the `HashMap`).
+ And I perform actions like this:

<img src="/assets/images/leetcode-journey-1679-waiting-room-analogy.svg" alt="LeetCode Journey: No. 1679, The Waiting Room Analogy" width="600">

###### Solution Snippet

```java
public int maxOperations(int[] nums, int k) {
  final Map<Integer, Integer> waitingRoom = new HashMap<>();
  int count = 0;

  for (int currentGuest : nums) {
    final int partner = k - currentGuest;
    final Integer candidatePartnersCount = waitingRoom.getOrDefault(partner, 0);
    if (candidatePartnersCount > 0) {
      waitingRoom.put(partner, candidatePartnersCount - 1);
      count++;
      continue;
    }
    final Integer existingCountOfCurrentGuest = waitingRoom.getOrDefault(currentGuest, 0);
    waitingRoom.put(currentGuest, existingCountOfCurrentGuest + 1);
  }

  return count;
}
```

###### Time Complexity Analysis: _O(N)_

+ I iterate through the array exactly once.
+ HashMap operations (put, get, containsKey) are O(1) on average.

###### Space Complexity Analysis: _O(N)_ (worst-case scenario)

+ In the worst case (e.g., `[1, 2, 3, 4]` with `k=100`), no pairs are found, and every single number is stored in the
  map.

##### How I Approach It (Solution #2 - The Matchmaker Analogy)

+ Say I am a **matchmaker** trying to pair people up so their combined "score" equals exactly `k`.
+ Since I CANNOT easily spot pairs in a chaotic crowd. So, before I do anything, I yell: "Everyone line up!" (I must
  sort the array first. This is the _cost of admission_ for this approach.)
+ And I pair them up like this.

<img src="/assets/images/leetcode-journey-1679-matchmaker-analogy.svg" alt="LeetCode Journey: No. 1679, The Matchmaker Analogy" width="600">

###### Solution Snippet

```java
public int maxOperations(int[] nums, int k) {
  // Step 0: Line them up smallest to biggest (sorting)
  Arrays.sort(nums);

  int count = 0;
  int left = 0;
  int right = nums.length - 1;

  while (left < right) {
    final int leftCandidate = nums[left];
    final int rightCandidate = nums[right];
    // Case I: Found one pair, congrads! Let both go and count them up!
    if (k == leftCandidate + rightCandidate) {
      count++;
      left++;
      right--;
      continue;
    }
    // Case II: One has to be bigger, only LEFT side can be bigger
    if (k > leftCandidate + rightCandidate) {
      left++;
      continue;
    }
    // Case II: One has to be smaller, only RIGHT side can be smaller
    if (k < leftCandidate + rightCandidate) {
      right--;
    }
  }

  return count;
}
```

###### Time Complexity Analysis: _O(N * logN)_

+ **Sorting:** `Arrays.sort(nums)` uses Dual-Pivot Quicksort for primitive arrays. This runs in O(N * logN) on average.

+ **Two Pointers:** The `while` loop performs a single pass through the array, touching each element at most once. This
  is O(N).

+ **Total:** The sorting dominates the linear scan, so the final complexity is **O(N * logN)**.

###### Space Complexity Analysis: _O(logN)_

+ I am sorting **in-place**.
  + There is no new array allocated on the heap.
  + Note: We say O(logN) (instead of pure O(1)) to account for the stack space used by the recursive calls inside the
    Quicksort algorithm.
  + _In an interview_: You can state, "It uses **O(1) auxiliary space** excluding the recursion stack," which is often
    what
    they are looking for.

---

#### No.15 - 3Sum

<details markdown="1">
<summary><h5 style="display:inline-block; margin:0; vertical-align:middle;">Description</h5></summary>

> [!TIP]
> **Pro Tip:**
> You can skip it if you already know the problem.

Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and
`j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

**Example 1:**

**Input:** nums = [-1,0,1,2,-1,-4]

**Output:** [[-1,-1,2],[-1,0,1]]

**Explanation:**
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.

nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.

nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.

The distinct triplets are [-1,0,1] and [-1,-1,2].

Notice that the order of the output and the order of the triplets does not matter.

**Example 2:**

**Input:** nums = [0,1,1]

**Output:** []

**Explanation:** The only possible triplet does not sum up to 0.

**Example 3:**

**Input:** nums = [0,0,0]

**Output:** [[0,0,0]]

**Explanation:** The only possible triplet sums up to 0.

**Constraints:**

- `3 <= nums.length <= 3000`
- `-10^5 <= nums[i] <= 10^5`

</details>
