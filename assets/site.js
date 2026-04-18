const menuButton = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    mobileMenu.hidden = !isOpen;
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const filterSets = document.querySelectorAll("[data-filter-set]");

filterSets.forEach((set) => {
  const targetSelector = set.getAttribute("data-filter-target");
  const target = targetSelector ? document.querySelector(targetSelector) : null;
  const items = target ? Array.from(target.querySelectorAll("[data-filter-item]")) : [];
  const buttons = Array.from(set.querySelectorAll("[data-filter]"));
  const emptyState = target ? target.parentElement.querySelector("[data-empty-state]") : null;
  const search = document.querySelector(`[data-search="${targetSelector}"]`);
  let activeFilter = "all";
  let query = "";

  const normalize = (value) => value.toLowerCase().trim();

  const applyFilters = () => {
    let visibleCount = 0;

    items.forEach((item) => {
      const categories = normalize(item.getAttribute("data-category") || "");
      const text = normalize(item.textContent || "");
      const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
      const matchesSearch = !query || text.includes(query);
      const isVisible = matchesFilter && matchesSearch;

      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = normalize(button.getAttribute("data-filter") || "all");
      buttons.forEach((candidate) => candidate.classList.remove("is-active"));
      button.classList.add("is-active");
      applyFilters();
    });
  });

  if (search) {
    search.addEventListener("input", () => {
      query = normalize(search.value);
      applyFilters();
    });
  }

  applyFilters();
});
