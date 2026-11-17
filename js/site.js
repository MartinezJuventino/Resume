(function () {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  document.querySelectorAll(".skill").forEach((skill) => {
    const level = skill.getAttribute("data-level") || "0";
    skill.style.setProperty("--level", `${level}%`);
  });

  const header = document.getElementById("headerNav");
  const desktopLinks = Array.from(document.querySelectorAll(".desktop-nav a"));
  const mobileLinks = Array.from(document.querySelectorAll(".mobile-nav a"));
  const allNavLinks = desktopLinks.concat(mobileLinks);
  const sectionIds = ["about", "resume", "portfolio", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActive(id) {
    allNavLinks.forEach((link) => {
      const match = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", match);
    });
  }

  function updateActiveFromScroll() {
    const marker = window.scrollY + 96;
    let current = "";
    sections.forEach((section) => {
      if (section.offsetTop <= marker) {
        current = section.id;
      }
    });
    setActive(current);
  }

  updateActiveFromScroll();
  window.addEventListener("scroll", updateActiveFromScroll, { passive: true });

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
      link.addEventListener("click", closeMenu);
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 640) {
      closeMenu();
    }
  });

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
        note.textContent = "Your email app should open with this message. If it does not, write to OmarMartinez14@gmail.com.";
      }
    });
  }

})();
