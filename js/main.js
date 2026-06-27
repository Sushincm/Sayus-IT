/**
 * VOLT - Interactive Scroll-Driven Website Script
 * Powering high-performance, modular GSAP and ScrollTrigger animations.
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
  // Initialize lightweight, high-performance Lenis smooth scroll
  initLenis();

  // Initialize the core hero animation
  initHeroScrollAnimation();
  
  // Initialize the reusable scroll-based entrance reveals
  initScrollReveals();
  
  // Subtle interactive hover effects for premium elements
  initInteractiveHoverEffects();

  // Play/pause background video for service boxes on hover
  initServiceBoxVideoHover();
});

/**
 * Initializes Lenis smooth scrolling with low-end device optimizations.
 * Binds the scroll updates and RAF ticks directly to the GSAP high-performance render loop.
 */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium exponential easing
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false, // CRITICAL OPTIMIZATION: Keeps native touch scrolling on mobile to prevent performance hit on low-end devices
    touchMultiplier: 2,
    infinite: false,
  });

  // Synchronize ScrollTrigger updates with Lenis scrolling frames
  lenis.on('scroll', ScrollTrigger.update);

  // Wire GSAP ticker rendering engine to drive Lenis RAF loop
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable GSAP's lag smoothing to keep ticks in exact sync during frame dips
  gsap.ticker.lagSmoothing(0);
}

/**
 * Orchestrates the epic hero scroll-driven animation
 * Involves: Pinned section, logo scaling/flight, cross-fades, and glass navbar creation.
 */
function initHeroScrollAnimation() {
  const logo = document.querySelector(".giant-logo");
  const target = document.querySelector("#logo-target");
  const heroContainer = document.querySelector("#hero-container");
  
  if (!logo || !target || !heroContainer) return;

  // Variables to hold calculated dimensions for absolute responsive layout landing
  let logoRect, targetRect, scale, xDiff, yDiff;

  /**
   * Recalculates the exact coordinates needed to move and scale the giant logo
   * from its initial bottom-left position to the fixed header's target placeholder.
   */
  function calculateTransitionParameters() {
    // 1. Temporarily clear GSAP transforms to get the raw layout coordinates
    gsap.set(logo, { clearProps: "x,y,scale,transformOrigin" });
    
    // 2. Capture client bounding boxes
    logoRect = logo.getBoundingClientRect();
    targetRect = target.getBoundingClientRect();
    
    // 3. Calculate responsive scale difference (using height comparison)
    scale = targetRect.height / logoRect.height;
    
    // 4. Calculate responsive coordinate differences (Top-Left point matching)
    xDiff = targetRect.left - logoRect.left;
    yDiff = targetRect.top - logoRect.top;
  }

  // Initial calculation
  calculateTransitionParameters();

  // Create the main scroll timeline
  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-container",
      start: "top top",
      end: "+=200%", // Scroll distance height (larger value = slower scroll transition)
      pin: true,     // Pin the hero in place
      scrub: 1.2,    // Smooth scrub duration
      invalidateOnRefresh: true, // Recalculate on browser resize
    }
  });

  // 1. The Logo Flight & Glow fade
  heroTimeline.to(logo, {
    x: () => xDiff,
    y: () => yDiff,
    scale: () => scale,
    filter: "drop-shadow(0px 0px 0px rgba(244, 121, 31, 0))", // Fade out glow
    transformOrigin: "left top",
    ease: "none"
  }, 0); // Starts immediately (time 0)

  // 2. Zoom Out the Video Background & Deepen the Ambient Dark Overlay
  heroTimeline.to(".hero-video", {
    scale: 1, // Scales down from 1.3 to 1
    ease: "power1.inOut"
  }, 0);

  heroTimeline.to(".grid-dark-overlay", {
    backgroundColor: "rgba(5, 5, 5, 0.8)", // Darkens the overlay as grid zooms out to elevate contrast
    ease: "power1.inOut"
  }, 0);

  // 3. Fade out Slide 1 Content & Scroll mouse indicator
  heroTimeline.to("#hero-content-1", {
    opacity: 0,
    y: -80,
    ease: "power1.inOut"
  }, 0);



  // 4. Fade in Slide 2 Content (Branding Showcase)
  heroTimeline.to("#hero-content-2", {
    opacity: 1,
    y: 0,
    ease: "power2.out"
  }, 0.4); // Starts slightly later for cinematic layered reveal

  // 5. Smooth ScrollTrigger to toggle header scrolled state with hardware CSS transitions
  ScrollTrigger.create({
    trigger: "body",
    start: "top -50px", // Triggers when scrolling down 50px
    onEnter: () => document.querySelector(".header-nav").classList.add("scrolled"),
    onLeaveBack: () => document.querySelector(".header-nav").classList.remove("scrolled"),
  });

  // Re-run calculations on ScrollTrigger refreshes (e.g. window resize, mobile orientation shift)
  ScrollTrigger.addEventListener("refreshInit", () => {
    calculateTransitionParameters();
  });
}

/**
 * Viewport Entrance Reveal Engine (Extremely Reusable)
 * Targets any element marked with `data-scroll="reveal"` and fades/slides it in.
 * Use attributes to customize:
 *   - data-scroll-direction="up|down|left|right"
 *   - data-scroll-delay="0.1" (in seconds)
 *   - data-scroll-duration="1.2" (in seconds)
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('[data-scroll="reveal"]');

  revealElements.forEach(element => {
    // Read user-defined customizations
    const direction = element.getAttribute("data-scroll-direction") || "up";
    const delay = parseFloat(element.getAttribute("data-scroll-delay")) || 0;
    const duration = parseFloat(element.getAttribute("data-scroll-duration")) || 1.2;
    const startPoint = element.getAttribute("data-scroll-start") || "top 85%";

    let xVal = 0;
    let yVal = 0;
    const offset = 40; // Pixels to slide

    if (direction === "up") yVal = offset;
    else if (direction === "down") yVal = -offset;
    else if (direction === "left") xVal = offset;
    else if (direction === "right") xVal = -offset;

    // Set initial invisible state
    gsap.set(element, {
      opacity: 0,
      x: xVal,
      y: yVal
    });

    // Create ScrollTrigger animation
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
        toggleActions: "play none none reverse", // Replays if scrolling back up
        once: false
      }
    });
  });
}

/**
 * Small micro-interactions for high-end feel
 * Adds dynamic magnetic or custom effects to CTA buttons.
 */
function initInteractiveHoverEffects() {
  const buttons = document.querySelectorAll(".btn-volt, .menu-btn");
  
  buttons.forEach(button => {
    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull element slightly towards cursor (magnetic effect)
      gsap.to(button, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    button.addEventListener("mouseleave", () => {
      // Snap back to base position
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });
    });
  });
}

/**
 * Handles play/pause of the service box background video on hover.
 */
function initServiceBoxVideoHover() {
  const boxes = document.querySelectorAll(".service-box");
  boxes.forEach((box) => {
    const video = box.querySelector(".box-video");
    if (!video) return;

    // Ensure video starts in a paused state and loads
    video.pause();

    box.addEventListener("mouseenter", () => {
      // Play video on hover
      video.play().catch((err) => {
        console.warn("Service box video play interrupted or blocked:", err);
      });
    });

    box.addEventListener("mouseleave", () => {
      // Pause and reset video when mouse leaves
      video.pause();
      video.currentTime = 0;
    });
  });
}
