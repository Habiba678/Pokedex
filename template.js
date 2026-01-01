function GetPokemonsTemplate(pokemon) {
  return `
    <div class="list-item" onclick="OpenPokemon(${allPokemons.indexOf(pokemon)})">
      <div class="number-wrap">
        <p class="caption-fonts">#${String(pokemon.id).padStart(3, "0")}</p>
      </div>

      <div class="img-wrap" style="background:${typeColors[(pokemon.types && pokemon.types[0] && pokemon.types[0].type && pokemon.types[0].type.name) ? pokemon.types[0].type.name : "none"] || typeColors.none}">
        <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
      </div>

      <div class="name-wrap">
        <p class="body3-fonts">${pokemon.name}</p>
      </div>

      <div class="type-row">
        ${getTypeIcons(pokemon)}
      </div>
    </div>
  `;
}

function getTypeIcons(pokemon) {
  return (pokemon.types || []).map(function(t) {
    return getTypeIconColor(t.type.name);
  }).join("");
}

function getTypeIconColor(typeName) {
  return `
    <span class="typeIconWrapper" style="background-color:${typeColors[typeName] || typeColors.none}">
      <img class="typeIcon" src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${typeName}.svg" alt="${typeName}">
    </span>
  `;
}

function GetPokemonDialogTemplate(pokemon) {
  return `
    <div class="pokeModal">
      <div class="pokeHeader">
        <button class="iconBtn" onclick="closeDialog()">←</button>
        <div class="pokeTitle">
          <span class="pokeName">${pokemon.name}</span>
        </div>
        <div class="pokeNr">#${String(pokemon.id).padStart(3, "0")}</div>
      </div>

      <div class="pokeTop" style="background:${typeColors[(pokemon.types && pokemon.types[0] && pokemon.types[0].type && pokemon.types[0].type.name) ? pokemon.types[0].type.name : "none"] || typeColors.none}">
        <div class="pokeHero">
          <button class="navGhost" onclick="prevPage()">‹</button>
          <img class="pokeHeroImg" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
          <button class="navGhost" onclick="nextPage()">›</button>
        </div>
      </div>

      <div class="pokeTypes">
        ${getTypeIcons(pokemon)}
      </div>

      <div class="pokeTabs">
        <button class="tabBtn" onclick="showMain(allPokemons[currentindex])">main</button>
        <button class="tabBtn" onclick="showStats(allPokemons[currentindex])">stats</button>
        <button class="tabBtn" onclick="showEvolution(allPokemons[currentindex])">evo chain</button>
      </div>

      <div class="pokeBody">
        <div id="pokemonDescription" class="descText"></div>
        <div id="dialogContentmain" class="pokeContent"></div>
      </div>
    </div>
  `;
}

function getMainSection(pokemon) {
  return `
    <div class="infoGrid">
      <div class="infoRow"><span>Height</span><span>${pokemon.height / 10} m</span></div>
      <div class="infoRow"><span>Weight</span><span>${pokemon.weight / 10} kg</span></div>
      <div class="infoRow"><span>Base experience</span><span>${pokemon.base_experience}</span></div>
      <div class="infoRow"><span>Abilities</span><span>${pokemon.abilities.map(function(a){ return a.ability.name; }).join(", ")}</span></div>
    </div>
  `;
}

function getStatsSection(statName, statValue) {
  return `
    <div class="statRow">
      <span class="statKey">${statName.toUpperCase()}</span>
      <div class="statBar"><div class="statFill" style="width:${Math.min(statValue, 100)}%"></div></div>
      <span class="statVal">${String(statValue).padStart(3, "0")}</span>
    </div>
  `;
}

function getEvolutionSection(pokemon) {
  return `
    <div class="shinyBox">
      <img class="pokeHeroImgSmall" src="${pokemon.sprites.other["official-artwork"].front_shiny}" alt="${pokemon.name}">
    </div>
  `;
}

function getPokemonNotFoundTemplate() {
  return `<div class="emptyState">Kein Pokemon gefunden...</div>`;
}