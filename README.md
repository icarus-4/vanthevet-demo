# Van the Vet: motion-driven redesign demo (v3, clean white premium)

This is a static, single-page redesign concept for vanthevet.com. The look is clean white, Apple-style. It keeps the client's teal, lavender and amber as accents, uses one modern type family (Geist), and pairs high-quality stock pet photos with the client's own team photos.

## Run it

```bash
python -m http.server 5180
```

Then open http://localhost:5180.

## Sections and motion

| Section | What happens |
|---|---|
| Hero | The words blur into focus. A row of five pet portraits rises in from the centre outwards, then spreads and tilts apart as you scroll. |
| "calm." zoom | The page shows a giant "calm." cut out of white, with a photo visible through the letters. Scrolling zooms through the "l" into the full-screen photo, and then "Gentle hands. Serious medicine." appears. |
| Mission | Apple-style text that turns from grey to black, word by word, as you scroll. |
| Why us | A grid of white tiles: Fear Free, in-house diagnostics, a live open/closed status, 3 countries, tele-consults and 9 specialties. The numbers count up. |
| Services | A row of 9 large photo cards. Visitors can drag it, swipe it or use the arrows. Each card links to the real service page. |
| Fear Free visit | On desktop, a photo stays pinned on the left and cross-fades as the three steps scroll past, with a progress bar. On phones, the steps stack with an image under each. |
| Team | The client's own photos and credentials for Dr. Vanya, Dr. Rosalia and Dr. Mitali, plus the support crew. |
| Stories | One large quote at a time. It advances on its own with Instagram-style progress bars, and has previous, next and pause buttons. It pauses on hover and while off screen. |
| Visit | A live open/closed status in Gurgaon time, today's hours highlighted, a validated booking form, and a map. |
| Final CTA | A large "Ready when they are." that scales up as you scroll, and the client's illustrated animal parade. |

**Stack:** GSAP 3.13 (ScrollTrigger and SplitText) and Lenis smooth scroll, in plain HTML, CSS and JS with no build step.

**Accessibility:**
- Respects the visitor's reduced-motion setting: animations off and carousels manual.
- If the scripts fail to load, all content still shows and the services row and form still work.
- Visible focus states, a skip link, and labelled form fields with inline errors.
- The carousel has a pause button.

## Before showing or shipping

- **Stock photos** come from Unsplash (free licence) and load directly from images.unsplash.com. Swap in the client's own professional shoot when available.
- **Team photos, logo, Fear Free badge and illustrations** load from the client's current Webflow site.
- **WhatsApp** buttons use +91 92173 74240. Confirm this number is on WhatsApp.
- **The booking form is a demo.** It validates and shows a confirmation, but sends nothing.
- **"Vet care, calm by design."** is new headline copy for the client to approve.

## Earlier versions

- `_v1-soft/`: light cream with a serif typeface (rejected as not modern).
- `_v2-dark/`: cinematic dark (rejected as too dark).
