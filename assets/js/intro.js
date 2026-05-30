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
  html.classList.add("ts-intro-lock"); // prevents scroll while playing

  var ov = document.createElement("div");
  ov.className = "ts-intro";
  ov.setAttribute("aria-hidden", "true");
  ov.innerHTML =
    '<div class="ts-intro__inner">' +
      '<span class="wordmark wordmark--light ts-intro__mark">' +
        'T<span class="wordmark__e" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="sr-only">E</span>CHSYS' +
      '</span>' +
      '<span class="ts-intro__tagline">Engineered Clarity</span>' +
      '<span class="ts-intro__sweep"></span>' +
    '</div>';

  function mount() {
    (document.body || html).appendChild(ov);
    // next frame → trigger the "play" state (lets initial styles apply first)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { ov.classList.add("is-playing"); });
    });
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  // Fade out and remove after the sequence completes.
  var DURATION = 2200; // total visible time before fade
  function finish() {
    ov.classList.add("is-leaving");
    html.classList.remove("ts-intro-lock");
    var done = function () { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); };
    ov.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 900); // fallback if transitionend doesn't fire
  }
  setTimeout(finish, DURATION);
})();
