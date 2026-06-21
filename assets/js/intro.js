/* ============================================================
   TechSys — logo intro animation
   ------------------------------------------------------------
   Plays ONCE per browser tab (sessionStorage): the first load in
   a tab shows the wordmark building in, then fades to the page.
   In-tab navigation between pages does NOT replay it; opening the
   site in a new tab/window does. Honours prefers-reduced-motion.
   Loaded synchronously in <head> so the overlay paints before
   page content (no flash of the page behind it).
   ============================================================ */
(function () {
  "use strict";
  var KEY = "ts-intro-played";

  // Skip if already played in this tab, or if storage is unavailable,
  // or if the visitor prefers reduced motion.
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { return; }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
  if (reduce) return;

  var html = document.documentElement;
  html.classList.add("ts-intro-lock");  // prevents scroll while playing
  html.classList.add("ts-intro-busy");  // hides the real nav logo until the flight lands

  var ov = document.createElement("div");
  ov.className = "ts-intro";
  ov.setAttribute("aria-hidden", "true");
  ov.innerHTML =
    '<div class="ts-intro__inner">' +
      '<img class="ts-intro__mark" src="assets/img/wordmark-dark.svg?v=12" alt="TECHSYS"/>' +
      '<span class="ts-intro__tagline">Engineered Clarity</span>' +
      '<span class="ts-intro__sweep"></span>' +
    '</div>';

  // Mount immediately (synchronously in <head>, before first paint) so the overlay
  // already covers the viewport when the page paints — no flash of page content.
  // body doesn't exist yet at this point, so fall back to <html>.
  (document.body || html).appendChild(ov);
  // next frame → trigger the "play" state (lets initial styles apply first)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { ov.classList.add("is-playing"); });
  });

  // Timing (ms)
  var FLIGHT_START = 1700;  // after the wordmark builds + tagline settles
  var FLIGHT_MS    = 950;   // duration of the arc to the nav corner

  var cleaned = false;
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    // Reveal the real nav logo first, then drop the overlay next frame so there's
    // no one-frame gap where neither logo is painted.
    html.classList.remove("ts-intro-busy");
    html.classList.remove("ts-intro-lock");
    requestAnimationFrame(function () {
      if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    });
  }

  // Fallback: the original straight fade-out (used when the arc can't be measured).
  function finishFade() {
    ov.classList.add("is-leaving");
    html.classList.remove("ts-intro-busy");
    html.classList.remove("ts-intro-lock");
    var done = function () { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); };
    ov.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 900);
  }

  // Fly the centred wordmark along a semi-circular arc onto the nav logo, then
  // hand off to the (identical) real nav logo underneath.
  function flyToNav() {
    var mark = ov.querySelector(".ts-intro__mark");
    var brand = document.querySelector(".nav .brand");
    if (!mark || !brand || typeof mark.animate !== "function") return finishFade();

    var m = mark.getBoundingClientRect();
    var t = brand.getBoundingClientRect();
    if (!m.width || !t.width) return finishFade();  // e.g. reloaded while scrolled

    var scale = t.width / m.width;
    var sx = m.left + m.width / 2, sy = m.top + m.height / 2;
    var ex = t.left + t.width / 2, ey = t.top + t.height / 2;
    var dx = ex - sx, dy = ey - sy;
    var len = Math.hypot(dx, dy) || 1;

    // Perpendicular unit vector for the arc bulge; pick the side whose apex stays
    // comfortably on-screen (not clipped off the top).
    var px = -dy / len, py = dx / len;
    var amp = len / 2;  // half the chord → a semi-circular swoop
    var apexUp = sy + dy / 2 + py * amp;
    var sign = (apexUp > 48) ? 1 : -1;

    var frames = [];
    for (var i = 0; i <= 24; i++) {
      var u = i / 24;
      var bulge = Math.sin(u * Math.PI) * amp * sign;
      var x = dx * u + px * bulge;
      var y = dy * u + py * bulge;
      var s = 1 + (scale - 1) * u;
      frames.push({ transform: "translate(" + x + "px," + y + "px) scale(" + s + ")", offset: u });
    }
    // Pin the final frame exactly on the nav logo.
    frames[frames.length - 1] = { transform: "translate(" + dx + "px," + dy + "px) scale(" + scale + ")", offset: 1 };

    ov.classList.add("is-flying");  // overlay backdrop fades → only the mark flies
    var anim = mark.animate(frames, { duration: FLIGHT_MS, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" });
    anim.onfinish = cleanup;
    setTimeout(cleanup, FLIGHT_MS + 350);  // safety net if onfinish doesn't fire
  }

  setTimeout(flyToNav, FLIGHT_START);
})();
