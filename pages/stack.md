---
layout: page
title: Tech Stack
permalink: /stack/
icon: fas fa-layer-group
order: 4
description: The tools, technologies, and hardware powering Rooby Studio.
---

This site is a "Digital Garden"—a blend of static content and dynamic micro-services. Here is the technical breakdown of
how **Rooby Studio** is built and hosted.

## 🏗️ Architecture

The philosophy is **"Static First, Dynamic When Necessary."**

<div class="d-flex flex-wrap align-items-center gap-2 mb-4">
  <a href="https://jekyllrb.com/"><img src="https://img.shields.io/badge/Jekyll-CC0000?style=for-the-badge&logo=jekyll&logoColor=white" alt="Jekyll"></a>
  <a href="https://github.com/cotes2020/jekyll-theme-chirpy"><img src="https://img.shields.io/badge/Chirpy_Theme-1F2D3D?style=for-the-badge&logo=github&logoColor=white" alt="Chirpy"></a>
  <a href="https://pages.github.com/">
    <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages">
  </a>
</div>

<div class="d-flex flex-wrap gap-2 mb-4">
  <a href="https://workers.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"></a>
  <a href="https://developers.cloudflare.com/kv/"><img src="https://img.shields.io/badge/Cloudflare_KV-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="KV Storage"></a>
  <a href="https://goatcounter.com/"><img src="https://img.shields.io/badge/GoatCounter-Analytics-black?style=for-the-badge&logo=goatcounter&logoColor=magenta" alt="GoatCounter"></a>
</div>

* **Jekyll:** Compiles Markdown into static HTML.
* **Chirpy:** The base UI/UX, customized to better suit my needs.
* **GitHub Pages:** CI/CD and static asset serving.
* **Cloudflare:** Handles the serverless "Like" counter and KV storage.
* **GoatCounter:** Privacy-focused analytics (No cookies, no spying).

## 🎹 Audio Engine

<div class="d-flex flex-wrap align-items-center gap-2 mb-4">
  <a href="https://strudel.cc/" class="d-flex">
    <img src="https://img.shields.io/badge/Strudel-Live_Coding-111111?style=for-the-badge&logo=tidal&logoColor=white" alt="Strudel">
  </a>
<!-- TODO: - Turn it on when revealed
  <img src="https://img.shields.io/badge/Web_MIDI_API-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Web MIDI">
  <img src="https://img.shields.io/badge/IAC_Driver-000000?style=for-the-badge&logo=apple&logoColor=white" alt="IAC Driver">
-->
</div>

* **Strudel:** A REPL for TidalCycles running in an iframe.
* **Integration:** Custom Micro-Frontend architecture to isolate the audio engine.

## 💻 Studio & Dev

The hardware and software behind the scenes.

<div class="d-flex flex-wrap align-items-center gap-2 mb-4">
  <img src="https://img.shields.io/badge/Logic_Pro-333333?style=for-the-badge&logo=apple&logoColor=white" alt="Logic Pro X">
  <img src="https://img.shields.io/badge/Traktor_Pro_4-002E53?style=for-the-badge&logo=nativeinstruments&logoColor=white" alt="Traktor">
  <img src="https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white" alt="IntelliJ">
</div>

<div class="d-flex flex-wrap gap-2 mb-4">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
</div>

* **Hardware:** MacBook Pro (M-Series)
* **Code Editor:** IntelliJ IDEA / VS Code
* **DAW:** Logic Pro
* **DJ Software:** Traktor Pro 4 / rekordbox
* **DJ Hardware:** Traktor MX2 / Traktor X1 MK3 / Traktor Z1 MK2 / Pioneer DDJ-400

---

### Why this stack?

I chose **Jekyll** for stability and **Cloudflare** for speed. The goal was to have a site that loads instantly anywhere
in the world, costs **$0** to host, but still has the power to run dynamic code when I need it.
