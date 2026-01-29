---
layout: post
title: "Git Commands Cheatsheet"
author: boyu
date: 2026-01-26 20:41:00 +0800
categories: [ Tech, Utility ]
tags: [ tech, cheatsheet, git ]
description: "A hand-picked collection of essential Git CLI commands for daily workflow"
image: /assets/images/headers/git-commands.jpg
---

I recently switched IDEs and decided to rely more on the terminal. Here is a documentation of my most frequently used `git` commands.

## 1. Setup & Configuration

+ **Initialize Repository**

```shell
git init
```

+ **Configure User (Per Repository)** _Useful when I need a different identity for a specific project_.

```shell
git config user.name "My Name"
git config user.email "me@example.com"
```

+ **Configure Remote URL** _Note: Use `add` if it's a new remote, or `set-url` to change an existing one_.

```shell
git remote set-url origin https://github.com/username/repo.git
```

## 2. The Daily Loop

+ **Check Status**

```shell
git status
```

+ **Stage Changes**

```shell
git add <file_path>
# Or stage everything
git add .
```

+ **Commit**

```shell
git commit -m "feat: my commit message"
```

+ **View History**

```shell
git log
# Pro tip: One-line view for cleaner history
git log --oneline
```

## 3. Syncing

+ **Pull with Rebase** _Keeps my history clean by moving my local commits on top of the incoming changes_.

```shell
git pull origin main --rebase
```

+ **Push**

```shell
git push origin main
```

## 4. Undo & Corrections

+ **Restore Staged Files** _Un-stages files (removes them from the index) but keeps my changes_.

```shell
git restore --staged .
```

+ **Amend Last Commit** _Adds staged changes to the previous commit without changing the message_.

```shell
git commit --amend --no-edit
```

+ **Edit Last Commit Message** _Only for local commits that haven't been pushed yet_.

```shell
git commit --amend -m "new message"
```

## 5. Patching (The Manual Move)

Sometimes I just need to move a commit physically (via email or file) without pushing.

+ **Create Patch for a Single Commit**

  1. Find the Commit Hash:
```shell
git log --oneline
```
  2. Create the `.patch` File: Once I have the commit hash (say it's `abc1234`), use the following command to create a patch:
```shell
git format-patch -1 abc1234
```

+ **Create Patch for Multiple Commits**
  + _Example: Get the last 3 commits_
```shell
git format-patch -3
```
  + _Example: Range from specific commit to HEAD_
```shell
git format-patch abc1234..HEAD
```

+ **Apply Patch**

```shell
git apply git apply /path/to/file.patch
```
