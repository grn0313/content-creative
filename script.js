const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelectorAll(".site-nav a");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const copyButton = document.querySelector(".copy-button");

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

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

    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    if (panel) {
      panel.hidden = false;
      panel.classList.add("is-active");
    }
  });
});

copyButton?.addEventListener("click", async () => {
  const value = copyButton.dataset.copy || "";
  const label = copyButton.querySelector("strong");
  const original = label?.textContent || value;

  try {
    await navigator.clipboard.writeText(value);
    if (label) label.textContent = "已复制微信号";
  } catch {
    if (label) label.textContent = "复制失败，请手动复制";
  }

  window.setTimeout(() => {
    if (label) label.textContent = original;
  }, 1600);
});
