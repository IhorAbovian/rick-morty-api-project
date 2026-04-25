let allEpisodes = [];

const getData = async () => {
  try {
    const searchParams = getSearchParams();

    const { name = "", page = 1 } = searchParams;

    const response = await fetch(
      `https://rickandmortyapi.com/api/episode/?name=${name}&page=${page}`,
    );

    if (!response.ok) throw new Error(response.status);

    const data = await response.json();

    return data.results;
  } catch (error) {
    return [];
  }
};

const getSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const searchParamsObject = Object.fromEntries(searchParams.entries());

  return searchParamsObject;
};

const saveSearchParams = (params = {}) => {
  const existingSearchParams = new URLSearchParams(window.location.search);

  for (const key in params) {
    existingSearchParams.set(key, params[key]);
  }

  window.history.replaceState({}, "", `?${existingSearchParams.toString()}`);
};

const setDefaultValues = (form) => {
  const searchParams = getSearchParams();

  for (const key in searchParams) {
    const formElement = form.elements[key];

    if (formElement) {
      formElement.value = searchParams[key];
    }
  }
};

const renderEpisodes = (episodes = []) => {
  const list = document.getElementById("episodes-list");
  const episodesHTMLContent = episodes
    .map((episode) => {
      const {
        id,
        name,
        air_date,
        episode: episodeNumber,
        characters,
      } = episode;

      return `<article
          class="flex-1 min-w-[250px] max-w-[300px] bg-[#3c3e44] rounded-lg p-4"
        >
          <div class="mb-3">
            <p class="text-orange-400 font-bold text-xs mb-1">${episodeNumber}</p>
            <h3
              class="text-white font-bold text-sm hover:text-orange-400 cursor-pointer transition-colors"
            >
              <a href="./episode.html?id=${id}">${name}</a>
            </h3>
          </div>

          <div class="border-t border-gray-600 pt-3">
            <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
              <i class="fa-solid fa-calendar mr-2"></i>Air Date
            </p>
            <p class="text-white text-xs">${air_date}</p>
          </div>

          <div class="border-t border-gray-600 pt-3 mt-3">
            <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
              <i class="fa-solid fa-users mr-2"></i>Characters
            </p>
            <p class="text-white text-xs">${characters.length}</p>
          </div>
        </article>`;
    })
    .join("");
  list.innerHTML = episodesHTMLContent;
};

(async () => {
  allEpisodes = await getData();

  const searchValue = document.getElementById("search-form");
  setDefaultValues(searchValue);

  const searchEpisode = async (event) => {
    event.preventDefault();

    const form = event.target;
    const query = form.name.value || "";

    saveSearchParams({ name: query });

    const response = await fetch(
      `https://rickandmortyapi.com/api/episode/?name=${query}`,
    );

    if (response.ok) {
      const data = await response.json();
      allEpisodes = data.results || [];
      renderEpisodes(allEpisodes);
    }
  };
  searchValue.addEventListener("submit", searchEpisode);

  const searchInput = searchValue.querySelector("input");
  searchInput.addEventListener("input", async (e) => {
    if (e.target.value === "") {
      saveSearchParams({ name: "" });
      allEpisodes = await getData();
      renderEpisodes(allEpisodes);
    }
  });

  const sortForm = document.getElementById("sort-form");
  setDefaultValues(sortForm);

  const { sort: defaultSort } = getSearchParams();
  if (defaultSort) {
    const [sortBy, sortOrder] = defaultSort.split(":");
    if (sortBy && sortOrder) {
      const sortedEpisodes = allEpisodes.toSorted((a, b) => {
        if (sortBy === "air_date") {
          return (
            (new Date(a[sortBy]) - new Date(b[sortBy])) * Number(sortOrder)
          );
        }
        const valueA = String(a[sortBy] || "").toLowerCase();
        const valueB = String(b[sortBy] || "").toLowerCase();
        return valueA.localeCompare(valueB) * Number(sortOrder);
      });
      allEpisodes = sortedEpisodes;
       if (sortForm && sortForm.sort) {
        sortForm.sort.value = defaultSort;
      }
    }
  }

  renderEpisodes(allEpisodes);

  const sortCallback = async (event) => {
    const sortField = event.target;
    const sortValue = sortField.value;

    saveSearchParams({
      sort: sortValue,
    });

    if (sortValue) {
      const [sortBy, sortOrder] = sortValue.split(":");
      const sortedEpisodes = allEpisodes.toSorted((a, b) => {
        if (sortBy === "air_date") {
          return (
            (new Date(a[sortBy]) - new Date(b[sortBy])) * Number(sortOrder)
          );
        }
        const valueA = String(a[sortBy] || "").toLowerCase();
        const valueB = String(b[sortBy] || "").toLowerCase();
        return valueA.localeCompare(valueB) * Number(sortOrder);
      });
      allEpisodes = sortedEpisodes;
      
    }

    renderEpisodes(allEpisodes);
  };
  sortForm?.addEventListener("change", sortCallback);

  const loadMoreBtn = document.getElementById("load-more-btn");

  const loadMore = async () => {
    const currentPage = Number(getSearchParams().page) || 1;
    const nextPage = currentPage + 1;
    saveSearchParams({ page: nextPage });

    const nextEpisodes = await getData();
    allEpisodes = [...allEpisodes, ...nextEpisodes];
    renderEpisodes(allEpisodes);

    const isFullyLoaded = nextEpisodes.length < 20;
    if (isFullyLoaded) {
      loadMoreBtn.style.display = "none";
    }
  };
  loadMoreBtn.addEventListener("click", loadMore);
})();
