const getSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(searchParams.entries());
};

const getData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    return {};
  }
};

const renderLocation = async (location = {}) => {
  const locationDetails = document.getElementById("location-details");
  const { name, type, dimension, residents } = location;

  if (!name) {
    locationDetails.innerHTML = `<p class="text-white text-center">Location not found</p>`;
    return;
  }

  const params = getSearchParams();
  const characterId = params.characterId;

  let navButtonHTML = "";
  if (characterId) {
    navButtonHTML = `
    <div class="max-w-4xl mx-auto mb-6">
      <a
        href="./character.html?id=${characterId}"
        class="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to character</span>
      </a>
    </div>
  `;
  } else {
    navButtonHTML = `
    <div class="max-w-4xl mx-auto mb-6">
      <a
        href="./locations.html"
        class="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to all locations</span>
      </a>
    </div>
  `;
  }

  let residentNamesDisplay = "No residents found";

  if (residents.length > 0) {
    const ids = residents.map((url) => url.split("/").at(-1)).join(",");
    const residentsData = await getData(
      `https://rickandmortyapi.com/api/character/${ids}`,
    );

    const residentsArr = Array.isArray(residentsData)
      ? residentsData
      : [residentsData];

    residentNamesDisplay = residentsArr
      .map(
        (char) => `
        <a
          href="./character.html?id=${char.id}&locationId=${params.id}"
          class="block bg-[#23252b] text-white rounded-lg px-4 py-3 text-center font-semibold shadow hover:bg-orange-400 hover:text-[#23252b] transition-colors duration-150 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-12px)] flex-shrink-0"
        >
          ${char.name}
        </a>
      `
      )
      .join("");
  }

  locationDetails.innerHTML = `
  ${navButtonHTML}
  <article class="max-w-4xl mx-auto bg-[#3c3e44] rounded-2xl shadow-2xl p-8">
    <h1 class="text-4xl font-black text-white mb-4">${name}</h1>
    <p class="text-lg text-orange-400 font-bold mb-2">${type}</p>
    <p class="text-gray-400 text-sm mb-6">
      <i class="fa-solid fa-globe mr-2"></i>${dimension}
    </p>
    <div class="border-t border-gray-600 pt-6">
      <h2 class="text-xl font-bold text-white mb-4">
        <i class="fa-solid fa-users mr-2"></i>Residents (${residents.length})
      </h2>
      <div class="flex flex-wrap gap-3">
        ${residentNamesDisplay}
      </div>
    </div>
  </article>`;
};

(async () => {
  const params = getSearchParams();
  const locationId = params.id;

  const location = await getData(
    `https://rickandmortyapi.com/api/location/${locationId}`,
  );
  await renderLocation(location);
})();
