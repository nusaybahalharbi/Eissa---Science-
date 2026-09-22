# ⚛️ Eissa · Energy and States of Matter

A bilingual (العربية / English) interactive learning website built for **Eissa / عيسى** covering
**Module: Classification and States of Matter — Lesson 1: Energy and States of Matter**.

**Live site:** https://nusaybahalharbi.github.io/Eissa---Science-/

## What it does

It teaches the lesson instead of showing answers. Every one of the **44 Question Bank items**
(sections A–H) is presented with the same teaching structure:

1. The original English question
2. السؤال بالعربي
3. وش يقصد السؤال؟ — what the question is really asking
4. الفكرة ببساطة — the concept in simple, child-friendly Arabic
5. The same concept in simple English
6. An animated visual
7. **Think first** — tap, choose, drag, build or type (the answer is never shown first)
8. The correct answer
9. ليش هذا الجواب صح؟
10. Why the other choices are wrong
11. 🧠 A memory trick
12. ⚡ A mini challenge to confirm understanding

## Sections

| Page | What it holds |
|---|---|
| 🏠 الرئيسية | The phenomenon: "Why is the liquid boiling?" + prediction |
| 📖 شرح الدرس | 16 lesson steps + the 4 Three-Dimensional Thinking challenges + the final return to the phenomenon |
| 🧪 مختبر المادة | Live particle lab: solid / liquid / gas + temperature slider |
| ⚛️ الذرات والمركبات | Molecule builder (CH₄, H₂O, NaCl, H₂O₂, NaHCO₃), symbols, ratios, subscripts |
| 🎮 تدرب | All 44 Question Bank items, filterable by section |
| 🧠 وضع الحفظ | Spaced repetition — wrong once returns soon, wrong twice comes first |
| 🏆 اختبر نفسك | 12-question mixed challenge, no explanations, then "راجع أخطائي" |
| 📊 تقدم عيسى | Stats, mastery, XP, streak, badges, per-question status |

## Language

🇸🇦 العربية (RTL) · 🇬🇧 English (LTR) · 🌐 Both (default).

## Tech

Plain HTML + CSS + JavaScript. No build step, no backend, no login, no API keys.
Progress is stored in `localStorage`. Works on desktop, iPad and phone.

## Files

- `index.html` — page shell, navigation, language switcher
- `styles.css` — design system, RTL/LTR, animations, responsive layout
- `data.js` — all lesson and Question Bank content (bilingual)
- `app.js` — rendering, activities, particle simulations, progress engine
- `source-coverage.md` — coverage checklist for both source documents

## Copyright

The source lesson is licensed McGraw Hill classroom material and is **not** reproduced here:
no textbook pages, scans, photographs, artwork or page designs are included or published.
All explanations, graphics, animations, activities and interface in this site are original,
written to teach the same concepts.
