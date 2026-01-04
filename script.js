let allPokemons = []
let BASE_URL = "https://pokeapi.co/api/v2/pokemon"
let SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species"
let currentindex = 0
let offset = 0
const limit = 15
const pokemon = 151
let pokemonCache = {}
let speciesCache = {}
let searchTimeout
let fullPokemonList = []

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
  await fetchFullPokemonList()
  await fetchDataJson()
  setLoading(false)
  document.getElementById("loadMoreBtn").onclick = loadMorePokemons
}

async function fetchFullPokemonList() {
  try {
    const response = await fetch(`${BASE_URL}?limit=${pokemon}&offset=0`)
    const data = await response.json()
    fullPokemonList = data.results || []
  } catch {
    fullPokemonList = []
  }
}

async function fetchDataJson() {
  if (offset >= pokemon) return
  setLoading(true)
  const list = await fetchPokemonList(offset)
  let newPokemons = []
  for (let entry of list) {
    const p = await getPokemon(entry)
    newPokemons.push(p)
  }
  allPokemons.push(...newPokemons)
  renderPokemons()
  setLoading(false)
}

async function fetchPokemonList(offset) {
  const rest = pokemon - offset
  const currentLimit = rest < limit ? rest : limit
  if (currentLimit <= 0) return []
  const response = await fetch(`${BASE_URL}?limit=${currentLimit}&offset=${offset}`)
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
  let html = ""
  for (let i = 0; i < allPokemons.length; i++) {
    html += GetPokemonsTemplate(allPokemons[i])
  }
  content.innerHTML = html
}

async function OpenPokemon(index) {
  currentindex = index
  updateDialog()
}

async function updateDialog() {
  let p = allPokemons[currentindex]
  let dialog = document.getElementById("openDialog")
  let content = document.getElementById("renderPokemonsDialog")
  content.innerHTML = GetPokemonDialogTemplate(p)
  showMain(p)
  let description = await getEnglishFlavorText(p.id)
  let descriptionElement = document.getElementById("pokemonDescription")
  if (descriptionElement) descriptionElement.textContent = description
  if (!dialog.open) dialog.showModal()
}

function closeDialog() {
  document.getElementById("openDialog").close()
}

function showMain(p) {
  document.getElementById("dialogContentmain").innerHTML = getMainSection(p)
}

function showStats(p) {
  document.getElementById("dialogContentmain").innerHTML = renderAllStats(p)
}

function renderAllStats(p) {
  let html = ""
  for (let i = 0; i < p.stats.length; i++) {
    html += getStatsSection(p.stats[i].stat.name, p.stats[i].base_stat)
  }
  return html
}

function showEvolution(p) {
  document.getElementById("dialogContentmain").innerHTML = getEvolutionSection(p)
}

function prevPage() {
  if (currentindex > 0) currentindex--
  else currentindex = allPokemons.length - 1
  updateDialog()
}

function nextPage() {
  if (currentindex < allPokemons.length - 1) currentindex++
  else currentindex = 0
  updateDialog()
}

function setLoading(isLoading) {
  document.body.classList.toggle("is-loading", isLoading)
}

async function getEnglishFlavorText(id) {
  if (speciesCache[id] !== undefined) return speciesCache[id]
  try {
    const response = await fetch(`${SPECIES_URL}/${id}`)
    const data = await response.json()
    const entry = (data.flavor_text_entries || []).find(e => e.language?.name === "en")
    const text = entry?.flavor_text ? entry.flavor_text.replace(/\f/g, " ") : ""
    speciesCache[id] = text
    return text
  } catch {
    speciesCache[id] = ""
    return ""
  }
}

function getSearchValue() {
  return document.getElementById("searchInput").value.trim().toLowerCase()
}

function getSearchElements() {
  return {
    content: document.getElementById("content"),
    loadBtn: document.getElementById("loadMoreBtn"),
    notFound: document.getElementById("not-found-message")
  }
}

function prepareSearchUI(content, loadBtn, notFound) {
  content.classList.remove("hidden")
  content.innerHTML = ""
  loadBtn.style.display = "none"
  if (notFound) notFound.style.display = "none"
}

function renderSearchResults(content, pokemons) {
  let html = ""
  for (let i = 0; i < pokemons.length; i++) {
    html += GetPokemonsTemplate(pokemons[i])
  }
  content.innerHTML = html
}

function findEntriesByName(query) {
  if (!fullPokemonList.length) return []
  return fullPokemonList.filter(e => e.name.includes(query))
}

function findIdsByNumberPrefix(prefix) {
  let ids = []
  for (let i = 1; i <= pokemon; i++) {
    if (String(i).startsWith(prefix)) ids.push(i)
  }
  return ids
}

async function fetchPokemonsFromEntries(entries, maxCount) {
  let result = []
  let count = Math.min(entries.length, maxCount)
  for (let i = 0; i < count; i++) {
    let p = await getPokemon(entries[i])
    result.push(p)
  }
  return result
}

async function fetchPokemonsFromIds(ids, maxCount) {
  let result = []
  let count = Math.min(ids.length, maxCount)
  for (let i = 0; i < count; i++) {
    let id = ids[i]
    try {
      let response = await fetch(`${BASE_URL}/${id}`)
      if (!response.ok) continue
      let p = await response.json()
      if (p && p.id >= 1 && p.id <= pokemon) result.push(p)
    } catch {}
  }
  return result
}

async function searchPokemon() {
  let searchValue = getSearchValue()
  if (searchValue.length === 0) { findingPokemon(); return }
  let { content, loadBtn, notFound } = getSearchElements()
  prepareSearchUI(content, loadBtn, notFound)
  let isNumber = /^\d+$/.test(searchValue)
  let results = isNumber
    ? await fetchPokemonsFromIds(findIdsByNumberPrefix(searchValue), 40)
    : await fetchPokemonsFromEntries(findEntriesByName(searchValue), 40)
  if (results.length) renderSearchResults(content, results)
  else pokemonNotfound()
}

function searchPokemonDebounced() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(function () {
    searchPokemon()
  }, 300)
}

function findingPokemon() {
  document.getElementById("loadMoreBtn").style.display = "block"
  let notFound = document.getElementById("not-found-message")
  if (notFound) notFound.style.display = "none"
  renderPokemons()
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
  if (offset >= pokemon) return
  setLoading(true)
  offset += limit
  await fetchDataJson()
  setLoading(false)
}