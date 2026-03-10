---
layout: post
title: "Database Design Best Practices Every Backend Dev Should Know"
author: boyu
date: 2026-03-10 10:30:00 +0800
mermaid: true
categories: [ Tech, Design ]
tags: [ tech, database, design, normalization, sql, backend ]
description: "From the three normal forms to logical foreign keys and the N+1 trap — the database design principles that separate clean schemas from production nightmares."
image: /assets/images/headers/db-design-best-practices.jpg
---

> A bad API can be versioned. A bad database schema haunts you forever.

Your database is the foundation of your application. Code can be refactored, APIs can be versioned, frontends can be rebuilt — but a poorly designed database will slowly poison everything that touches it. Migrations are risky, data is hard to move, and by the time you realize the schema is wrong, half your codebase has grown around its shape.

These are the principles and practices I keep coming back to.

---

## 1. The Three Normal Forms — Your Database's Backbone

**Normalization** is the process of structuring your tables so that data is stored cleanly, without duplication or hidden dependencies. There are more than three normal forms, but in practice, **the first three are the ones that matter**. If your schema satisfies 3NF, you're ahead of most production databases I've seen.

The analogy: imagine you're organizing a **filing cabinet** for a company. Every piece of information should live in exactly one folder, and every folder should be about exactly one thing. If you dump everything into one giant folder, you'll find the same customer's address scribbled on fifty invoices — and when they move, you'll have to find and fix all fifty.

```mermaid
graph LR
    U[<b>Unnormalized</b><br/>Everything in one table<br/>Duplicated data everywhere]
    --> A[<b>1NF</b><br/>Atomic values<br/>No repeating groups]
    --> B[<b>2NF</b><br/>No partial dependencies<br/>Every column depends on the full key]
    --> C[<b>3NF</b><br/>No transitive dependencies<br/>Columns depend only on the key]

    classDef bad fill:#fff,stroke:#c62828,stroke-width:2px,color:#000;
    classDef step fill:#fff,stroke:#0277bd,stroke-width:2px,color:#000;
    classDef good fill:#fff,stroke:#2e7d32,stroke-width:3px,color:#000;

    class U bad;
    class A,B step;
    class C good;
```

### 1NF: One Value, One Cell

**First Normal Form** says: every column holds a single, atomic value. No comma-separated lists. No arrays crammed into a text field.

Take a look at this table:

| order_id | customer | products |
|---|---|---|
| 1 | Alice | Widget, Gadget, Gizmo |
| 2 | Bob | Widget |

Seems compact and convenient. Now try to answer this: **how would you write a query to find all orders that contain "Gadget"?** You'd have to parse a comma-separated string — `LIKE '%Gadget%'` — which is fragile, can't use an index, and would also match a product called "SuperGadget". What about counting how many products each order has? More string splitting. The moment you need to _query_ the data inside that column, the design falls apart.

**Challenge:** before reading on, how would you redesign this table so that querying for a single product is straightforward?

The fix — give each product its own row, or (better) extract products into a separate table:

| order_id | product |
|---|---|
| 1 | Widget |
| 1 | Gadget |
| 1 | Gizmo |
| 2 | Widget |

**The rule:** if you're tempted to store a comma-separated list in a column, you're violating 1NF. Stop and create a related table instead.

### 2NF: Every Column Depends on the Full Key

**Second Normal Form** builds on 1NF and says: every non-key column must depend on _the entire_ primary key, not just part of it. This only matters when you have a **composite key** (a primary key made of two or more columns).

Consider an `order_items` table. A single order can contain multiple products, and the same product can appear in multiple orders. Neither `order_id` nor `product_id` alone can uniquely identify a row — but _together_ they can. That combination is called a **composite key**: a primary key made of two or more columns. Here, the composite key is `(order_id, product_id)`:

| order_id | product_id | quantity | product_name | product_price |
|---|---|---|---|---|
| 1 | 101 | 2 | Widget | 9.99 |
| 1 | 102 | 1 | Gadget | 19.99 |
| 2 | 101 | 5 | Widget | 9.99 |

Looks reasonable at first glance. Now ask yourself: **what happens when the Widget's price changes to 12.99?** You'd have to find and update _every row_ where `product_id = 101` appears. Miss one, and your data contradicts itself — the same product with two different prices.

The root cause: `product_name` and `product_price` depend only on `product_id` — they have nothing to do with `order_id`. That's a **partial dependency**. These columns don't need the full composite key to be determined; they only need half of it.

**Challenge:** how would you restructure this table so that a price change only requires updating a single row?

The fix — extract product info into its own table:

**`order_items`**

| order_id | product_id | quantity |
|---|---|---|
| 1 | 101 | 2 |
| 1 | 102 | 1 |
| 2 | 101 | 5 |

**`products`**

| product_id | product_name | product_price |
|---|---|---|
| 101 | Widget | 9.99 |
| 102 | Gadget | 19.99 |

Now each fact lives in exactly one place. Price changes happen in one row.

### 3NF: No Middle-Men

**Third Normal Form** says: no **transitive dependencies**. A non-key column should depend on the primary key directly — not through another non-key column.

Look at this `employees` table:

| employee_id | employee_name | department_id | department_name | department_head |
|---|---|---|---|---|
| 1 | Alice | D10 | Engineering | Charlie |
| 2 | Bob | D10 | Engineering | Charlie |
| 3 | Carol | D20 | Marketing | Diana |

Everything looks correct. But now: **what happens when the Engineering department gets a new head?** You'd need to update every row where `department_id = D10`. And if Alice's row says the head is "Charlie" while Bob's row already says "Eve," which one is right? The same fact — who leads Engineering — is duplicated across rows, and duplicated facts eventually contradict each other.

The root cause: `department_name` and `department_head` don't really depend on `employee_id`. They depend on `department_id`, which _itself_ depends on `employee_id`. The dependency chain is: `employee_id → department_id → department_name`. That's a **transitive dependency** — a column reaching the key only through a middle-man.

**Challenge:** how would you split this table so that department info lives in exactly one place, no matter how many employees belong to it?

The fix is the same pattern — extract the transitive dependency into its own table:

**`employees`**

| employee_id | employee_name | department_id |
|---|---|---|
| 1 | Alice | D10 |
| 2 | Bob | D10 |
| 3 | Carol | D20 |

**`departments`**

| department_id | department_name | department_head |
|---|---|---|
| D10 | Engineering | Charlie |
| D20 | Marketing | Diana |

**The classic summary:** a column in 3NF depends on _the key, the whole key, and nothing but the key_ — so help me Codd.

> **Normalize until it hurts, denormalize until it works.** The normal forms are your starting point. In practice, you may intentionally denormalize for read performance (caching a `total_amount` on an order, for instance). That's fine — as long as it's a conscious decision, not an accident.
{: .prompt-tip }

---

## 2. Logical Foreign Keys Over Physical Foreign Keys

This one trips up a lot of developers who learned database design from textbooks.

A **physical foreign key** is a `FOREIGN KEY` constraint declared in your DDL. The database enforces referential integrity — if you try to insert an order with a `customer_id` that doesn't exist in the `customers` table, the database rejects it.

```sql
CREATE TABLE orders (
    id          BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    total       DECIMAL(10,2),
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

A **logical foreign key** is the same column — `customer_id` referencing a customer — but without the database-level constraint. The relationship exists in your application code and documentation, not in the DDL.

```sql
CREATE TABLE orders (
    id          BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    total       DECIMAL(10,2)
);
```

**Why would you skip the constraint?** It feels dangerous. But in practice, many production systems at scale intentionally use logical foreign keys:

+ **Cross-service boundaries.** In a microservices architecture, `orders` and `customers` might live in different databases entirely. You _can't_ declare a foreign key across databases. The `customer_id` in the orders DB is a logical reference — your code is responsible for ensuring it's valid.

+ **Schema migration pain.** Foreign keys make `ALTER TABLE` operations slower and riskier on large tables. Dropping and recreating constraints during a migration on a table with hundreds of millions of rows can lock the table for minutes. Many teams at scale (Shopify, GitHub, Meta) have documented moving away from physical foreign keys for this reason.

+ **Soft deletes.** If your `customers` table uses soft deletes (`deleted_at IS NOT NULL` instead of actual `DELETE`), a foreign key constraint won't help — the row still exists. You need application-level checks anyway.

+ **Insert ordering.** Foreign keys enforce insert order — you must insert the parent before the child. In bulk imports or event-driven systems, records may arrive out of order. Logical foreign keys give you flexibility to insert records in any order and reconcile later.

This doesn't mean "never use physical foreign keys." For a monolithic application with a single database and strong data integrity requirements (financial systems, for example), physical foreign keys are valuable. **The point is: understand the tradeoff.** Physical foreign keys give you database-enforced integrity. Logical foreign keys give you operational flexibility. Pick the one that matches your architecture.

```java
// With logical foreign keys, your application layer enforces integrity
public Order createOrder(CreateOrderRequest request) {
    Customer customer = customerRepo.findById(request.getCustomerId())
        .orElseThrow(() -> new EntityNotFoundException(
            "Customer not found: " + request.getCustomerId()));

    Order order = new Order();
    order.setCustomerId(customer.getId());
    order.setTotal(request.getTotal());
    return orderRepo.save(order);
}
```

**The rule:** use physical foreign keys when you have a single database with strict integrity requirements. Use logical foreign keys when crossing service boundaries, working at scale, or when operational flexibility matters more than database-level enforcement.

---

## 3. Taming the N+1 Query Problem

I covered the N+1 problem from an API perspective in a [previous post](/posts/backend-api-design-tips/). Here I want to zoom into the **ORM layer** — specifically JPA/Hibernate — because that's where this problem most often hides.

The core issue: your ORM loads related entities **lazily by default**. That means fetching a list of orders doesn't load their customers until you _access_ each one. In a loop, that means N extra queries.

```java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
```

```java
List<Order> orders = orderRepo.findAll();
for (Order order : orders) {
    System.out.println(order.getCustomer().getName()); // fires a SELECT per order
}
```

This silently generates 1 + N queries. Ten orders? Eleven queries. A thousand orders? A thousand and one queries hammering your database.

### Fix 1: JOIN FETCH in JPQL

The most direct solution — tell JPA to fetch the related entity in the same query:

```java
@Query("SELECT o FROM Order o JOIN FETCH o.customer")
List<Order> findAllWithCustomers();
```

This generates a single `SELECT ... FROM orders JOIN customers ...` instead of 1 + N queries.

### Fix 2: @EntityGraph

If you prefer annotations over query strings:

```java
@EntityGraph(attributePaths = {"customer"})
List<Order> findAll();
```

Same result — one query with a `JOIN` — but declared on the repository method rather than in JPQL.

### Fix 3: Batch Fetching

Hibernate can batch lazy loads. Instead of N individual `SELECT` queries, it issues `SELECT ... WHERE id IN (?, ?, ?, ...)` in chunks:

```java
@Entity
@BatchSize(size = 50)
public class Customer {
    // ...
}
```

This won't eliminate the extra queries entirely, but it reduces N queries to roughly N/50. It's a pragmatic middle ground when you can't easily rewrite all your queries.

**The rule is the same as before:** if you're reading a list of entities and accessing their relationships in a loop, you probably have an N+1 problem. Profile your queries — Hibernate's `hibernate.show_sql=true` will make it painfully obvious.

---

## 4. More Practices Worth Adopting

### Index What You Query

An index on a column you never filter or sort by is wasted space and slows down writes. An _absent_ index on a column in your `WHERE` clause turns a millisecond lookup into a full table scan.

```sql
-- If you frequently query orders by customer and status:
CREATE INDEX idx_orders_customer_status
    ON orders (customer_id, status);
```

**The mental model:** indexes are like a book's index. You wouldn't put every word in the index — just the ones readers actually look up. Profile your slow queries, check your `WHERE` clauses, and index accordingly.

Composite indexes matter too: an index on `(customer_id, status)` serves queries that filter by `customer_id` alone _and_ queries that filter by both `customer_id` and `status`. But it does **not** serve queries that filter by `status` alone — index column order matters.

### Soft Deletes Over Hard Deletes

Instead of `DELETE FROM customers WHERE id = 42`, set a flag:

```sql
UPDATE customers SET deleted_at = NOW() WHERE id = 42;
```

+ You keep audit history
+ You can recover accidentally deleted data
+ Foreign references don't break

Add a default scope or a `WHERE deleted_at IS NULL` to your queries so deleted records are invisible by default. Most ORMs support this natively — JPA has `@Where`, Spring Data has `@SoftDelete`.

### Always Add Audit Columns

Every table should have, at minimum:

```sql
CREATE TABLE orders (
    id          BIGINT PRIMARY KEY,
    -- ... business columns ...
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);
```

You will need these. Every production debug session eventually becomes "when did this change, and who changed it?" Without audit columns, you're flying blind.

### Use Consistent Naming Conventions

Pick a convention and enforce it ruthlessly:

| Element | Convention | Example |
|---|---|---|
| Tables | `snake_case`, plural | `order_items` |
| Columns | `snake_case` | `customer_id` |
| Primary keys | `id` | `orders.id` |
| Foreign keys | `<singular_table>_id` | `orders.customer_id` |
| Indexes | `idx_<table>_<columns>` | `idx_orders_customer_id` |
| Booleans | `is_` prefix | `is_active` |
| Timestamps | `_at` suffix | `created_at`, `deleted_at` |

The specific convention matters less than consistency. When every table follows the same pattern, developers can navigate the schema without checking documentation.

---

## The Takeaway

Database design is not glamorous work. Nobody tweets about a well-normalized schema. But **every production nightmare I've debugged — data inconsistency, mysterious slowdowns, impossible migrations — traced back to a design decision made (or not made) in the first week**.

The normal forms keep your data clean. Logical foreign keys keep your architecture flexible. Killing N+1 queries keeps your app fast. And the small practices — indexes, soft deletes, audit columns, naming conventions — compound into a schema that's a _pleasure_ to work with instead of a minefield.

> Design your database as if the next developer to work on it is a sleep-deprived version of you — because it will be.
