---
layout: post
title: "Backend API Design Tips I Should've Known Earlier"
author: boyu
date: 2026-03-05 09:00:00 +0800
categories: [ Tech, API ]
tags: [ tech, api, backend, design, performance, rest ]
description: "Five practical backend API design tips — from avoiding N+1 queries to idempotency and error contracts — that separate production-ready APIs from the rest."
image: /assets/images/headers/backend-api-design-tips.jpg
---

> An API is a promise. Every rough edge is a promise you'll have to keep forever.

I've read a lot of API design guides. Most of them stop at "use nouns, not verbs" and call it a day. That's fine for day one, but it doesn't prepare you for the problems that show up at day 100 — when you're under load, when clients are retrying aggressively, or when a breaking change has to land without taking down your users.

These are the five tips I wish someone had drilled into me earlier.

---

## 1. Kill the N+1 Problem Before It Kills Your Performance

The **N+1 problem** is the most common performance trap in API backends, and it's embarrassingly easy to introduce.

The scenario: I have an endpoint that returns a list of orders. Each order has a customer. My code fetches all orders in one query, then loops over them and fetches each customer individually. One query to get N orders — then N more queries to get N customers. That's **N+1 queries** for what should have been two.

```java
// Bad — N+1
List<Order> orders = orderRepo.findAll();
for (Order order : orders) {
    Customer customer = customerRepo.findById(order.getCustomerId()); // fired N times
    // ...
}
```

The fix depends on the stack, but the principle is the same: **load related data in bulk, not one-at-a-time**.

```java
// Good — 2 queries total
List<Order> orders = orderRepo.findAll();

Set<Long> customerIds = orders.stream()
    .map(Order::getCustomerId)
    .collect(Collectors.toSet());

Map<Long, Customer> customers = customerRepo.findAllById(customerIds)
    .stream()
    .collect(Collectors.toMap(Customer::getId, c -> c));

// Attach the fetched customers back to the orders
for (Order order : orders) {
    Customer customer = customers.get(order.getCustomerId());
    order.setCustomer(customer); // or however you use it
}
```

In JPA / Hibernate, this is often solved by switching from `FetchType.LAZY` to a proper `JOIN FETCH` in the query. In GraphQL APIs, **DataLoader** is the standard solution — it batches and caches all the individual lookups made within a single request cycle.

The reason this matters so much: N+1 queries don't just feel slow — they scale _linearly_ with your data size. Ten orders might be fine. Ten thousand orders hits your database a thousand times in a single request.

**The rule:** if you're looping and calling the database inside the loop, you have a problem.

---

## 2. Paginate Everything That Returns a List

Never return an unbounded list. Ever.

I've seen endpoints that return `GET /users` and hand back the full user table — fine in development, catastrophic in production. The right default is: **if something can grow, paginate it from day one**.

There are two main pagination strategies, and they're not interchangeable:

### Offset Pagination

The classic. Clients pass a `page` and `size` (or a `limit` and `offset`).

```
GET /orders?page=3&size=20
```

It's easy to implement and easy to understand. The problem: **offset pagination is unstable under concurrent writes**. If a new order is inserted while the client is reading page 2, page 3 shifts — rows get skipped or duplicated. For most CRUD dashboards this is fine. For real-time feeds or large datasets, it breaks.

### Cursor Pagination

Instead of a numeric offset, the client passes an **opaque cursor** — a token representing their position in the result set.

```
GET /orders?cursor=eyJpZCI6MTAwfQ&limit=20
```

The response includes the next cursor:

```json
{
  "data": [...],
  "nextCursor": "eyJpZCI6MTIwfQ",
  "hasMore": true
}
```

The cursor encodes something stable — often the `id` or a `(created_at, id)` tuple. The database query becomes `WHERE id > :cursorId ORDER BY id LIMIT 20` — no offset, no instability. **Cursor pagination stays correct even as data changes.**

The tradeoff: clients can't jump to page 7 directly. It's forward-only navigation. For infinite-scroll UIs and event feeds, that's exactly right. For admin tables where someone needs to jump to a specific page, offset pagination is the more practical choice.

**The default I use:** cursor pagination for user-facing feeds and event streams; offset for admin/reporting endpoints where jumping to a specific page matters.

---

## 3. Make Mutating Endpoints Idempotent

An **idempotent** operation produces the same result no matter how many times you run it. `GET` is idempotent. `DELETE /orders/42` is idempotent — deleting the same order twice has the same end state. But `POST /orders` is _not_ — calling it twice creates two orders.

This matters because networks are unreliable. Clients retry. A payment request that times out might have succeeded on the server — so the client retries, and now you've charged the customer twice. This is a real production bug, not a theoretical one.

The standard fix: **idempotency keys**.

The client generates a unique key for each logical operation and sends it as a header:

```
POST /payments
Idempotency-Key: a3f8c2d1-7b44-4e9a-8901-bd2e12345678
Content-Type: application/json

{ "amount": 9900, "currency": "HKD" }
```

The server stores the key and the result. On a duplicate request with the same key, it returns the stored result instead of processing again.

```java
String key = request.getHeader("Idempotency-Key");
if (idempotencyStore.has(key)) {
    return idempotencyStore.get(key); // return the original result
}
PaymentResult result = processPayment(request.getBody());
idempotencyStore.put(key, result, Duration.ofHours(24));
return result;
```

[Stripe has used this pattern for years](https://stripe.com/blog/idempotency) — it's the reason their API documentation explicitly calls out idempotency keys for every mutating endpoint. The key expires after a window (typically 24 hours) to bound storage.

**The rule:** any endpoint where calling it twice would cause harm — payments, order placement, email sends — needs an idempotency key mechanism.

---

## 4. Design Errors as First-Class Citizens

Most APIs treat errors as an afterthought. The happy path gets careful JSON design; the error path gets a bare `{ "message": "Something went wrong" }`. That's a problem for every client that has to handle it.

[**RFC 9457**](https://www.rfc-editor.org/rfc/rfc9457) (Problem Details for HTTP APIs, published July 2023 — it supersedes RFC 7807) defines a standard error body that's both human-readable and machine-parseable:

```json
{
  "type": "https://api.example.com/errors/insufficient-balance",
  "title": "Insufficient Balance",
  "status": 402,
  "detail": "Account balance is $0.00. A charge of $99.00 was attempted.",
  "instance": "/payments/a3f8c2d1"
}
```

+ **`type`** — a URI that uniquely identifies the error class. Clients can `switch` on this, not on fragile string messages.
+ **`title`** — human-readable name for the error class.
+ **`detail`** — the specific detail for _this_ occurrence.
+ **`instance`** — a URI pointing to the specific failed request.

You can extend it with domain fields — `"balance": 0, "charged": 9900` — as long as the core fields are present.

The reason this matters: **clients need to distinguish between errors to respond correctly**. A `402 Insufficient Balance` should prompt a top-up flow. A `422 Validation Error` should highlight the invalid field. A `503 Service Unavailable` should trigger a retry. If all three return `{ "message": "error" }`, the client can't tell them apart without parsing English strings — which is fragile and breaks the moment someone renames the message.

**The rule:** every error response should tell the client _what happened_, _why_, and _what to distinguish this error from another_. RFC 9457 is the current standard. At minimum, include a machine-readable error code.

---

## 5. Version Your API from Day One

APIs evolve. Clients don't always update when you do. This tension is why **versioning** exists — it lets me change the API without breaking existing integrations.

The two main approaches:

### URL Versioning

```
GET /v1/orders
GET /v2/orders
```

Simple, visible, easy to test in a browser. The version is explicit in every request. This is what Stripe, Twilio, and most public APIs use. The downside is that the version leaks into every URL, and it can encourage clients to pin to a version forever.

### Header Versioning

```
GET /orders
Accept: application/vnd.myapp.v2+json
```

Cleaner URLs, but harder to test and less obvious. Fewer clients get it right without good documentation.

**My preference:** URL versioning for external/public APIs — it's explicit and hard to mess up. Header versioning for internal APIs between services where both sides are under your control.

The more important rule: **version before you have a breaking change, not after**. Starting with `/v1/` costs almost nothing. Adding versioning after you've already shipped `/orders` means negotiating a migration with everyone who's already integrated.

What counts as a breaking change? Removing a field, renaming a field, changing a field's type, or changing error codes — anything a client might have relied on. Adding optional fields to a response is generally safe.

**The rule:** ship `/v1/` on day one. Document your deprecation policy before you need it.

---

## The Takeaway

None of these tips are exotic. N+1 queries, unbounded lists, double-charged payments, unstructured errors, unversioned endpoints — these are the bugs that show up not in code review but in production at 2am.

The pattern across all five is the same: **design for the second request, not just the first**. The client that retries. The dataset that grows. The error the user actually needs to handle. The consumer that can't break.

A good API makes the right thing easy and the wrong thing hard. These five tips move it measurably closer to that.
