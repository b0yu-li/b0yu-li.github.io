---
layout: post
title: "SOLID Principle Brochure"
author: boyu
date: 2026-01-23 14:30:00 +0800
categories: [ Tech, Design ]
tags: [ tech, solid, principle, design ]
description: "SOLID principle helps us write better code."
image: /assets/images/headers/solid-principle.jpg
published: false
---

This brochure consolidates everything I need to know about the **SOLID** principle.

---

## Single Responsibility

TODO: - Coming soon...

---

## Open/Closed

> _"Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification."_

+ **_Open_ for extension:** Can add new behaviors or functionality to the system.
+ **_Closed_ for Modification**: Should not change the existing source code to add that new functionality.

### The Analogy: The Power Strip

![The Power Strip Analogy](/assets/images/power-strip.png){: width="360" height="180" .w-50 .left}

+ **Closed for Modification**: The internal wiring of that strip is set for good. I don't cut the rubber cord and splice
  in new wires every time I need to use an appliance. It would be hilarious if I did so, right?
+ **Open for Extension**: The strip provides a standard _interface_ (the socket). I can plug in a lamp, a laptop, or a
  heater. The power strip doesn't care what is plugged in, as long as it fits the plug interface. I extend the utility
  of the electricity without rewiring the internals. Huh, how clever.

### Examples

#### Bad Example

```java
class PaymentProcessor {
  public void processPayment(String type, double amount) {
    if (type.equals("CreditCard")) {
      // Logic for verifying credit card
      // Logic for charging credit card
      System.out.println("Paid " + amount + " via Credit Card");
    } else if (type.equals("PayPal")) {
      // Logic for logging into PayPal
      // Logic for sending funds
      System.out.println("Paid " + amount + " via PayPal");
    }
  }
}
```

#### Good Example

```java
// Step 1: Create an Interface
interface PaymentMethod {
  void pay(double amount);
}

// Step 2: Create separate classes for each method. These are my "extensions."
class CreditCard implements PaymentMethod {
  public void pay(final double amount) {
    // Logic specific to Credit Cards
    log.info("Paid " + amount + " via Credit Card");
  }
}

class PayPal implements PaymentMethod {
  public void pay(final double amount) {
    // Logic specific to PayPal
    log.info("Paid " + amount + " via PayPal");
  }
}

// Step 3: The Processor (Closed for Modification)
class PaymentProcessor {
  public void processPayment(final PaymentMethod method, final double amount) {
    // I just call .pay() - I don't care what the specific class is.
    method.pay(amount);
  }
}
```

### Watch out for these smells

+ A massive chain of `if (type == X) ... else if (type == Y)` like we saw in the bad example.
+ I have to add a new `case` statement for the `switch`.
+ A hardcoded dependency, like `new PDFReportGenerator()` directly inside the logic class, I should create the
  `ReportGenerator` interface and use Dependency Injection to inject the interface instead.
  + I can put it in another way: Hardcoded dependencies that force me to modify the parent class just to switch tools (
    e.g., swapping `PDFGenerator` for `ExcelGenerator`).

### Why this principle?

+ **Testing**: When I add `CryptoPayment`, I only write tests for that new class. I don't need to re-test the
  `CreditCard` logic because I didn't touch it like, at all.
+ **Safety (including mental safety, that's a huge plus, right?)**: I can't break existing features if I don't even open
  their files.
+ **Collaboration**: Two developers can write two different payment methods at the same time without merge conflicts in
  the `PaymentProcessor`.

---

## Liskov Substitution

TODO: - Coming soon...

---

## Interface Segregation

TODO: - Coming soon...

---

## Dependency Inversion

TODO: - Coming soon...

---

## The Takeaway

+ At the end of the day, "SOLID" is a tool, not a religion.
+ "SOLID" helps us ship _faster_ in the _long_ run.
