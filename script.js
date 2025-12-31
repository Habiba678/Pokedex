let allPokemons = []
let BASE_URL = "https://pokeapi.co/api/v2/pokemon"
let SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species"
let currentindex = 0
let offset = 0
const limit = 20
let pokemonCache = {}
let speciesCache = {}

const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
  none: "#2a2f36"
}

async function init() {
  offset = 0
  setLoading(true)
  await fetchDataJson()
  setLoading(false)
  document.getElementById("loadMoreBtn").onclick = loadMorePokemons
}

async function fetchDataJson() {
  setLoading(true)
  const list = await fetchPokemonList(offset)

  let newPokemons = []
  for (let entry of list) {
    const pokemon = await getPokemon(entry)
    newPokemons.push(pokemon)
  }

  allPokemons.push(...newPokemons)
  renderPokemons()
  setLoading(false)
}

async function fetchPokemonList(offset) {
  const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`)
  const data = await response.json()
  return data.results
}

async function getPokemon(entry) {
  if (pokemonCache[entry.name]) return pokemonCache[entry.name]
  const response = await fetch(entry.url)
  const data = await response.json()
  pokemonCache[entry.name] = data
  return data
}

function renderPokemons() {
  let content = document.getElementById("content")
  content.classList.remove("hidden")
  content.innerHTML = ""
  for (let i = 0; i < allPokemons.length; i++) {
    content.innerHTML += GetPokemonsTemplate(allPokemons[i])
  }
}

async function OpenPokemon(index) {
  currentindex = index
  let pokemon = allPokemons[index]

  let dialog = document.getElementById("openDialog")
  let content = document.getElementById("renderPokemonsDialog")

  content.innerHTML = GetPokemonDialogTemplate(pokemon)
  showMain(pokemon)

  let description = await getEnglishFlavorText(pokemon.id)
  let descriptionElement = document.getElementById("pokemonDescription")
  if (descriptionElement) descriptionElement.textContent = description

  dialog.showModal()
}

function closeDialog() {
  document.getElementById("openDialog").close()
}

function showMain(pokemon) {
  document.getElementById("dialogContentmain").innerHTML = getMainSection(pokemon)
}

function showStats(pokemon) {
  document.getElementById("dialogContentmain").innerHTML = renderAllStats(pokemon)
}

function renderAllStats(pokemon) {
  let html = ""
  for (let i = 0; i < pokemon.stats.length; i++) {
    html += getStatsSection(pokemon.stats[i].stat.name, pokemon.stats[i].base_stat)
  }
  return html
}

function showEvolution(pokemon) {
  document.getElementById("dialogContentmain").innerHTML = getEvolutionSection(pokemon)
}

function prevPage() {
  if (currentindex > 0) currentindex--
  else currentindex = allPokemons.length - 1
  OpenPokemon(currentindex)
}

function nextPage() {
  if (currentindex < allPokemons.length - 1) currentindex++
  else currentindex = 0
  OpenPokemon(currentindex)
}

function setLoading(isLoading) {
  document.body.classList.toggle("is-loading", isLoading)
}

async function getEnglishFlavorText(id) {
  if (speciesCache[id] !== undefined) return speciesCache[id]
  try {
    const response = await fetch(`${SPECIES_URL}/${id}`)
    const data = await response.json()
    const entry = (data.flavor_text_entries || []).find((e) => e.language?.name === "en")
    const text = entry?.flavor_text ? entry.flavor_text.replace(/\f/g, " ") : ""
    speciesCache[id] = text
    return text
  } catch {
    speciesCache[id] = ""
    return ""
  }
}

function searchPokemon() {
  let searchValue = document.getElementById("searchInput").value.toLowerCase()
  let content = document.getElementById("content")
  let loadBtn = document.getElementById("loadMoreBtn")
  let notFound = document.getElementById("not-found-message")

  if (searchValue.length < 3) {
    findingPokemon()
    return
  }

  content.innerHTML = ""
  loadBtn.style.display = "none"
  if (notFound) notFound.style.display = "none"

  let found = false
  let sortByNumber = document.getElementById("number")?.checked

  for (let i = 0; i < allPokemons.length; i++) {
    let p = allPokemons[i]
    let match = sortByNumber ? String(p.id).startsWith(searchValue) : p.name.includes(searchValue)
    if (match) {
      content.innerHTML += GetPokemonsTemplate(p)
      found = true
    }
  }

  if (!found) pokemonNotfound()
}

function findingPokemon() {
  document.getElementById("loadMoreBtn").style.display = "block"
  let notFound = document.getElementById("not-found-message")
  if (notFound) notFound.style.display = "none"
  renderPokemons()
}

let searchTimeout

function searchPokemonDebounced() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchPokemon, 300)
}

function pokemonNotfound() {
  document.getElementById("loadMoreBtn").style.display = "none"
  document.getElementById("content").innerHTML = getPokemonNotFoundTemplate()
  let notFound = document.getElementById("not-found-message")
  if (notFound) notFound.style.display = "block"
}

function clearSearch() {
  let input = document.getElementById("searchInput")
  if (input) input.value = ""
  findingPokemon()
}

async function loadMorePokemons() {
  setLoading(true)
  offset += 20
  await fetchDataJson()
  setLoading(false)
}