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

const renderEpisode = async (episode = {}) => {
  const episodeDetails = document.getElementById("episode-details");
  const { name, episode: episodeCode, air_date, characters } = episode;

  if (!name) {
    episodeDetails.innerHTML = `<p class="text-white text-center">Episode not found</p>`;
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
        href="./episodes.html"
        class="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to all episodes</span>
      </a>
    </div>
  `;
  }

let characterNamesDisplay = "No characters found";

if (characters.length > 0) {
  const ids = characters.map((url) => url.split("/").at(-1)).join(",");
  const charactersData = await getData(
    `https://rickandmortyapi.com/api/character/${ids}`,
  );

  const charactersArr = Array.isArray(charactersData)
    ? charactersData
    : [charactersData];

characterNamesDisplay = charactersArr
  .map(
    (char) => `
      <a 
        href="./character.html?id=${char.id}&characterId=${char.id}" 
        class="block bg-[#23252b] text-white rounded-lg px-4 py-3 text-center font-semibold shadow hover:bg-orange-400 hover:text-[#23252b] transition-colors duration-150 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-12px)] flex-shrink-0"
      >
        ${char.name}
      </a>
    `
  )
  .join("");
}

  episodeDetails.innerHTML = `
  ${navButtonHTML} <article class="max-w-4xl mx-auto bg-[#3c3e44] rounded-2xl shadow-2xl p-8">
      <h1 class="text-4xl font-black text-white mb-4">${name}</h1>
      <p class="text-lg text-orange-400 font-bold mb-2">${episodeCode}</p>
      <p class="text-gray-400 text-xs font-semibold uppercase mb-1">
        <i class="fa-solid fa-calendar mr-2"></i>
        ${air_date}
      </p>
      <div class="border-t border-gray-600 pt-6">
        <h2 class="text-xl font-bold text-white mb-4">
          <i class="fa-solid fa-user mr-2"></i>Characters (${characters.length})
        </h2>
        <div class="flex flex-wrap gap-3">
          ${characterNamesDisplay}
        </div>
      </div>
    </article>`;
};

(async () => {
  const params = getSearchParams();
  const episodeId = params.id;
  const characterId = params.characterId;

  const episode = await getData(
    `https://rickandmortyapi.com/api/episode/${episodeId}`,
  );
  await renderEpisode(episode);
})();
