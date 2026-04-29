const EPISODE_PAGE_PATH = "/pages/episode.html";

const getSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);

  return Object.fromEntries(searchParams.entries());
};

const getData = async (id) => {
  try {
    const response = await fetch(
      `https://rickandmortyapi.com/api/character/${id}`,
    );

    if (!response.ok) throw new Error(response.status);

    const data = await response.json();

    return data ?? {};
  } catch (error) {
    return {};
  }
};

const renderCharacter = async (character = {}) => {
  const characterDetailElement = document.getElementById("character-detail");

  if (!characterDetailElement) {
    console.log("[ERROR] Character detail element not found");

    return;
  }

  if (!character.id) {
    const noDataHTMLContent = `<p class="text-white text-center text-2xl">Character not found</p>`;

    characterDetailElement.innerHTML = noDataHTMLContent;

    return;
  }

  const { name, status, species, gender, origin, location, image, episode } =
    character || "";

  let statusColor = "bg-gray-500";

  if (status === "Alive") {
    statusColor = "bg-green-500";
  } else if (status === "Dead") {
    statusColor = "bg-red-500";
  }

  const episodesHTMLContent = episode
    ?.map((episodeUrl) => {
      const episodeId = episodeUrl.split("/").at(-1);
      const episodePagePath = `${EPISODE_PAGE_PATH}?id=${episodeId}&characterId=${character.id}`;
      return `<a 
      href="${episodePagePath}" 
      class="block bg-[#23252b] text-white rounded-lg px-4 py-3 text-center font-semibold shadow hover:bg-orange-400 hover:text-[#23252b] transition-colors duration-150 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-12px)]"
    >
      Episode ${episodeId}
    </a>`;
    })
    .join("");

  const htmlContent = `<article
          class="max-w-4xl mx-auto bg-[#3c3e44] rounded-2xl shadow-2xl overflow-hidden"
        >
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/3">
              <img
                src="${image}"
                  alt="${name}"
                class="w-full h-full"
              />
            </div>

            <div class="md:w-2/3 p-8 flex flex-col justify-center">
              <h1
                class="text-4xl font-black text-white mb-3"
              >
                ${name}
              </h1>

              <p class="flex items-center gap-2 text-lg text-white mb-6">
                <span
                  id="status-dot"
                  class="h-3 w-3 rounded-full ${statusColor}"
                ></span>
                <span>${status} - ${species}</span>
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
                    <i class="fa-solid fa-venus-mars mr-1"></i> Gender
                  </p>
                  <p class="text-white text-base">${gender}</p>
                </div>

                <div>
                  <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
                    <i class="fa-solid fa-dna mr-1"></i> Species
                  </p>
                  <p class="text-white text-base">
                    ${species}
                  </p>
                </div>

                <div>
                  <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
                    <i class="fa-solid fa-globe mr-1"></i> Origin
                  </p>
                  <p class="text-white text-base">
                    ${origin?.name}
                  </p>
                </div>

                <div>
                  <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
                    <i class="fa-solid fa-location-dot mr-1"></i> Location
                  </p>
                  <a href="/pages/location.html?id=${location?.url?.split("/").at(-1)}&characterId=${character.id}" class="text-white text-base hover:text-orange-400 transition-colors duration-150">
                    ${location?.name}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-600 p-8">
            <h2 class="text-xl font-bold text-white mb-4">
              <i class="fa-solid fa-film mr-2"></i>
              Episodes (${episode?.length || 0})
            </h2>
            <div class="flex flex-wrap gap-3">
  ${episodesHTMLContent || "No episodes found"}
</div>
          </div>
        </article>`;

  characterDetailElement.innerHTML = htmlContent;
};

(async () => {
  const searchParams = getSearchParams();
  const characterId = searchParams.id;

   const episodeId = searchParams.episodeId;
  const locationId = searchParams.locationId;
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    if (episodeId) {
      backBtn.href = `episode.html?id=${episodeId}`;
      backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> <span>Back to episode</span>`;
    } else if (locationId) {
      backBtn.href = `location.html?id=${locationId}`;
      backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> <span>Back to location</span>`;
    } else {
      backBtn.href = "../index.html";
      backBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> <span>Back to all characters</span>`;
    }
  }

  const characterData = await getData(characterId);

  console.log({ characterData });

  renderCharacter(characterData);
})();
