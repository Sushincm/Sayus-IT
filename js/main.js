// ==========================================================================
// GSAP Plugins Setup
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

let lenis;

// ==========================================================================
// App Initialization
// ==========================================================================
window.addEventListener("load", () => {
  prepareWordReveal();
  initLenis();
  initMenuOverlay();
  initHeroScrollAnimation();
  initScrollReveals();
  initPortfolioHorizontalScroll();
  initInteractiveHoverEffects();
  initServiceBoxVideoHover();
  initKeyFactsAnimation();
  initCounters();
  initShutterReveal();
  initFaqAccordion();
  initTooltips();
  initFooterCanvas();
  initBackToTop();
  initServicesCarousel();
});

// ==========================================================================
// Word Splitting Reveal Helper
// ==========================================================================
function prepareWordReveal() {
  const showcaseText = document.querySelector(".showcase-text");
  if (!showcaseText) return;
  wrapWordsInTextNodes(showcaseText);
}

function wrapWordsInTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue;
    if (!text.trim()) return;

    const tokens = text.split(/(\s+)/);
    const parent = node.parentNode;

    tokens.forEach((token) => {
      if (token.trim()) {
        const span = document.createElement("span");
        span.className = "word";
        if (token.toLowerCase().includes("sayus")) {
          span.classList.add("highlight");
        }
        span.textContent = token;
        parent.insertBefore(span, node);
      } else {
        parent.insertBefore(document.createTextNode(token), node);
      }
    });

    parent.removeChild(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.classList.contains("word")) return;

    const children = Array.from(node.childNodes);
    children.forEach((child) => wrapWordsInTextNodes(child));
  }
}

// ==========================================================================
// Lenis Smooth Scroll Setup
// ==========================================================================
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// ==========================================================================
// Hero Scroll Animation
// ==========================================================================
function initHeroScrollAnimation() {
  const logo = document.querySelector(".giant-logo");
  const target = document.querySelector("#logo-target");
  const heroContainer = document.querySelector("#hero-container");

  if (!logo || !target || !heroContainer) return;

  let logoRect, targetRect, scale, xDiff, yDiff;

  function calculateTransitionParameters() {
    gsap.set(logo, { clearProps: "x,y,scale,transformOrigin" });

    logoRect = logo.getBoundingClientRect();
    targetRect = target.getBoundingClientRect();

    scale = targetRect.height / logoRect.height;

    xDiff = targetRect.left - logoRect.left;
    yDiff = targetRect.top - logoRect.top;
  }

  calculateTransitionParameters();

  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-container",
      start: "top top",
      end: "+=200%",
      pin: true,
      scrub: 1.2,
      invalidateOnRefresh: true,
    },
  });

  heroTimeline.to(
    logo,
    {
      x: () => xDiff,
      y: () => yDiff,
      scale: () => scale,
      filter: "drop-shadow(0px 0px 0px rgba(244, 121, 31, 0))",
      transformOrigin: "left top",
      ease: "none",
    },
    0,
  );

  heroTimeline.to(
    ".hero-video",
    {
      scale: 1,
      ease: "power1.inOut",
    },
    0,
  );

  heroTimeline.to(
    ".grid-dark-overlay",
    {
      backgroundColor: "rgba(5, 5, 5, 0.8)",
      ease: "power1.inOut",
    },
    0,
  );

  heroTimeline.to(
    "#hero-content-1 .sub-headline",
    {
      opacity: 0,
      scale: 0.8,
      filter: "blur(15px)",
      duration: 0.5,
      ease: "power1.inOut",
    },
    0,
  );

  heroTimeline.to(
    "#hero-content-2",
    {
      opacity: 1,
      duration: 0.1,
      ease: "none",
    },
    0.3,
  );

  const words = document.querySelectorAll(".showcase-text .word");
  const staggerDuration = 0.55 / (words.length || 1);
  heroTimeline.to(
    words,
    {
      opacity: 1,
      stagger: staggerDuration,
      duration: 0.1,
      ease: "none",
    },
    0.3,
  );

  const servicesBtn = document.querySelector("#hero-content-2 .btn-volt");
  if (servicesBtn) {
    gsap.set(servicesBtn, { opacity: 0, y: 30 });
    heroTimeline.to(
      servicesBtn,
      {
        opacity: 1,
        y: 0,
        duration: 0.15,
        ease: "power2.out",
      },
      0.85,
    );
  }

  const header = document.querySelector(".header-nav");

  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const currentScroll = self.scroll();
      // Safely determine when the hero animation pin ends
      const heroEnd = heroTimeline.scrollTrigger
        ? heroTimeline.scrollTrigger.end
        : window.innerHeight * 2;

      if (currentScroll < heroEnd) {
        // Inside hero section: keep header and logo visible (let timeline handle logo positioning)
        gsap.to(header, { y: 0, duration: 0.3, ease: "power2.out" });
        gsap.to(logo, { opacity: 1, duration: 0.3, ease: "power2.out" });

        if (currentScroll < 80) {
          header.classList.remove("scrolled");
          logo.classList.remove("scrolled");
        } else {
          header.classList.add("scrolled");
          logo.classList.add("scrolled");
        }
      } else {
        // Scrolled past hero section
        header.classList.add("scrolled");
        logo.classList.add("scrolled");

        if (self.direction === 1) {
          // Scrolling down - hide header & logo
          gsap.to(header, { y: "-100%", duration: 0.3, ease: "power2.out" });
          gsap.to(logo, { opacity: 0, duration: 0.3, ease: "power2.out" });
        } else if (self.direction === -1) {
          // Scrolling up - show header & logo
          gsap.to(header, { y: 0, duration: 0.3, ease: "power2.out" });
          gsap.to(logo, { opacity: 1, duration: 0.3, ease: "power2.out" });
        }
      }
    },
  });

  const handleRefreshInit = () => {
    calculateTransitionParameters();
  };

  ScrollTrigger.addEventListener("refreshInit", handleRefreshInit);
}

// ==========================================================================
// Scroll Reveal Engine
// ==========================================================================
function initScrollReveals() {
  const revealElements = document.querySelectorAll('[data-scroll="reveal"]');

  revealElements.forEach((element) => {
    const direction = element.getAttribute("data-scroll-direction") || "up";
    const delay = parseFloat(element.getAttribute("data-scroll-delay")) || 0;
    const duration =
      parseFloat(element.getAttribute("data-scroll-duration")) || 1.2;
    const startPoint = element.getAttribute("data-scroll-start") || "top 85%";

    let xVal = 0;
    let yVal = 0;
    const offset = 40;

    if (direction === "up") yVal = offset;
    else if (direction === "down") yVal = -offset;
    else if (direction === "left") xVal = offset;
    else if (direction === "right") xVal = -offset;

    // Temporarily disable transition during setup & reveal animation to prevent conflicts
    element.style.transition = "none";

    gsap.set(element, {
      opacity: 0,
      x: xVal,
      y: yVal,
    });

    gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: duration,
      delay: delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: startPoint,
        toggleActions: "play none none reverse",
        once: false,
        onEnter: () => {
          element.style.transition = "none";
          element.classList.remove("is-revealed");
        },
        onLeaveBack: () => {
          element.style.transition = "none";
          element.classList.remove("is-revealed");
        },
        onEnterBack: () => {
          element.style.transition = "none";
          element.classList.remove("is-revealed");
        },
      },
      onComplete: () => {
        element.style.transition = "";
        element.classList.add("is-revealed");
      },
      onReverseComplete: () => {
        element.style.transition = "";
        element.classList.remove("is-revealed");
      },
    });
  });
}

// ==========================================================================
// Key Facts Scroll Animation
// ==========================================================================
function initKeyFactsAnimation() {
  const section = document.querySelector(".key-facts-section");
  const sectionMobile = document.querySelector(".key-facts-section-mobile");

  let mm = gsap.matchMedia();

  // Desktop (min-width: 992px)
  mm.add("(min-width: 992px)", () => {
    if (!section) return;
    const cards = section.querySelectorAll(".fact-card");
    if (cards.length < 3) return;

    gsap.set(cards, {
      opacity: 0,
      x: 0,
      y: 0,
      z: 0,
      rotateX: -92,
      rotateY: 0,
      skewY: 0,
      transformOrigin: "center top",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".key-facts-section .row",
        start: "top 95%",
        end: "top 30%",
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    });

    tl.to(
      cards[0],
      {
        opacity: 1,
        rotateX: 0,
        ease: "power2.out",
      },
      0,
    )
      .to(
        cards[1],
        {
          opacity: 1,
          rotateX: 0,
          ease: "power2.out",
        },
        0.1,
      )
      .to(
        cards[2],
        {
          opacity: 1,
          rotateX: 0,
          ease: "power2.out",
        },
        0.2,
      );
  });

  // Mobile (max-width: 991.5px)
  mm.add("(max-width: 991.5px)", () => {
    if (!sectionMobile) return;
    const track = sectionMobile.querySelector(".metrics-scroll-track");
    if (!track) return;

    const cards = sectionMobile.querySelectorAll(".fact-card");

    // Fade in / slide up cards when the section itself is reached
    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionMobile,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );

    // Calculate dynamic horizontal scroll amount
    const getScrollAmount = () => {
      return -(track.scrollWidth - window.innerWidth);
    };

    gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: sectionMobile,
        pin: true,
        scrub: 1.0,
        start: "top top",
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        invalidateOnRefresh: true,
      },
    });
  });
}

// ==========================================================================
// Key Facts Counters Animation
// ==========================================================================
function initCounters() {
  const counters = document.querySelectorAll(".count-value");

  counters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute("data-target")) || 0;
    const decimals = parseInt(counter.getAttribute("data-decimals")) || 0;
    const countObj = { value: 0 };

    // Find nearest section to use as trigger
    const section = counter.closest("section");
    const triggerElement = section ? section : ".key-facts-section";

    gsap.to(countObj, {
      value: target,
      duration: 2.0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: triggerElement,
        start: "top 60%",
        toggleActions: "play none none none",
        once: true,
      },
      onUpdate: () => {
        counter.textContent = countObj.value.toFixed(decimals);
      },
    });
  });
}

// ==========================================================================
// Button Interactive Hover Effects
// ==========================================================================
function initInteractiveHoverEffects() {
  const buttons = document.querySelectorAll(
    ".btn-volt, .menu-btn, .header-icon-link",
  );

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      // Disable CSS transitions so GSAP handles magnetic motion without lag
      button.style.transition = "none";
    });

    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
          // Only restore transition if mouse has not re-entered
          if (!button.matches(":hover")) {
            button.style.transition = "";
          }
        },
      });
    });
  });
}

// ==========================================================================
// Service Box Video Playback
// ==========================================================================
function initServiceBoxVideoHover() {
  const boxes = document.querySelectorAll(".service-box");

  // Set up desktop hover listeners
  boxes.forEach((box) => {
    const video = box.querySelector(".box-video");
    if (!video) return;

    video.pause();

    box.addEventListener("mouseenter", () => {
      // Only play on hover if we are on desktop
      if (window.innerWidth > 991.5) {
        video.play().catch((err) => {
          console.warn("Service box video play interrupted or blocked:", err);
        });
      }
    });

    box.addEventListener("mouseleave", () => {
      if (window.innerWidth > 991.5) {
        video.pause();
        video.currentTime = 0;
      }
    });
  });

  // Handle mobile autoplay of videos
  const playMobileVideos = () => {
    if (window.innerWidth <= 991.5) {
      boxes.forEach((box) => {
        const video = box.querySelector(".box-video");
        if (video && video.paused) {
          video.play().catch((err) => {
            console.log("Autoplay failed or blocked by browser:", err);
          });
        }
      });
    } else {
      // Pause mobile videos if resized back to desktop
      boxes.forEach((box) => {
        const video = box.querySelector(".box-video");
        if (video && !video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
    }
  };

  // Run on load
  playMobileVideos();

  // Run on window resize
  window.addEventListener("resize", playMobileVideos);
}

// ==========================================================================
// Bootstrap Tooltips Setup
// ==========================================================================
function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]',
  );
  tooltipTriggerList.forEach((tooltipTriggerEl) => {
    new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: "hover",
    });
  });
}

// ==========================================================================
// Portfolio Horizontal Scroll (Selected Work Section)
// ==========================================================================
function initPortfolioHorizontalScroll() {
  const track = document.querySelector(".portfolio-scroll-track");
  const section = document.querySelector(".portfolio-horizontal-section");
  if (!track || !section) return;

  let mm = gsap.matchMedia();

  // Desktop (Pin & scroll horizontally)
  mm.add("(min-width: 768px)", () => {
    // Dynamic calculate scroll amount based on track width
    const scrollAmount = track.scrollWidth - window.innerWidth;

    const scrollTween = gsap.to(track, {
      x: -scrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1.0,
        start: "top top",
        end: () => `+=${scrollAmount}`,
        invalidateOnRefresh: true,
      },
    });

    // Subtly animate card entry as it enters screen viewport (slide up from bottom)
    const cards = section.querySelectorAll(".portfolio-card");
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 150 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: "left right",
            end: "left center",
            scrub: true,
          },
        },
      );
    });

    // Animate the portfolio ending CTA text group as it enters screen viewport
    const endCta = section.querySelector(".end-cta-content-inner");
    if (endCta) {
      gsap.fromTo(
        endCta,
        { opacity: 0, y: 150 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: endCta,
            containerAnimation: scrollTween,
            start: "left right",
            end: "left center",
            scrub: true,
          },
        },
      );
    }
  });

  // Mobile (Vertical stack layout reveal)
  mm.add("(max-width: 767.98px)", () => {
    const panels = section.querySelectorAll(".portfolio-panel");
    panels.forEach((panel) => {
      const card = panel.querySelector(".portfolio-card");
      const textGroup = panel.querySelector(
        ".header-content-inner, .end-cta-content-inner",
      );

      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      if (textGroup) {
        gsap.fromTo(
          textGroup,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });
  });
}

// ==========================================================================
// Shutter Reveal Animation
// ==========================================================================
function initShutterReveal() {
  const section = document.querySelector(".shutter-reveal-section");
  if (!section) return;

  const slats = section.querySelectorAll(".shutter-slat");
  const faqHeading = section.querySelector(".faq-main-heading");
  const faqItems = section.querySelectorAll(".faq-item");

  let mm = gsap.matchMedia();

  // Desktop (min-width: 992px)
  mm.add("(min-width: 992px)", () => {
    // Set initial states to avoid flash of content and ensure they start from below
    if (faqHeading) {
      gsap.set(faqHeading, { opacity: 0, y: 80 });
    }
    if (faqItems.length) {
      gsap.set(faqItems, { opacity: 0, y: 80 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    // 1. Animate slats to scaleY(0) to reveal the background
    tl.to(
      slats,
      {
        scaleY: 0,
        stagger: {
          each: 0.03,
          from: "start",
        },
        duration: 0.8,
        ease: "power1.inOut",
      },
      0,
    );

    // 2. Fade and lift the FAQ heading
    if (faqHeading) {
      tl.to(
        faqHeading,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.35,
      );
    }

    // 3. Fade and lift each FAQ item staggered (block by block)
    if (faqItems.length) {
      tl.to(
        faqItems,
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        },
        0.45,
      );
    }
  });

  // Mobile / Responsive (max-width: 991.98px)
  mm.add("(max-width: 991.98px)", () => {
    // Set initial states to avoid flash of content and ensure they start closed
    gsap.set(slats, { scaleY: 1 });
    if (faqHeading) {
      gsap.set(faqHeading, { opacity: 0, y: 50 });
    }
    if (faqItems.length) {
      gsap.set(faqItems, { opacity: 0, y: 40 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top 20%",
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    // 1. Animate slats to scaleY(0) to reveal the background
    tl.to(
      slats,
      {
        scaleY: 0,
        stagger: {
          each: 0.03,
          from: "start",
        },
        duration: 0.8,
        ease: "power1.inOut",
      },
      0,
    );

    // 2. Fade and lift the FAQ heading
    if (faqHeading) {
      tl.to(
        faqHeading,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.35,
      );
    }

    // 3. Fade and lift each FAQ item staggered
    if (faqItems.length) {
      tl.to(
        faqItems,
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
        },
        0.45,
      );
    }
  });
}

// ==========================================================================
// FAQ Accordion Interaction
// ==========================================================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close all other items
      faqItems.forEach((i) => {
        if (i !== item) {
          i.classList.remove("active");
          const panel = i.querySelector(".faq-panel");
          gsap.to(panel, { height: 0, duration: 0.4, ease: "power2.out" });
          const icon = i.querySelector(".faq-icon");
          if (icon) {
            gsap.to(icon, { rotation: 0, duration: 0.3 });
          }
        }
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add("active");
        const panel = item.querySelector(".faq-panel");
        const answer = item.querySelector(".faq-answer-wrapper");
        gsap.to(panel, {
          height: answer.scrollHeight,
          duration: 0.4,
          ease: "power2.out",
        });
        const icon = item.querySelector(".faq-icon");
        if (icon) {
          gsap.to(icon, { rotation: 45, duration: 0.3 });
        }
      } else {
        item.classList.remove("active");
        const panel = item.querySelector(".faq-panel");
        gsap.to(panel, { height: 0, duration: 0.4, ease: "power2.out" });
        const icon = item.querySelector(".faq-icon");
        if (icon) {
          gsap.to(icon, { rotation: 0, duration: 0.3 });
        }
      }
    });
  });
}

// ==========================================================================
// Footer Particle Canvas Animation
// ==========================================================================
function initFooterCanvas() {
  const canvas = document.getElementById("footer-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let animationFrameId;
  let particles = [];

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 1.5 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(244, 121, 31, 0.25)"; // Volt orange with opacity
      ctx.fill();
    }
  }

  for (let i = 0; i < 40; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(244, 121, 31, ${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Use IntersectionObserver to run animation only when visible
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate();
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      });
    },
    { threshold: 0.1 },
  );

  observer.observe(canvas);
}

// ==========================================================================
// Menu Overlay Logic
// ==========================================================================
function initMenuOverlay() {
  const menuBtn = document.querySelector(".menu-btn");
  const menuOverlay = document.getElementById("menu-overlay");
  if (!menuBtn || !menuOverlay) return;

  const menuBackdrop = menuOverlay.querySelector(".menu-backdrop");
  const menuPanel = menuOverlay.querySelector(".menu-panel");
  const navLinks = menuOverlay.querySelectorAll(".menu-nav-link");
  const infoItems = menuOverlay.querySelectorAll(".menu-info-section");
  let isOpen = false;

  // Set initial hidden state for animation elements
  gsap.set(menuOverlay, { display: "none" });
  gsap.set(menuBackdrop, { opacity: 0 });
  gsap.set(menuPanel, { xPercent: 100 });
  gsap.set(navLinks, { y: 40, opacity: 0 });
  gsap.set(infoItems, { y: 20, opacity: 0 });

  function openMenu() {
    isOpen = true;
    document.body.classList.add("menu-open");

    if (lenis) {
      lenis.stop();
    }

    gsap.killTweensOf(menuOverlay);
    gsap.killTweensOf(menuBackdrop);
    gsap.killTweensOf(menuPanel);
    gsap.killTweensOf(navLinks);
    gsap.killTweensOf(infoItems);

    // Animate overlay elements
    gsap
      .timeline()
      .set(menuOverlay, { display: "block" })
      .to(menuBackdrop, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(
        menuPanel,
        {
          xPercent: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.5",
      )
      .to(
        navLinks,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.3",
      )
      .to(
        infoItems,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
        },
        "-=0.3",
      );
  }

  function closeMenu() {
    isOpen = false;
    document.body.classList.remove("menu-open");

    if (lenis) {
      lenis.start();
    }

    gsap.killTweensOf(menuOverlay);
    gsap.killTweensOf(menuBackdrop);
    gsap.killTweensOf(menuPanel);
    gsap.killTweensOf(navLinks);
    gsap.killTweensOf(infoItems);

    gsap
      .timeline()
      .to(infoItems, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
      })
      .to(
        navLinks,
        {
          y: 40,
          opacity: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power2.in",
        },
        "-=0.2",
      )
      .to(
        menuPanel,
        {
          xPercent: 100,
          duration: 0.5,
          ease: "power3.inOut",
        },
        "-=0.2",
      )
      .to(
        menuBackdrop,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.4",
      )
      .set(menuOverlay, { display: "none" });
  }

  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking nav links and smoothly scroll
  const allOverlayLinks = menuOverlay.querySelectorAll("a");
  allOverlayLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Close when clicking the backdrop
  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", () => {
      closeMenu();
    });
  }
}

function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  });
}

// ==========================================================================
// Services Section Carousel for Mobile/Responsive (Swiper)
// ==========================================================================
let servicesSwiper;
function initServicesCarousel() {
  const container = document.querySelector(".services-carousel");
  if (!container) return;

  const handleResponsiveInit = () => {
    const isMobile = window.innerWidth <= 991.5;

    if (isMobile) {
      if (!servicesSwiper) {
        servicesSwiper = new Swiper(".services-carousel", {
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: false,
          grabCursor: true,
          speed: 800,
        });
      }
    } else {
      if (servicesSwiper) {
        servicesSwiper.destroy(true, true);
        servicesSwiper = undefined;
      }
    }
  };

  handleResponsiveInit();
  window.addEventListener("resize", handleResponsiveInit);
}
