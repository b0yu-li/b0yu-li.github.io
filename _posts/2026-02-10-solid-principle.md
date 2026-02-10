---
layout: post
title: "SOLID Principle Brochure"
author: boyu
date: 2026-02-10 12:10:00 +0800
categories: [ Tech, Design ]
tags: [ tech, solid, principle, design ]
description: "SOLID principle helps us write better code."
image: /assets/images/headers/solid-principle.jpg
# published: false
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

> _"Clients should not be forced to depend upon interfaces that they do not use."_

Please let me interpret it in simpler terms: **Don't force a class to sign a contract it can't fulfill.**
If I have a massive interface (a "Fat" interface), and a class only needs _one_ small part of it, I shouldn't force that class to implement the rest just to make the compiler happy.

### The Analogy: The Universal Remote vs. The Dedicated Button

![The Remote Analogy](/assets/images/remote-analogy.png){: width="330" height="180" .w-40 .right}

+ **The Violation:** Imagine a TV remote that also has buttons to control the Microwave, the Garage Door, and the AC. If I just want to change the channel, I still have to hold this massive, heavy brick. Worse, if the "Microwave" button shorts out, I might have to replace the whole remote, even though the TV part works fine.

+ **The Ideal:** Small, focused controls. I have a TV remote for the TV. I have a wall switch for the Garage. If I am a "TV Watcher," I don't need to carry the "Garage Opener" dependency.

### Examples

#### Bad Example (The "Fat" Interface)

I have a `Worker` interface. It seems logical: workers work, and they need to take breaks to eat.

```java
interface Worker {
    void work();
    void eat();
}

class HumanWorker implements Worker {
    public void work() { System.out.println("Working..."); }
    public void eat() { System.out.println("Eating lunch..."); }
}

class RobotWorker implements Worker {
    public void work() { System.out.println("Beep boop, working..."); }

    // PROBLEM: Robots don't eat!
    // I am forced to implement this method just to satisfy the interface.
    public void eat() {
        throw new UnsupportedOperationException("I don't eat!");
    }
}
```

**The Issue:** The `RobotWorker` depends on `eat()`, even though it doesn't use it.
If the definition of `eat()` changes (e.g., requires `calories` parameter), I have to update the Robot class, which is absurd.

#### Good Example (Segregated Interfaces)

I split the "Fat" interface into smaller, capability-based interfaces (Role Interfaces).

```java
// Capability 1: Working
interface Workable {
    void work();
}

// Capability 2: Eating
interface Feedable {
    void eat();
}

// Human needs both
class HumanWorker implements Workable, Feedable {
    public void work() { System.out.println("Working..."); }
    public void eat() { System.out.println("Eating lunch..."); }
}

// Robot only needs one
class RobotWorker implements Workable {
    public void work() { System.out.println("Beep boop, working..."); }
    // No eat() method here. Clean.
}
```

### Watch out for these smells

+ **"Not Implemented" Exceptions**: If I see a class override a method just to throw `new UnsupportedOperationException()`, it's a screaming sign of an ISP violation.

+ **Empty Methods**: Implementing a method with an empty body `{ }` just to satisfy the compiler.

+ **Fat Interfaces**: Interfaces with names like `Service`, `Manager`, or `Util` that have 20+ unrelated methods.

### Why this principle?

+ **Leaner Mocks**: When I write unit tests, I don't want to mock 50 methods for a "God Interface" when I only test one behavior. Segregated interfaces make testing trivial.

+ **Safety**: I can't accidentally call `robot.eat()` and crash the system at runtime, because the method simply doesn't exist on the API level.

+ **Decoupling**: Changes to the "Eating" logic never touch the "Robot" file.

---

## Dependency Inversion

> _"High-level modules should not depend on low-level modules. Both should depend on abstractions."_

Let's translate that into English: **Don't solder the lamp directly to the electrical wiring.**

If I build a house and I wire the lamp directly into the wall, I can never move it. I can never replace it with a fan. I am stuck.
Instead, I install a **Socket** (Interface). The lamp depends on the socket. The electrical wiring depends on the socket.
Now, I can plug _anything_ in.

### The Analogy: The Wall Socket

![The Wall Socket Analogy](/assets/images/wall-socket.png){: width="320" height="180" .w-50 .right}

+ **The Violation (Soldering)**: Imagine if my laptop charger was permanently welded to the nuclear power plant. If the plant goes down, I can't just switch to solar. If I want to move to a coffee shop, I have to drag the power plant with me.
+ **The Ideal (The Socket)**: My laptop plug (High Level) doesn't care if the electricity comes from a Nuclear Plant, a Wind Farm, or a Hamster Wheel (Low Level). It only cares that it fits the **Standard 2-Prong Socket** (Abstraction).

### Examples

#### Bad Example (Hard Dependencies)

I have a `NotificationService` (High Level) that needs to send messages. I hardcode the `EmailSender` (Low Level) inside it.

```java
class EmailSender {
    public void sendEmail(String msg) {
        System.out.println("Sending email: " + msg);
    }
}

class NotificationService {
    private EmailSender sender;

    public NotificationService() {
        // ERROR: I am creating the dependency myself ("New is Glue").
        // I am now stuck with EmailSender forever.
        this.sender = new EmailSender();
    }

    public void promote() {
        sender.sendEmail("50% OFF!");
    }
}
```

**The Problem:** If I want to change from **Email** to **SMS**, I have to rewrite the `NotificationService`. I have violated the Open/Closed principle because my high-level logic depends on the low-level detail of "Email."

#### Good Example (Dependency Injection)

I flip the dependency. I ask for an _interface_ in the constructor.

```java
// 1. The Abstraction (The Socket)
interface MessageSender {
    void sendMessage(String msg);
}

// 2. The Low-Level Modules (The Plugs)
class EmailSender implements MessageSender {
    public void sendMessage(String msg) { System.out.println("Email: " + msg); }
}

class SmsSender implements MessageSender {
    public void sendMessage(String msg) { System.out.println("SMS: " + msg); }
}

// 3. The High-Level Module
class NotificationService {
    private MessageSender sender;

    // "Inject" the dependency.
    // I don't care if it's Email or SMS, as long as it fits the interface.
    public NotificationService(MessageSender sender) {
        this.sender = sender;
    }

    public void promote() {
        sender.sendMessage("50% OFF!");
    }
}
```

### Watch out for these smells

+ **"New is Glue"**: If I see `new ConcreteClass()` inside a high-level business logic class, I am coupling them together.

+ **Static Calls**: Static methods like `Database.save()` are global and permanent. I cannot replace them with a mock object during testing, which forces my test suite to depend on a real, slow, and fragile database connection.

### Why this principle?

+ **Swappability**: I can switch from `MySQL` to `PostgreSQL` without changing a single line of my business logic.

+ **Testing**: This is the #1 reason we do this. If I hardcode `EmailSender`, my unit tests will spam real emails. If I use Dependency Inversion, I can inject a `FakeSender` that just logs "Email sent" to the console during tests.

```java
// Testing is easy now!
NotificationService testService = new NotificationService(new FakeSender());
```

---

## 💡 LSP vs. ISP: Wait, aren't they the same?

You might have noticed that the **Bad Examples** for Liskov Substitution (Penguin) and Interface Segregation (Robot) look almost identical. In both cases, the class throws an error because it can't do what it's asked to do.

| **Principle**         | **Perspective**             | **The Complaint**                                                                                                                                                   |
| --------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Liskov (LSP)**      | **The User** (Client)       | _"I asked for a Bird, you gave me a Penguin, and now my code crashed because I tried to fly it. You broke my trust!"_                                               |
| **Segregation (ISP)** | **The Class** (Implementer) | _"I am a Robot. Why do I have to import the 'Food' library and compile 'Nutrition' modules just to implement the 'Worker' interface? This is unnecessary baggage."_ |

**The Relationship:** Often, **ISP is the tool used to fix an LSP violation.** If a `Penguin` cannot replace a `Bird` (LSP Violation), it is likely because the `Bird` interface is too "fat" and includes flying logic by default. By breaking `Bird` into `Flyable` and `Walkable` (applying ISP), you solve the substitution problem.

---

## The Takeaway

+ At the end of the day, "SOLID" is a tool, not a religion.
+ "SOLID" helps us ship _faster_ in the _long_ run.
