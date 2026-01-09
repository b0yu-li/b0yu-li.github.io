---
layout: post
title: "Tracking Traffic Without Spying: Setting up GoatCounter Analytics"
author: boyu
date: 2026-01-06 14:45:00 +0800
categories: tech
tags: [ analytics, blog, goat-counter, privacy, tutorial ]
redirect_from:
  - /tech/2026/01/06/goat-analytics.html
---

## Background

Recently, I set up my blog with a humble wish: I simply wanted to know if people were reading it. (By the way, if you are reading this—thank you! 🫶)

I knew *Google Analytics* could get the job done, but it felt like overkill. Specifically:

1.  **It can be heavy:** The script is comparatively larger and can potentially slow down the site.
2.  **It can be invasive:** It involves tracking personal data, which often requires those annoying "Cookie Consent" banners to comply with GDPR.

So I did my research, and I was more than happy to stumble across **GoatCounter**—a privacy-focused, open-source analytics utility.

## Why GoatCounter?

1. **Privacy:** It doesn't track individual users or IP addresses, so I generally don't need a "Cookie Consent" banner.
2. **Simplicity:** The dashboard is clean—just pageviews and referrers.
3. **Performance:** The actual downloaded library is tiny (~3kb) compared to Google's (~45kb+).

## How to Set It Up

### 1. Prerequisite

1.  Go to [goatcounter.com/signup](https://www.goatcounter.com/signup) to sign up.
    <img src="/assets/images/goatcounter-signup.png" alt="GoatCounter Signup" width="600">

2.  You'll receive a verification link in your email. Just verify it, and you're good to go.

### 2. Inject the Script into Your Blog

1.  After signing up, you'll be redirected to your dashboard at `https://boyu.goatcounter.com` (replace `boyu` with your actual code). If not, you can manually navigate there. Once there, copy the provided script.
    <img src="/assets/images/goatcounter-script.png" alt="GoatCounter Script" width="600">

2.  **(READ THIS CAREFULLY)** Paste that script into `_includes/head-custom.html` (create the file if it doesn't exist yet). Your `_includes/head-custom.html` file should look like this:
    <img src="/assets/images/goatcounter-script-inspect.png" alt="Script Inspection" width="600">

### 3. Verification

Since I am a developer, my first instinct was to open the browser console to verify that the browser was actually talking to GoatCounter. As you can see, when I load one of my posts, it works!

<img src="/assets/images/goatcounter-verification-1.png" alt="Console Verification" width="600">

Ok, here comes the real deal—the smoking gun evidence. I navigated to my dashboard. After a successful login, I saw the sweet insights page with a record that strongly proves the analytics is working.

<img src="/assets/images/goatcounter-verification-2.png" alt="Dashboard Verification" width="600">

## How Do I Monitor Traffic?

Just navigate to `https://boyu.goatcounter.com` (replace `boyu` with your code), login, and **VOILÀ**.

## Conclusion

* It literally took me less than 10 minutes to make it work. This felt great, but what makes it even better? Knowing that readers like you can feel at ease regarding privacy. This is a tasteful choice, and I like it. ;)
* Feel free to check out the [source code](https://github.com/b0yu-li/b0yu-li.github.io/blob/main/_includes/head-custom.html) if it helps!
