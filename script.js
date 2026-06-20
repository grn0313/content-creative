// ============================================================
// Dark Premium v3.1 — Robust GSAP + ScrollTrigger System
// Safe-default: content always visible, GSAP adds polish only
// ============================================================

(function () {
  "use strict";

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasST = typeof window.ScrollTrigger !== "undefined";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Safety net: if GSAP not ready after 4s, force-show everything =====
  let gsapTimeout;

  document.addEventListener("DOMContentLoaded", () => {
    // Always-initialize non-GSAP utilities
    initMenuToggle();
    initHeaderScroll();
    initCoverSlideshow();
    initTabs();
    initCopyButton();
    initParticles();

    if (hasGSAP && hasST && !prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      document.body.classList.add("has-gsap");
      // Start animations — set initial states then play
      initOpeningAnimation();
      initScrollReveals();
      initImageParallax();
    } else {
      // No GSAP or reduced motion — everything stays visible by default
      document.body.classList.add("no-anim");
    }

    // Safety timeout: if GSAP animations haven't resolved in 4s, force-show all
    if (hasGSAP && !prefersReducedMotion) {
      gsapTimeout = setTimeout(() => {
        document.querySelectorAll(
          "[data-anim-card], .anim-stagger-group > *, .anim-title, .anim-title-eyebrow, " +
          ".anim-hero-stagger > *, .anim-hero-copy, .anim-hero-actions > *, .anim-hero-right, " +
          ".anim-section .workflow-item, .hero-mask-inner"
        ).forEach(el => {
          if (getComputedStyle(el).opacity === "0") {
            el.style.opacity = "1";
            el.style.transform = "none";
          }
        });
        // Remove all img-reveal-mask overlays
        document.querySelectorAll(".img-reveal-mask").forEach(m => m.remove());
        document.body.classList.add("no-anim");
      }, 4000);
    }
  });

  // ============================================================
  // 1. OPENING ANIMATION
  //    Safe: set initial state → immediately animate to visible
  // ============================================================
  function initOpeningAnimation() {
    // Set initial hidden states
    gsap.set([
      ".anim-hero-stagger > span",
      ".anim-hero-copy",
      ".anim-hero-right",
      ".hero-scroll-hint"
    ], { opacity: 0 });
    gsap.set(".anim-hero-actions > *", { opacity: 0 });
    gsap.set(".hero-mask-inner", { yPercent: 100 });
    gsap.set(".hero-bg img", { scale: 1.12, opacity: 0.6 });
    gsap.set(".hero-bg-overlay", { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => { if (gsapTimeout) clearTimeout(gsapTimeout); }
    });

    // Role tags stagger
    tl.to(".anim-hero-stagger > span", {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.08,
    }, 0.15)

    // Main title: mask reveal (yPercent 100 → 0)
    .to(".hero-mask-inner", {
      yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.14,
    }, 0.3)
    // Slight horizontal compression on line 2
    .fromTo(".hero-line-2 .hero-mask-inner", {
      scaleX: 0.85, transformOrigin: "left center"
    }, {
      scaleX: 1, duration: 1.1, ease: "power3.out",
    }, 0.5)

    // Hero copy
    .to(".anim-hero-copy", {
      y: 0, opacity: 1, duration: 1, ease: "power3.out",
    }, 0.95)

    // Hero actions
    .to(".anim-hero-actions > *", {
      y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "power3.out",
    }, 1.15)

    // Hero right deco block
    .to(".anim-hero-right", {
      x: 0, opacity: 1, duration: 1.2, ease: "expo.out",
    }, 0.7)

    // Header slide down (already visible by default, just add polish)
    .from(".site-header", {
      y: -80, opacity: 0, duration: 1, ease: "expo.out",
    }, 0)

    // Scroll hint
    .to(".hero-scroll-hint", {
      opacity: 1, duration: 1, ease: "power2.out",
    }, 1.6)

    // Hero background
    .to(".hero-bg img", {
      scale: 1, opacity: 1, duration: 2.2, ease: "expo.out",
    }, 0)
    .to(".hero-bg-overlay", {
      opacity: 1, duration: 1.5, ease: "power2.out",
    }, 0);
  }

  // ============================================================
  // 2. SCROLL-TRIGGERED MODULE REVEALS
  //    Safe: set initial → scroll triggers reveal
  // ============================================================
  function initScrollReveals() {
    // Set initial hidden states for scroll-triggered elements
    gsap.set([
      ".anim-title",
      ".anim-title-eyebrow",
      ".anim-stagger-group > *",
      "[data-anim-card]",
    ], { opacity: 0, y: 30 });

    gsap.set(".anim-section .workflow-item", { opacity: 0, y: 50 });

    // --- Workflow strip ---
    ScrollTrigger.batch(".anim-section .workflow-item", {
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "expo.out",
        });
      },
      start: "top 85%",
      once: true,
    });

    // --- Each section ---
    document.querySelectorAll("section.section").forEach((section) => {
      const eyebrow = section.querySelector(".anim-title-eyebrow");
      const title = section.querySelector(".anim-title");
      const staggerGroups = section.querySelectorAll(".anim-stagger-group");
      const cards = section.querySelectorAll("[data-anim-card]");
      const projectGrid = section.querySelectorAll(".project-grid");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "expo.out" },
      });

      // Eyebrow first
      if (eyebrow) {
        tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.8 }, 0);
      }
      // Title — big displacement, slow
      if (title) {
        tl.to(title, { y: 0, opacity: 1, duration: 1.3 }, 0.15);
      }
      // Stagger groups (tabs, tag pills)
      staggerGroups.forEach((group) => {
        tl.to(gsap.utils.toArray(group.children), {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.1,
        }, 0.5);
      });
      // Cards with data-anim-card
      if (cards.length) {
        const sortedCards = Array.from(cards).sort((a, b) =>
          (parseInt(a.dataset.animCard) || 0) - (parseInt(b.dataset.animCard) || 0)
        );
        tl.to(sortedCards, {
          y: 0, opacity: 1, duration: 1.1, stagger: 0.16,
        }, 0.6);
      }
      // Project grid fallback
      projectGrid.forEach((grid) => {
        const directChildren = grid.querySelectorAll(".project-card:not([data-anim-card])");
        if (directChildren.length) {
          tl.to(directChildren, {
            y: 0, opacity: 1, duration: 1.1, stagger: 0.16,
          }, 0.6);
        }
      });
    });

    initImageReveal();
  }

  // ============================================================
  // 3. IMAGE REVEAL (mask wipe) — only when GSAP is active
  // ============================================================
  function initImageReveal() {
    document.querySelectorAll(".project-media, .cover-showcase").forEach((container) => {
      const img = container.querySelector("img");
      if (!img || container.dataset.revealReady) return;
      container.dataset.revealReady = "true";

      // Create overlay mask
      const mask = document.createElement("div");
      mask.className = "img-reveal-mask";
      // Ensure container has relative positioning for absolute mask
      if (!container.style.position) {
        container.style.position = "relative";
      }
      mask.style.cssText = `
        position: absolute; inset: 0; z-index: 5;
        background: var(--surface-card, #1a1a22);
        transform-origin: right center;
        pointer-events: none;
        border-radius: inherit;
      `;
      container.appendChild(mask);

      // Animate: mask wipes away, image scales in
      gsap.set(img, { scale: 1.25 });
      gsap.to(mask, {
        scaleX: 0,
        duration: 1.3,
        ease: "expo.inOut",
        scrollTrigger: {
          trigger: container,
          start: "top 82%",
          once: true,
        },
      });
      gsap.to(img, {
        scale: 1,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: {
          trigger: container,
          start: "top 82%",
          once: true,
        },
      });
    });
  }

  // ============================================================
  // 4. IMAGE PARALLAX (subtle depth)
  // ============================================================
  function initImageParallax() {
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    // Hero background parallax
    gsap.to(".hero-bg img", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      },
    });

    // Project cards subtle parallax
    document.querySelectorAll(".project-media img").forEach((img) => {
      gsap.to(img, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest(".project-card"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    });
  }

  // ============================================================
  // 5. UTILITY FUNCTIONS
  // ============================================================

  function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 60) header.classList.add("scrolled");
          else header.classList.remove("scrolled");
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initCoverSlideshow() {
    const slides = document.querySelectorAll(".cover-slide");
    const dots = document.querySelectorAll(".cover-dot");
    if (!slides.length || !dots.length) return;
    let current = 0;
    let interval;

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = index;
      if (current >= slides.length) current = 0;
      if (current < 0) current = slides.length - 1;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }
    function next() { goTo(current + 1); }
    function startAutoPlay() { interval = setInterval(next, 4500); }
    function stopAutoPlay() { clearInterval(interval); }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => { stopAutoPlay(); goTo(i); startAutoPlay(); });
    });
    const showcase = document.querySelector(".cover-showcase");
    if (showcase) {
      showcase.addEventListener("mouseenter", stopAutoPlay);
      showcase.addEventListener("mouseleave", startAutoPlay);
    }
    startAutoPlay();
  }

  function initMenuToggle() {
    const btn = document.querySelector(".menu-button");
    const links = document.querySelectorAll(".site-nav a");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
    links.forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((item) => {
          item.classList.remove("is-active");
          item.setAttribute("aria-selected", "false");
        });
        panels.forEach((panel) => {
          panel.classList.remove("is-active");
          panel.hidden = true;
        });
        const panelId = tab.getAttribute("aria-controls");
        const panel = document.getElementById(panelId);
        if (panel) {
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");
          panel.hidden = false;
          panel.classList.add("is-active");

          // Re-trigger reveal animations for newly shown panel
          if (hasGSAP && !prefersReducedMotion) {
            const cards = panel.querySelectorAll("[data-anim-card], .project-card");
            gsap.fromTo(cards,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "expo.out" }
            );
            const featured = panel.querySelector(".aigc-featured");
            if (featured) {
              gsap.fromTo(featured,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "expo.out" }
              );
            }
            ScrollTrigger.refresh();
          }
        }
      });
    });
  }

  function initCopyButton() {
    const copyBtn = document.querySelector(".copy-button");
    if (!copyBtn) return;
    copyBtn.addEventListener("click", async () => {
      const value = copyBtn.dataset.copy || "";
      const label = copyBtn.querySelector("strong");
      const original = label?.textContent || value;
      try {
        await navigator.clipboard.writeText(value);
        if (label) label.textContent = "已复制微信号";
        copyBtn.style.borderColor = "var(--accent-teal)";
      } catch {
        if (label) label.textContent = "复制失败，请手动复制";
      }
      setTimeout(() => {
        if (label) label.textContent = original;
        copyBtn.style.borderColor = "";
      }, 1800);
    });
  }

  // ============================================================
  // 6. PARTICLE BACKGROUND
  // ============================================================
  function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (prefersReducedMotion) return;

    let width, height, particles, mouse = { x: null, y: null };
    let animationId;
    const CONFIG = {
      count: 60,
      maxSize: 2.2,
      minSize: 0.4,
      speed: 0.25,
      colorBase: "124, 138, 255",
      colorAlt: "167, 139, 250",
      connectionDist: 140,
      mouseRadius: 110,
      alphaBase: 0.22,
    };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    function createParticles() {
      particles = [];
      for (let i = 0; i < CONFIG.count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * CONFIG.speed,
          vy: (Math.random() - 0.5) * CONFIG.speed,
          size: Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize,
          alpha: Math.random() * CONFIG.alphaBase + 0.08,
          useAltColor: Math.random() > 0.7,
        });
      }
    }
    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      const color = p.useAltColor ? CONFIG.colorAlt : CONFIG.colorBase;
      ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
      ctx.fill();
    }
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.connectionDist) {
            const alpha = (1 - dist / CONFIG.connectionDist) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${CONFIG.colorBase}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.mouseRadius) {
            const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.12;
            p.vy += Math.sin(angle) * force * 0.12;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        drawParticle(p);
      });
      drawConnections();
      animationId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });
    resize();
    createParticles();
    animate();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animationId);
      else animate();
    });
  }
})();
