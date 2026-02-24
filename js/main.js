document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const body = document.getElementById("page");
  const home = document.getElementById("homeLink");
  const om = document.getElementById("omLink");
  const berghs = document.getElementById("berghsLink");
  const side = document.getElementById("sideLink");
  const toolbox = document.getElementById("toolboxLink");
  const emoji = document.getElementById("emojiBtn");
  const accordions = document.querySelectorAll(".accordion");

  // Background color changes
  if (home) home.addEventListener("click", (e) => { e.preventDefault(); body.style.background = "var(--blue)"; });
  if (om) om.addEventListener("click", () => (body.style.background = "var(--red)"));
  if (berghs) berghs.addEventListener("click", () => (body.style.background = "var(--green)"));
  if (side) side.addEventListener("click", () => (body.style.background = "var(--blue-dark)"));
  if (toolbox) toolbox.addEventListener("click", () => (body.style.background = "var(--blue)"));

  // Emoji interaction
  const glyphs = ["👋", "😎", "✨", "🚀", "💡", "🔥"];
  let g = 0;
  if (emoji) {
    emoji.addEventListener("click", () => {
      g = (g + 1) % glyphs.length;
      emoji.textContent = glyphs[g];
    });
  }

  // Accordion logic
  accordions.forEach((acc) => {
    acc.addEventListener("click", function () {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;

      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // Adaptive accordion height on resize
  window.addEventListener("resize", () => {
    document.querySelectorAll(".accordion.active").forEach((acc) => {
      const panel = acc.nextElementSibling;
      panel.style.maxHeight = panel.scrollHeight + "px";
    });
  });

  // Google Tag Manager Event Mapping
  const map = {
    omLink: "about",
    berghsLink: "berghs",
    sideLink: "projects",
    toolboxLink: "toolbox",
  };

  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", function () {
      window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: "section_click",
        section_name: map[id],
      });
      console.log("✅ section_click pushed:", map[id]);
    });
  });
});
