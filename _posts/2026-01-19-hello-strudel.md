---
layout: post
title: "Hello Strudel: Wait, I Can CODE Music Now?"
author: boyu
date: 2026-01-19 11:53:00 +0800
categories: [ Studio, Code ]
tags: [ strudel, live-coding ]
strudel: true
image: /assets/images/headers/hello-strudel.jpg
# TODO: - Add description
pin: true
---

I used to click MIDI notes. Now I can code them!

Let's have a look at an example on how we build a Trance example.

## Round I: Create The Driving Pulse

Trance is built on "4-on-the-floor."
This means the Bass Drum (Kick) hits on every single beat of the measure: 1, 2, 3, 4.

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

## Round II: Add the Open High Hat

The Hat must play only on the off-beats.

<div style="
  position: relative; 
  height: 420px; 
  width: 100%; 
  overflow: hidden; 
  border: 1px solid #3b4045; 
  border-radius: 8px; 
  margin-top: 20px;
  background: #1b1b1b;
">
  <iframe 
    src="https://strudel.cc/#CnNldGNwbSgxMzgvNCkKCnN0YWNrKAogIHMoImJkIGJkIGJkIGJkIiksIC8vIGNhbiBiZSByZWZhY3RvcmVkIGludG8gYGJkKjRgCiAgcygifiBvaCB%2BIG9oIH4gb2ggfiBvaCIpIC8vIGNhbiBiZSByZWZhY3RvcmVkIGludG8gYFt%2BIGJkXSo0YAopCiAgLmJhbmsoInRyOTA5IikKICAuZ2FpbigiMSAwLjcgMC45IDAuNiIpCiAgLl9wdW5jaGNhcmQoKQ%3D%3D" 
    width="100%" 
    height="100%" 
    style="border: none;" 
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; midi"
    loading="lazy">
  </iframe>
</div>

I can do a bit refactoring to the code, also I tweaked the hi-hat a bit, because Trance relies on a hypnotic, steady
machine-gun rhythm. So I made the off-beat hats steady and loud (`.gain(0.9)`).

<div style="
  position: relative; 
  height: 450px; 
  width: 100%; 
  overflow: hidden; 
  border: 1px solid #3b4045; 
  border-radius: 8px; 
  margin-top: 20px;
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
