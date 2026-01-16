---
# The layout 'page' keeps the sidebar and styling
layout: page
icon: fas fa-pen-fancy
order: 4
title: Journal
---

<ul>
  {% for post in site.categories.Journal %}
    <li style="margin-bottom: 10px;">
      <span style="font-family: monospace; color: var(--text-muted-color);">{{ post.date | date: "%Y-%m-%d" }}</span>
      &raquo;
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
