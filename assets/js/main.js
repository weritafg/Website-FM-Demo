(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Mobile nav toggle */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("flex");
      mobileNav.classList.toggle("hidden");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("overflow-hidden", isOpen);
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.add("hidden");
        mobileNav.classList.remove("flex");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }

  /* Header elevation on scroll */
  const header = document.querySelector("[data-site-header]");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("shadow-lift", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Sliding nav indicator: tracks hover, rests under the active link */
  const navGroup = document.querySelector("[data-nav]");
  if (navGroup) {
    const indicator = navGroup.querySelector("[data-nav-indicator]");
    const links = Array.from(navGroup.querySelectorAll("a"));
    const activeLink = navGroup.querySelector("a.is-active");

    const moveIndicatorTo = (link, animate) => {
      if (!link || !indicator) return;
      const groupRect = navGroup.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const left = linkRect.left - groupRect.left;
      if (animate && window.gsap && !prefersReducedMotion) {
        gsap.to(indicator, { left, width: linkRect.width, opacity: 1, duration: 0.35, ease: "power2.out" });
      } else {
        indicator.style.left = `${left}px`;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.opacity = link ? "1" : "0";
      }
    };

    if (activeLink) moveIndicatorTo(activeLink, false);
    links.forEach((link) => {
      link.addEventListener("mouseenter", () => moveIndicatorTo(link, true));
    });
    navGroup.addEventListener("mouseleave", () => moveIndicatorTo(activeLink, true));
    window.addEventListener("resize", () => moveIndicatorTo(document.activeElement && links.includes(document.activeElement) ? document.activeElement : activeLink, false));
  }

  /* Magnetic buttons: nudge toward the cursor within their own bounds */
  if (!prefersReducedMotion && window.gsap && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.35, duration: 0.4, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Hero cursor-follow spotlight: subtle brand-tinted glow that tracks the pointer within the section */
  if (!prefersReducedMotion && hasFinePointer) {
    document.querySelectorAll("[data-spotlight]").forEach((section) => {
      section.addEventListener("mousemove", (e) => {
        const r = section.getBoundingClientRect();
        section.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
        section.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
        section.classList.add("is-active");
      });
      section.addEventListener("mouseleave", () => section.classList.remove("is-active"));
    });
  }

  /* Hero image tilt: subtle 3D parallax that follows the cursor, settles back on exit */
  if (!prefersReducedMotion && window.gsap && hasFinePointer) {
    document.querySelectorAll("[data-tilt]").forEach((wrap) => {
      const img = wrap.querySelector("img");
      if (!img) return;
      wrap.addEventListener("mousemove", (e) => {
        const r = wrap.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(img, {
          rotateX: py * -5,
          rotateY: px * 5,
          scale: 1.035,
          duration: 0.7,
          ease: "power2.out",
        });
      });
      wrap.addEventListener("mouseleave", () => {
        gsap.to(img, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.9, ease: "power3.out" });
      });
    });
  }

  /* Idle micro-float: a slow, subtle vertical drift for small hero badges */
  if (!prefersReducedMotion && window.gsap) {
    gsap.utils.toArray("[data-float]").forEach((el, i) => {
      gsap.to(el, {
        y: -6,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      });
    });
  }

  /* Split headline text into per-word masks (responsive-safe: words reflow, each stays independently maskable) */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="line-mask"><span class="line-mask__inner">${w}</span></span>`)
      .join(" ");
  });

  /* GSAP scroll reveals */
  if (window.gsap && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    });

    gsap.utils.toArray("[data-reveal-group]").forEach((group) => {
      const items = group.children.length ? Array.from(group.children) : [group];
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    });

    const hero = document.querySelector("[data-hero-parallax]");
    if (hero && window.innerWidth > 768) {
      gsap.to(hero, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }

    /* Split-word headline reveal: masked words cascade up into place */
    gsap.utils.toArray("[data-split]").forEach((el) => {
      const words = el.querySelectorAll(".line-mask__inner");
      gsap.to(words, {
        y: "0%",
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.035,
        delay: 0.15,
      });
    });

    /* Image wipe-reveal: a solid panel slides away, image settles from a slight zoom */
    gsap.utils.toArray("[data-wipe]").forEach((el) => {
      const panel = el.querySelector(".reveal-wipe__panel");
      const img = el.querySelector(".reveal-wipe__img");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" },
      });
      if (panel) tl.to(panel, { scaleX: 0, duration: 0.9, ease: "power3.inOut" });
      if (img) tl.to(img, { scale: 1, duration: 1.3, ease: "power2.out" }, panel ? 0.05 : 0);
    });

    /* Count-up stats */
    gsap.utils.toArray("[data-count-to]").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const suffix = el.getAttribute("data-count-suffix") || "";
      const counter = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: "power1.out",
            onUpdate: () => {
              el.textContent = Math.round(counter.val) + suffix;
            },
          });
        },
      });
    });
  } else {
    /* No-JS-motion fallback: just show everything */
    document.querySelectorAll("[data-reveal], [data-reveal-group] > *").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
    document.querySelectorAll("[data-count-to]").forEach((el) => {
      el.textContent = el.getAttribute("data-count-to") + (el.getAttribute("data-count-suffix") || "");
    });
    document.querySelectorAll(".line-mask__inner").forEach((el) => {
      el.style.transform = "none";
    });
    document.querySelectorAll(".reveal-wipe__panel").forEach((el) => {
      el.style.transform = "scaleX(0)";
    });
    document.querySelectorAll(".reveal-wipe__img").forEach((el) => {
      el.style.transform = "none";
    });
  }

  /* Contact form -> mailto fallback (static site, no backend/CRM wired up).
     TODO: no public inbox was listed on fehlmex.com — replace with the real sales inbox
     before launch, or swap this handler for a form backend (e.g. Formspree) + real endpoint. */
  const CONTACT_EMAIL = "ventas@fehlmex.com";
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const nombre = data.get("nombre") || "";
      const telefono = data.get("telefono") || "";
      const correo = data.get("correo") || "";
      const departamento = data.get("departamento") || "";
      const comentarios = data.get("comentarios") || "";
      const subject = encodeURIComponent(`[Sitio web] ${departamento || "Contacto"} — ${nombre}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nTeléfono: ${telefono}\nCorreo: ${correo}\nDepartamento: ${departamento}\n\nComentarios:\n${comentarios}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    });
  }
})();
