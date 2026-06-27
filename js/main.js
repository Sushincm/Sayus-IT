// ==========================================================================
// GSAP Plugins Setup
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// App Initialization
// ==========================================================================
window.addEventListener("load", () => {
  prepareWordReveal();
  initLenis();
  initHeroScrollAnimation();
  initScrollReveals();
  initInteractiveHoverEffects();
  initServiceBoxVideoHover();
  initKeyFactsAnimation();
  initTooltips();
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
    
    tokens.forEach(token => {
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
    children.forEach(child => wrapWordsInTextNodes(child));
  }
}

// ==========================================================================
// Lenis Smooth Scroll Setup
// ==========================================================================
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

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
    }
  });

  heroTimeline.to(logo, {
    x: () => xDiff,
    y: () => yDiff,
    scale: () => scale,
    filter: "drop-shadow(0px 0px 0px rgba(244, 121, 31, 0))",
    transformOrigin: "left top",
    ease: "none"
  }, 0);

  heroTimeline.to(".hero-video", {
    scale: 1,
    ease: "power1.inOut"
  }, 0);

  heroTimeline.to(".grid-dark-overlay", {
    backgroundColor: "rgba(5, 5, 5, 0.8)",
    ease: "power1.inOut"
  }, 0);

  heroTimeline.to("#hero-content-1 .sub-headline", {
    opacity: 0,
    scale: 0.8,
    filter: "blur(15px)",
    duration: 0.5,
    ease: "power1.inOut"
  }, 0);

  heroTimeline.to("#hero-content-2", {
    opacity: 1,
    duration: 0.1,
    ease: "none"
  }, 0.3);

  const words = document.querySelectorAll(".showcase-text .word");
  const staggerDuration = 0.55 / (words.length || 1);
  heroTimeline.to(words, {
    opacity: 1,
    stagger: staggerDuration,
    duration: 0.1,
    ease: "none"
  }, 0.3);

  const servicesBtn = document.querySelector("#hero-content-2 .btn-volt");
  if (servicesBtn) {
    gsap.set(servicesBtn, { opacity: 0, y: 30 });
    heroTimeline.to(servicesBtn, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: "power2.out"
    }, 0.85);
  }

  ScrollTrigger.create({
    trigger: "body",
    start: "top -50px",
    onEnter: () => document.querySelector(".header-nav").classList.add("scrolled"),
    onLeaveBack: () => document.querySelector(".header-nav").classList.remove("scrolled"),
  });

  ScrollTrigger.create({
    trigger: ".services-section",
    endTrigger: ".key-facts-section",
    start: "top 60px",
    end: "bottom 60px",
    onEnter: () => {
      document.querySelector(".header-nav").classList.add("light-theme-nav");
      document.querySelector(".giant-logo").classList.add("light-theme-logo");
    },
    onLeave: () => {
      document.querySelector(".header-nav").classList.remove("light-theme-nav");
      document.querySelector(".giant-logo").classList.remove("light-theme-logo");
    },
    onEnterBack: () => {
      document.querySelector(".header-nav").classList.add("light-theme-nav");
      document.querySelector(".giant-logo").classList.add("light-theme-logo");
    },
    onLeaveBack: () => {
      document.querySelector(".header-nav").classList.remove("light-theme-nav");
      document.querySelector(".giant-logo").classList.remove("light-theme-logo");
    },
  });

  ScrollTrigger.addEventListener("refreshInit", () => {
    calculateTransitionParameters();
  });
}

// ==========================================================================
// Scroll Reveal Engine
// ==========================================================================
function initScrollReveals() {
  const revealElements = document.querySelectorAll('[data-scroll="reveal"]');

  revealElements.forEach(element => {
    const direction = element.getAttribute("data-scroll-direction") || "up";
    const delay = parseFloat(element.getAttribute("data-scroll-delay")) || 0;
    const duration = parseFloat(element.getAttribute("data-scroll-duration")) || 1.2;
    const startPoint = element.getAttribute("data-scroll-start") || "top 85%";

    let xVal = 0;
    let yVal = 0;
    const offset = 40;

    if (direction === "up") yVal = offset;
    else if (direction === "down") yVal = -offset;
    else if (direction === "left") xVal = offset;
    else if (direction === "right") xVal = -offset;

    gsap.set(element, {
      opacity: 0,
      x: xVal,
      y: yVal
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
        once: false
      }
    });
  });
}

// ==========================================================================
// Key Facts Scroll Animation
// ==========================================================================
function initKeyFactsAnimation() {
  const section = document.querySelector(".key-facts-section");
  if (!section) return;

  const cards = section.querySelectorAll(".fact-card");
  if (cards.length < 3) return;

  let mm = gsap.matchMedia();

  // Desktop (min-width: 768px)
  mm.add("(min-width: 768px)", () => {
    gsap.set(cards, {
      opacity: 0,
      x: 0,
      y: 0,
      z: 0,
      rotateX: -92,
      rotateY: 0,
      skewY: 0,
      transformOrigin: "center center"
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".key-facts-section .row",
        start: "top 95%",
        end: "top 30%",
        scrub: 1.5,
        invalidateOnRefresh: true
      }
    });

    tl.to(cards[0], {
      opacity: 1,
      rotateX: 0,
      ease: "power2.out"
    }, 0)
    .to(cards[1], {
      opacity: 1,
      rotateX: 0,
      ease: "power2.out"
    }, 0.1)
    .to(cards[2], {
      opacity: 1,
      rotateX: 0,
      ease: "power2.out"
    }, 0.2);
  });

  // Mobile (max-width: 767.98px)
  mm.add("(max-width: 767.98px)", () => {
    cards.forEach((card) => {
      gsap.set(card, { opacity: 0, y: 50 });
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      });
    });
  });
}

// ==========================================================================
// Button Interactive Hover Effects
// ==========================================================================
function initInteractiveHoverEffects() {
  const buttons = document.querySelectorAll(".btn-volt, .menu-btn, .header-icon-link");
  
  buttons.forEach(button => {
    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(button, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });
    });
  });
}

// ==========================================================================
// Service Box Video Playback
// ==========================================================================
function initServiceBoxVideoHover() {
  const boxes = document.querySelectorAll(".service-box");
  boxes.forEach((box) => {
    const video = box.querySelector(".box-video");
    if (!video) return;

    video.pause();

    box.addEventListener("mouseenter", () => {
      video.play().catch((err) => {
        console.warn("Service box video play interrupted or blocked:", err);
      });
    });

    box.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

// ==========================================================================
// Bootstrap Tooltips Setup
// ==========================================================================
function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: 'hover'
    });
  });
}
