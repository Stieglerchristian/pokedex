let offset = 0;

let limit = 20;

let currentPokemonData = {};

let currentIndex = 0;

let allPokemon = [];


async function loadPokemon() {

    document.getElementById("loadBtn").style.display = "none";

    showLoading();

    await new Promise(resolve => setTimeout(resolve, 2000));

    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);

    let data = await response.json();

    allPokemon = data.results;

    for (let index = 0; index < allPokemon.length; index++) {
        let pokemon = allPokemon[index];

        renderPokemon(pokemon, index);
    }

    hideLoading();

    document.getElementById("loadBtn").style.display = "block";
}

async function renderPokemon(pokemon, index) {

    let response = await fetch(pokemon.url);

    let pokemonDetails = await response.json();

    let image = pokemonDetails.sprites.front_default;

    let type = pokemonDetails.types[0].type.name;

    let bgColor = getTypeColor(type);

    document.getElementById("pokedex").innerHTML += `

        <div onclick= "renderOverlayPokemon(${index})" class="pokemon-card" style="background-color:${bgColor}">
            <h3>${pokemon.name}</h3>
            <img src="${image}"
            <p>${type}</p>
        </div>
    `;
}

async function renderOverlayPokemon(index = currentIndex) {

    currentIndex = index

    let pokemon = allPokemon[currentIndex];

    let response = await fetch(pokemon.url);

    let data = await response.json();

    showOverlay(
        data.name,
        data.sprites.front_default,
        data.types[0].type.name,
        data.height,
        data.weight,
        currentIndex,
        data.stats,
        data.species.url
    );
}

async function loadMorePokemon() {

    document.getElementById("loadBtn").style.display = "none";

    offset += limit;
    await loadPokemon();

    document.getElementById("loadBtn").style.display = "block";


}

function getTypeColor(type) {
    if (type == "grass") return "lightgreen";
    if (type == "fire") return "orange";
    if (type == "water") return "lightblue";
    if (type == "bug") return "yellowgreen";
    if (type == "normal") return "lightgray";

    return "white";
}

function showPokemon(pokemon) {

    document.getElementById("pokemonDetail").innerHTML = `
    
    <div>
        <h3>${pokemon.name}</h3>
        <img src="${pokemon.sprites.front_default}">
        <p>Typ: ${pokemon.types[0].type.name}</p>
    </div>`;
}

function searchPokemon() {
    let searchText = document.getElementById("searchInput").value.toLowerCase();

    document.getElementById("pokedex").innerHTML = "";

    for (let index = 0; index < allPokemon.length; index++) {
        let pokemon = allPokemon[index];

        if
            (pokemon.name.toLowerCase().includes(searchText)) {
            renderPokemon(pokemon, index);
        }
    }
}

function showLoading() {

    document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {

    document.getElementById("loading").classList.add("hidden");
}

function showOverlay(name, img, type, height, weight, index, stats, speciesUrl) {

    currentIndex = index;

    currentPokemonData = {
        name: name,
        img: img,
        type: type,
        height: height,
        weight: weight,
        stats: stats,
        speciesUrl: speciesUrl
    };

    document.getElementById("overlay").classList.remove("d-none");
    document.getElementById("overlayName").innerHTML = name;
    document.getElementById("overlayImg").src = img;

    showMainTab();
}

function showMainTab() {
    document.getElementById("overlayTabContent").innerHTML = `

    <p>Typ: ${currentPokemonData.type.toUpperCase()}</p>
    <p>Height: ${currentPokemonData.height / 10} m</p>
    <p>Weight: ${currentPokemonData.weight / 10} kg</p>

    `;
}

async function showEvoTab() {

    let responseSpecies = await fetch(currentPokemonData.speciesUrl);

    let speciesData = await responseSpecies.json();

    let responseEvolution = await fetch(speciesData.evolution_chain.url);

    let evolutionData = await responseEvolution.json();

    let first = evolutionData.chain.species.name;

    let second = evolutionData.chain.evolves_to[0]?.species.name;

    let third = evolutionData.chain.evolves_to[0]?.evolves_to[0]?.species.name;

    let firstImg = await getPokemonImg(first);

    let secondImg = second ? await getPokemonImg(second) : "";

    let thirdImg = third ? await getPokemonImg(third) : "";



    document.getElementById("overlayTabContent").innerHTML = `

    <div class="evo-chain">

        <div>
            <img src="${firstImg}">
            <span>${first}</span>
        </div>

        <span class="arrow">»</span>

        <div>
            <img src="${secondImg}">
            <span>${second}</span>
        </div>



        ${third ? `
        <span class="arrow">»</span>
        <div>
            <img src="${thirdImg}">
            <span>${third}</span>
        </div>
        ` : ""}
    </div>

    `;
}

async function getPokemonImg(name) {

    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

    let data = await response.json();

    return data.sprites.front_default;
}

function showStatsTab() {

    let stats = currentPokemonData.stats;

    document.getElementById("overlayTabContent").innerHTML = `
    
    <div class="stat-row">
        <p>HP</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width:${stats[0].base_stat}%"></div>
        </div>
    </div>

    <div class="stat-row">
        <p>Attack</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width:${stats[1].base_stat}%"></div>
        </div>
    </div>

    <div class="stat-row">
        <p>Defense</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width:${stats[2].base_stat}%"></div>
        </div>
    </div>

    <div class="stat-row">
        <p>Sp Attack</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width:${stats[3].base_stat}%"></div>
        </div>
    </div>

    <div class="stat-row">
        <p>Sp Defense</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width:${stats[4].base_stat}%"></div>
        </div>
    </div>

    <div class="stat-row">
        <p>Speed</p>
        <div class="stat-bar">
            <div class="stat-fill" style="width:${stats[5].base_stat}%"></div>
        </div>
    </div>

    `;
}

function closeOverlay() {
    document.getElementById("overlay").classList.add("d-none");
}

loadPokemon();