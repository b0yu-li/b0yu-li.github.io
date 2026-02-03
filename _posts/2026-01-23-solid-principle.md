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

> _"A class should have one, and only one, reason to change."_

This doesn't mean a class should only have one _method_. It means a class should be responsible for only one _part_ of the system's functionality.

If I have to change a class because of a **Database** change, AND I have to change the _same_ class because of a **Business Logic** change, that class has too many responsibilities.

### The Analogy: The Swiss Army Knife

![The Swiss Army Knife Analogy](/assets/images/swiss-army-knife.png){: width="360" height="180" .w-50 .right}

+ **The Violation**: A Swiss Army Knife tries to be a knife, a spoon, a saw, a corkscrew, and a toothpick. It does everything, but it does nothing _great_. If the corkscrew mechanism jams, the whole knife might become useless. It is heavy, clunky, and hard to clean.
+ **The Ideal**: A dedicated Chef's Knife. It has one job: cutting. It does it perfectly. If I need to open a wine bottle, I get a corkscrew. If I want to fix the database (or a loose screw), I get a screwdriver. Each tool changes independently.

### Examples

#### Bad Example (The "God" Class)

Meet the `User` class. It manages state, talks to the database, and even sends emails.

```java
class User {
  private String username;

  // Responsibility 1: Data Management
  public String getUsername() { return username; }

  // Responsibility 2: Database Operations
  public void saveToDatabase() {
    Connection conn = database.getConnection();
    // ... SQL logic ...
  }

  // Responsibility 3: Notification Logic
  public void sendWelcomeEmail() {
    EmailClient client = new EmailClient();
    client.send(this.email, "Welcome!");
  }
}
```

**The Problem:**

+ If the **CTO** changes the Database from MySQL to PostgreSQL, I touch this class.

+ If **Marketing** wants to change the email subject line, I touch _the same_ class.

+ **Shared State:** If the class uses shared variables (like a global `dbConnection`), a bug in the email logic might leave that connection in a bad state, causing the Login logic to fail subsequently.

#### Good Example (Delegation)

We split the responsibilities into focused classes.

```java
// 1. The Entity (Data only)
class User {
  private String username;
  public String getUsername() { return username; }
}

// 2. The Repository (Database only)
class UserRepository {
  public void save(User user) {
    // ... Database logic ...
  }
}

// 3. The Service (Notification only)
class EmailService {
  public void sendWelcomeEmail(User user) {
    // ... Email logic ...
  }
}
```

### Watch out for these smells

+ **The "And" Keyword**: If I describe what a class does and I use the word "and" multiple times (e.g., "This class parses the file **AND** validates the data **AND** saves it"), it likely breaks SRP.

+ **God Classes**: Classes named `UserManager`, `SystemHandler`, or `CentralController` are often dumping grounds for unrelated logic.

+ **Imports from Everywhere**: If a class imports `java.sql.*` (Database) AND `java.net.*` (Network) AND `javax.swing.*` (UI), it is definitely doing too much.

### Why this principle?

+ **Lower Coupling**: Changes in the database layer won't break my email logic.

+ **Fewer Merge Conflicts**: The backend engineer works on `UserRepository` while the frontend engineer updates `EmailService`. They don't fight over the same file.

+ **Reusability**: I can use that `EmailService` for other things (like "Forgot Password") without dragging along the entire User Database logic.

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

> _"Subtypes must be substitutable for their base types without altering the correctness of the program."_

Let me put it in a very simple way.
If I have a parent class `Parent` and a child class `Child`, I should be able to **replace `Parent` with `Child` everywhere** in my code, and **nothing should explode**.

### The Analogy: The Mechanical Duck

![The Mechanical Duck Analogy](/assets/images/mechanical-duck-analogy.png){: width="330" height="180" .w-40 .right}

If it looks like a duck, swims like a duck, and quacks like a duck, but it **needs batteries** to function, we have a problem.

Imagine I have a pond simulator. It holds a collection of `Duck` objects.

+ **Real Duck**: Eats bread, swims, quacks.
+ **Mechanical Duck**: Eats... batteries? Breaks if put in water?

If my code treats them both as generic `Duck`s, and I try to feed the Mechanical Duck a piece of bread, it might jam the gears and crash the system.
The Mechanical Duck **violates** the Liskov Substitution Principle because it cannot seamlessly replace a Real Duck, even though they share the same name.

### Examples

#### Bad Example (The Violation)

I create a `Bird` class with a `fly()` method. Everyone loves birds. Then I add a `Penguin`. Penguins are birds, right? So `Penguin` extends `Bird`.

```java
class Bird {
    public void fly() {
        System.out.println("I believe I can fly...");
    }
}

class Sparrow extends Bird {
    // Inherits fly() - Works great.
}

class Penguin extends Bird {
    @Override
    public void fly() {
        // ERROR: Penguins can't fly!
        throw new UnsupportedOperationException("I can't fly!");
    }
}

// The Client Code
public void moveBirds(List<Bird> birds) {
    for (Bird bird : birds) {
        // If I pass a Penguin here, my program CRASHES.
        // This means Penguin is NOT a safe substitute for Bird.
        bird.fly(); 
    }
}
```

#### Good Example (The Fix)

The problem isn't the Penguin; the problem is my abstraction.
Not all birds fly.
I should separate the capabilities (Interfaces) from the biology.

```java
// Capability 1: Moving
interface Moveable {
    void move();
}

// Capability 2: Flying (Only for flying birds)
interface Flyable {
    void fly();
}

class Sparrow implements Moveable, Flyable {
    public void move() { System.out.println("Hopping..."); }
    public void fly() { System.out.println("Flying high!"); }
}

class Penguin implements Moveable {
    // Penguin only implements Moveable, NOT Flyable.
    public void move() { System.out.println("Running fast!"); }
}

// The Client Code
public void moveBirds(List<Moveable> birds) {
    for (Moveable bird : birds) {
        // Safe! Both Sparrow and Penguin can move.
        // I don't need to ask "Are you a Penguin?"
        bird.move();
    }
}
```

### Watch out for these smells

+ **Refused Bequest**: Does my child class override a method just to throw `NotImplementedException` or do nothing? That's a red flag.
+ **Type Checking**: Do I see code like `if (item instanceof Penguin)`? That usually means my abstraction is leaky.
+ **Downcasting**: Am I constantly casting a generic object down to a specific type to get it to work? To fix downcasting, look for the common intent behind the specific actions. If a `Penguin` _slides_ and a `Sparrow` _flies_, the common intent is _movement_. Create a generic `move()` method and let each class handle its own implementation details.
  + **Why it is dangerous**: If I add a new bird (e.g., `Ostrich`), I have to hunt down every single `if (instanceof ...)` statement in my entire codebase and update it. If I miss one, I get a runtime crash. That is the opposite of "Closed for Modification."
  + **How to fix it: Generalize the Action**
    + **Identify the Intent**: Why am I checking if it's a `Penguin`? I want it to move.
    + **Rename the Method**: `fly()` is too specific. `slideOnBelly()` is too specific. Change the parent method to `move()` or `performAction()`.
    + **Push the Logic Down**: Move the "how" into the specific classes. Implement the `move()` method in `Penguin`, and actually make it `slideOnBelly()`
  + _Note:_ Sometimes I can't generalize. For example, `playMusic()` vs `layEgg()`. They aren't the same "type" of action. If I find myself downcasting in that situation, it usually means my list is too generic. I should split the `List<Object> things` (contains `Duck`, `Radio`, `Car`) into `List<Animal> animals` and `List<Device> devices`.

```java
// The "Smell" of Downcasting
for (Bird bird : birds) {
    if (bird instanceof Penguin) {
        // I have to cast it (Downcast) to make it do what I want.
        // This implies 'Bird' is a leaky abstraction.
        ((Penguin) bird).slideOnBelly(); 
    } else {
        bird.fly();
    }
}
```

### Why this principle?

+ **No Surprises**: A `List<Bird>` should behave like a list of birds. I shouldn't have to worry about one of them being a grenade (or a Penguin).
+ **Maintainability**: I can add new "Good" birds forever without breaking the `moveBirds` method.
+ **Safety**: In a No QA environment, LSP is critical. If I create a subclass that throws unexpected errors, no QA tester will catch it. It will crash in production when a user triggers that specific edge case.

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
