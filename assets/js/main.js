/* ============================================================
   TECHSYS — interaction layer
   Modular IIFE units. Each is independent and self-guarding so
   pages only pay for what they use. Phase-2 motion (GSAP/Lottie,
   scroll-linked timelines) can hook the `reveal` + `[data-anim]`
   seams without touching markup.
   ============================================================ */
(function () {
  "use strict";

  /* --- Navigation: scrolled state + mobile menu ------------- */
  const nav = document.querySelector("[data-nav]");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = nav.querySelector("[data-burger]");
    const closeMenu = () => {
      nav.classList.remove("is-open");
      burger && burger.setAttribute("aria-expanded", "false");
      document.body.style.removeProperty("overflow");
    };
    if (burger) {
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
      });
      nav.querySelectorAll(".nav__link").forEach((a) => a.addEventListener("click", closeMenu));
      window.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
      const mq = window.matchMedia("(min-width: 901px)");
      mq.addEventListener("change", (e) => e.matches && closeMenu());
    }
  }

  /* --- Reveal on scroll (IntersectionObserver) -------------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }
  }

  /* --- Footer year ------------------------------------------ */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* --- Contact form: validation + success/error states ------ */
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const status = form.querySelector("[data-form-status]");
    const setStatus = (type, msg) => {
      if (!status) return;
      status.className = "form-status is-visible form-status--" + type;
      status.innerHTML = msg;
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const validators = {
      name:    (v) => v.trim().length >= 2 || "Please enter your full name.",
      company: (v) => v.trim().length >= 2 || "Please enter your company name.",
      email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email address.",
      phone:   (v) => v.trim() === "" || /^[+()\d][\d\s().-]{6,}$/.test(v.trim()) || "Enter a valid phone number.",
      service: (v) => v.trim() !== "" || "Please choose a service.",
      message: (v) => v.trim().length >= 10 || "Tell us a little more (10+ characters).",
    };

    const fieldOf = (input) => input.closest(".field");
    const validate = (input) => {
      const rule = validators[input.name];
      if (!rule) return true;
      const res = rule(input.value);
      const field = fieldOf(input);
      const err = field && field.querySelector(".field__error");
      if (res === true) {
        field && field.classList.remove("has-error");
        return true;
      }
      if (err) err.textContent = res;
      field && field.classList.add("has-error");
      return false;
    };

    form.querySelectorAll("input, select, textarea").forEach((input) => {
      input.addEventListener("blur", () => validate(input));
      input.addEventListener("input", () => {
        const f = fieldOf(input);
        if (f && f.classList.contains("has-error")) validate(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = [...form.querySelectorAll("input, select, textarea")];
      const ok = inputs.map(validate).every(Boolean);
      if (!ok) {
        setStatus("err", iconAlert() + "Please review the highlighted fields and try again.");
        const firstErr = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        firstErr && firstErr.focus();
        return;
      }
      // Phase 2: POST to a backend / Formspree / API route here.
      const btn = form.querySelector("[type=submit]");
      const label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setTimeout(() => {
        setStatus("ok", iconCheck() + "Thank you — your request has reached TechSys. We'll respond within one business day.");
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }, 700);
    });

    function iconCheck() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" width="18" height="18"><path d="M20 6 9 17l-5-5"/></svg>'; }
    function iconAlert() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18"><path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/></svg>'; }
  }
})();
