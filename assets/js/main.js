/* ==========================================================================
   Van the Vet — motion layer ("Clean white premium")
   GSAP 3.13 (ScrollTrigger + SplitText) + Lenis. Degrades gracefully:
   - prefers-reduced-motion → static layout, manual carousels
   - CDN failure            → everything visible, shelf + form still work
   ========================================================================== */
(function () {
  'use strict';

  window.__motionReady = true;
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var lenis = null;

  initOpenStatus();
  initNavState();
  initMenu();
  initForm();
  initShelf();

  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!hasGsap) { root.classList.remove('motion'); initAnchors(); initQuotes(null); return; }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  if (!motion) { initAnchors(); initQuotes(null); return; }

  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis; // handy for QA: __lenis.scrollTo(y, { immediate: true })
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  initAnchors();

  Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]).then(function () {
    heroIntro();
    heroScroll();
    zoomThrough();
    splitHeadings();
    introFill();
    reveals();
    counters();
    servicesEnter();
    story();
    initQuotes(gsap);
    ctaScale();
    progressBar();
    ScrollTrigger.refresh();
  });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* ================================================================== */

  function heroIntro() {
    var title = document.querySelector('[data-hero-title]');
    if (SplitText) {
      SplitText.create(title, {
        type: 'words',
        wordsClass: 'w',
        autoSplit: true,
        onSplit: function (self) {
          gsap.set(title, { opacity: 1 });
          return gsap.from(self.words, { y: 46, opacity: 0, filter: 'blur(14px)', duration: 1.3, stagger: 0.08, ease: 'expo.out', delay: 0.1, clearProps: 'filter' });
        }
      });
    } else {
      gsap.to(title, { opacity: 1, duration: 0.8 });
    }
    gsap.fromTo('[data-hero-fade]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out', delay: 0.45 });
    gsap.fromTo('.lineup__item', { opacity: 0, y: 140, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: 'expo.out', stagger: { each: 0.09, from: 'center' }, delay: 0.55 });
  }

  function heroScroll() {
    var items = gsap.utils.toArray('.lineup__item');
    var mid = (items.length - 1) / 2;
    items.forEach(function (it, i) {
      var d = parseFloat(it.getAttribute('data-drift')) || 0;
      var dir = i < mid ? -1 : i > mid ? 1 : 0;
      gsap.to(it, {
        xPercent: dir * d * 18, yPercent: d * 16, rotate: dir * d * 3.5, ease: 'none',
        scrollTrigger: { trigger: '.lineup', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    gsap.to('.lineup__item--center img', { scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.lineup', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* Giant "calm." cut out of a white sheet; the page zooms through the "l". */
  function zoomThrough() {
    var section = document.querySelector('[data-zoom]');
    if (!section) return;
    var stage = section.querySelector('.zoom__stage');
    var svg = section.querySelector('.zoom__mask');
    var word = svg.querySelector('.zoom__word');
    var img = section.querySelector('.zoom__img');
    var caption = section.querySelector('[data-zoom-caption]');
    var hint = section.querySelector('.zoom__hint');

    var layout = function () {
      gsap.set(svg, { scale: 1, opacity: 1 });
      var portrait = stage.clientWidth / stage.clientHeight < 1;
      var vw = portrait ? 900 : 1600, vh = portrait ? 1600 : 900;
      svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
      // oversize the white sheet so no sliver of photo shows at the edges
      svg.querySelectorAll('rect').forEach(function (r) {
        r.setAttribute('x', -vw); r.setAttribute('y', -vh);
        r.setAttribute('width', vw * 3); r.setAttribute('height', vh * 3);
      });
      var m = svg.querySelector('mask');
      m.setAttribute('x', -vw); m.setAttribute('y', -vh);
      m.setAttribute('width', vw * 3); m.setAttribute('height', vh * 3);
      var fs = portrait ? 285 : 430;
      word.style.fontSize = fs + 'px';
      word.style.letterSpacing = (portrait ? -17 : -26) + 'px';
      word.setAttribute('x', vw / 2);
      word.setAttribute('y', vh / 2 + fs * 0.34);

      // centre of the "l" stem in user units → element pixels (preserveAspectRatio: slice)
      var ext = word.getExtentOfChar(2);
      var ux = ext.x + ext.width / 2;
      var uy = vh / 2 + fs * 0.34 - fs * 0.36;
      var W = svg.clientWidth, H = svg.clientHeight;
      var s = Math.max(W / vw, H / vh);
      var ox = (W - vw * s) / 2, oy = (H - vh * s) / 2;
      gsap.set(svg, { transformOrigin: (ox + ux * s) + 'px ' + (oy + uy * s) + 'px' });
    };
    layout();

    gsap.set(caption.children, { opacity: 0, y: 40 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: layout
      }
    });
    tl.to(hint, { opacity: 0, duration: 0.08 }, 0)
      .fromTo(svg, { scale: 1 }, { scale: 70, duration: 1, ease: 'power3.in' }, 0)
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.15, ease: 'power2.out' }, 0)
      .to(svg, { opacity: 0, duration: 0.12 }, 0.86)
      .to(caption.children, { opacity: 1, y: 0, duration: 0.3, stagger: 0.07, ease: 'power2.out' }, 0.95);
  }

  function splitHeadings() {
    document.querySelectorAll('[data-split]').forEach(function (h) {
      if (!SplitText) { gsap.to(h, { opacity: 1, duration: 1, scrollTrigger: { trigger: h, start: 'top 88%', once: true } }); return; }
      SplitText.create(h, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: function (self) {
          gsap.set(h, { opacity: 1 });
          return gsap.from(self.lines, { yPercent: 110, duration: 1.25, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
        }
      });
    });
  }

  /* Apple-style: words darken from grey to ink as you scroll. */
  function introFill() {
    var el = document.querySelector('[data-fill-text]');
    if (!el || !SplitText) return;
    SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit: function (self) {
        return gsap.fromTo(self.words, { color: '#d2d2d7' }, {
          color: '#1d1d1f', stagger: 0.1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
        });
      }
    });
  }

  function reveals() {
    ScrollTrigger.batch('[data-reveal], [data-card]', {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, stagger: 0.09, ease: 'expo.out', overwrite: true });
      }
    });
  }

  function counters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10);
      var obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: end, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  function servicesEnter() {
    gsap.from('[data-svc]', {
      x: 160, opacity: 0, duration: 1.4, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '[data-shelf]', start: 'top 85%', once: true }
    });
  }

  function story() {
    var rootEl = document.querySelector('[data-story]');
    if (!rootEl) return;
    var steps = gsap.utils.toArray('[data-story-step]', rootEl);
    var imgs = gsap.utils.toArray('[data-story-img]', rootEl);
    var bar = rootEl.querySelector('[data-story-bar]');
    var setActive = function (i) {
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
    };

    gsap.matchMedia().add('(min-width: 901px)', function () {
      steps.forEach(function (s, i) {
        ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) setActive(i); } });
      });
      ScrollTrigger.create({
        trigger: rootEl.querySelector('.story__steps'), start: 'top 55%', end: 'bottom 55%',
        onUpdate: function (self) { bar.style.transform = 'scaleX(' + self.progress + ')'; }
      });
    });
  }

  function ctaScale() {
    var t = document.querySelector('[data-cta]');
    if (t) {
      gsap.fromTo(t, { scale: 0.78, opacity: 0.15 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'center 55%', scrub: true } });
    }
    var parade = document.querySelector('[data-parade]');
    if (parade) {
      gsap.fromTo(parade, { xPercent: 16 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: parade, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }

  function progressBar() {
    gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* ------------------------------------------------------------------
     Components that work without GSAP
     ------------------------------------------------------------------ */
  function initShelf() {
    var shelf = document.querySelector('[data-shelf]');
    if (!shelf) return;
    var prev = document.querySelector('[data-shelf-prev]');
    var next = document.querySelector('[data-shelf-next]');
    var step = function () { var c = shelf.querySelector('.svc'); return c ? c.getBoundingClientRect().width + 20 : 300; };
    var update = function () {
      prev.disabled = shelf.scrollLeft < 8;
      next.disabled = shelf.scrollLeft + shelf.clientWidth >= shelf.scrollWidth - 8;
    };
    prev.addEventListener('click', function () { shelf.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { shelf.scrollBy({ left: step(), behavior: 'smooth' }); });
    shelf.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    shelf.querySelectorAll('img').forEach(function (i) { i.setAttribute('draggable', 'false'); });
    var down = false, moved = false, startX = 0, startLeft = 0;
    shelf.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = shelf.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) { moved = true; shelf.classList.add('is-dragging'); }
      if (moved) shelf.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { shelf.classList.remove('is-dragging'); }, 0);
    });
    shelf.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  function initQuotes(g) {
    var rootEl = document.querySelector('[data-quotes]');
    if (!rootEl) return;
    var track = rootEl.querySelector('[data-q-track]');
    var slides = Array.prototype.slice.call(track.children);
    var barsWrap = rootEl.querySelector('[data-q-bars]');
    var pauseBtn = rootEl.querySelector('[data-q-pause]');
    var idx = 0, tween = null, userPaused = false, hovering = false, onScreen = false;
    var autoplay = !!g;

    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
      barsWrap.insertAdjacentHTML('beforeend', '<span><i></i></span>');
    });
    var bars = Array.prototype.slice.call(barsWrap.children);
    if (!autoplay && pauseBtn) pauseBtn.hidden = true;

    var padLeft = function () { return parseFloat(getComputedStyle(track).paddingLeft) || 0; };
    var mark = function () {
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
      bars.forEach(function (b, k) {
        b.classList.toggle('is-done', k < idx);
        if (k !== idx && g) g.set(b.firstChild, { scaleX: k < idx ? 1 : 0 });
      });
    };
    var shouldRun = function () { return autoplay && !userPaused && !hovering && onScreen; };
    var startBar = function () {
      if (!g) return;
      if (tween) tween.kill();
      tween = g.fromTo(bars[idx].firstChild, { scaleX: 0 }, { scaleX: 1, duration: 7, ease: 'none', paused: !shouldRun(), onComplete: function () { go(idx + 1); } });
    };
    var go = function (i) {
      idx = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[idx].offsetLeft - padLeft(), behavior: 'smooth' });
      mark();
      startBar();
    };
    var sync = function () { if (tween) { shouldRun() ? tween.resume() : tween.pause(); } };

    rootEl.querySelector('[data-q-prev]').addEventListener('click', function () { go(idx - 1); });
    rootEl.querySelector('[data-q-next]').addEventListener('click', function () { go(idx + 1); });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        pauseBtn.setAttribute('aria-pressed', String(userPaused));
        pauseBtn.setAttribute('aria-label', userPaused ? 'Play stories' : 'Pause stories');
        pauseBtn.querySelector('use').setAttribute('href', userPaused ? '#i-play' : '#i-pause');
        sync();
      });
    }
    track.addEventListener('mouseenter', function () { hovering = true; sync(); });
    track.addEventListener('mouseleave', function () { hovering = false; sync(); });
    track.addEventListener('focusin', function () { hovering = true; sync(); });
    track.addEventListener('focusout', function () { hovering = false; sync(); });

    // keep index in sync with manual swipes
    var t;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var x = track.scrollLeft + padLeft();
        var nearest = 0, best = Infinity;
        slides.forEach(function (s, k) { var d = Math.abs(s.offsetLeft - x); if (d < best) { best = d; nearest = k; } });
        if (nearest !== idx) { idx = nearest; mark(); startBar(); }
      }, 140);
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(track);
    }
    mark();
    startBar();
  }

  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
        else target.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.replaceState(null, '', id);
      });
    });
  }

  function initOpenStatus() {
    var parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date())
      .forEach(function (p) { parts[p.type] = p.value; });
    var day = parts.weekday;
    var mins = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
    var weekend = day === 'Sat' || day === 'Sun';
    var opens = weekend ? 600 : 540, closes = weekend ? 1140 : 1080;
    var isOpen = mins >= opens && mins < closes;
    var fmt = function (m) { var h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h >= 12 ? ' pm' : ' am'); };
    var text = isOpen ? 'Open now · until ' + fmt(closes)
      : mins < opens ? 'Closed · opens today ' + fmt(opens)
      : 'Closed · opens tomorrow ' + fmt(day === 'Fri' || day === 'Sat' ? 600 : 540);
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.setAttribute('data-state', isOpen ? 'open' : 'closed');
      el.querySelector('.txt').textContent = text;
    });
    document.querySelectorAll(weekend ? '[data-days="weekend"]' : '[data-days="weekday"]').forEach(function (row) { row.classList.add('is-today'); });
  }

  function initNavState() {
    var links = document.querySelectorAll('.nav__links a');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          var active = l.getAttribute('href') === '#' + entry.target.id;
          l.classList.toggle('is-active', active);
          if (active) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'services', 'team', 'stories', 'visit'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  function initMenu() {
    var btn = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (!btn || !menu) return;
    var use = btn.querySelector('use');
    var closeTimer;
    var open = function () {
      clearTimeout(closeTimer);
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu'); use.setAttribute('href', '#i-x');
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
    };
    var close = function () {
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); use.setAttribute('href', '#i-menu');
      if (lenis) lenis.start();
      document.body.style.overflow = '';
      closeTimer = setTimeout(function () { menu.hidden = true; }, 450);
    };
    btn.addEventListener('click', function () { btn.getAttribute('aria-expanded') === 'true' ? close() : open(); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { close(); btn.focus(); } });
  }

  function initForm() {
    var form = document.querySelector('[data-book-form]');
    if (!form) return;
    var rules = {
      petName: function (v) { return v.trim() ? '' : "Please tell us your pet's name."; },
      name: function (v) { return v.trim() ? '' : 'Please add your name.'; },
      phone: function (v) { return /^\+?[\d\s-]{8,}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : "That email doesn't look quite right."; }
    };
    var errIds = { petName: 'e-pet', name: 'e-name', phone: 'e-phone', email: 'e-email' };
    var validate = function (input) {
      var msg = rules[input.name](input.value);
      var err = document.getElementById(errIds[input.name]);
      err.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      return !msg;
    };
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { if (input.value) validate(input); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') validate(input); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) { if (!validate(form.elements[name]) && !firstBad) firstBad = form.elements[name]; });
      if (firstBad) { firstBad.focus(); return; }
      toast('Thank you! We’ll call you shortly to book ' + form.elements.petName.value.trim() + '’s visit. (Demo — nothing was sent.)');
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach(function (i) { i.removeAttribute('aria-invalid'); });
    });
  }

  function toast(msg) {
    var t = document.querySelector('[data-toast]');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('is-visible'); }, 5200);
  }
})();
