---
layout: post
title: "Hello Strudel: Wait, I Can CODE Music Now?"
author: boyu
date: 2026-01-19 11:53:00 +0800
categories: [ Studio, Code ]
tags: [ strudel, live-coding ]
strudel: true
image: /assets/images/headers/hello-strudel.jpg
description: "From clicking MIDI to writing code: A step-by-step tutorial on building a 138 BPM Trance beat using Strudel and JavaScript."
pin: true
---

I used to click MIDI notes. Now I can code them!

Let's look at how we can build a Trance beat from scratch.

---

## Round I: Create The Driving Pulse

Trance is built on "4-on-the-floor."
This means the Bass Drum (Kick) hits on every single beat of the measure: 1, 2, 3, 4.

**The Tools:**

+ Set Tempo: `setcpm(138/4)`, dividing by 4 sets the grid to 138 BPM (Beats Per Minute), the standard speed for Trance. 
+ The Source: `s("...")`, short for `sound()`. It tells the engine to play a sample pattern.
+ The Kick: `bd`, short for "Bass Drum".
+ The Texture: `.bank("tr909")`, loads the legendary **Roland TR-909** drum kit, known for its punchy, mid-range "thump."
+ The Groove: `.gain("...")`, controls volume. Use this to add Dynamics (changing volume per hit) so the drum sounds human and driving, rather than robotic.
+ The Eyes: `_punchcard()`, generates a piano-roll visualization to verify the rhythm pattern.

> Click the **Play** button below to hear it right now.
{: .prompt-tip }

<div style="
  position: relative; 
  height: 390px; 
  width: 100%; 
  overflow: hidden; 
  border: 1px solid #3b4045; 
  border-radius: 8px; 
  margin-top: 20px;
  margin-bottom: 20px;
  background: #1b1b1b;
">
  <iframe 
    src="https://strudel.cc/#CnNldGNwbSgxMzgvNCkKLy8gNCBvbiB0aGUgZmxvb3IKcygiYmQqNCIpCiAgLmJhbmsoInRyOTA5IikKICAuZ2FpbigiMSAwLjcgMC45IDAuNiIpCiAgLl9wdW5jaGNhcmQoKQ%3D%3D" 
    width="100%" 
    height="100%" 
    style="border: none;" 
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; midi"
    loading="lazy">
  </iframe>
</div>

---

## Round II: Add the Energy

A Kick drum alone is a heartbeat.
But Trance needs **energy**.
Energy comes from the **Off-beat**.

If I place a sharp sound exactly in the middle of two kicks, the brain creates a sense of suction, pulling me to the
next beat. So let's use Open High Hat (`oh`) to create that energy, and the Hat must play only on the off-beats.

**The Tools:**

+ Stack the sounds: `stack(..., ...)`, to layer independent musical parts together.

<div style="
  position: relative; 
  height: 420px; 
  width: 100%; 
  overflow: hidden; 
  border: 1px solid #3b4045; 
  border-radius: 8px; 
  margin-top: 20px;
  margin-bottom: 20px;
  background: #1b1b1b;
">
  <iframe 
    src="https://strudel.cc/#CnNldGNwbSgxMzgvNCkKCnN0YWNrKAogIHMoImJkIGJkIGJkIGJkIiksIC8vIGNhbiBiZSByZWZhY3RvcmVkIGludG8gYGJkKjRgCiAgcygifiBvaCB%2BIG9oIH4gb2ggfiBvaCIpIC8vIGNhbiBiZSByZWZhY3RvcmVkIGludG8gYFt%2BIG9oXSo0YAopCiAgLmJhbmsoInRyOTA5IikKICAuZ2FpbigiMSAwLjcgMC45IDAuNiIpCiAgLl9wdW5jaGNhcmQoKQ%3D%3D" 
    width="100%" 
    height="100%" 
    style="border: none;" 
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; midi"
    loading="lazy">
  </iframe>
</div>

I did a bit of refactoring to the code, also I tweaked the hi-hat a bit, because Trance relies on a hypnotic, steady
machine-gun rhythm. So I made the off-beat hats steady and loud (`.gain(0.9)`).

<div style="
  position: relative; 
  height: 450px; 
  width: 100%; 
  overflow: hidden; 
  border: 1px solid #3b4045; 
  border-radius: 8px; 
  margin-top: 20px;
  margin-bottom: 20px;
  background: #1b1b1b;
">
  <iframe 
    src="https://strudel.cc/#CnNldGNwbSgxMzgvNCkKCiQ6IHN0YWNrKAogIC8vIExBWUVSIDE6IFRoZSBIZWFydGJlYXQKICBzKCJiZCo0IikKICAgIC5nYWluKCIxIDAuNyAwLjkgMC42IiksCgogIC8vIExBWUVSIDI6IFRoZSBFbmVyZ3kKICBzKCJbfiBvaF0qNCIpICAgICAgICAgICAvLyBSZWZhY3RvcmVkIGZyb20gIn4gb2ggfiBvaC4uLiIKICAgIC5nYWluKDAuOSkgICAgICAgICAgICAvLyBTdGVhZHkgcG93ZXIKKQouYmFuaygidHI5MDkiKQouX3B1bmNoY2FyZCgp" 
    width="100%" 
    height="100%" 
    style="border: none;" 
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; midi"
    loading="lazy">
  </iframe>
</div>

---

## Round III: Add the Anchor

We have the Kick (1, 2, 3, 4) and the Hat (&, &, &, &).
Now we need the **anchor**.
It means the **Clap (or Snare)** on beats **2** and **4**.

In Trance, the Clap is never "dry".
A dry clap sounds like a toy.
Trance claps sound like they are being played in a massive stadium. We need to add **Space**.

**The Tools:**

+ `cp`: Clap
+ `sd`: Snare Drum
+ `delay(0.3)`: Controls the amount of echo (feedback). This fills the empty space between the beats.

> **Pro Tip**
>
> Combine `delay(0.3)` with `.room(0.5)` to add Reverb.
> In Trance, I normally shorten the sample using `.decay()` (making it snappy) and then add Reverb using `.room()`
{: .prompt-tip }

<div style="
  position: relative; 
  height: 550px; 
  width: 100%; 
  overflow: hidden; 
  border: 1px solid #3b4045; 
  border-radius: 8px; 
  margin-top: 20px;
  margin-bottom: 20px;
  background: #1b1b1b;
">
  <iframe 
    src="https://strudel.cc/#CnNldGNwbSgxMzgvNCkKCiQ6IHN0YWNrKAogIC8vIExBWUVSIDE6IFRoZSBIZWFydGJlYXQKICBzKCJiZCo0IikKICAgIC5nYWluKCIxIDAuNyAwLjkgMC42IiksCgogIC8vIExBWUVSIDI6IFRoZSBFbmVyZ3kKICBzKCJbfiBvaF0qNCIpCiAgICAuZ2FpbigwLjkpLCAvLyBTdGVhZHkgcG93ZXIKCiAgLy8gTEFZRVIgMzogVGhlIEFuY2hvcgogIHMoIlt%2BIFtjcCwgc2RdXSoyIikKICAgIC5kZWxheSgwLjMpCiAgICAucm9vbSgwLjUpCikKLmJhbmsoInRyOTA5IikKLl9wdW5jaGNhcmQoKQ%3D%3D" 
    width="100%" 
    height="100%" 
    style="border: none;" 
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; midi"
    loading="lazy">
  </iframe>
</div>
