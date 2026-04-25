let allLocations = [];

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

const getData = async () => {
  try {
    const searchParams = getSearchParams();

    const { name = "", page = 1 } = searchParams;

    const response = await fetch(
      `https://rickandmortyapi.com/api/location/?name=${name}&page=${page}`,
    );

    if (!response.ok) throw new Error(response.status);

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    return [];
  }
};

const renderLocations = (locations = []) => {
  const locationsCards = document.getElementById("locations-list");

  const locationsHTMLContent = locations.map((location) => {
    const { name, type, dimension, residents } = location || {};

    return `<article
            class="flex-1 min-w-[250px] max-w-[300px] bg-[#3c3e44] rounded-lg p-4"
          >
            <div class="mb-3">
              <h3
                class="text-white font-bold text-sm hover:text-orange-400 cursor-pointer transition-colors"
              >
                <a href="location.html?name=${name}">${name}</a>
              </h3>
              <p class="text-orange-400 font-bold text-xs mb-1">
                Type: ${type}
              </p>
            </div>
            <div class="border-t border-gray-600 pt-3">
              <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
                <i class="fa-solid fa-globe mr-2"></i>${dimension}
              </p>
              
            </div>
            <div class="border-t border-gray-600 pt-3 mt-3">
              <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
                <i class="fa-solid fa-users mr-2"></i>${residents.length}
              </p>
              
            </div>
          </article>`;
  });

  locationsCards.innerHTML =
    locationsHTMLContent.length > 0
      ? locationsHTMLContent.join("")
      : "<article>No posts found</article>";
};

(async () => {
  allLocations = await getData();
  renderLocations(allLocations);

  const searchValue = document.getElementById("search-form");
  setDefaultValues(searchValue);

  const searchLocations = async (event) => {
    event.preventDefault();

    const form = event.target;
    const query = form.name.value || "";

    saveSearchParams({ name: query });

    const response = await fetch(
      `https://rickandmortyapi.com/api/location/?name=${query}`,
    );

    if (response.ok) {
      const data = await response.json();
      allLocations = data.results || [];
      renderLocations(allLocations);
    }
  };
  searchValue.addEventListener("submit", searchLocations);

  const sortForm = document.getElementById("sort-form");

  const sortCallback = async (event) => {
    const sortField = event.target;
    const sortValue = sortBy?.value;

    saveSearchParams({
      sort: sortValue,
    });

    if (sortValue) {
      const { sortBy, sortOrder } = sortValue.split(":");

      const sortedLocations = allLocations.toSorted((a, b) => {
        const valueA = String(a[sortBy] || "").toLowerCase();
        const valueB = String(b[sortBy] || "").toLowerCase();

        return valueA.localeCompare(valueB) * Number(sortOrder);
      });

      allLocations = sortedLocations;
    }
    renderLocations(allLocations);
  };

  sortForm?.addEventListener("change", sortCallback);

  const searchInput = searchValue.querySelector("input");
  searchInput.addEventListener("input", async (e) => {
    if (e.target.value === "") {
      saveSearchParams({ name: "" });
      allLocations = await getData();
      renderLocations(allLocations);
    }
  });

  const loadMoreBtn = document.getElementById("load-more-btn");

  const loadMore = async () => {
    const currentPage = Number(getSearchParams().page) || 1;
    const nextPage = currentPage + 1;
    saveSearchParams({ page: nextPage });

    const nextLocations = await getData();
    allLocations = [...allLocations, ...nextLocations];
    renderLocations(allLocations);

    const isFullyLoaded = nextLocations.length < 20;
    if (isFullyLoaded) {
      loadMoreBtn.style.display = "none";
    }
  };
  loadMoreBtn.addEventListener("click", loadMore);
})();

//Search
//Create async func
//Get the submitted form
// Get the value from the search input
// Fetch from the API using the search query
//Save the found result
//Render
