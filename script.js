/* =========================================================
   Downtown Auto Detailing & Repair — JS
   Three.js particles · GSAP reveals · Tilt · Lightbox · Form
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("load", hidePreloader);

  function init() {
    initNavbar();
    initReveal();
    initCounters();
    initTilt();
    initLightbox();
    initForm();
    initHeroParticles();
  }

  /* ---------- Preloader ---------- */
  function hidePreloader() {
    const pre = $("#preloader");
    if (!pre) return;
    setTimeout(() => pre.classList.add("hide"), 250);
  }

  /* ---------- Navbar ---------- */
  function initNavbar() {
    const nav = $("#navbar");
    const toggle = $(".nav-toggle");
    const mobile = $(".nav-mobile");

    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && mobile) {
      toggle.addEventListener("click", () => {
        const open = mobile.classList.toggle("show");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        mobile.setAttribute("aria-hidden", String(!open));
      });
      $$(".nav-mobile a").forEach((a) =>
        a.addEventListener("click", () => {
          mobile.classList.remove("show");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          mobile.setAttribute("aria-hidden", "true");
        })
      );
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (reduced) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const idx = Number(el.dataset.i || 0);
            setTimeout(() => el.classList.add("in"), idx * 80);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el, i) => {
      el.dataset.i = String(i % 6);
      io.observe(el);
    });
  }

  /* ---------- Stat counters ---------- */
  function initCounters() {
    const nums = $$(".stat-num");
    if (!nums.length) return;
    const animate = (el) => {
      const target = Number(el.dataset.count || 0);
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Vanilla Tilt ---------- */
  function initTilt() {
    if (reduced) return;
    if (typeof VanillaTilt === "undefined") return;
    const cards = $$(".tilt");
    if (cards.length) {
      VanillaTilt.init(cards, {
        max: 10,
        speed: 500,
        glare: true,
        "max-glare": 0.2,
        gyroscope: false,
      });
    }
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    const tiles = $$("[data-lb]");
    const lb = $("#lightbox");
    if (!tiles.length || !lb) return;
    const img = lb.querySelector("img");
    const close = lb.querySelector(".lb-close");
    const prev = lb.querySelector(".lb-prev");
    const next = lb.querySelector(".lb-next");
    let idx = 0;

    const show = (i) => {
      idx = (i + tiles.length) % tiles.length;
      const tile = tiles[idx];
      const src = tile.getAttribute("href");
      const alt = tile.querySelector("img")?.alt || "";
      img.src = src;
      img.alt = alt;
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const hide = () => {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      img.src = "";
    };

    tiles.forEach((t, i) => {
      t.addEventListener("click", (e) => {
        e.preventDefault();
        show(i);
      });
    });
    close.addEventListener("click", hide);
    prev.addEventListener("click", () => show(idx - 1));
    next.addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) hide(); });
    window.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const required = ["name", "phone", "email", "service", "message"];
      let ok = true;
      required.forEach((n) => {
        const v = String(data.get(n) || "").trim();
        if (!v) ok = false;
      });
      if (!ok) {
        status.textContent = "Please fill out every field so we can help.";
        status.className = "form-status err";
        return;
      }

      // Compose a WhatsApp handoff so the message actually reaches Jaime.
      const msg = [
        "Hi Downtown Auto — new inquiry from your website:",
        `• Name: ${data.get("name")}`,
        `• Phone: ${data.get("phone")}`,
        `• Email: ${data.get("email")}`,
        `• Service: ${data.get("service")}`,
        "",
        `${data.get("message")}`,
      ].join("\n");
      const url = "https://wa.me/14154245807?text=" + encodeURIComponent(msg);

      status.textContent = "Opening WhatsApp so you can send this instantly…";
      status.className = "form-status ok";
      window.open(url, "_blank", "noopener");
      form.reset();
      setTimeout(() => (status.textContent = ""), 6000);
    });
  }

  /* ---------- Hero particle field (Three.js) ---------- */
  function initHeroParticles() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || typeof THREE === "undefined" || reduced) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    resize();

    // Particles ---------------------------------
    const count = window.innerWidth < 768 ? 900 : 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const cRed = new THREE.Color(0xe63946);
    const cGold = new THREE.Color(0xc9a84c);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 220;
      positions[i3 + 1] = (Math.random() - 0.5) * 140;
      positions[i3 + 2] = (Math.random() - 0.5) * 220;

      const roll = Math.random();
      const c = roll < 0.55 ? cWhite : roll < 0.85 ? cGold : cRed;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      speeds[i] = 0.02 + Math.random() * 0.05;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Wireframe torus that echoes a wheel / rim shape --
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(18, 3.2, 12, 60),
      new THREE.MeshBasicMaterial({
        color: 0xe63946,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      })
    );
    torus.position.set(0, 0, -30);
    scene.add(torus);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(28, 0.18, 8, 100),
      new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        transparent: true,
        opacity: 0.25,
      })
    );
    ring.position.set(0, 0, -20);
    scene.add(ring);

    // Mouse parallax --------------------------
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener(
      "mousemove",
      (e) => {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    window.addEventListener("resize", resize);
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // Animate --------------------------------
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        pos[i3 + 1] += speeds[i] * 0.4;
        if (pos[i3 + 1] > 80) pos[i3 + 1] = -80;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = t * 0.04 + mouse.x * 0.2;
      points.rotation.x = mouse.y * 0.15;

      torus.rotation.x = t * 0.35;
      torus.rotation.y = t * 0.25;

      ring.rotation.z = t * 0.15;
      ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.05;

      camera.position.x = mouse.x * 4;
      camera.position.y = -mouse.y * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ---------- GSAP hero flourish (progressive) ---------- */
  window.addEventListener("load", () => {
    if (reduced || typeof gsap === "undefined") return;
    gsap.from(".eyebrow", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" });
    gsap.from(".hero-title .line", {
      y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: "power4.out", delay: 0.15,
    });
    gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 0.9, delay: 0.55, ease: "power3.out" });
    gsap.from(".hero-cta .btn", {
      y: 20, opacity: 0, duration: 0.7, stagger: 0.12, delay: 0.75, ease: "power3.out",
    });
    gsap.from(".hero-mini .mini", {
      y: 12, opacity: 0, duration: 0.6, stagger: 0.1, delay: 1.05, ease: "power2.out",
    });
  });
})();
