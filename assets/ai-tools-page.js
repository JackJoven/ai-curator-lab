(function () {
  const categories = window.AI_CATEGORIES || [];
  const tools = window.AI_TOOLS || [];
  const grid = document.querySelector("#toolGrid");
  const filters = document.querySelector("#categoryFilters");
  const search = document.querySelector("#toolSearch");
  const empty = document.querySelector("#toolEmpty");
  const count = document.querySelector("#toolCount");
  const categoryCount = document.querySelector("#categoryCount");
  let activeCategory = "all";
  let query = "";

  if (!grid || !filters) return;

  const categoryLabelMap = categories.reduce((acc, category) => {
    acc[category.id] = category.label;
    return acc;
  }, {});

  const normalize = (value) => String(value || "").toLowerCase().trim();
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  };

  const getInitials = (name) => {
    const compact = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "");
    return compact.slice(0, 2).toUpperCase() || "AI";
  };

  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return tools.length;
    return tools.filter((tool) => tool.category === categoryId).length;
  };

  const createButton = (category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-button category-filter${category.id === "all" ? " is-active" : ""}`;
    button.dataset.category = category.id;
    button.innerHTML = `<span>${category.label}</span><strong>${getCategoryCount(category.id)}</strong>`;
    button.addEventListener("click", () => {
      activeCategory = category.id;
      filters.querySelectorAll("button").forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === button);
      });
      renderTools();
    });
    return button;
  };

  const renderFilters = () => {
    filters.innerHTML = "";
    filters.appendChild(createButton({ id: "all", label: "全部" }));
    categories.forEach((category) => filters.appendChild(createButton(category)));
  };

  const createToolCard = (tool) => {
    const article = document.createElement("article");
    article.className = "tool-card";
    article.dataset.category = tool.category;

    const tags = tool.tags.map((tag) => `<span class="chip">${tag}</span>`).join("");
    const domain = getDomain(tool.url);
    const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
    const fallbackUrl = domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : "";

    article.innerHTML = `
      <div class="tool-head">
        <div class="tool-identity">
          <img class="tool-logo" src="${logoUrl}" alt="${tool.name} logo" loading="lazy">
          <div class="tool-title">
            <h2 class="tool-name">
              <a href="${tool.url}" target="_blank" rel="noopener noreferrer">${tool.name}</a>
            </h2>
          </div>
        </div>
        <span class="chip sage">${tool.pricing}</span>
      </div>
      <p>${tool.summary}</p>
      <div class="chip-row">${tags}</div>
    `;

    const logo = article.querySelector(".tool-logo");
    if (logo) {
      logo.addEventListener("error", () => {
        if (fallbackUrl && logo.dataset.fallback !== "duck") {
          logo.dataset.fallback = "duck";
          logo.src = fallbackUrl;
          return;
        }

        const fallback = document.createElement("span");
        fallback.className = "tool-logo logo-fallback";
        fallback.textContent = getInitials(tool.name);
        logo.replaceWith(fallback);
      });
    }

    return article;
  };

  const matchesTool = (tool) => {
    const haystack = normalize([
      tool.name,
      tool.summary,
      tool.category,
      categoryLabelMap[tool.category],
      tool.region,
      tool.pricing,
      ...tool.tags,
    ].join(" "));
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch = !query || haystack.includes(query);
    return matchesCategory && matchesSearch;
  };

  const renderTools = () => {
    const visibleTools = tools.filter(matchesTool);
    grid.innerHTML = "";
    visibleTools.forEach((tool) => grid.appendChild(createToolCard(tool)));

    if (empty) empty.classList.toggle("is-visible", visibleTools.length === 0);
    if (count) count.textContent = `${visibleTools.length} / ${tools.length} 个工具`;
  };

  if (search) {
    search.addEventListener("input", () => {
      query = normalize(search.value);
      renderTools();
    });
  }

  renderFilters();
  renderTools();

  if (categoryCount) {
    categoryCount.textContent = `${categories.length} 个分类`;
  }
})();
