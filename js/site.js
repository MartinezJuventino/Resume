(function () {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  document.querySelectorAll(".skill").forEach((skill) => {
    const level = skill.getAttribute("data-level") || "0";
    skill.style.setProperty("--level", `${level}%`);
  });

  const desktopLinks = Array.from(document.querySelectorAll(".desktop-nav a"));
  const mobileLinks = Array.from(document.querySelectorAll(".mobile-nav a"));
  const allNavLinks = desktopLinks.concat(mobileLinks);

  function currentFile() {
    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!file || file === "index.html") {
      return "index.html";
    }
    return file;
  }

  const current = currentFile();
  allNavLinks.forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
    const match = href === current;
    link.classList.toggle("active", match);
    if (match) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if ("IntersectionObserver" in window) {

    const skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll(".skill").forEach((skill) => skillObserver.observe(skill));
  } else {
    document.querySelectorAll(".skill").forEach((skill) => skill.classList.add("in-view"));
  }

  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  function closeMenu() {
    if (!mobileNav || !menuButton) {
      return;
    }
    mobileNav.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  }

  function openMenu() {
    if (!mobileNav || !menuButton) {
      return;
    }
    mobileNav.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      if (mobileNav.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    mobileNav.addEventListener("click", (event) => {
      if (event.target === mobileNav) {
        closeMenu();
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        window.setTimeout(closeMenu, 0);
      });
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 640) {
      closeMenu();
    }
  });

  function initCoverflow(root) {
    const cards = Array.from(root.querySelectorAll(".coverflow-card"));
    const prev = root.querySelector(".coverflow-nav.prev");
    const next = root.querySelector(".coverflow-nav.next");
    const dotsWrap = root.querySelector(".coverflow-dots");
    const count = cards.length;
    if (!count) {
      return;
    }

    let index = Math.floor(count / 2);
    let dragStartX = 0;
    let dragging = false;
    let dragDelta = 0;
    let didDrag = false;
    let lastWheel = 0;
    const dots = cards.map((_, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Show screenshot ${i + 1} of ${count}`);
      button.addEventListener("click", () => {
        index = i;
        render();
      });
      dotsWrap.appendChild(button);
      return button;
    });

    function wrap(value) {
      return ((value % count) + count) % count;
    }

    function render() {
      cards.forEach((card, i) => {
        let offset = i - index;
        if (offset > count / 2) {
          offset -= count;
        } else if (offset < -count / 2) {
          offset += count;
        }
        const distance = Math.abs(offset);
        const scale = Math.max(0.42, 1 - distance * 0.22);
        const rot = `${offset * -16}deg`;
        const depth = `${180 - distance * 90}px`;
        card.style.setProperty("--offset", String(offset));
        card.style.setProperty("--scale", String(scale));
        card.style.setProperty("--rot", rot);
        card.style.setProperty("--depth", depth);
        card.style.zIndex = String(20 - distance);
        card.classList.toggle("is-active", offset === 0);
        card.classList.toggle("is-hidden", distance > 2);
        card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
        card.setAttribute("aria-label", offset === 0 ? "Expand screenshot" : "Show this screenshot");
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function move(step) {
      index = wrap(index + step);
      render();
    }

    prev.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));

    function selectOrExpand(card) {
      const i = cards.indexOf(card);
      if (i < 0) {
        return;
      }
      if (i === index) {
        openLightbox(card.querySelector("img"));
        return;
      }
      index = i;
      render();
    }

    cards.forEach((card) => {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        selectOrExpand(card);
      });
    });

    let pressCard = null;

    function onPointerMove(event) {
      if (!dragging) {
        return;
      }
      dragDelta = event.clientX - dragStartX;
    }

    function onPointerUp() {
      if (!dragging) {
        return;
      }
      dragging = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      const card = pressCard;
      pressCard = null;

      if (Math.abs(dragDelta) > 40) {
        didDrag = true;
        move(dragDelta < 0 ? 1 : -1);
        dragDelta = 0;
        return;
      }

      didDrag = false;
      dragDelta = 0;
      if (card) {
        selectOrExpand(card);
      }
    }

    root.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      if (event.target.closest(".coverflow-nav, .coverflow-dots")) {
        return;
      }
      pressCard = event.target.closest(".coverflow-card");
      dragging = true;
      didDrag = false;
      dragStartX = event.clientX;
      dragDelta = 0;
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    });

    root.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 12) {
          return;
        }
        event.preventDefault();
        const now = Date.now();
        if (now - lastWheel < 420) {
          return;
        }
        lastWheel = now;
        move(event.deltaX > 0 ? 1 : -1);
      },
      { passive: false }
    );

    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    });

    root.tabIndex = 0;
    render();
  }

  document.querySelectorAll("[data-carousel]").forEach(initCoverflow);

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = lightbox ? lightbox.querySelector("img") : null;
  const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function openLightbox(image) {
    if (!lightbox || !lightboxImage || !image) {
      return;
    }
    lightboxImage.src = image.getAttribute("src") || image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Expanded screenshot";
    if (lightbox.open) {
      return;
    }
    try {
      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
    } catch (error) {
      lightbox.setAttribute("open", "");
    }
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }
    if (typeof lightbox.close === "function" && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
      window.location.href = `mailto:OmarMartinez14@gmail.com?subject=${subject}&body=${body}`;
      if (note) {
        note.hidden = false;
        note.textContent = "Your email app should open with this template. If it does not, email me at OmarMartinez14@gmail.com.";
      }
    });
  }

})();
