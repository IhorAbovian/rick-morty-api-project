const CHARACTER_PAGE_PATH = "./pages/character.html";
let characters = [];

//получение параметров из url
const getSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const searchParamsObject = Object.fromEntries(searchParams.entries());

  return searchParamsObject;
};

//сохранение параметров в url
const saveSearchParams = (params = {}) => {
  const existingSearchParams = new URLSearchParams(window.location.search);

  for (const key in params) {
    existingSearchParams.set(key, params[key]);
  }

  window.history.replaceState({}, "", `?${existingSearchParams.toString()}`);
};

//установка дефолтных значений форм на основе параметров из url
const setDefaultValues = (form) => {
  const searchParams = getSearchParams();

  for (const key in searchParams) {
    const formElement = form.elements[key];

    if (formElement) {
      formElement.value = searchParams[key];
    }
  }
};

//получение данных с сервера
const getData = async () => {
  try {
    const searchParams = getSearchParams();

    const { name = "", page = 1, status = "", gender = "" } = searchParams;

    const response = await fetch(
      `https://rickandmortyapi.com/api/character/?page=${page}&name=${name}&status=${status}&gender=${gender}`,
    );

    if (!response.ok) throw new Error(response.status);

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    return [];
  }
};
//рендер данных на странице
const renderCharacters = (characters = []) => {
  const characterCards = document.getElementById("character-cards");

  //
  const charactersHTMLContent = characters.map((character) => {
    const { id, name, status, image, species, location } = character || {};

    let statusColor = "bg-gray-500";

    if (status === "Alive") {
      statusColor = "bg-green-500";
    } else if (status === "Dead") {
      statusColor = "bg-red-500";
    }

    return `<article
              class="flex rounded-lg bg-[#3c3e44] shadow-lg w-[calc(50%-12px)] max-w-[450px] mb-6"
            >
              <div class="w-1/3">
                <img
                  src="${image}" loading=lazy decoding=async
                  alt="${name}"
                  class="h-full w-full object-cover rounded"
                />
              </div>

              <div class="w-2/3 p-4 flex flex-col">
                <div>
                  <h2
                    class="text-2xl font-black text-white hover:text-orange-400 cursor-pointer"
                  >
                    <a href="${CHARACTER_PAGE_PATH}?id=${id}">${name}</a>
                  </h2>
                  <p
                    class="flex items-center gap-2 text-sm font-medium text-white"
                  >
                    <span class="h-2 w-2 rounded-full ${statusColor}"></span>
                    ${status} - ${species}
                  </p>
                </div>

                <div class="mt-4">
                  <p class="text-gray-400 text-xs font-semibold uppercase">
                    Last known location:
                  </p>
                  <p class="text-white text-base">
                    ${location?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </article>`;
  });

  characterCards.innerHTML =
    charactersHTMLContent.length > 0
      ? charactersHTMLContent.join("")
      : "<article>No posts found</article>";
};

(async () => {
  characters = await getData();

  const { sort: defaultSort } = getSearchParams();

  // TODO: @VladKrasnozhon - Explain how to move this into a separate function and use it in the sort callback as well
  if (defaultSort) {
    const [sortBy, sortOrder] = defaultSort.split(":");

    //сортировка данных на клиенте
    const sortedCharacters = characters.toSorted((a, b) => {
      
      const valueA = String(a[sortBy] || "").toLowerCase();
      const valueB = String(b[sortBy] || "").toLowerCase();

      return valueA.localeCompare(valueB) * Number(sortOrder);
    });

    characters = sortedCharacters;
  }

  const sortForm = document.getElementById("sort-form");

  // The same w/o helper function
  // if (sortForm) {
  //   const sortField = sortForm.sort;

  //   if (sortField) {
  //     sortField.value = defaultSort || "";
  //   }
  // }

  if (sortForm) {
    setDefaultValues(sortForm);
  }

  renderCharacters(characters);

  //
  const searchForm = document.getElementById("search-form");
  setDefaultValues(searchForm);

  const searchCallBack = async (event) => {
    event.preventDefault();

    const form = event.target;
    const qValue = form.name?.value || "";

    saveSearchParams({ name: qValue, page: 1 });

    const response = await fetch(
      `https://rickandmortyapi.com/api/character/?name=${qValue}`,
    );

    if (response.ok) {
      const data = await response.json();
      characters = data.results || [];
      renderCharacters(characters);

      if (loadMoreBtn) {
        loadMoreBtn.style.display = characters.length < 20 ? "none" : "block";
      }
    }
    searchForm?.addEventListener("submit", searchCallBack);
  };

  const sortCallback = async (event) => {
    const sortField = event.target;

    const sortValue = sortField?.value;

    saveSearchParams({
      sort: sortValue,
    });

    if (sortValue) {
      const [sortBy, sortOrder] = sortValue.split(":");

      //сортировка данных на клиенте
      const sortedCharacters = characters.toSorted((a, b) => {
        //получение значений полей для сортировки и приведение их к строке в нижнем регистре для корректного сравнения
        const valueA = String(a[sortBy] || "").toLowerCase();
        const valueB = String(b[sortBy] || "").toLowerCase();

        //сравнение значений для сортировки и умножение на порядок сортировки (1 для asc и -1 для desc)
        return valueA.localeCompare(valueB) * Number(sortOrder);
      });

      characters = sortedCharacters;
    }

    renderCharacters(characters);
  };
  sortForm?.addEventListener("change", sortCallback);

  const loadMoreBtn = document.getElementById("load-more-btn");

  //загрузка следующей страницы данных и добавление их на страницу
  const loadMoreCallBack = async () => {
    saveSearchParams({ page: Math.floor(characters.length / 20) + 1 });

    const nextCharacters = await getData();
    //создание нового массива с уже загруженными данными и новыми данными и рендер его на странице
    characters = [...characters, ...nextCharacters];
    renderCharacters(characters);

    const isFullyLoaded = nextCharacters.length < 20;

    if (isFullyLoaded) {
      loadMoreBtn.style.display = "none";
    }
  };
  loadMoreBtn?.addEventListener("click", loadMoreCallBack);

  const filterForm = document.getElementById("filter-form");

  //фильтрация данных на странице
  filterForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;

    //получение выбранных значений фильтров
    const selectedStatus =
      [...form.status].find((radio) => radio.checked)?.value || "";
    const selectedGender =
      [...form.gender].find((radio) => radio.checked)?.value || "";

    //сохранение выбранных значений фильтров в url
    saveSearchParams({ status: selectedStatus, gender: selectedGender });

    characters = await getData();

    renderCharacters(characters);
  });
  if (filterForm) {
  setDefaultValues(filterForm); // Подставить значения фильтров из URL
}
})();

// Sorting:
// Options #1 - server side sorting via GET params
// Options #2 - client side sorting via JS

// Client sorting:
// 1. All results are fetched from the server at the moment
// - we need to store those results in a variable due to lazy loading/pagination
// - that variable should be a global one and be used for rendering the data on the page
// 2. Define the field or fields and order to sort by
// - define the fields from the data object that will be used for sorting (object keys)
// - use the form with select/inputs to select sorting field and order (asc/desc)
// 3. Sort the array of data
// - get sort field and order from the form
// - use an array method to sort the data based on the selected field and order
// - store the sorted data in the same variable that is used for rendering the data on the page (override it)
// 4. Re-render the sorted data on the page.
// - render sorted data from the variable that is used for rendering the data on the page

// Additional - use the URl params saving strategy (for sharing or refresh)
// 1. Save sorting params in the URL on each form changes (submit)
// 2. On the first render/load of the page
// - get sorting params from the URL for fetch/render data and use them
// - set the default values of the sorting form
