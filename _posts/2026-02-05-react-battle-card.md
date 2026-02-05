---
layout: post
title: "React Battle Card"
author: boyu
date: 2026-02-05 11:06:00 +0800
categories: [ Tech, React ]
tags: [ tech, react, battle-card, cheatsheet ]
image: /assets/images/headers/react-battle-card.jpg
description: "A concentrated cheat sheet for React interviews and daily development. Covers essential patterns, architectural decisions (Derived State), and the philosophy of 'Forced Simplicity'."
---

### 🧠 The Philosophy: "Forced Simplicity"

- **Do not over-engineer.** If a simple `useState` works, don't use `useReducer`
- **Declarative > Imperative.** Describe _what_ I want (`map`), not _how_ to get it (`for` loop)
- **Talk while I type.** "I'm keeping this simple first..."

---

### 🛠️ Coding Patterns (Syntax)

**1. Create Arrays (The "Clean" Way)** Don't use `for` loops. Use `Array.from`

```typescript
// Good for Star Ratings, Pagination, Lists
const items = Array.from({ length: 5 }, (_, i) => i + 1);
```

**2. Rendering Lists** Always use `.map()` and **always** provide a unique `key`

```typescript
{items.map((item) => (
  <span key={item.id}>{item.name}</span>
))}
```

**3. Controlled Inputs** Never let an input manage itself. Bind `value` and `onChange`

```typescript
<input 
  value={text} 
  onChange={(e) => setText(e.target.value)} 
/>
```

**4. Thread-Safe Updates** When toggling or incrementing, use the **Functional Update**

```typescript
// BAD: setValue(!value)  -> Might be stale
// GOOD: setValue(prev => !prev) -> Always accurate
```

---

### 🏗️ Architecture & State

**5. Derived State is King**

- **Rule:** If I can calculate it, **do not** put it in state.
- **The Trap:** Storing `users` AND `filteredUsers`.
- **The Fix:** Store `users` + `search`. Calculate `filteredUsers` during render.
- **Soundbite:** _"I'm using derived state here to avoid synchronization bugs."_

**6. Dependency Arrays (`useEffect`, `useMemo`)**

- `[]` = **Mount only** (Run once).
- `[prop]` = **Update** (Run when `prop` changes).
- `(missing)` = **Every Render** (Danger ⚠️).

**7. Performance Optimization** Use `useMemo` for expensive derived state (like filtering a big list)

```typescript
const filtered = useMemo(() => {
  return list.filter(item => ...);
}, [list, filterTerm]);
```

---

### 🧪 Testing & Quality

**8. Testing Hooks** I cannot test hooks directly. Use the `renderHook` helper

```typescript
import { renderHook, act } from "@testing-library/react";

// 1. Render
const { result } = renderHook(() => useToggle());
// 2. Act (Update State)
act(() => result.current.toggle());
// 3. Assert
expect(result.current.value).toBe(true);
```

**9. Accessibility (The Senior Bonus)**

- Add `role="button"` to non-button clickables (like Stars).
- Use `aria-label="Rate 5 stars"` for screen readers.

---

### 🗣️ Quick Definitions (If asked "Why?")

- **Side Effect:** "Any operation that reaches outside the component, like fetching data or changing the document title. We use `useEffect` to keep the render pure."
- **Hooks:** "Functions that let functional components 'hook into' React features like state and lifecycle."
